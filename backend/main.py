"""
main.py — MedLens FastAPI Server
Run: uvicorn main:app --reload --port 8000
"""

import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from backend.deidentifier import DeIdentifier
from backend.analyzer import MedicalAnalyzer
from backend.ocr import OCRPipeline
from backend.qa_engine import QAEngine
from backend.database import Database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medlens")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting MedLens server...")
    app.state.deidentifier = DeIdentifier()
    app.state.analyzer     = MedicalAnalyzer()
    app.state.ocr          = OCRPipeline()
    app.state.qa           = QAEngine()
    app.state.db           = Database()
    await app.state.db.connect()
    logger.info("✅ All modules loaded. Server ready.")
    yield
    await app.state.db.disconnect()
    logger.info("👋 Server shutdown.")


app = FastAPI(
    title="MedLens API",
    description="Privacy-first AI medical report analyzer",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextAnalysisRequest(BaseModel):
    text: str
    mode: str = "full"
    dataset_context: str = ""


class QARequest(BaseModel):
    question: str
    report_context: str = ""


@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/analyze/text")
async def analyze_text(request: TextAnalysisRequest):
    start = time.time()

    if len(request.text.strip()) < 50:
        raise HTTPException(400, "Report text too short (minimum 50 characters)")

    # Step 1: Scrub PHI
    deid_result = app.state.deidentifier.scrub(request.text)
    clean_text  = deid_result["clean_text"]
    phi_found   = deid_result["phi_detected"]

    if phi_found:
        logger.info(f"PHI scrubbed: {deid_result['entities_found']}")

    # Step 2: Find similar cases from vector DB
    similar_cases = await app.state.db.similarity_search(
        query=clean_text[:500],
        dataset=request.dataset_context,
        top_k=3,
    )

    # Step 3: AI analysis
    result = await app.state.analyzer.analyze(
        text=clean_text,
        mode=request.mode,
        context_cases=similar_cases,
        dataset_hint=request.dataset_context,
    )

    elapsed = int((time.time() - start) * 1000)
    result["processing_time_ms"] = elapsed
    result["phi_detected"]       = phi_found

    return result


@app.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...)):
    allowed = {"application/pdf", "image/jpeg", "image/png", "text/plain"}
    if file.content_type not in allowed:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    file_bytes = await file.read()

    if len(file_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 10MB)")

    extracted_text = app.state.ocr.extract(
        file_bytes=file_bytes,
        content_type=file.content_type,
        filename=file.filename,
    )

    if not extracted_text or len(extracted_text) < 50:
        raise HTTPException(422, "Could not extract readable text from this document")

    req = TextAnalysisRequest(text=extracted_text)
    return await analyze_text(req)


@app.post("/qa")
async def question_answer(request: QARequest):
    if not request.question.strip():
        raise HTTPException(400, "Question cannot be empty")

    answer = await app.state.qa.answer(
        question=request.question,
        report_context=request.report_context,
        db=app.state.db,
    )
    return {"answer": answer, "source": "MedQuAD + Groq"}


@app.get("/datasets/status")
async def dataset_status():
    counts = await app.state.db.get_record_counts()
    return {
        "mtsamples":   counts.get("mtsamples", 0),
        "medquad":     counts.get("medquad", 0),
        "pmcpatients": counts.get("pmcpatients", 0),
        "total":       sum(counts.values()),
    }