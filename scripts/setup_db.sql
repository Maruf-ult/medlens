-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Table 1: medical_cases
CREATE TABLE IF NOT EXISTS medical_cases (
    id          SERIAL PRIMARY KEY,
    source      TEXT NOT NULL,
    specialty   TEXT,
    text        TEXT NOT NULL,
    metadata    JSONB DEFAULT '{}',
    embedding   vector(384),
    created_at  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_case UNIQUE (source, md5(text))
);

CREATE INDEX IF NOT EXISTS medical_cases_embedding_idx
    ON medical_cases USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX IF NOT EXISTS medical_cases_source_idx ON medical_cases (source);
CREATE INDEX IF NOT EXISTS medical_cases_specialty_idx ON medical_cases (specialty);

-- Table 2: qa_pairs
CREATE TABLE IF NOT EXISTS qa_pairs (
    id          SERIAL PRIMARY KEY,
    question    TEXT NOT NULL,
    answer      TEXT NOT NULL,
    source_url  TEXT,
    focus_area  TEXT,
    qtype       TEXT,
    embedding   vector(384),
    created_at  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_qa UNIQUE (md5(question))
);

CREATE INDEX IF NOT EXISTS qa_pairs_embedding_idx
    ON qa_pairs USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Table 3: analysis_logs
CREATE TABLE IF NOT EXISTS analysis_logs (
    id              SERIAL PRIMARY KEY,
    session_id      TEXT NOT NULL,
    mode            TEXT,
    report_length   INTEGER,
    dataset_used    TEXT,
    urgency_score   INTEGER,
    overall_status  TEXT,
    processing_ms   INTEGER,
    phi_detected    BOOLEAN DEFAULT FALSE,
    error           TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Verify
DO $$
BEGIN
    RAISE NOTICE '✅ MedLens schema created successfully';
    RAISE NOTICE '   Tables: medical_cases, qa_pairs, analysis_logs';
    RAISE NOTICE '   pgvector extension: enabled';
END $$;
```

---

## What to check after pressing F5

At the bottom of pgAdmin you'll see the **Messages** tab. You should see:
```
NOTICE:  ✅ MedLens schema created successfully
NOTICE:     Tables: medical_cases, qa_pairs, analysis_logs
NOTICE:     pgvector extension: enabled

Query returned successfully.