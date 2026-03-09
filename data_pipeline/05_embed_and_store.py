"""
05_embed_and_store.py — Generate Embeddings + Load into pgvector

This is the key step that makes the RAG (Retrieval-Augmented Generation)
pattern work. It:

  1. Reads all processed JSONL files
  2. Generates a 384-dim vector embedding for each record
  3. Stores everything in PostgreSQL with pgvector

After this runs, the AI can find "similar cases" to any new report
by doing a fast vector similarity search.

Estimated runtime:
  MTSamples  (5k records):  ~5 minutes
  MedQuAD   (47k records): ~30 minutes
  PMC-Patients (5k sample): ~5 minutes

Run: python data_pipeline/05_embed_and_store.py
"""

import os
import sys
import json
import asyncio
import logging
from dotenv import load_dotenv
load_dotenv('E:/medlens/.env')
from pathlib import Path

from tqdm import tqdm

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

ROOT = Path(__file__).parent.parent

# Add backend to path so we can import Database
sys.path.insert(0, str(ROOT / "backend"))

from database import Database

# Processed JSONL files to load
DATASETS = [
    {"file": ROOT / "data/processed/mtsamples.jsonl",   "type": "cases"},
    {"file": ROOT / "data/processed/pmcpatients.jsonl", "type": "cases"},
    {"file": ROOT / "data/processed/medquad.jsonl",     "type": "qa"},
]

# Batch size for DB inserts (tune for your RAM)
BATCH_SIZE = 100


async def load_dataset(db: Database, file_path: Path, dataset_type: str):
    """
    Read a JSONL file and insert all records with embeddings into the DB.
    
    Args:
        db: Connected Database instance
        file_path: Path to .jsonl file
        dataset_type: "cases" or "qa"
    """
    if not file_path.exists():
        logger.warning(f"Skipping missing file: {file_path}")
        return 0

    records = []
    with open(file_path) as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    logger.info(f"Loading {len(records):,} records from {file_path.name}")

    inserted = 0
    errors   = 0

    # Process in batches to show progress
    for i in tqdm(range(0, len(records), BATCH_SIZE), desc=file_path.stem):
        batch = records[i : i + BATCH_SIZE]

        for record in batch:
            try:
                if dataset_type == "cases":
                    await db.insert_case(
                        source   = record["source"],
                        text     = record["text"],
                        specialty= record.get("specialty", ""),
                        metadata = record.get("metadata", {}),
                    )
                elif dataset_type == "qa":
                    await db.insert_qa(
                        question   = record["question"],
                        answer     = record["answer"],
                        source_url = record.get("source_url", ""),
                        focus_area = record.get("focus_area", ""),
                    )
                inserted += 1
            except Exception as e:
                errors += 1
                if errors <= 3:   # Don't spam logs
                    logger.debug(f"Insert error: {e}")

    logger.info(f"  ✅ {inserted:,} inserted, {errors} errors")
    return inserted


async def main():
    print()
    print("╔══════════════════════════════════════════════╗")
    print("║   MedLens — Embedding & Vector Store Loader  ║")
    print("╚══════════════════════════════════════════════╝")
    print()

    # Check environment
    if not os.getenv("DATABASE_URL") and not os.getenv("POSTGRES_PASSWORD"):
        print("⚠️  DATABASE_URL not set. Using default:")
        print("   postgresql://postgres:password@localhost:5432/medlens")
        print()
        print("   To customize: export DATABASE_URL=postgresql://user:pass@host:5432/medlens")
        print()

    # Connect to DB
    db = Database()
    await db.connect()

    if not db.pool:
        print("❌ Could not connect to PostgreSQL.")
        print("   Make sure PostgreSQL is running and you ran setup_db.sql first:")
        print("   psql -U postgres -f scripts/setup_db.sql")
        sys.exit(1)

    print("✅ Connected to PostgreSQL")
    print()

    total = 0
    for dataset in DATASETS:
        n = await load_dataset(db, dataset["file"], dataset["type"])
        total += n
        print()

    # Final counts
    counts = await db.get_record_counts()
    print("═══════════════════════════════════")
    print("FINAL DATABASE COUNTS:")
    for source, count in counts.items():
        print(f"  {source:20s} {count:,} records")
    print(f"  {'TOTAL':20s} {total:,} records")
    print("═══════════════════════════════════")
    print()
    print("✅ Done! Your vector database is ready.")
    print()
    print("Start the API server:")
    print("  cd backend && uvicorn main:app --reload --port 8000")

    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
