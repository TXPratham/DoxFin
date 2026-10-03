"""
Seeds the default showcase document 'doc_abc_2025' (ABC Industries Annual Report 2025)
into SQLite database and FAISS vector index with rich grounded financial evidence.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.database.database import SessionLocal, init_db
from app.database.models import Document, FinancialMetric, AnomalyRecord
from app.services.embedding_service import create_embeddings
from app.services.faiss_service import FaissStore, save_document_store

def seed_demo_document():
    init_db()
    db = SessionLocal()
    doc_id = "doc_abc_2025"
    filename = "ABC Industries — Annual Report 2025.pdf"
    
    try:
        # 1. Upsert Document in DB
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            doc = Document(
                id=doc_id,
                filename=filename,
                file_path=f"uploads/{filename}",
                page_count=184,
                status="completed"
            )
            db.add(doc)
        else:
            doc.status = "completed"
            doc.page_count = 184
        db.commit()

        # 2. Financial Metrics
        db.query(FinancialMetric).filter(FinancialMetric.document_id == doc_id).delete()
        demo_metrics = [
            ("Consolidated Revenue", 16420.0, "Cr", "FY2025", "income_statement"),
            ("Reported PAT", 2180.0, "Cr", "FY2025", "income_statement"),
            ("Operating Margin", 18.4, "%", "FY2025", "income_statement"),
            ("Free Cash Flow", 1320.0, "Cr", "FY2025", "cash_flow_statement"),
            ("Debt-to-Equity Ratio", 0.68, "ratio", "FY2025", "balance_sheet"),
            ("Current Ratio", 1.33, "ratio", "FY2025", "balance_sheet"),
            ("YoY Revenue Growth", 12.4, "%", "FY2025", "deterministic_engine"),
            ("Trade Receivables Growth", 23.0, "%", "FY2025", "deterministic_engine"),
        ]
        for name, val, unit, period, src in demo_metrics:
            m = FinancialMetric(
                document_id=doc_id,
                metric_name=name,
                value=val,
                unit=unit,
                period=period,
                validation_status="verified",
                source=src
            )
            db.add(m)

        # 3. Anomalies
        db.query(AnomalyRecord).filter(AnomalyRecord.document_id == doc_id).delete()
        demo_anomalies = [
            (
                "TRADE_RECEIVABLES_DIVERGENCE",
                "HIGH",
                "Trade receivables grew by +23.0% YoY while revenue expanded by +12.4%, indicating working capital strain.",
                "Review Note 17 aging schedule and Expected Credit Loss (ECL) provisioning on Page 151."
            ),
            (
                "OPERATING_CASH_FLOW_LAG",
                "MEDIUM",
                "Operating cash flow to EBITDA ratio declined to 62% from 78% in FY24 due to inventory build-up.",
                "Cross-reference inventory turnover days in MD&A Note 8 on Page 82."
            )
        ]
        for a_type, sev, msg, act in demo_anomalies:
            a = AnomalyRecord(
                document_id=doc_id,
                anomaly_type=a_type,
                severity=sev,
                message=msg,
                action_required=act
            )
            db.add(a)

        db.commit()

        # 4. Build FAISS Index with realistic chunk evidence
        chunks = [
            {
                "chunk_id": f"{doc_id}_chunk_1",
                "document_id": doc_id,
                "page_number": 112,
                "section": "Consolidated Statement of Profit and Loss",
                "source_type": "table",
                "text": "Revenue from operations for the financial year ended March 31, 2025 stood at ₹16,420.00 Crores compared to ₹14,600.00 Crores in the previous year (growth of +12.4% YoY). Profit After Tax (PAT) reached ₹2,180.00 Crores with an Operating Margin of 18.4%."
            },
            {
                "chunk_id": f"{doc_id}_chunk_2",
                "document_id": doc_id,
                "page_number": 114,
                "section": "Consolidated Statement of Cash Flows",
                "source_type": "table",
                "text": "Net cash generated from operating activities before changes in working capital was ₹3,021.50 Crores. Capital expenditures (Capex) were ₹1,701.50 Crores, resulting in Free Cash Flow (FCF) of ₹1,320.00 Crores."
            },
            {
                "chunk_id": f"{doc_id}_chunk_3",
                "document_id": doc_id,
                "page_number": 151,
                "section": "Note 17: Trade Receivables Aging & ECL",
                "source_type": "notes",
                "text": "Trade receivables considered good - unsecured aggregate ₹3,240.00 Crores compared to ₹2,634.00 Crores in FY24 (+23.0% YoY growth). Outstanding receivables > 6 months stood at ₹412.00 Crores with Expected Credit Loss (ECL) provisioning of 14.5%."
            },
            {
                "chunk_id": f"{doc_id}_chunk_4",
                "document_id": doc_id,
                "page_number": 82,
                "section": "Management Discussion & Analysis (MD&A)",
                "source_type": "text",
                "text": "Operating cash flow declined to 62% of EBITDA due to temporary working capital strain and strategic inventory build-up for high-demand product lines. Management expects normalization within Q2 FY2026."
            },
            {
                "chunk_id": f"{doc_id}_chunk_5",
                "document_id": doc_id,
                "page_number": 118,
                "section": "Balance Sheet & Solvency Structure",
                "source_type": "table",
                "text": "Total Debt stood at ₹5,400.00 Crores against Total Shareholders Equity of ₹7,940.00 Crores, yielding a Debt-to-Equity ratio of 0.68. Current assets were ₹9,310.00 Crores against Current liabilities of ₹7,000.00 Crores, maintaining a Current Ratio of 1.33."
            }
        ]

        texts = [c["text"] for c in chunks]
        embeddings = create_embeddings(texts)
        dim = embeddings.shape[1] if hasattr(embeddings, "shape") else len(embeddings[0])
        store = FaissStore(dimension=dim)
        store.add(embeddings=embeddings, metadata=chunks)
        save_document_store(store, doc_id=doc_id, vector_store_dir=BACKEND_DIR / "vector_store")

        print(f"✓ Successfully seeded '{doc_id}' into Database and FAISS Vector Store ({len(chunks)} chunks).")
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_document()
