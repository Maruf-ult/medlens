"""
03_medquad.py — Process MedQuAD XML files
Converts 47,457 Q&A pairs from XML into clean JSONL.

MedQuAD structure:
  data/raw/medquad/MedQuAD/
    1_CancerGov_QA/          ← Q&As from cancer.gov
    2_GARD_QA/               ← Rare disease Q&As
    3_GHR_QA/                ← Genetics Home Reference
    4_MedlineplusGov_QA/     ← MedlinePlus (most common terms)
    5_NIDDK_QA/              ← Diabetes & digestive diseases
    ...12 total sources

Input:  data/raw/medquad/MedQuAD/
Output: data/processed/medquad.jsonl

Run: python data_pipeline/03_medquad.py
"""

import json
import sys
from pathlib import Path
import xmltodict
from tqdm import tqdm

ROOT       = Path(__file__).parent.parent
INPUT_DIR  = ROOT / "data/raw/medquad/MedQuAD"
OUTPUT_DIR = ROOT / "data/processed"
OUTPUT_FILE = OUTPUT_DIR / "medquad.jsonl"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def parse_xml_file(xml_path: Path) -> list:
    """
    Parse a single MedQuAD XML file.
    Returns list of Q&A dicts.
    """
    try:
        with open(xml_path, "r", encoding="utf-8") as f:
            data = xmltodict.parse(f.read())
    except Exception:
        return []

    doc = data.get("Document", {})
    if not doc:
        return []

    focus_area = doc.get("@id", "").replace("_", " ")
    source_url = doc.get("@source", "")
    focus_name = doc.get("Focus", "") or focus_area

    # Q&A pairs are nested under QAPairs → QAPair
    qa_section = doc.get("QAPairs", {})
    if not qa_section:
        return []

    qa_pairs = qa_section.get("QAPair", [])
    if isinstance(qa_pairs, dict):
        qa_pairs = [qa_pairs]   # Single Q&A

    results = []
    for qa in qa_pairs:
        question = qa.get("Question", {})
        answer   = qa.get("Answer", "")

        # Question can be string or dict with @qtype attribute
        if isinstance(question, dict):
            q_text = question.get("#text", "")
            q_type = question.get("@qtype", "")
        else:
            q_text = str(question)
            q_type = ""

        # Clean up
        q_text = str(q_text).strip()
        answer = str(answer).strip()

        if not q_text or not answer or len(answer) < 20:
            continue

        results.append({
            "source":     "medquad",
            "question":   q_text,
            "answer":     answer,
            "source_url": source_url,
            "focus_area": focus_name,
            "qtype":      q_type,
        })

    return results


def process_medquad():
    print("📂 Processing MedQuAD...")
    print(f"   Input:  {INPUT_DIR}")
    print(f"   Output: {OUTPUT_FILE}")
    print()

    if not INPUT_DIR.exists():
        print(f"❌ Directory not found: {INPUT_DIR}")
        print("   Run: bash data_pipeline/01_download.sh")
        sys.exit(1)

    # Find all XML files across all subdirectories
    xml_files = list(INPUT_DIR.rglob("*.xml"))
    print(f"   Found {len(xml_files):,} XML files")
    print()

    total     = 0
    by_source = {}

    with open(OUTPUT_FILE, "w") as out:
        for xml_path in tqdm(xml_files, desc="Parsing XML"):
            qa_pairs = parse_xml_file(xml_path)

            for record in qa_pairs:
                out.write(json.dumps(record) + "\n")
                total += 1

                source_dir = xml_path.parent.name
                by_source[source_dir] = by_source.get(source_dir, 0) + 1

    print(f"\n✅ MedQuAD processed!")
    print(f"   Total Q&A pairs: {total:,}")
    print(f"\n   By source folder:")
    for src, n in sorted(by_source.items(), key=lambda x: -x[1]):
        print(f"   {src:40s} {n:,}")
    print(f"\n   Output: {OUTPUT_FILE}")
    return total


if __name__ == "__main__":
    process_medquad()
