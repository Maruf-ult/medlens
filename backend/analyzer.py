"""
analyzer.py — Core Medical Report Analyzer (Groq version)
"""

import os
import json
import logging
from groq import AsyncGroq

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are MedLens, an expert medical report analyzer.
You are trained on MTSamples clinical transcriptions, MIMIC-IV clinical notes,
and PMC-Patients case summaries.

Analyze de-identified medical reports and return structured findings
in plain, accessible language that patients can understand.

CRITICAL RULES:
1. This is for EDUCATIONAL PURPOSES ONLY — never claim to diagnose
2. Always explain medical jargon in plain language
3. Flag critical/abnormal values clearly with severity levels
4. Suggest specific questions the patient should ask their doctor

SEVERITY LEVELS:
- critical: requires urgent medical attention
- warning: outside normal range, needs follow-up
- normal: within expected range
- info: contextual information

Return ONLY valid JSON, no markdown, no code fences:
{
  "overall_status": "Normal | Attention Needed | Urgent Review",
  "urgency_score": <integer 1-10>,
  "summary": "<2-3 sentence plain-language summary>",
  "findings": [
    {
      "severity": "critical|warning|normal|info",
      "title": "<medical term or finding>",
      "detail": "<plain-language explanation>",
      "value": "<actual value if applicable>",
      "reference_range": "<normal range if applicable>"
    }
  ],
  "doctor_questions": [
    "<specific question 1>",
    "<specific question 2>",
    "<specific question 3>"
  ],
  "dataset_context_used": "mtsamples|mimic|pmcpatients|medquad"
}"""

MODE_INSTRUCTIONS = {
    "full":     "Provide a complete, thorough analysis of all findings.",
    "redflags": "Focus ONLY on abnormal or critical values. Skip anything normal.",
    "layman":   "Use the SIMPLEST possible language. Avoid ALL medical jargon.",
}


class MedicalAnalyzer:

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set in .env file")
        self.client = AsyncGroq(api_key=api_key)
        self.model = "llama-3.3-70b-versatile"
        logger.info("✅ Analyzer using Groq API (llama-3.3-70b)")

    async def analyze(
        self,
        text: str,
        mode: str = "full",
        context_cases: list = None,
        dataset_hint: str = "",
    ) -> dict:

        mode_instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["full"])

        context_block = ""
        if context_cases:
            context_block = "\n\nSIMILAR CASES FROM TRAINING DATA:\n"
            for i, case in enumerate(context_cases[:3], 1):
                context_block += f"\n--- Case {i} ({case.get('source', 'dataset')}) ---\n"
                context_block += case.get("text", "")[:400] + "...\n"

        user_message = f"""Analyze this medical report.
Mode: {mode_instruction}
{f'Prioritize knowledge from: {dataset_hint}' if dataset_hint else ''}
{context_block}

REPORT TO ANALYZE:
{text}"""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_message},
            ],
            temperature=0.1,
            max_tokens=2048,
        )

        raw = response.choices[0].message.content
        clean = raw.replace("```json", "").replace("```", "").strip()

        try:
            return json.loads(clean)
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse failed: {e}")
            return self._fallback_response()

    def _fallback_response(self) -> dict:
        return {
            "overall_status": "Analysis Incomplete",
            "urgency_score": 5,
            "summary": "Could not fully parse this report. Please try again.",
            "findings": [{"severity": "info", "title": "Processing Note",
                          "detail": "Try copying just the key sections of your report.",
                          "value": None, "reference_range": None}],
            "doctor_questions": ["Please bring this report to your doctor for review."],
            "dataset_context_used": "none",
        }