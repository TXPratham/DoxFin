# Project4

FinWise

FinWise is a privacy-first, multimodal financial document intelligence platform designed to analyze large financial reports, extract structured information, calculate financial metrics, detect unusual patterns, explain likely causes, and provide evidence-backed answers with source references.

Core principle: Python calculates, RAG provides evidence, and the LLM explains.

1. Problem

Financial reports can be hundreds of pages long and contain financial statements, tables, notes, management discussion, risk disclosures, charts, graphs, images, earnings information, and segment information.

FinWise aims to convert complex financial documents into structured, searchable, and understandable financial intelligence.

2. Main Goals

Upload and analyze financial reports and PDFs

Support large reports, including 400–500 pages

Extract text and financial tables

Understand relevant charts and graphs

Calculate financial ratios programmatically

Detect financial anomalies

Investigate why anomalies occurred

Answer document-specific questions using RAG

Show evidence and source-page references

Provide beginner-friendly explanations

Support private and enterprise financial documents

Run in cloud, local enterprise, or private-cloud environments

3. Core Architecture

User uploads PDF
       ↓
Document classification / routing
       ↓
┌─────────────┬─────────────┬─────────────┐
↓             ↓             ↓
Text          Tables        Charts / Images
PyMuPDF       Docling       Vision Model
              / Camelot
↓             ↓             ↓
└─────────────┴──────┬──────┘
                     ↓
              Structured Data
                     ↓
              Validation Layer
                     ↓
          Python Financial Engine
                     ↓
             Anomaly Detection
                     ↓
                 Embeddings
                     ↓
              Vector DB / RAG
                     ↓
                  LLM
                     ↓
          Evidence-backed Answer

4. Technology Responsibilities

Text Extraction

Possible tools:

PyMuPDF

Docling

Recommended initial approach:

Digital PDF
   ↓
PyMuPDF
   ↓
Extracted text

OCR should only be used when required for scanned or image-only pages.

Table Extraction

Possible tools:

Docling

Camelot

Other table-extraction tools if required

Example:

Balance Sheet PDF
       ↓
Docling / Camelot
       ↓
Pandas DataFrame

Chart and Image Understanding

Possible vision-language models include:

Small Phi vision-class models

Smaller Qwen-VL models

Medium Qwen-VL models

InternVL

Granite vision/document models

Other suitable multimodal models

FinWise should not run vision processing on every image.

Image / Page
     ↓
Financially relevant?
     ├── No  → Skip heavy vision processing
     └── Yes → Send to Vision Model

5. Financial Engine

Financial calculations should be performed using deterministic Python code rather than relying on an LLM.

Possible calculations include:

Revenue growth

Profit growth

Net profit margin

Operating margin

Gross margin

Return on Equity

Return on Capital Employed

Return on Assets

Debt-to-equity ratio

Current ratio

Quick ratio

Interest coverage ratio

Free cash flow

Cash flow from operations

EPS

Asset turnover

Inventory turnover

Receivables turnover

Example:

Revenue 2024 = ₹1,000 Cr
Revenue 2025 = ₹1,200 Cr

Growth
= (1200 - 1000) / 1000 × 100
= 20%

The LLM receives the calculated result instead of performing the calculation itself.

6. Anomaly Detection

FinWise can detect unusual financial relationships such as:

Revenue increasing while profit decreases

Profit increasing while operating cash flow decreases

Debt increasing sharply

Receivables growing faster than revenue

Margins falling significantly

Free cash flow weakening

Current ratio deteriorating

Expenses increasing faster than sales

Example workflow:

Anomaly detected
      ↓
Retrieve related evidence using RAG
      ↓
Find management explanation
      ↓
LLM generates explanation
      ↓
Show supporting page / section

An anomaly should not automatically be treated as fraud or financial failure.

7. RAG Architecture

FinWise should avoid sending an entire 500-page report directly to an LLM.

Financial Report
      ↓
Chunking
      ↓
Embeddings
      ↓
Vector Search
      ↓
Relevant 3–8 chunks
      ↓
LLM
      ↓
Evidence-backed answer

Possible vector technology: FAISS.

8. Hallucination Reduction

FinWise should not use the LLM as the authoritative source of financial numbers.

PDF
 ↓
Structured extraction
 ↓
Validation
 ↓
Financial Engine
 ↓
RAG evidence
 ↓
LLM explanation

Cross-Verification

Financial Table → Debt = ₹820 Cr
Nearby Text    → Debt = ₹820 Cr
                 ↓
              Verified

If sources disagree:

Table → ₹820 Cr
Chart → ₹280 Cr
        ↓
Conflict detected
        ↓
Human verification required

FinWise should not silently guess.

9. Human-in-the-Loop

For low-confidence or conflicting results:

AI Result
   ↓
Low confidence / conflict
   ↓
Flag for review
   ↓
Financial Analyst
   ↓
Approve / Correct

Enterprise customers may require approval before exporting analysis, finalizing reports, or sharing high-risk conclusions.

10. Confidence Scoring

A future confidence layer could classify extracted results.

98% confidence → normal output
75% confidence → warning
50% confidence → human verification

Actual thresholds should be determined through testing and benchmarking rather than guessed.

11. Evidence and Citations

Important FinWise outputs should ideally contain:

Document name

Page number

Section

Table reference

Chart reference

Example:

Revenue increased 20% in FY2025.

Source:
Annual Report
Page 126
Consolidated Statement of Profit & Loss

12. Large PDF Processing Strategy

A 400–500-page report should not be processed using the most expensive model on every page.

500-page PDF
     ↓
Lightweight page classification
     ↓
┌──────────┬──────────┬──────────┬──────────┐
Text       Table      Chart      Irrelevant
↓          ↓          ↓          ↓
PyMuPDF    Docling    Vision     Skip

Possible relevant-content signals:

Revenue

Profit

EBITDA

Borrowings

Debt

Cash Flow

Assets

Liabilities

Equity

Segment

Operating Margin

Financial Results

Balance Sheet

Profit and Loss

Financial captions

Axes and legends

Table structure

Section headings

Possible scoring:

Financial keyword       +2
Chart/table detected    +2
Financial caption       +3
Financial section       +2
Decorative/photo only   -3

13. Performance Optimization

Selective Processing

Run expensive AI only on relevant pages.

Parallel Processing

Text Extraction   ─┐
Table Extraction   ├── Run concurrently
Vision Processing ─┘

Batch Processing

Batch embeddings, images, text chunks, and table operations.

Avoid Unnecessary OCR

Use PyMuPDF for digitally readable PDFs and OCR only when required.

Section Prioritization

Prioritize financial statements, notes, MD&A, risk sections, and segment reporting.

Caching

Store extracted text, tables, chart descriptions, embeddings, calculated metrics, anomalies, and page references.

Progressive Processing

Stage 1 → Text search ready
Stage 2 → Tables ready
Stage 3 → Charts fully analyzed

Quantization

Use smaller 4-bit or 8-bit models where appropriate.

14. Memory and Hardware Strategy

Local LLM + vision does not automatically require 32 GB or 64 GB RAM.

Memory requirements depend on model size, quantization, image resolution, batch size, context length, system RAM, GPU VRAM, and whether multiple models are loaded simultaneously.

Possible optimizations:

Smaller models

Quantization

Smaller batches

Lower image resolution where acceptable

CPU offloading

Sequential model loading

GPU server deployment

15. Small vs Large Models

Small Models

Good for laptops, lower memory, local Lite deployments, basic chart understanding, and lower inference cost.

Medium Models

Good for balanced accuracy and resource use, cloud or company GPU servers, and better visual/document reasoning.

Large Models

Good for complex charts, dense documents, advanced reasoning, and strong cloud or enterprise GPU infrastructure.

FinWise should use the smallest model that meets benchmarked accuracy requirements.

16. Hardware-Adaptive Processing

FinWise can inspect CPU, RAM, GPU, and VRAM, then select a processing mode.

Lite Mode

Small models

Lower batch size

Limited parallelism

Balanced Mode

Medium models

Moderate parallel processing

Performance Mode

Larger batches

More workers

Strong GPU utilization

Larger models where justified

Deployment Options

17. FinWise Cloud SaaS

User
 ↓
Browser
 ↓
FinWise Cloud
 ↓
Cloud CPU / GPU
 ↓
LLM + Vision + RAG

Advantages:

Users do not need powerful hardware

Scalable

Easier deployment

Can use strong GPUs

Parallel processing

Disadvantages:

Cloud GPU cost

Storage cost

Increased security responsibility

Sensitive documents leave the customer's infrastructure

18. FinWise Enterprise Local

Employees
 ↓
Browser
 ↓
Company Server
 ├── FinWise
 ├── Database
 ├── RAG
 ├── LLM
 └── Vision Model
       ↓
 Company GPU

Advantages:

Financial data remains within the company

Company provides compute

No cloud inference dependency

Suitable for confidential documents

Disadvantages:

Performance depends on customer hardware

Installation and support are more complex

19. FinWise Private Cloud

Company
 ↓
Company AWS / Azure / GCP environment
 ↓
Private GPU Instance
 ↓
FinWise

Benefits:

Powerful scalable hardware

Customer controls the cloud environment

Useful for enterprises that do not own physical GPU servers

20. Hybrid Deployment Strategy

                    FINWISE
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
     SaaS          Local Enterprise   Private Cloud
       ↓               ↓               ↓
FinWise GPU        Customer GPU      Customer Cloud GPU

Customers can choose based on security, privacy, performance, hardware, cost, and compliance.

Security

21. Security Principle

Every uploaded document may contain confidential or sensitive information.

Never depend on users avoiding sensitive uploads.

22. Encryption in Transit

Use TLS/HTTPS when information travels between systems.

User
 🔒 HTTPS/TLS
FinWise Server

23. Encryption at Rest

Sensitive stored data should be encrypted, including:

Original PDFs

Extracted text

Tables

Temporary files

Cached chart data

Embeddings

Analysis results

Backups

AES-256 may be used where appropriate, combined with proper key management.

24. Key Management

Possible approaches:

Cloud Key Management Service

HSM

TPM

Enterprise secrets vault

25. Authentication and Authorization

Possible controls:

User login

MFA

RBAC

ABAC for advanced enterprise deployments

26. Audit Logs

Example:

10:30 User A logged in
10:32 User A uploaded Report.pdf
10:35 Analysis completed
11:02 User B viewed report
11:10 User B exported analysis

27. Data Retention

Organizations should be able to configure policies such as:

Delete immediately after analysis

Keep for 30 days

Keep for 90 days

Keep for one year

Custom retention period

Deletion should consider the original PDF, extracted text, tables, images, embeddings, caches, derived analysis, and applicable backup-retention rules.

28. Multi-Tenant SaaS Isolation

Company A → Company A Data
Company B → Company B Data
Company C → Company C Data

One tenant must not access another tenant's PDFs, embeddings, analysis, chats, or metadata.

29. DPDP Considerations

The Digital Personal Data Protection framework may be relevant when FinWise processes digital personal data relating to identifiable individuals.

Examples may include names, email addresses, employee information, personal identifiers, and certain personal financial information.

Not every financial figure is automatically personal data. Production deployment should include appropriate legal and compliance review.

30. Optional Blockchain / Integrity Layer

Blockchain is not required for core FinWise security.

If used, a better use case is document integrity:

PDF
 ↓
SHA-256 Hash
 ↓
Tamper-Evident Record

Do not store confidential PDFs directly on a blockchain.

Alternatives include digital signatures, hash-chained logs, and append-only audit storage.

Workflow and Scaling Tools

31. Useful Open-Source Repositories

Docling

Document parsing, layout, tables, and structured document conversion.

Docling Serve

Document-processing API, worker-based conversion, asynchronous jobs, and scalable processing.

PyMuPDF

Fast PDF text extraction, page handling, and image extraction.

Camelot

Extracting PDF tables and converting them to Pandas DataFrames.

FAISS

Vector similarity search and RAG retrieval.

Celery

User-triggered background processing and distributed task execution.

Redis / RabbitMQ

Task broker, queue, and caching.

Apache Airflow

Scheduled pipelines, re-indexing, filing updates, cleanup workflows, retry handling, and workflow dependencies.

Airflow does not directly make the AI model faster.

Ray

Distributed CPU/GPU processing and scaling Python AI workloads across machines.

Unstructured

Can be evaluated for document partitioning and parallel PDF workflows.

32. Airflow vs Celery vs Ray

Tool

Main Role

Celery

Real-time/background application jobs

Airflow

Scheduled/batch workflows

Ray

Distributed compute

Docling Serve

Document conversion workers

Do not add all tools unless the architecture requires them.

33. Suggested Initial Stack

Frontend
React

Backend
FastAPI

Database
PostgreSQL

Background Jobs
Celery + Redis
OR
Docling Serve workers

PDF Processing
PyMuPDF + Docling

Table Processing
Docling / Camelot

Vision
Small or Medium VLM

Financial Engine
Python + Pandas

Embeddings
Suitable embedding model

Vector Search
FAISS

Explanation
Granite LLM

Security
TLS + Authentication + RBAC
+ Encryption + Audit Logs

Licensing and Business Model

34. Enterprise Licensing

FinWise Enterprise can use cryptographically signed offline licence files.

{
  "customer": "ABC Ltd",
  "product": "FinWise Enterprise",
  "plan": "enterprise",
  "max_users": 50,
  "expires": "2027-12-31",
  "features": [
    "rag",
    "financial_analysis",
    "anomaly_detection",
    "vision"
  ]
}

Flow:

FinWise creates licence
       ↓
Signs with private key
       ↓
Customer receives licence
       ↓
FinWise verifies locally
using public key

35. Monetization Options

SaaS

Customer pays monthly, annual, or usage-based subscription. FinWise pays for infrastructure.

Enterprise Local

Customer provides GPU, server, and storage. FinWise charges for annual licence, deployment, support, updates, and integrations.

Private Cloud

Customer pays cloud infrastructure. FinWise charges for software licence, deployment, support, and maintenance.

Cost Planning

36. Prototype / Development Cost

A low initial cost is possible if existing laptops, open-source software, pretrained models, and minimal cloud usage are used.

A small development estimate must not be presented as the cost of commercial deployment.

37. Production Cost Categories

Infrastructure

CPU

GPU

Storage

Databases

Networking

Backups

Monitoring

Security

Vulnerability testing

Penetration testing

Security audits

Key management

Security monitoring

Legal and Compliance

Privacy policy

Terms

Contracts

Data processing agreements

DPDP-related review where applicable

Product Operations

Development

DevOps

Maintenance

Customer support

Financial-domain review

Software / Licensing

Some final components may have commercial licensing costs.

Open-source software reduces licensing expenses but does not eliminate compute or operational costs.

Benchmarking

38. Required Performance Benchmarks

Test FinWise with:

100-page reports

300-page reports

500-page reports

Measure:

Upload time

Text extraction time

Table extraction time

Vision-processing time

Embedding-generation time

Financial-engine time

Index creation

First-query latency

Later-query latency

RAM usage

VRAM usage

CPU utilization

GPU utilization

Cloud cost per document

Do not claim a fixed 500-page processing time before benchmarking.

Things to Avoid

39. Bad Architecture Decisions

Avoid:

Sending all 500 pages directly to an LLM

Running vision on every page

Using the LLM for financial arithmetic

Trusting extracted values without validation

Claiming RAG completely eliminates hallucinations

Assuming users will not upload confidential documents

Assuming local deployment is automatically secure

Assuming cloud automatically makes processing faster

Claiming fixed processing times without measurements

Adding Airflow, Ray, Celery, and other systems without need

Using one huge model for every task

Treating every financial value as DPDP personal data

Presenting a small prototype budget as full production cost

Proposed Final Architecture

                         FINWISE
                            │
                      React Frontend
                            │
                         FastAPI
                            │
                  Authentication / RBAC
                            │
                       Upload Service
                            │
                  Background Job Queue
                            │
                   Relevance/Page Router
                            │
       ┌────────────────────┼────────────────────┐
       ↓                    ↓                    ↓
    PyMuPDF              Docling             Vision VLM
      Text                Tables              Charts
       ↓                    ↓                    ↓
       └────────────────────┼────────────────────┘
                            ↓
                     Validation Layer
                            ↓
                  Python Financial Engine
                            ↓
                    Anomaly Detection
                            ↓
                   Embeddings + FAISS
                            ↓
                           RAG
                            ↓
                       Granite LLM
                            ↓
                Evidence-Backed Explanation
                            ↓
                   Confidence Verification
                            ↓
              Human Review When Necessary

Deployment options:

                       FINWISE
                          │
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
       Cloud SaaS     Enterprise Local   Private Cloud
          ↓               ↓               ↓
   FinWise Cloud GPU  Customer GPU     Customer Cloud GPU

Future Improvements

Multi-company comparison

Multi-year trend analysis

Earnings-call analysis

Financial forecasting

Company-specific dashboards

Automated sensitivity detection

Role-based enterprise workspaces

Collaborative analyst review

Exportable evidence-backed reports

Model benchmarking framework

Automatic extraction-quality scoring

Advanced fraud-risk indicators

Private-cloud deployment automation

Distributed GPU processing

Advanced document-integrity verification

Product Positioning

FinWise is not intended to rely entirely on a single LLM.

Its value comes from combining:

Document Intelligence
        +
Financial Computation
        +
Anomaly Detection
        +
RAG
        +
Multimodal AI
        +
Evidence Verification
        +
Enterprise Privacy

The goal is to create a system that is not only capable of reading financial reports, but also capable of producing structured, explainable, and verifiable financial intelligence.

Disclaimer

FinWise should be positioned as a financial research and document-analysis platform, not as a replacement for professional financial, investment, accounting, legal, or compliance advice.

Automated anomaly detection indicates unusual patterns and should not automatically be interpreted as fraud, wrongdoing, or investment advice.
