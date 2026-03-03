"""
deidentifier.py — PHI Scrubber
Removes patient names, dates, phone numbers etc before AI sees the report.
"""

import re
import logging

logger = logging.getLogger(__name__)

try:
    from presidio_analyzer import AnalyzerEngine
    from presidio_anonymizer import AnonymizerEngine
    from presidio_anonymizer.entities import OperatorConfig
    PRESIDIO_AVAILABLE = True
except ImportError:
    PRESIDIO_AVAILABLE = False
    logger.warning("Presidio not installed — using regex fallback")


class DeIdentifier:

    PHI_ENTITIES = [
        "PERSON",
        "DATE_TIME",
        "PHONE_NUMBER",
        "US_SSN",
        "LOCATION",
        "EMAIL_ADDRESS",
        "MEDICAL_RECORD_NUMBER",
    ]

    def __init__(self):
        if PRESIDIO_AVAILABLE:
            self._analyzer   = AnalyzerEngine()
            self._anonymizer = AnonymizerEngine()
            logger.info("✅ Presidio de-identifier loaded")
        else:
            logger.info("⚠️  Using regex fallback de-identifier")

    def scrub(self, text: str) -> dict:
        if not text:
            return {"clean_text": "", "phi_detected": False, "entities_found": []}
        if PRESIDIO_AVAILABLE:
            return self._presidio_scrub(text)
        else:
            return self._regex_scrub(text)

    def _presidio_scrub(self, text: str) -> dict:
        results = self._analyzer.analyze(
            text=text,
            entities=self.PHI_ENTITIES,
            language="en",
        )
        if not results:
            return {"clean_text": text, "phi_detected": False, "entities_found": []}

        entities_found = list({r.entity_type for r in results})
        operators = {
            entity: OperatorConfig("replace", {"new_value": f"[{entity}]"})
            for entity in self.PHI_ENTITIES
        }
        anonymized = self._anonymizer.anonymize(
            text=text,
            analyzer_results=results,
            operators=operators,
        )
        return {
            "clean_text":     anonymized.text,
            "phi_detected":   True,
            "entities_found": entities_found,
        }

    def _regex_scrub(self, text: str) -> dict:
        original = text
        entities_found = []

        patterns = {
            "DATE":  r"\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4}\b",
            "PHONE": r"\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
            "SSN":   r"\b\d{3}-\d{2}-\d{4}\b",
            "EMAIL": r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Z|a-z]{2,}\b",
            "DOB":   r"\bDOB[:\s]+\S+\b",
            "MRN":   r"\b(?:MRN|Patient ID|Record #)[:\s]*[\w\-]+\b",
        }

        for label, pattern in patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                text = re.sub(pattern, f"[{label}]", text, flags=re.IGNORECASE)
                entities_found.append(label)

        return {
            "clean_text":     text,
            "phi_detected":   text != original,
            "entities_found": entities_found,
        }