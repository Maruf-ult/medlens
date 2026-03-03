"""
database.py — PostgreSQL + pgvector
"""

import os
import json
import logging

logger = logging.getLogger(__name__)

try:
    import asyncpg
    from pgvector.asyncpg import register_vector
    ASYNCPG_AVAILABLE = True
except ImportError:
    ASYNCPG_AVAILABLE = False
    logger.warning("asyncpg not installed — DB features disabled")

try:
    from sentence_transformers import SentenceTransformer
    ST_AVAILABLE = True
except ImportError:
    ST_AVAILABLE = False


class Database:

    EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

    def __init__(self):
        self.pool     = None
        self.embedder = None
        if ST_AVAILABLE:
            logger.info("Loading sentence embedder...")
            self.embedder = SentenceTransformer(self.EMBED_MODEL)
            logger.info("✅ Embedder loaded")

    async def connect(self):
        if not ASYNCPG_AVAILABLE:
            logger.warning("Database disabled — asyncpg not installed")
            return
        db_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/medlens")
        try:
            self.pool = await asyncpg.create_pool(
                db_url,
                min_size=2,
                max_size=10,
                init=register_vector,
            )
            logger.info("✅ PostgreSQL connected")
        except Exception as e:
            logger.error(f"DB connection failed: {e}")
            self.pool = None

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

    def embed(self, text: str) -> list:
        if not self.embedder:
            return []
        vec = self.embedder.encode(text[:512], normalize_embeddings=True)
        return vec.tolist()

    async def similarity_search(self, query: str, dataset: str = "", top_k: int = 3) -> list:
        if not self.pool or not self.embedder:
            return []
        query_vec = self.embed(query)
        if not query_vec:
            return []
        dataset_filter = "AND source = $3" if dataset else ""
        params = [query_vec, top_k]
        if dataset:
            params.append(dataset)
        sql = f"""
            SELECT id, source, text, specialty, metadata,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM medical_cases
            WHERE 1=1 {dataset_filter}
            ORDER BY embedding <=> $1::vector
            LIMIT $2
        """
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(sql, *params)
        return [
            {
                "id":        row["id"],
                "source":    row["source"],
                "text":      row["text"],
                "specialty": row["specialty"],
                "metadata":  json.loads(row["metadata"] or "{}"),
                "similarity":round(row["similarity"], 3),
            }
            for row in rows
        ]

    async def search_qa(self, question: str, top_k: int = 5) -> list:
        if not self.pool or not self.embedder:
            return []
        q_vec = self.embed(question)
        sql = """
            SELECT question, answer, source_url, focus_area,
                   1 - (embedding <=> $1::vector) AS similarity
            FROM qa_pairs
            ORDER BY embedding <=> $1::vector
            LIMIT $2
        """
        async with self.pool.acquire() as conn:
            rows = await conn.fetch(sql, q_vec, top_k)
        return [
            {
                "question":  row["question"],
                "answer":    row["answer"],
                "source":    row["source_url"],
                "focus":     row["focus_area"],
                "similarity":round(row["similarity"], 3),
            }
            for row in rows
        ]

    async def get_record_counts(self) -> dict:
        if not self.pool:
            return {}
        async with self.pool.acquire() as conn:
            rows     = await conn.fetch("SELECT source, COUNT(*) as n FROM medical_cases GROUP BY source")
            qa_count = await conn.fetchval("SELECT COUNT(*) FROM qa_pairs")
        counts = {row["source"]: row["n"] for row in rows}
        counts["medquad"] = qa_count
        return counts

    async def insert_case(self, source: str, text: str, specialty: str, metadata: dict):
        if not self.pool:
            return
        embedding = self.embed(text[:1000])
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO medical_cases (source, text, specialty, metadata, embedding)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT DO NOTHING""",
                source, text, specialty, json.dumps(metadata), embedding
            )

    async def insert_qa(self, question: str, answer: str, source_url: str, focus_area: str):
        if not self.pool:
            return
        embedding = self.embed(question)
        async with self.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO qa_pairs (question, answer, source_url, focus_area, embedding)
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT DO NOTHING""",
                question, answer, source_url, focus_area, embedding
            )