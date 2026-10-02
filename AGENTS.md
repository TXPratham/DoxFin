# DoxFin Agent & Subagent Directory

Welcome to the **DoxFin** AI-first development environment. This document outlines the developer AI subagents, engineering principles, and workflows available for building and maintaining DoxFin.

---

## Core Project Principle
> **"Python calculates, RAG provides evidence, and the LLM explains."**
- Financial arithmetic is **always deterministic** in Python.
- Never use an LLM or probabilistic reasoning for financial ratios, growth rates, or balances.
- All extracted intelligence and explanations must carry precise **source page and section references**.

---

## Available Developer AI Subagents

| Subagent Name | Role | Primary Focus Area | Typical Commands / Invocations |
| :--- | :--- | :--- | :--- |
| **`doxfin-frontend-engineer`** | Lead UI/UX Engineer | React, TypeScript, Tailwind CSS, Recharts, citation drawers, PDF split-screen | *"Build the financial metrics overview table with YoY delta indicators."* |
| **`doxfin-backend-architect`** | Backend & Pipeline Architect | FastAPI, Celery, Redis, PyMuPDF, Docling, FAISS vector search | *"Implement the async upload route and page classification router."* |
| **`doxfin-financial-specialist`** | Quantitative Finance Specialist | Financial statements, accounting ratios, cash flow health, anomaly rules | *"Implement the DuPont ROE decomposition and working capital strain rules."* |
| **`doxfin-qa-tester`** | QA & Performance Benchmark Lead | Pytest, Vitest, synthetic PDF fixtures, 100/300/500-page benchmarks | *"Write unit tests for edge-case ratio calculations and zero-division handling."* |

---

## How to Invoke Builder Subagents in Antigravity

In any conversation turn within Antigravity or the Antigravity IDE, you can ask the primary assistant to delegate tasks to these subagents:

```
Please invoke doxfin-frontend-engineer to create the Source Evidence Drawer component.
```
```
Please invoke doxfin-financial-specialist to verify the Free Cash Flow and DSO formula logic.
```

---

## Architectural Guidelines
1. **Zero Hallucination Arithmetic:** All formulas must be executed via `doxfin-financial-specialist` or Python engine modules.
2. **Selective Processing:** 400–500 page documents must not be naively passed in their entirety to an LLM. Always use selective routing (classify pages $\rightarrow$ extract text/tables/charts $\rightarrow$ compute metrics $\rightarrow$ retrieve relevant chunks via RAG).
3. **Privacy First:** Never transmit raw customer financial documents outside the designated local or private enterprise deployment boundaries.
