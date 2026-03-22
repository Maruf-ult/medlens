from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import asyncpg
import logging
import json
import os
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:axelord@127.0.0.1:5432/medlens")

async def get_conn():
    return await asyncpg.connect(DATABASE_URL)

# ─── CHAT MODELS ────────────────────────────────────────────────
class ConversationCreate(BaseModel):
    id: str
    user_id: str
    title: str

class ConversationUpdate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    timestamp: str

# ─── ANALYSIS MODELS ────────────────────────────────────────────
class AnalysisCreate(BaseModel):
    id: str
    user_id: str
    title: str
    report_text: Optional[str] = None
    overall_status: Optional[str] = None
    urgency_score: Optional[int] = None
    summary: Optional[str] = None
    findings: Optional[list] = None
    doctor_questions: Optional[list] = None
    dataset_context: Optional[str] = None
    processing_time_ms: Optional[int] = None
    phi_detected: Optional[bool] = False

# ─── CHAT ENDPOINTS ─────────────────────────────────────────────
@router.get("/conversations/{user_id}")
async def get_conversations(user_id: str):
    conn = await get_conn()
    try:
        rows = await conn.fetch(
            """
            SELECT c.id, c.title, c.created_at,
                   COUNT(m.id) as message_count
            FROM chat_conversations c
            LEFT JOIN chat_messages m ON m.conversation_id = c.id
            WHERE c.user_id = $1
            GROUP BY c.id, c.title, c.created_at
            ORDER BY c.updated_at DESC
            LIMIT 50
            """,
            user_id
        )
        return [dict(r) for r in rows]
    finally:
        await conn.close()

@router.post("/conversations")
async def create_conversation(data: ConversationCreate):
    conn = await get_conn()
    try:
        await conn.execute(
            """
            INSERT INTO chat_conversations (id, user_id, title)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO NOTHING
            """,
            data.id, data.user_id, data.title
        )
        return {"success": True}
    finally:
        await conn.close()

@router.patch("/conversations/{conv_id}")
async def update_conversation(conv_id: str, data: ConversationUpdate):
    conn = await get_conn()
    try:
        await conn.execute(
            """
            UPDATE chat_conversations
            SET title = $1, updated_at = NOW()
            WHERE id = $2
            """,
            data.title, conv_id
        )
        return {"success": True}
    finally:
        await conn.close()

@router.delete("/conversations/{conv_id}")
async def delete_conversation(conv_id: str):
    conn = await get_conn()
    try:
        await conn.execute(
            "DELETE FROM chat_conversations WHERE id = $1",
            conv_id
        )
        return {"success": True}
    finally:
        await conn.close()

@router.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str):
    conn = await get_conn()
    try:
        rows = await conn.fetch(
            """
            SELECT id, role, content, timestamp
            FROM chat_messages
            WHERE conversation_id = $1
            ORDER BY timestamp ASC
            """,
            conv_id
        )
        return [dict(r) for r in rows]
    finally:
        await conn.close()

@router.post("/messages")
async def save_message(data: MessageCreate):
    conn = await get_conn()
    try:
        await conn.execute(
            """
            INSERT INTO chat_messages (id, conversation_id, role, content, timestamp)
            VALUES ($1, $2, $3, $4, $5::timestamptz)
            ON CONFLICT (id) DO NOTHING
            """,
            data.id, data.conversation_id, data.role,
            data.content, data.timestamp
        )
        await conn.execute(
            "UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1",
            data.conversation_id
        )
        return {"success": True}
    finally:
        await conn.close()

# ─── ANALYSIS HISTORY ENDPOINTS ─────────────────────────────────
@router.get("/analysis/{user_id}")
async def get_analysis_history(user_id: str):
    conn = await get_conn()
    try:
        rows = await conn.fetch(
            """
            SELECT id, title, overall_status, urgency_score,
                   summary, created_at, phi_detected
            FROM analysis_history
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50
            """,
            user_id
        )
        return [dict(r) for r in rows]
    finally:
        await conn.close()

@router.get("/analysis/{user_id}/{analysis_id}")
async def get_analysis_detail(user_id: str, analysis_id: str):
    conn = await get_conn()
    try:
        row = await conn.fetchrow(
            """
            SELECT * FROM analysis_history
            WHERE id = $1 AND user_id = $2
            """,
            analysis_id, user_id
        )
        if not row:
            return {"error": "Not found"}
        return dict(row)
    finally:
        await conn.close()

@router.post("/analysis")
async def save_analysis(data: AnalysisCreate):
    conn = await get_conn()
    try:
        await conn.execute(
            """
            INSERT INTO analysis_history (
                id, user_id, title, report_text,
                overall_status, urgency_score, summary,
                findings, doctor_questions, dataset_context,
                processing_time_ms, phi_detected
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (id) DO NOTHING
            """,
            data.id,
            data.user_id,
            data.title,
            data.report_text,
            data.overall_status,
            data.urgency_score,
            data.summary,
            json.dumps(data.findings) if data.findings else None,
            json.dumps(data.doctor_questions) if data.doctor_questions else None,
            data.dataset_context,
            data.processing_time_ms,
            data.phi_detected
        )
        return {"success": True}
    finally:
        await conn.close()

@router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    conn = await get_conn()
    try:
        await conn.execute(
            "DELETE FROM analysis_history WHERE id = $1",
            analysis_id
        )
        return {"success": True}
    finally:
        await conn.close()