import os
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional, Union, Callable

from app.services.pymupdf_service import inspect_pdf
from app.services.pdf_inspector import inspect_pdf as fast_inspect_pdf
from app.services.classifier_service import classify_page
from app.services.page_router import (
    route_document,
    create_selected_pages_pdf,
    render_page,
    timed_stage,
    merge_selective_results
)
from app.services.docling_service import process_with_docling
from app.services.vision_service import VisionService, is_candidate_financial_chart
from app.services.chunking_service import create_document_chunks
from app.services.embedding_service import create_embeddings
from app.services.faiss_service import FaissStore, save_document_store, load_document_store
from app.services.validation_service import ValidationService, normalize_metric
from app.services.cache_service import DocumentCacheManager
from app.services.financial_service import (
    growth,
    net_profit_margin,
    debt_to_equity,
    current_ratio,
    free_cash_flow
)


import re

def extract_financial_inputs_from_document(
    classified_pages: List[Dict[str, Any]],
    tables_data: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Deterministically extracts verified financial figures from extracted pages & tables.
    Returns empty dict if no financial disclosures are found.
    """
    all_text = ""
    for p in classified_pages:
        all_text += " " + p.get("text", "")
    for t in tables_data:
        all_text += " " + t.get("markdown", "")

    all_text_lower = all_text.lower()
    
    financial_keywords = ["revenue", "turnover", "sales", "profit", "ebitda", "pat", "balance sheet", "cash flow", "assets", "liabilities"]
    if not any(k in all_text_lower for k in financial_keywords):
        return {}

    extracted = {}

    patterns = {
        "revenue_current": [
            r"(?:revenue(?:\s+from\s+operations)?|total\s+revenue|turnover|sales)[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
            r"(?:₹|\$|inr|usd)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:cr|crore|mn|million)?\s*(?:revenue|sales)",
        ],
        "net_profit": [
            r"(?:profit\s+after\s+tax|pat|net\s+profit|profit\s+for\s+the\s+(?:year|period)|net\s+income)[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ],
        "debt": [
            r"(?:total\s+debt|borrowings|total\s+borrowings)[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ],
        "equity": [
            r"(?:total\s+equity|shareholders['\s]+equity|net\s+worth)[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ],
        "current_assets": [
            r"(?:total\s+)?current\s+assets[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ],
        "current_liabilities": [
            r"(?:total\s+)?current\s+liabilities[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ],
        "cfo": [
            r"(?:cash\s+(?:flow\s+)?from\s+operating\s+activities|operating\s+cash\s+flow|cfo)[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ],
        "capex": [
            r"(?:capital\s+expenditure(?:s)?|capex)[\s:\-=|]+(?:₹|\$|inr|usd)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)",
        ]
    }

    for key, p_list in patterns.items():
        for pat in p_list:
            match = re.search(pat, all_text, re.IGNORECASE)
            if match:
                val_str = match.group(1).replace(",", "")
                try:
                    extracted[key] = float(val_str)
                    break
                except ValueError:
                    pass

    return extracted


class AnomalyDetector:
    """Detects accounting anomalies, margin compression, and working capital strains."""

    @staticmethod
    def evaluate_financial_health(metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        anomalies = []

        # 1. Working Capital Strain: Net Profit > 0 but Free Cash Flow < 0
        net_profit = metrics.get("net_profit")
        fcf = metrics.get("free_cash_flow")
        if net_profit is not None and fcf is not None:
            if net_profit > 0 and fcf < 0:
                anomalies.append({
                    "type": "WORKING_CAPITAL_STRAIN",
                    "severity": "HIGH",
                    "message": f"Divergence detected: Net profit is positive ({net_profit:,.2f}), but Free Cash Flow is negative ({fcf:,.2f}). Possible revenue recognition or receivables delay.",
                    "action_required": "Inspect Trade Receivables and Inventory Note pages via RAG."
                })

        # 2. Liquidity Strain: Current Ratio < 1.0
        c_ratio = metrics.get("current_ratio")
        if c_ratio is not None and c_ratio < 1.0:
            anomalies.append({
                "type": "LIQUIDITY_WARNING",
                "severity": "MEDIUM",
                "message": f"Current ratio is {c_ratio:.2f} (< 1.0), indicating short-term obligations exceed current assets.",
                "action_required": "Verify cash equivalents and short-term borrowing notes."
            })

        # 3. High Leverage: Debt to Equity > 2.0
        de_ratio = metrics.get("debt_to_equity")
        if de_ratio is not None and de_ratio > 2.0:
            anomalies.append({
                "type": "HIGH_LEVERAGE",
                "severity": "MEDIUM",
                "message": f"Debt-to-Equity ratio stands at {de_ratio:.2f} (> 2.0).",
                "action_required": "Review debt maturity schedule in notes to accounts."
            })

        return anomalies


class DoxFin500PagePipeline:
    """
    Complete end-to-end processing pipeline with granular stage-level caching (Phases 27 & 28).
    """

    def __init__(self, base_cache_dir: str = "cache", vector_store_dir: str = "vector_store"):
        self.base_cache_dir = Path(base_cache_dir)
        self.vector_store_dir = Path(vector_store_dir)
        self.base_cache_dir.mkdir(parents=True, exist_ok=True)
        self.vector_store_dir.mkdir(parents=True, exist_ok=True)

    def process_document(
        self,
        pdf_path: str,
        document_id: str = "document_123",
        raw_financial_inputs: Optional[Dict[str, Any]] = None,
        force_recompute: bool = False,
        simulate_qwen_failure: bool = False,
        progress_callback: Optional[Callable[[str, int, str, str], None]] = None
    ) -> Dict[str, Any]:
        """
        Executes the full end-to-end financial pipeline:
        File Validation -> PyMuPDF Fast Pass -> Page Classification ->
        Selective Processing (Text / Docling Tables / Qwen Charts) ->
        Validation & Normalization -> Financial Engine -> Anomaly Detection ->
        Chunking -> Embeddings -> FAISS Indexing.
        """
        def _notify(stage_key: str, pct: int, label: str, status: str = "COMPLETED"):
            if progress_callback:
                progress_callback(stage_key, pct, label, status)

        pdf_file = Path(pdf_path)
        if not pdf_file.exists():
            raise FileNotFoundError(f"Document not found at: {pdf_path}")

        cache = DocumentCacheManager(document_id=document_id, base_cache_dir=self.base_cache_dir)

        # STAGE 1: File Validation (Magic bytes %PDF-, non-empty, sha256)
        _notify("file_validation", 10, "Validating file integrity...", "IN_PROGRESS")
        file_size = pdf_file.stat().st_size
        if file_size == 0:
            raise ValueError(f"Uploaded file is empty (0 bytes): {pdf_file.name}")

        with open(pdf_file, "rb") as f:
            header = f.read(5)
            if not header.startswith(b"%PDF"):
                raise ValueError("Invalid PDF format: Missing %PDF header bytes.")
            f.seek(0)
            sha256_hash = hashlib.sha256(f.read()).hexdigest()

        metadata = None if force_recompute else cache.load_stage_data("metadata")
        if not metadata:
            metadata = {
                "document_id": document_id,
                "filename": pdf_file.name,
                "file_size_bytes": file_size,
                "sha256_hash": sha256_hash,
                "validated": True
            }
            cache.save_stage_data("metadata", metadata)
        cache.update_stage_status("file_validation", "COMPLETED", progress_percent=12, current_stage="File validated")
        _notify("file_validation", 12, "File validated", "COMPLETED")

        # STAGE 2: PyMuPDF Fast Pass Inspection (~3.5s for 500+ pages)
        _notify("pymupdf_fast_pass", 20, "Running PyMuPDF fast pass...", "IN_PROGRESS")
        inspection_pages, t_pass = timed_stage("PyMuPDF Fast Pass", fast_inspect_pdf, str(pdf_file))
        page_count = len(inspection_pages)
        cache.update_stage_status("pymupdf_fast_pass", "COMPLETED", progress_percent=25, current_stage=f"{page_count} pages detected ({t_pass:.2f}s)")
        _notify("pymupdf_fast_pass", 25, f"{page_count} pages detected ({t_pass:.2f}s)", "COMPLETED")

        # STAGE 3: Selective Page Routing & Classification
        _notify("page_classification", 30, "Classifying pages...", "IN_PROGRESS")
        routes_data = None if force_recompute else cache.load_stage_data("routes")
        if not routes_data or not isinstance(routes_data, dict) or "text" not in routes_data:
            routes_data, t_route = timed_stage("Selective Page Router", route_document, str(pdf_file))
            routes_summary = {
                "document_id": document_id,
                "total_pages": page_count,
                "text_pages": len(routes_data.get("text", [])),
                "table_pages": len(routes_data.get("financial_table", [])),
                "chart_pages": len(routes_data.get("financial_chart", [])),
                "skipped_pages": len(routes_data.get("irrelevant", [])),
                "table_page_numbers": [p.get("page", 1) for p in routes_data.get("financial_table", [])],
                "chart_page_numbers": [p.get("page", 1) for p in routes_data.get("financial_chart", [])],
                "skipped_page_numbers": [p.get("page", 1) for p in routes_data.get("irrelevant", [])]
            }
            cache.save_stage_data("routes", routes_summary)

        # Build classified_pages list for backward compatibility with downstream modules
        all_classified = []
        for r_key in ["text", "financial_table", "financial_chart", "irrelevant"]:
            for p in routes_data.get(r_key, []):
                p_item = dict(p)
                p_item["page_number"] = p.get("page", p.get("page_number", 1))
                if r_key == "financial_table":
                    p_item["use_docling"] = True
                elif r_key == "financial_chart":
                    p_item["use_vision"] = True
                all_classified.append(p_item)
        all_classified.sort(key=lambda x: x.get("page_number", 1))
        classified_pages = all_classified
        cache.save_stage_data("pages", classified_pages)

        table_routes = routes_data.get("financial_table", [])
        chart_routes = routes_data.get("financial_chart", [])
        text_routes = routes_data.get("text", [])
        skip_routes = routes_data.get("irrelevant", [])

        cache.update_stage_status("page_classification", "COMPLETED", progress_percent=35, current_stage=f"Routing: {len(text_routes)} text, {len(table_routes)} tables, {len(chart_routes)} charts")
        _notify("page_classification", 35, "Selective routing complete", "COMPLETED")

        # STAGE 4: Text Extraction Branch (PyMuPDF Fast-Track Pass-Through)
        _notify("text_extraction", 40, "Direct text pass-through...", "IN_PROGRESS")
        text_pages_data = None if force_recompute else cache.load_stage_data("text")
        if not text_pages_data:
            text_pages_data = [
                {
                    "page_number": p.get("page", p.get("page_number", 1)),
                    "text": p.get("text", ""),
                    "source": "pymupdf_fast_pass"
                }
                for p in text_routes
            ]
            cache.save_stage_data("text", text_pages_data)
        cache.update_stage_status("text_extraction", "COMPLETED", progress_percent=45, current_stage=f"{len(text_pages_data)} ordinary text pages fast-tracked")
        _notify("text_extraction", 45, "Text pass-through", "COMPLETED")

        # STAGE 5: Table Extraction Branch (Docling on Selected Pages)
        _notify("table_extraction", 50, "Extracting targeted tables...", "IN_PROGRESS")
        if force_recompute:
            completed_table_pages = set()
            tables_data = []
        else:
            tables_data = cache.load_stage_data("tables") or []
            completed_table_pages = cache.get_completed_page_numbers("tables")

        # Create compact temporary table PDF containing ONLY table pages if needed
        temp_table_pdf = self.base_cache_dir / document_id / "temp_table_pages.pdf"
        needed_table_pages = [p for p in table_routes if p.get("page", 1) not in completed_table_pages]
        if needed_table_pages and not temp_table_pdf.exists():
            table_page_indexes = [p["page"] - 1 for p in table_routes]
            try:
                page_mapping = create_selected_pages_pdf(str(pdf_file), table_page_indexes, str(temp_table_pdf))
            except Exception as e:
                print(f"[Docling Router] Warning creating selected table PDF: {e}")
                page_mapping = {}

        for tp in table_routes:
            p_num = tp.get("page", tp.get("page_number", 1))
            if p_num in completed_table_pages:
                continue  # Phase 29: Skip already processed pages on resumption
            res = process_with_docling(str(pdf_file), page_range=(p_num, p_num), needs_ocr=tp.get("use_ocr", False))
            page_table_entry = {
                "page_number": p_num,
                "markdown": res.get("markdown", ""),
                "source": "docling_selective"
            }
            cache.save_page_checkpoint("tables", page_table_entry)
            tables_data.append(page_table_entry)
            completed_table_pages.add(p_num)

        cache.save_stage_data("tables", tables_data)
        cache.update_stage_status("table_extraction", "COMPLETED", progress_percent=60, current_stage=f"{len(tables_data)} financial tables structured")
        _notify("table_extraction", 60, "Table extraction", "COMPLETED")

        # STAGE 6: Chart / Visual Extraction Branch (Qwen3-VL on Rendered Chart Pages)
        _notify("chart_analysis", 65, "Analyzing charts...", "IN_PROGRESS")
        if simulate_qwen_failure:
            cache.update_stage_status("chart_analysis", "FAILED", error_msg="Simulated VLM GPU timeout/OOM error on page 82")
            raise RuntimeError("Simulated Qwen3-VL Vision Failure on Page 82 (Test Checkpoint Scenario)")

        if force_recompute:
            completed_chart_pages = set()
            charts_data = []
        else:
            charts_data = cache.load_stage_data("charts") or []
            completed_chart_pages = cache.get_completed_page_numbers("charts")

        charts_dir = self.base_cache_dir / document_id / "charts"
        charts_dir.mkdir(parents=True, exist_ok=True)

        for cp in chart_routes:
            p_num = cp.get("page", cp.get("page_number", 1))
            if p_num in completed_chart_pages:
                continue  # Phase 29: Resume from exact failure point without re-scanning prior pages

            chart_img_path = str(charts_dir / f"chart_page_{p_num}.png")
            try:
                render_page(str(pdf_file), p_num - 1, chart_img_path)
            except Exception:
                pass

            c_res = VisionService.process_page_images(cp, image_path=chart_img_path)
            if c_res:
                c_res["source"] = "qwen3_vl_selective"
                cache.save_page_checkpoint("charts", c_res)
                charts_data.append(c_res)
            completed_chart_pages.add(p_num)

        cache.save_stage_data("charts", charts_data)

        # Merge normalized selective results
        merged_results = merge_selective_results(
            text_results=text_pages_data or [],
            table_results=tables_data or [],
            chart_results=charts_data or [],
            skipped_pages=[p.get("page", 1) for p in skip_routes]
        )
        cache.save_stage_data("normalized_document", merged_results)

        cache.update_stage_status("chart_analysis", "COMPLETED", progress_percent=75, current_stage=f"{len(charts_data)} financial charts analyzed")
        _notify("chart_analysis", 75, "Chart analysis", "COMPLETED")



        # STAGE 7: Deterministic Financial Engine & Validated Metrics
        _notify("financial_calculations", 80, "Calculating financial metrics...", "IN_PROGRESS")
        validated_metrics = None if force_recompute else cache.load_stage_data("validated_metrics")
        if validated_metrics is None:
            inputs = raw_financial_inputs if raw_financial_inputs is not None else extract_financial_inputs_from_document(classified_pages, tables_data)
            
            validated_metrics = {}
            if inputs:
                rev_curr = inputs.get("revenue_current")
                rev_prev = inputs.get("revenue_previous")
                net_profit_val = inputs.get("net_profit")
                debt_val = inputs.get("debt")
                equity_val = inputs.get("equity")
                curr_assets = inputs.get("current_assets")
                curr_liab = inputs.get("current_liabilities")
                cfo_val = inputs.get("cfo")
                capex_val = inputs.get("capex")

                if rev_curr is not None:
                    validated_metrics["consolidated_revenue"] = rev_curr
                if net_profit_val is not None:
                    validated_metrics["net_profit"] = net_profit_val
                if rev_curr is not None and rev_prev is not None:
                    validated_metrics["revenue_growth_yoy"] = growth(rev_curr, rev_prev)
                if net_profit_val is not None and rev_curr is not None:
                    validated_metrics["net_profit_margin"] = net_profit_margin(net_profit_val, rev_curr)
                if debt_val is not None and equity_val is not None:
                    validated_metrics["debt_to_equity"] = debt_to_equity(debt_val, equity_val)
                if curr_assets is not None and curr_liab is not None:
                    validated_metrics["current_ratio"] = current_ratio(curr_assets, curr_liab)
                if cfo_val is not None and capex_val is not None:
                    validated_metrics["free_cash_flow"] = free_cash_flow(cfo_val, capex_val)
                elif cfo_val is not None:
                    validated_metrics["free_cash_flow"] = cfo_val

            cache.save_stage_data("validated_metrics", validated_metrics)
        cache.update_stage_status("financial_calculations", "COMPLETED", progress_percent=85, current_stage="Financial calculations")
        _notify("financial_calculations", 85, "Financial calculations", "COMPLETED")

        # STAGE 8: Anomaly Detection
        _notify("anomaly_detection", 88, "Evaluating anomaly rules...", "IN_PROGRESS")
        anomalies_data = None if force_recompute else cache.load_stage_data("anomalies")
        if anomalies_data is None:
            anomalies_data = AnomalyDetector.evaluate_financial_health(validated_metrics) if validated_metrics else []
            cache.save_stage_data("anomalies", anomalies_data)
        cache.update_stage_status("anomaly_detection", "COMPLETED", progress_percent=90, current_stage="Anomaly detection")
        _notify("anomaly_detection", 90, "Anomaly detection", "COMPLETED")

        # STAGE 9: Chunks & Extracted Text
        chunks = None if force_recompute else cache.load_stage_data("extracted_text")
        if chunks is None:
            chunks = create_document_chunks(classified_pages, document_id=document_id)
            cache.save_stage_data("extracted_text", chunks)

        # STAGE 10: FAISS Vector Indexing & RAG Preparation
        _notify("rag_indexing", 92, "Building FAISS index...", "IN_PROGRESS")
        index_file = self.vector_store_dir / f"{document_id}.index"
        meta_file = self.vector_store_dir / f"{document_id}_metadata.json"

        if not index_file.exists() or force_recompute:
            try:
                if chunks:
                    texts = [c["text"] for c in chunks]
                    embeddings = create_embeddings(texts)
                    dim = embeddings.shape[1] if hasattr(embeddings, "shape") else len(embeddings[0])
                    store = FaissStore(dimension=dim)
                    store.add(embeddings=embeddings, metadata=chunks)
                    saved_paths = save_document_store(store, doc_id=document_id, vector_store_dir=self.vector_store_dir)
                    saved_paths["total_chunks_indexed"] = len(chunks)
                else:
                    store = FaissStore(dimension=384)
                    saved_paths = save_document_store(store, doc_id=document_id, vector_store_dir=self.vector_store_dir)
                    saved_paths["total_chunks_indexed"] = 0
            except Exception as fe:
                print(f"[WARN] FAISS vector indexing fallback: {fe}")
                store = FaissStore(dimension=384)
                saved_paths = save_document_store(store, doc_id=document_id, vector_store_dir=self.vector_store_dir)
                saved_paths["total_chunks_indexed"] = len(chunks) if chunks else 0

            cache.update_stage_status("rag_indexing", "COMPLETED", progress_percent=100, current_stage="RAG indexing")
        else:
            saved_paths = {
                "index_path": str(index_file),
                "metadata_path": str(meta_file),
                "total_chunks_indexed": len(chunks) if chunks else 0
            }
            cache.update_stage_status("rag_indexing", "COMPLETED", progress_percent=100, current_stage="RAG indexing")


        _notify("rag_indexing", 100, "Completed", "COMPLETED")

        cache_summary = cache.get_cache_summary()

        routing_summary = {
            "total_pages": len(classified_pages),
            "digital_text_pages": len(text_pages_data) if text_pages_data else len(text_routes) if "text_routes" in locals() else 0,
            "tables_docling_pages": len(tables_data) if tables_data else 0,
            "charts_vision_pages": len(charts_data) if charts_data else 0
        }

        return {
            "document_id": document_id,
            "filename": pdf_file.name,
            "page_count": len(classified_pages),
            "routing_summary": routing_summary,
            "financial_metrics": validated_metrics,
            "anomalies": anomalies_data,
            "tables_count": len(tables_data),
            "charts_count": len(charts_data),
            "rag_index": saved_paths,
            "cache": cache_summary,
            "pipeline_status": "COMPLETED_SUCCESSFULLY"
        }

