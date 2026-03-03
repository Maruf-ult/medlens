"""
qa_engine.py — MedQuAD Q&A Engine (Groq version)
"""

import os
import logging
from groq import AsyncGroq

logger = logging.getLogger(__name__)

QA_SYSTEM = """You are a medical Q&A assistant trained on the MedQuAD dataset
(47,457 expert Q&A pairs from NIH, CDC, MedlinePlus, NCI).

Answer medical questions accurately and in plain language (2-4 sentences).
Always recommend consulting a doctor for personal medical decisions.
Do NOT make up information — if uncertain, say so."""


class QAEngine:

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        self.client = AsyncGroq(api_key=api_key)
        self.model  = "llama-3.3-70b-versatile"
        logger.info("✅ QA Engine using Groq API")

    async def answer(
        self,
        question: str,
        report_context: str = "",
        db=None,
    ) -> str:

        similar_qa = []
        if db:
            similar_qa = await db.search_qa(question, top_k=4)

        qa_context = ""
        if similar_qa:
            qa_context = "\n\nRELEVANT MedQuAD EXAMPLES:\n"
            for qa in similar_qa:
                if qa["similarity"] > 0.4:
                    qa_context += f"\nQ: {qa['question']}\nA: {qa['answer']}\n"

        report_block = ""
        if report_context:
            report_block = f"\n\nPATIENT REPORT CONTEXT:\n{report_context[:600]}..."

        user_message = f"""Question: {question}
{qa_context}
{report_block}

Answer the question clearly in 2-4 sentences."""

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": QA_SYSTEM},
                {"role": "user",   "content": user_message},
            ],
            temperature=0.2,
            max_tokens=400,
        )

        return response.choices[0].message.content