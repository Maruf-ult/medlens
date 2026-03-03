# MedLens — AI Medical Report Analyzer
## Full-Stack Build Guide (2026)

```
medlens/
├── backend/
│   ├── main.py              ← FastAPI server (entry point)
│   ├── analyzer.py          ← Core AI analysis logic
│   ├── ocr.py               ← LayoutLMv3 OCR pipeline
│   ├── deidentifier.py      ← PHI scrubber (HIPAA-safe)
│   ├── database.py          ← PostgreSQL + pgvector setup
│   └── qa_engine.py         ← MedQuAD Q&A retrieval
├── data_pipeline/
│   ├── 01_download.sh       ← Download all 4 datasets
│   ├── 02_mtsamples.py      ← Process MTSamples CSV
│   ├── 03_medquad.py        ← Process MedQuAD XML→JSON
│   ├── 04_pmcpatients.py    ← Process PMC-Patients
│   └── 05_embed_and_store.py← Generate embeddings → pgvector
├── scripts/
│   ├── setup_db.sql         ← PostgreSQL schema
│   └── test_pipeline.py     ← End-to-end test
├── frontend/                ← Your existing HTML app
└── docs/
    └── HIPAA_CHECKLIST.md   ← Compliance guide
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.11+ | python.org |
| PostgreSQL | 16+ | postgresql.org |
| Docker (optional) | Latest | docker.com |
| Git | Any | git-scm.com |

---

## 1. Clone & Install

```bash
git clone <your-repo>
cd medlens
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 2. Database Setup

```bash
# Install PostgreSQL + pgvector extension
psql -U postgres -f scripts/setup_db.sql
```

---

## 3. Download Datasets

```bash
# Set your Kaggle API key first
export KAGGLE_USERNAME=your_username
export KAGGLE_KEY=your_api_key

bash data_pipeline/01_download.sh
```

---

## 4. Run Data Pipeline

```bash
python data_pipeline/02_mtsamples.py
python data_pipeline/03_medquad.py
python data_pipeline/04_pmcpatients.py
python data_pipeline/05_embed_and_store.py   # Takes ~30-60 min
```

---

## 5. Start the Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

---

## 6. Test It

```bash
python scripts/test_pipeline.py
```
