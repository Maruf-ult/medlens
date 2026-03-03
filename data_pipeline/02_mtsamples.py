"""
02_mtsamples.py — Process MTSamples CSV
Cleans and prepares ~5,000 medical transcription samples.

Input:  data/raw/mtsamples/mtsamples.csv
Output: data/processed/mtsamples.jsonl  (one JSON per line)

Run: python data_pipeline/02_mtsamples.py
"""

import json
import re
import sys
from pathlib import Path
import pandas as pd
from tqdm import tqdm

# ── Paths ─────────────────────────────────────────────────────
ROOT       = Path(__file__).parent.parent
INPUT_CSV  = ROOT / "data/raw/mtsamples/mtsamples.csv"
OUTPUT_DIR = ROOT / "data/processed"
OUTPUT_FILE = OUTPUT_DIR / "mtsamples.jsonl"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def clean_text(text: str) -> str:
    """
    Clean a medical transcription:
    - Remove excessive whitespace
    - Normalize line breaks
    - Strip HTML artifacts
    """
    if not isinstance(text, str):
        return ""
    text = re.sub(r"<[^>]+>", "", text)       # Remove HTML tags
    text = re.sub(r"\n{3,}", "\n\n", text)     # Max 2 consecutive newlines
    text = re.sub(r"[ \t]{2,}", " ", text)     # Collapse spaces
    text = text.strip()
    return text


def process_mtsamples():
    print("📂 Processing MTSamples...")
    print(f"   Input:  {INPUT_CSV}")
    print(f"   Output: {OUTPUT_FILE}")
    print()

    if not INPUT_CSV.exists():
        print(f"❌ File not found: {INPUT_CSV}")
        print("   Run: bash data_pipeline/01_download.sh")
        sys.exit(1)

    df = pd.read_csv(INPUT_CSV)
    print(f"   Loaded {len(df):,} rows")
    print(f"   Columns: {list(df.columns)}")
    print()

    # MTSamples CSV columns:
    # unnamed, description, medical_specialty, sample_name, transcription, keywords

    processed   = 0
    skipped     = 0
    specialties = {}

    with open(OUTPUT_FILE, "w") as f:
        for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing"):
            transcription = clean_text(str(row.get("transcription", "")))
            specialty     = str(row.get("medical_specialty", "")).strip()
            keywords      = str(row.get("keywords", "")).strip()
            description   = str(row.get("description", "")).strip()

            # Skip very short or empty transcriptions
            if len(transcription) < 100:
                skipped += 1
                continue

            record = {
                "source":     "mtsamples",
                "specialty":  specialty,
                "text":       transcription,
                "metadata": {
                    "description": description,
                    "keywords":    keywords,
                    "sample_name": str(row.get("sample_name", "")),
                    "char_count":  len(transcription),
                }
            }

            f.write(json.dumps(record) + "\n")
            processed += 1

            # Track specialty distribution
            specialties[specialty] = specialties.get(specialty, 0) + 1

    # Print summary
    print(f"\n✅ MTSamples processed!")
    print(f"   Records written: {processed:,}")
    print(f"   Skipped (too short): {skipped}")
    print(f"\n   Top specialties:")
    for spec, count in sorted(specialties.items(), key=lambda x: -x[1])[:10]:
        print(f"   {spec:30s} {count:,}")

    print(f"\n   Output: {OUTPUT_FILE}")
    return processed


if __name__ == "__main__":
    process_mtsamples()
