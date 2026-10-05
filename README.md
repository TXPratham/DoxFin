# DoxFin: Enterprise Financial Document Intelligence Platform

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![IBM Granite 4.0](https://img.shields.io/badge/LLM-IBM%20Granite%204.0%201B-1261FE?style=flat&logo=ibm&logoColor=white)](https://huggingface.co/ibm-granite)
[![FAISS](https://img.shields.io/badge/Vector%20Search-FAISS-00599C?style=flat&logo=c%2B%2B&logoColor=white)](https://github.com/facebookresearch/faiss)
[![Docker](https://img.shields.io/badge/Deployment-Docker%20%26%20Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com)
[![Compliance](https://img.shields.io/badge/Security-SOC2%20Type%20II%20Ready-success)](https://doxfin.internal)

> **"Python calculates, RAG provides evidence, and the LLM explains."**  
> DoxFin is an on-premise, privacy-first financial document intelligence platform engineered for credit rating agencies, institutional audit committees, and quantitative research desks. It ingests 500+ page annual filings, extracts complex tabular notes, deterministically calculates financial ratios, flags forensic accounting anomalies, and delivers grounded multi-turn conversational AI with exact page-level provenance.

---

## Table of Contents

- [Core Principles & Architectural Highlights](#core-principles--architectural-highlights)
- [System Architecture](#system-architecture)
- [Hardware & Software Prerequisites](#hardware--software-prerequisites)
- [Quickstart Installation Guide](#quickstart-installation-guide)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Setup (Python Virtual Environment)](#2-backend-setup-python-virtual-environment)
  - [3. Frontend Setup (Node.js & Vite)](#3-frontend-setup-nodejs--vite)
  - [4. Verify Local LLM Weights](#4-verify-local-llm-weights)
- [Running DoxFin](#running-doxfin)
  - [Method A: Local Dual-Terminal Run (Recommended for Dev)](#method-a-local-dual-terminal-run-recommended-for-dev)
  - [Method B: Automated One-Command Installer](#method-b-automated-one-command-installer)
  - [Method C: Docker & Docker Compose (Production On-Premise)](#method-c-docker--docker-compose-production-on-premise)
  - [Method D: Live Public URL & Tunnel Deployment](#method-d-live-public-url--tunnel-deployment)
- [Demo Credentials & Role-Based Access Control](#demo-credentials--role-based-access-control)
- [Key Workflows & Feature Guide](#key-workflows--feature-guide)
  - [PyMuPDF Fast Pass & Selective Page Router](#pymupdf-fast-pass--selective-page-router)
  - [Conversational Neural Chat ("Ask DoxFin")](#conversational-neural-chat-ask-doxfin)
  - [Deterministic Financial Ratio Engine](#deterministic-financial-ratio-engine)
  - [Forensic Anomaly Detection](#forensic-anomaly-detection)
  - [Enterprise Security & Hardening (Phase 41)](#enterprise-security--hardening-phase-41)
  - [SOC2 Type II Audit Ledger](#soc2-type-ii-audit-ledger)
- [Verification & Automated Test Suite](#verification--automated-test-suite)
- [Environment Configuration & Variables](#environment-configuration--variables)
- [Repository Structure](#repository-structure)
- [Troubleshooting & FAQ](#troubleshooting--faq)
- [Enterprise Disclaimer & Pilot Licensing](#enterprise-disclaimer--pilot-licensing)

---

## Core Principles & Architectural Highlights

1. **Zero Hallucination Arithmetic:**  
   Large Language Models are probabilistic and prone to math hallucinations. In DoxFin, **all financial math is executed in deterministic Python**. YoY growth rates, EBITDA, Net Profit Margin, Debt-to-Equity, Current Ratio, and Free Cash Flow are computed via formula engines with guaranteed 2-decimal rounding.
2. **Selective Ingestion Pipeline (PyMuPDF Fast Pass):**  
   Processing 500-page annual reports through brute-force vision models or Docling causes massive memory exhaustion and minutes of latency. DoxFin's two-stage scanner classifies every page in milliseconds:
   - **Ordinary Text Pages** $\rightarrow$ Fast pass via PyMuPDF (near-instantaneous).
   - **Financial Tables** $\rightarrow$ Docling table layout parsing & Schedule III normalization.
   - **Important Financial Charts** $\rightarrow$ Targeted Qwen-VL multimodal analysis.
   - **Decorative / Cover Pages** $\rightarrow$ Skipped entirely to conserve compute.
3. **100% Air-Gapped Data Sovereignty:**  
   Designed for confidential filings (M&A dossiers, unreleased quarterly results). DoxFin runs entirely offline using local **IBM Granite 4.0 1B** causal language models and local **FAISS CPU/GPU** vector stores. Zero external API calls, zero telemetry, zero data egress.
4. **Direct Evidence Tables with Exact Page Badges:**  
   Every RAG citation delivers the exact source page number (e.g. `Page 151: Note 17 Trade Receivables`) and renders structured Markdown tables directly as interactive, styled HTML tables.

---

## System Architecture

```
                    500-Page Annual Report (PDF)
                                │
                                ▼
                   PyMuPDF Fast-Pass Scanner
                    (~1.2s Optical Screening)
                                │
                                ▼
                       Selective Page Router
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
    [Normal Text]       [Financial Tables]     [Financial Charts]
    PyMuPDF Passthrough       Docling               Qwen-VL
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                                ▼
                     Data Normalization Layer
                                │
         ┌──────────────────────┴──────────────────────┐
         ▼                                             ▼
  Python Financial Engine                     Semantic Chunking &
  - Deterministic Ratios (2 dec)              FAISS Vector Indexing
  - 18 Forensic Anomaly Rules                          │
  - Ind AS / Schedule III Checks                       │
         │                                             │
         └──────────────────────┬──────────────────────┘
                                │
                                ▼
                   IBM Granite 4.0 1B (Local)
                   Evidence Synthesizer & RAG
                                │
                                ▼
               DoxFin React 19 Neural Workspace
     (Multi-Turn Chat • Direct Tables • Page Citations)
```

---

## Hardware & Software Prerequisites

| Component | Minimum Specification | Recommended Specification |
| :--- | :--- | :--- |
| **Operating System** | Windows 10/11, Ubuntu 20.04+, macOS 12+ | Windows 11 / Ubuntu 22.04 LTS |
| **Python** | Python 3.10 – 3.12 | **Python 3.11** |
| **Node.js** | Node.js v18.0+ | **Node.js v20.x or v22.x** with npm 10+ |
| **RAM** | 8 GB | **16 GB – 32 GB** |
| **Processor** | 4-Core x86_64 / ARM64 | 8-Core (AVX-512 supported) |
| **GPU (Optional)** | Not required (CPU mode supported) | NVIDIA RTX 3050+ (4GB+ VRAM, CUDA 12.x) |
| **Disk Space** | 6 GB available (includes local Granite weights) | 15 GB NVMe SSD |

---

## Quickstart Installation Guide

### 1. Clone Repository

```bash
git clone https://github.com/your-org/DoxFin.git
cd DoxFin
```

---

### 2. Backend Setup (Python Virtual Environment)

It is strongly recommended to use a dedicated Python virtual environment.

#### On Windows (PowerShell / Command Prompt):
```powershell
# 1. Create virtual environment
python -m venv .venv

# 2. Activate virtual environment
# In PowerShell:
.\.venv\Scripts\Activate.ps1
# (If script execution is blocked: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# Or in Command Prompt:
.\.venv\Scripts\activate.bat

# 3. Upgrade pip and build tools
python -m pip install --upgrade pip setuptools wheel

# 4. Install backend dependencies
pip install -r backend/requirements.txt
```

#### On Linux / macOS (Bash / Zsh):
```bash
# 1. Create virtual environment
python3 -m venv .venv

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Upgrade pip
pip install --upgrade pip setuptools wheel

# 4. Install backend dependencies
pip install -r backend/requirements.txt
```

---

### 3. Frontend Setup (Node.js & Vite)

Navigate into the `frontend` folder and install NPM packages:

```bash
cd frontend
npm install
cd ..
```

---

### 4. Verify Local LLM Weights

DoxFin includes local offline model weights for **IBM Granite 4.0 1B** inside the `models/` directory:

```
models/
└── granite-4.0-1b/
    ├── config.json
    ├── model.safetensors  (3.26 GB)
    ├── tokenizer.json
    └── chat_template.jinja
```

Verify that the model directory exists and has all safetensors files before running.

---

## Running DoxFin

### Method A: Local Dual-Terminal Run (Recommended for Dev)

Open two terminal windows from the repository root:

#### Terminal 1 — Backend API Server
Activate your virtual environment and start the FastAPI backend:

```powershell
# Windows
.\.venv\Scripts\activate
python run_backend.py
```
```bash
# Linux / macOS
source .venv/bin/activate
python run_backend.py
```

The backend server will start at:
- **API Server:** `http://127.0.0.1:8000`
- **Swagger / Interactive OpenAPI Docs:** `http://127.0.0.1:8000/docs`
- **Redoc Specification:** `http://127.0.0.1:8000/redoc`

#### Terminal 2 — Frontend Application
Start the Vite development server:

```bash
cd frontend
npm run dev
```

The React workspace will start at:
- **Web UI:** `http://localhost:3000`

> **Note:** The Vite dev server is pre-configured to proxy all `/api` requests directly to `http://127.0.0.1:8000`.

---

### Method B: Automated One-Command Installer

DoxFin provides an automated self-hosted provisioning script (`installer.py`) that checks prerequisites, initializes directories, verifies dependencies, and creates the database schema:

```bash
python installer.py
```

The installer performs 5 automated steps:
1. Configures `uploads`, `extracted`, `cache`, `vector_store`, and `logs` directories.
2. Verifies Python dependencies.
3. Initializes the SQLite schema (`doxfin.db`).
4. Checks enterprise licenses.
5. Displays ready-to-run service commands.

---

### Method C: Docker & Docker Compose (Production On-Premise)

For containerized enterprise deployments:

```bash
# Build and launch DoxFin container in background
docker-compose up --build -d

# Check running status and health
docker-compose ps

# View live container logs
docker-compose logs -f doxfin-backend
```

- Backend API container runs on `http://localhost:8000`.
- Data persistence is managed via Docker named volumes: `doxfin_data`, `doxfin_extracted`, `doxfin_vector`, and `doxfin_cache`.
- Container health check verifies `http://localhost:8000/docs` every 30 seconds.

---

### Method D: Live Public URL & Tunnel Deployment

DoxFin includes built-in scripts to expose your local frontend and backend to the web with one click:

#### 1. Start a New Tunnel & Copy URL to Clipboard:
```powershell
.\start-tunnel.ps1
```
*Automatically launches Cloudflare Tunnel to `http://localhost:3000`, extracts the live HTTPS URL, prints it in yellow, and copies it directly to your clipboard.*

#### 2. Check the Currently Active URL:
If the tunnel is already running in the background and you need the link again:
```powershell
.\check-tunnel-url.ps1
```

#### 3. Permanent Fixed URLs (Never Changes):
For permanent, persistent domains without random URLs (via Localtunnel, Ngrok, or Cloudflare Custom Domains), refer to the dedicated guide:  
📖 **[LIVE_URL_AND_DEPLOYMENT.md](file:///c:/vscode%20projects/DoxFin/LIVE_URL_AND_DEPLOYMENT.md)**

---

## Demo Credentials & Role-Based Access Control

DoxFin automatically seeds demo enterprise user accounts on the first database initialization:

| Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| **`pratham@doxfin.internal`** | `admin123` | **ADMIN / OWNER** | Full system administration, license management, upload, audit logs |
| **`analyst1@doxfin.internal`** | `analyst123` | **ANALYST** | Read and execute quantitative analysis, run RAG queries |
| **`analyst2@doxfin.internal`** | `analyst123` | **ANALYST** | Read-only access to existing reports |
| **`reviewer1@doxfin.internal`** | `reviewer123` | **REVIEWER** | Read and sign off on metric invariance verifications |
| **`employee4@doxfin.internal`** | `employee123` | **VIEWER** | Minimal restricted viewer privileges |

---

## Key Workflows & Feature Guide

### PyMuPDF Fast Pass & Selective Page Router
1. Drag and drop any 10-page to 500-page financial PDF into the workspace.
2. The PyMuPDF Fast Pass analyzes optical bounds and page structures in ~1.2 seconds.
3. Text pages bypass heavy OCR; tables are routed to Docling; charts are routed to Qwen-VL.
4. Live processing status streams in the real-time terminal console.

### Conversational Neural Chat ("Ask DoxFin")
- Switch to the **Ask DoxFin** tab in the sidebar.
- Type any question or click a quick suggestion chip:
  - *"Summarize Note 17 trade receivables aging"*
  - *"What is the revenue growth YoY?"*
  - *"Check Ind AS 36 impairment disclosures"*
  - *"Explain Free Cash Flow bridge"*
- **Multi-turn conversation thread:** User bubbles on the right, DoxFin AI on the left with timestamps.
- **Direct Evidence Tables:** Receivables aging brackets and financial tables are rendered as formatted HTML tables directly within the citation card, accompanied by clickable **Page `<N>`** badges.

### Deterministic Financial Ratio Engine
- Switch to the **Financial Analysis** tab.
- All numbers are strictly rounded off to 2 decimal places (e.g. `Operating Margin: 49.00%`, `Current Ratio: 3.83x`).
- Zero LLM math hallucination: Every number is derived from Python AST calculations mapped directly to Schedule III and Ind AS line items.

### Forensic Anomaly Detection
- Switch to the **Anomalies** tab.
- Evaluates 18 forensic accounting rules:
  - **Trade Receivables Divergence:** Flagged when receivables surge significantly faster than revenue growth (potential channel stuffing or collection strain).
  - **Operating Cash Flow Lag:** Detects EBITDA vs. OCF disconnects.
  - **Goodwill Impairment & Debt-to-Equity Strains.**

### Enterprise Security & Hardening (Phase 41)
- **HTTP Security Headers:** Injects `nosniff`, `SAMEORIGIN`, `1; mode=block`, `HSTS`, `Referrer-Policy`, and `Permissions-Policy` across all endpoints.
- **Path Traversal Shield:** Enforces strict regex validation (`^[a-zA-Z0-9_\-]+$`) on all document IDs and sanitizes uploaded filenames.
- **PDF Decontamination:** PyMuPDF scrubs malicious JavaScript, launch actions, and embedded attachments before indexing.
- **Adversarial Prompt Injection Defense:** RAG pipeline filters jailbreak attempts (`DAN`, `reveal system prompt`, SQL injection patterns) and returns a `SECURITY_VIOLATION` response.
- **Sliding-Window Rate Limiting:** Enforces 120 req/min per IP to prevent scraping and abuse.

### SOC2 Type II Audit Ledger
- Switch to the **Audit** tab.
- Every document ingestion, user query, ratio verification, and authentication event is cryptographically recorded in an immutable ledger with timestamps, user identities, client IP addresses, and hash fingerprints.

---

## Verification & Automated Test Suite

Run these test scripts to verify your installation:

### 1. Test PyMuPDF Page Router
```bash
python test_router.py
```
*Validates that text, table, chart, and irrelevant pages are classified accurately.*

### 2. Test Local IBM Granite 4.0 1B LLM
```bash
python test_granite.py
```
*Loads the local model weights into memory and generates a 2-sentence financial explanation.*

### 3. Test End-to-End FAISS + Granite RAG Pipeline
```bash
python test_faiss_granite_pipeline.py
```
*Builds an in-memory vector index and evaluates sub-second RAG retrieval.*

### 4. Verify Frontend Production Build
```bash
cd frontend
npm run build
```
*Validates TypeScript types and generates production bundles (`tsc && vite build`).*

### 5. Test Enterprise Security Suite
```powershell
python -m unittest backend/tests/test_enterprise_security.py
```
*Verifies security headers, path traversal rejection, prompt injection filters, magic byte verification, and sliding-window rate limiting.*

---

## Environment Configuration & Variables

You can configure DoxFin by creating a `.env` file in the project root:

```ini
# Environment Mode
ENVIRONMENT=development

# Database Connection (SQLite by default; supports PostgreSQL in production)
DATABASE_URL=sqlite:///./doxfin.db
# PostgreSQL Example: postgresql+psycopg2://user:password@localhost:5432/doxfin

# Security & JWT Tokens
DOXFIN_JWT_SECRET=your_super_secret_cryptographic_key_here
DOXFIN_JWT_EXPIRATION_MINUTES=1440

# Hardware & Inference Profile (LITE | BALANCED | PERFORMANCE)
DOXFIN_HARDWARE_MODE=LITE
DOXFIN_MEMORY_CEILING_GB=4.0

# Storage Directories
DOXFIN_UPLOAD_DIR=./backend/uploads
DOXFIN_EXTRACTED_DIR=./backend/extracted
DOXFIN_VECTOR_DIR=./backend/vector_store
DOXFIN_CACHE_DIR=./backend/cache
```

---

## Repository Structure

```
DoxFin/
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI REST route endpoints
│   │   │   ├── audit.py         # SOC2 compliance & audit ledger routes
│   │   │   ├── auth.py          # JWT authentication & user management
│   │   │   ├── documents.py     # Document upload, parsing, status, & RAG query
│   │   │   └── enterprise.py    # Hardware profiling & license checks
│   │   ├── database/            # SQLAlchemy models, sessions & migrations
│   │   │   ├── database.py      # SQLite / PostgreSQL engine config
│   │   │   └── models.py        # User, Document, Metric, Anomaly, Audit models
│   │   ├── services/            # Core computational & AI engines
│   │   │   ├── anomaly_service.py     # 18 forensic accounting stress rules
│   │   │   ├── audit_service.py       # SOC2 audit trail logging
│   │   │   ├── auth_service.py        # RBAC permissions & password hashing
│   │   │   ├── chunking_service.py    # Table-aware semantic chunking
│   │   │   ├── extraction_service.py  # Docling / PyMuPDF extractors
│   │   │   ├── financial_service.py   # Deterministic Python ratio math
│   │   │   ├── granite_service.py     # Local IBM Granite 4.0 1B LLM loader
│   │   │   ├── page_router.py         # PyMuPDF Fast Pass classifier
│   │   │   ├── rag_service.py         # FAISS vector store & prompt grounding
│   │   │   └── security_service.py    # PDF sanitization & crypto tokens
│   │   └── main.py              # FastAPI application entrypoint
│   └── requirements.txt         # Python package dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components & DoxFin vector logo
│   │   ├── App.tsx              # Main multi-view application (Chat, Analysis, etc.)
│   │   ├── index.css            # Dark/light theme design system tokens
│   │   └── main.tsx             # React DOM root mounting
│   ├── package.json             # React 19, TypeScript, Lucide, Vite dependencies
│   └── vite.config.ts           # Development server & proxy configuration
│
├── models/
│   └── granite-4.0-1b/          # Local offline IBM Granite 4.0 1B LLM weights
│
├── installer.py                 # Automated enterprise deployment & validation script
├── run_backend.py               # Root-level backend launcher
├── Dockerfile                   # Production Python 3.11 container specification
├── docker-compose.yml           # Multi-volume Docker orchestration
├── test_router.py               # Unit test: Fast pass page classifier
├── test_granite.py              # Unit test: IBM Granite local inference
└── test_faiss_granite_pipeline.py # Unit test: FAISS vector retrieval & RAG
```

---

## Troubleshooting & FAQ

### 1. PowerShell: "Running scripts is disabled on this system"
Run this command in PowerShell to allow the virtual environment activation script:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 2. PyMuPDF or Docling library issues on Linux
Ensure required system packages for PDF rendering and OCR are installed:
```bash
sudo apt-get update && sudo apt-get install -y libmupdf-dev libgomp1 tesseract-ocr
```

### 3. Port 8000 or 3000 is already in use
- **Backend:** Change port in `run_backend.py` (`port=8001`) and update `frontend/vite.config.ts` proxy target.
- **Frontend:** Start Vite on an alternate port: `cd frontend && npm run dev -- --port 3001`.

### 4. GPU Out-of-Memory (CUDA OOM)
If running on systems with limited GPU VRAM (e.g. 4GB Laptop GPUs), DoxFin defaults to the **`LITE`** hardware profile (`torch.float32` / CPU fallback or 4-bit quantization). You can explicitly toggle this via the web UI in the **System** tab.

### 5. Why are financial ratios different from raw LLM outputs?
DoxFin enforces **Zero Hallucination Arithmetic**. If an LLM estimates a ratio as `14.2%` while the deterministic Python formula evaluates it to `18.40%` based on audited P&L line items, DoxFin always displays the deterministic `18.40%` and flags the source note.

---

## Enterprise Disclaimer & Pilot Licensing

- **Disclaimer:** DoxFin is an advanced financial intelligence and document audit assistance system. It is designed to aid qualified credit analysts, equity researchers, and auditors. It does not provide automated legal, accounting, investment, or tax advice.
- **Licensing:** Enterprise Pilot licenses are managed locally via `backend/licenses/doxfin.lic`. For air-gapped on-premise keys and institutional licensing, contact your internal system administrator.

---

<p align="center">
  <strong>Built with Precision for Quantitative Financial Intelligence.</strong><br>
  © 2026 DoxFin Systems. All rights reserved.
</p>
