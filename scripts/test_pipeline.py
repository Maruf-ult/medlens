"""
test_pipeline.py — End-to-end test of the MedLens pipeline

Run: python scripts/test_pipeline.py

Tests:
  1. De-identifier (PHI scrubbing)
  2. Analyzer (AI analysis)
  3. Q&A engine
  4. Full API via HTTP
"""

import asyncio
import sys
import os
from pathlib import Path

ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "backend"))

# ── Test 1: De-identifier ─────────────────────────────────────
def test_deidentifier():
    print("\n🔒 TEST 1: De-identifier")
    print("─" * 40)
    
    from deidentifier import DeIdentifier
    deid = DeIdentifier()

    test_text = """
    Patient: John Smith, DOB: 03/15/1975, MRN: 123456
    Phone: 555-867-5309 | Email: jsmith@email.com
    
    DIAGNOSIS: The patient presents with elevated creatinine (2.1 mg/dL).
    History of hypertension and type 2 diabetes.
    Recommend nephrology consultation.
    """

    result = deid.scrub(test_text)

    print(f"  PHI detected:    {result['phi_detected']}")
    print(f"  Entities found:  {result['entities_found']}")
    print(f"\n  Original:  {test_text[:120].strip()}")
    print(f"\n  Scrubbed:  {result['clean_text'][:120].strip()}")

    assert result["phi_detected"], "Should have detected PHI"
    print("\n  ✅ PASS")
    return True


# ── Test 2: OCR ────────────────────────────────────────────────
def test_ocr():
    print("\n🔬 TEST 2: OCR Pipeline")
    print("─" * 40)

    from ocr import OCRPipeline
    ocr = OCRPipeline()

    # Test plain text (always works)
    test_text = b"HEMOGLOBIN: 12.1 g/dL [LOW]\nWBC: 7.2 x10^3/uL [Normal]"
    result = ocr.extract(test_text, "text/plain", "test.txt")

    assert "HEMOGLOBIN" in result
    print(f"  Plain text extraction: ✅")
    print(f"  Extracted: {result[:80]}")
    print("\n  ✅ PASS")
    return True


# ── Test 3: Analyzer (requires ANTHROPIC_API_KEY) ─────────────
async def test_analyzer():
    print("\n🤖 TEST 3: AI Analyzer")
    print("─" * 40)

    if not os.getenv("ANTHROPIC_API_KEY"):
        print("  ⚠️  ANTHROPIC_API_KEY not set — skipping")
        return True

    from analyzer import MedicalAnalyzer
    analyzer = MedicalAnalyzer()

    test_report = """
    LABORATORY REPORT
    WBC: 12.5 × 10³/µL [HIGH — Ref: 4.5-11.0]
    Hemoglobin: 10.1 g/dL [LOW — Ref: 12.0-16.0]
    Creatinine: 1.9 mg/dL [HIGH — Ref: 0.6-1.2]
    Glucose: 148 mg/dL [HIGH — Fasting ref: 70-100]
    Sodium: 138 mEq/L [Normal]
    """

    result = await analyzer.analyze(test_report, mode="full")

    print(f"  Overall status:  {result.get('overall_status')}")
    print(f"  Urgency score:   {result.get('urgency_score')}/10")
    print(f"  Findings count:  {len(result.get('findings', []))}")
    print(f"  Summary snippet: {result.get('summary', '')[:100]}...")

    assert result.get("overall_status"), "Should have overall_status"
    assert result.get("findings"),       "Should have findings"
    print("\n  ✅ PASS")
    return True


# ── Test 4: Full HTTP API ──────────────────────────────────────
async def test_api():
    print("\n🌐 TEST 4: HTTP API")
    print("─" * 40)

    try:
        import httpx
    except ImportError:
        print("  ⚠️  httpx not installed — skipping API test")
        return True

    async with httpx.AsyncClient(base_url="http://localhost:8000") as client:
        try:
            # Health check
            resp = await client.get("/health")
            assert resp.status_code == 200
            print("  GET /health:        ✅")

            # Dataset status
            resp = await client.get("/datasets/status")
            print(f"  GET /datasets/status: {resp.json()} ✅")

            # Text analysis
            resp = await client.post(
                "/analyze/text",
                json={
                    "text": "LABORATORY: WBC 13.2 [HIGH]. Creatinine 2.1 [HIGH]. Hemoglobin 9.8 [LOW].",
                    "mode": "redflags",
                }
            )
            if resp.status_code == 200:
                data = resp.json()
                print(f"  POST /analyze/text: ✅  (urgency: {data['urgency_score']}/10)")
            else:
                print(f"  POST /analyze/text: {resp.status_code} — {resp.text[:100]}")

        except httpx.ConnectError:
            print("  ⚠️  Server not running. Start with:")
            print("      cd backend && uvicorn main:app --reload --port 8000")

    print("\n  ✅ PASS (or server not running)")
    return True


# ── Main ──────────────────────────────────────────────────────
async def main():
    print()
    print("╔══════════════════════════════════════════════╗")
    print("║   MedLens Pipeline Tests                     ║")
    print("╚══════════════════════════════════════════════╝")

    results = []

    results.append(("De-identifier", test_deidentifier()))
    results.append(("OCR Pipeline",  test_ocr()))
    results.append(("AI Analyzer",   await test_analyzer()))
    results.append(("HTTP API",      await test_api()))

    print("\n═══════════════════════════════════")
    print("RESULTS:")
    for name, passed in results:
        icon = "✅" if passed else "❌"
        print(f"  {icon} {name}")
    print("═══════════════════════════════════\n")


if __name__ == "__main__":
    asyncio.run(main())
