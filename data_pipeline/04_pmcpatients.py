"""
04_pmcpatients.py — Process PMC-Patients Dataset
Downloads and processes 167k patient summaries from HuggingFace.

Dataset: zhengyun21/PMC-Patients
Each record: patient summary extracted from a PubMed Central case report

Input:  HuggingFace (auto-downloaded)
Output: data/processed/pmcpatients.jsonl

Run: python data_pipeline/04_pmcpatients.py

Note: Full dataset is ~2GB. For initial testing, use MAX_RECORDS=5000.
"""

import json
import sys
from pathlib import Path
from tqdm import tqdm

ROOT        = Path(__file__).parent.parent
OUTPUT_DIR  = ROOT / "data/processed"
OUTPUT_FILE = OUTPUT_DIR / "pmcpatients.jsonl"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# For testing, limit to 5000. Set to None to process all 167k.
MAX_RECORDS = 5000


def process_pmcpatients():
    print("📂 Processing PMC-Patients...")
    print(f"   Source: HuggingFace (zhengyun21/PMC-Patients)")
    print(f"   Output: {OUTPUT_FILE}")
    print(f"   Max records: {MAX_RECORDS or 'ALL (~167k)'}")
    print()

    try:
        from datasets import load_dataset
    except ImportError:
        print("❌ datasets library not installed")
        print("   Run: pip install datasets")
        sys.exit(1)

    print("   Downloading from HuggingFace (first run ~2GB download)...")
    dataset = load_dataset(
        "zhengyun21/PMC-Patients",
        split="train",
        streaming=True,          # Stream to avoid loading all 2GB into RAM
    )

    processed  = 0
    age_groups = {}

    with open(OUTPUT_FILE, "w") as out:
        for record in tqdm(dataset, total=MAX_RECORDS, desc="Processing"):
            if MAX_RECORDS and processed >= MAX_RECORDS:
                break

            # PMC-Patients fields:
            # patient_id, patient, age, sex, relevant_articles, similar_patients
            summary = str(record.get("patient", "")).strip()

            if len(summary) < 100:
                continue

            age = str(record.get("age", "")).strip()
            sex = str(record.get("sex", "")).strip()

            # Build readable text including age/sex context
            text = f"Patient: {age} {sex}\n\n{summary}"

            item = {
                "source":    "pmcpatients",
                "specialty": "Case Report",      # PMC-Patients are general case reports
                "text":      text,
                "metadata": {
                    "patient_id":         record.get("patient_id", ""),
                    "age":                age,
                    "sex":                sex,
                    "relevant_articles":  len(record.get("relevant_articles", [])),
                }
            }

            out.write(json.dumps(item) + "\n")
            processed += 1

            # Track age distribution
            try:
                age_num = int(age.split()[0]) if age else 0
                bucket  = f"{(age_num // 10) * 10}s"
                age_groups[bucket] = age_groups.get(bucket, 0) + 1
            except:
                pass

    print(f"\n✅ PMC-Patients processed!")
    print(f"   Records written: {processed:,}")
    if age_groups:
        print(f"\n   Age distribution:")
        for bucket, n in sorted(age_groups.items()):
            bar = "█" * (n // max(1, max(age_groups.values()) // 20))
            print(f"   {bucket:6s} {bar} {n:,}")
    print(f"\n   Output: {OUTPUT_FILE}")
    return processed


if __name__ == "__main__":
    process_pmcpatients()
