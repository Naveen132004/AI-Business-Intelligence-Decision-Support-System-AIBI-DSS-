"""RAG Business Assistant — sync, embed, retrieve, and generate answers."""

import json
import logging
from typing import List, Optional, Tuple

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings

logger = logging.getLogger(__name__)

# ── Lazy-loaded singletons ────────────────────────────────────

_embedding_model = None
_gemini_model = None


def _get_embedding_model():
    """Lazy-load the sentence-transformer embedding model."""
    global _embedding_model
    if _embedding_model is None:
        from sentence_transformers import SentenceTransformer
        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully")
    return _embedding_model


def _get_gemini_model():
    """Lazy-load the Gemini generative model."""
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        if not settings.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Set it in ai-service/.env or as an environment variable."
            )
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_model = genai.GenerativeModel("gemini-2.0-flash")
        logger.info("Gemini model initialized")
    return _gemini_model


# ── Text chunk builders ───────────────────────────────────────

def _build_product_chunks(db: Session) -> List[dict]:
    """Build text chunks from the products table."""
    rows = db.execute(text("""
        SELECT p.id, p.name, p.sku, p.category, p.unit_price, p.cost_price,
               p.description, p.is_active,
               COALESCE(i.quantity_in_stock, 0) AS stock
        FROM products p
        LEFT JOIN inventory i ON i.product_id = p.id
        ORDER BY p.id
    """)).fetchall()

    chunks = []
    for r in rows:
        status = "active" if r[7] else "inactive"
        margin = ""
        if r[5] and r[5] > 0:
            margin_pct = ((r[4] - r[5]) / r[5]) * 100
            margin = f" Profit margin: {margin_pct:.1f}%."
        desc = f" Description: {r[6]}." if r[6] else ""
        text_content = (
            f"Product: {r[1]} (SKU: {r[2]}). Category: {r[3] or 'Uncategorized'}. "
            f"Unit price: ₹{r[4]:,.2f}. Cost price: ₹{r[5]:,.2f}.{margin}{desc} "
            f"Status: {status}. Current stock: {r[8]} units."
        )
        chunks.append({
            "source_type": "product",
            "source_id": str(r[0]),
            "content": text_content,
        })
    return chunks


def _build_customer_chunks(db: Session) -> List[dict]:
    """Build text chunks from the customers table with order stats."""
    rows = db.execute(text("""
        SELECT c.id, c.name, c.email, c.phone, c.address,
               COUNT(o.id) AS order_count,
               COALESCE(SUM(o.total_amount) FILTER (WHERE o.status <> 'CANCELLED'), 0) AS total_spent
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        GROUP BY c.id
        ORDER BY c.id
    """)).fetchall()

    chunks = []
    for r in rows:
        contact_parts = []
        if r[2]: contact_parts.append(f"email: {r[2]}")
        if r[3]: contact_parts.append(f"phone: {r[3]}")
        contact = ", ".join(contact_parts) if contact_parts else "no contact info"
        address = f" Address: {r[4]}." if r[4] else ""
        text_content = (
            f"Customer: {r[1]}. Contact: {contact}.{address} "
            f"Total orders: {r[5]}. Total spent: ₹{r[6]:,.2f}."
        )
        chunks.append({
            "source_type": "customer",
            "source_id": str(r[0]),
            "content": text_content,
        })
    return chunks


def _build_order_chunks(db: Session) -> List[dict]:
    """Build text chunks from orders with their items."""
    orders = db.execute(text("""
        SELECT o.id, c.name AS customer_name, o.order_date, o.status,
               o.total_amount, o.notes
        FROM orders o
        LEFT JOIN customers c ON c.id = o.customer_id
        ORDER BY o.order_date DESC
    """)).fetchall()

    # Batch-load all order items
    items = db.execute(text("""
        SELECT oi.order_id, p.name, oi.quantity, oi.unit_price, oi.subtotal
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        ORDER BY oi.order_id, oi.id
    """)).fetchall()

    # Group items by order_id
    items_by_order: dict = {}
    for item in items:
        items_by_order.setdefault(item[0], []).append(item)

    chunks = []
    for o in orders:
        order_items = items_by_order.get(o[0], [])
        item_strs = [f"{it[1]} x{it[2]} (₹{it[4]:,.2f})" for it in order_items]
        items_text = "; ".join(item_strs) if item_strs else "no items"
        notes = f" Notes: {o[5]}." if o[5] else ""
        date_str = o[2].strftime("%Y-%m-%d") if o[2] else "unknown date"
        text_content = (
            f"Order #{o[0]} placed by {o[1] or 'Unknown'} on {date_str}. "
            f"Status: {o[3]}. Total: ₹{o[4]:,.2f}. "
            f"Items: {items_text}.{notes}"
        )
        chunks.append({
            "source_type": "order",
            "source_id": str(o[0]),
            "content": text_content,
        })
    return chunks


def _build_supplier_chunks(db: Session) -> List[dict]:
    """Build text chunks from the suppliers table."""
    rows = db.execute(text("""
        SELECT s.id, s.name, s.contact_person, s.email, s.phone, s.address,
               COUNT(i.id) AS products_supplied
        FROM suppliers s
        LEFT JOIN inventory i ON i.supplier_id = s.id
        GROUP BY s.id
        ORDER BY s.id
    """)).fetchall()

    chunks = []
    for r in rows:
        contact = f"Contact: {r[2]}." if r[2] else ""
        email = f" Email: {r[3]}." if r[3] else ""
        phone = f" Phone: {r[4]}." if r[4] else ""
        address = f" Address: {r[5]}." if r[5] else ""
        text_content = (
            f"Supplier: {r[1]}. {contact}{email}{phone}{address} "
            f"Products supplied: {r[6]}."
        )
        chunks.append({
            "source_type": "supplier",
            "source_id": str(r[0]),
            "content": text_content,
        })
    return chunks


def _build_inventory_chunks(db: Session) -> List[dict]:
    """Build text chunks from the inventory table."""
    rows = db.execute(text("""
        SELECT i.id, p.name, p.sku, i.quantity_in_stock, i.reorder_level,
               s.name AS supplier_name, i.last_restocked_at
        FROM inventory i
        JOIN products p ON p.id = i.product_id
        LEFT JOIN suppliers s ON s.id = i.supplier_id
        ORDER BY i.id
    """)).fetchall()

    chunks = []
    for r in rows:
        low_stock = "YES — below reorder level" if r[3] <= r[4] else "No"
        supplier = f"Supplier: {r[5]}." if r[5] else "No supplier assigned."
        restocked = f" Last restocked: {r[6].strftime('%Y-%m-%d')}." if r[6] else ""
        text_content = (
            f"Inventory for {r[1]} (SKU: {r[2]}). "
            f"Quantity in stock: {r[3]}. Reorder level: {r[4]}. Low stock: {low_stock}. "
            f"{supplier}{restocked}"
        )
        chunks.append({
            "source_type": "inventory",
            "source_id": str(r[0]),
            "content": text_content,
        })
    return chunks


def _build_expense_chunks(db: Session) -> List[dict]:
    """Build text chunks from the expenses table with aggregated summaries."""
    # Individual expenses
    rows = db.execute(text("""
        SELECT id, category, amount, description, expense_date
        FROM expenses
        ORDER BY expense_date DESC
    """)).fetchall()

    chunks = []
    for r in rows:
        desc = f" Description: {r[3]}." if r[3] else ""
        text_content = (
            f"Expense #{r[0]}: {r[1]} — ₹{r[2]:,.2f} on {r[4]}.{desc}"
        )
        chunks.append({
            "source_type": "expense",
            "source_id": str(r[0]),
            "content": text_content,
        })

    # Category-level summary (as an extra chunk for analytical questions)
    summary_rows = db.execute(text("""
        SELECT category, COUNT(*) AS count, SUM(amount) AS total,
               AVG(amount) AS avg_amount
        FROM expenses
        GROUP BY category
        ORDER BY total DESC
    """)).fetchall()

    if summary_rows:
        lines = []
        grand_total = 0
        for sr in summary_rows:
            lines.append(f"  {sr[0]}: {sr[1]} transactions, total ₹{sr[2]:,.2f}, avg ₹{sr[3]:,.2f}")
            grand_total += float(sr[2])
        summary_text = (
            f"Expense Summary (all time). Grand total: ₹{grand_total:,.2f}.\n"
            + "\n".join(lines)
        )
        chunks.append({
            "source_type": "expense_summary",
            "source_id": "all",
            "content": summary_text,
        })

    return chunks


# ── Core RAG functions ────────────────────────────────────────

def sync_business_data(db: Session) -> dict:
    """Scan all business tables, embed text chunks, and upsert into document_chunks."""
    model = _get_embedding_model()

    # 1. Build all chunks
    all_chunks = []
    all_chunks.extend(_build_product_chunks(db))
    all_chunks.extend(_build_customer_chunks(db))
    all_chunks.extend(_build_order_chunks(db))
    all_chunks.extend(_build_supplier_chunks(db))
    all_chunks.extend(_build_inventory_chunks(db))
    all_chunks.extend(_build_expense_chunks(db))

    logger.info(f"Built {len(all_chunks)} text chunks from business data")

    # 2. Delete existing chunks (full re-sync)
    delete_result = db.execute(text("DELETE FROM document_chunks"))
    deleted = delete_result.rowcount
    logger.info(f"Deleted {deleted} existing chunks")

    if not all_chunks:
        db.commit()
        return {"message": "No data to sync", "chunks_created": 0, "chunks_deleted": deleted}

    # 3. Embed all chunks in batch
    texts = [c["content"] for c in all_chunks]
    embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)

    # 4. Insert new chunks
    insert_query = text("""
        INSERT INTO document_chunks (source_type, source_id, content, embedding, metadata)
        VALUES (:source_type, :source_id, :content, :embedding, :metadata)
    """)

    for chunk, emb in zip(all_chunks, embeddings):
        db.execute(insert_query, {
            "source_type": chunk["source_type"],
            "source_id": chunk["source_id"],
            "content": chunk["content"],
            "embedding": str(emb.tolist()),
            "metadata": json.dumps({"source_type": chunk["source_type"], "source_id": chunk["source_id"]}),
        })

    db.commit()
    logger.info(f"Inserted {len(all_chunks)} chunks into document_chunks")

    return {
        "message": f"Synced {len(all_chunks)} chunks successfully",
        "chunks_created": len(all_chunks),
        "chunks_deleted": deleted,
    }


def ask(db: Session, question: str) -> dict:
    """Embed the question, retrieve relevant chunks, and generate an answer with Gemini."""

    # 1. Check if we have any chunks
    count_row = db.execute(text("SELECT COUNT(*) FROM document_chunks")).fetchone()
    chunks_in_db = count_row[0] if count_row else 0

    if chunks_in_db == 0:
        return {
            "answer": (
                "I don't have any business data indexed yet. "
                "Please click the **Sync Data** button first to index your business data, "
                "then ask me your question again."
            ),
            "sources": [],
            "chunks_in_db": 0,
        }

    # 2. Embed the question
    model = _get_embedding_model()
    question_embedding = model.encode([question], normalize_embeddings=True)[0]

    # 3. Vector similarity search using pgvector cosine distance
    search_query = text("""
        SELECT id, source_type, source_id, content,
               1 - (embedding <=> :embedding::vector) AS similarity
        FROM document_chunks
        WHERE 1 - (embedding <=> :embedding::vector) >= :threshold
        ORDER BY embedding <=> :embedding::vector
        LIMIT :top_k
    """)

    results = db.execute(search_query, {
        "embedding": str(question_embedding.tolist()),
        "threshold": settings.RAG_SIMILARITY_THRESHOLD,
        "top_k": settings.RAG_TOP_K,
    }).fetchall()

    sources = []
    context_parts = []
    for i, r in enumerate(results):
        sources.append({
            "source_type": r[1],
            "source_id": r[2],
            "content": r[3],
            "score": round(float(r[4]), 4),
        })
        context_parts.append(f"[Source {i+1} — {r[1]}] {r[3]}")

    # 4. Generate answer with Gemini
    if not context_parts:
        answer = (
            "I couldn't find relevant data matching your question. "
            "Try rephrasing your question, or sync your data to ensure it's up to date."
        )
    else:
        context_text = "\n\n".join(context_parts)
        answer = _generate_answer(question, context_text)

    return {
        "answer": answer,
        "sources": sources,
        "chunks_in_db": chunks_in_db,
    }


def _generate_answer(question: str, context: str) -> str:
    """Call Gemini to generate a business-aware answer from retrieved context."""
    try:
        gemini = _get_gemini_model()

        prompt = f"""You are an AI Business Intelligence Assistant for AIBI-DSS, an enterprise management platform.
You help business users understand their sales, inventory, customers, orders, suppliers, and expenses data.

Based ONLY on the following retrieved business data, answer the user's question.
Be specific, cite actual numbers, names, and dates from the data.
If the data doesn't contain enough information to fully answer, say so honestly.
Format your response in clear, readable prose. Use bullet points for lists.
All monetary values are in Indian Rupees (₹).

── RETRIEVED BUSINESS DATA ──
{context}

── USER QUESTION ──
{question}

── YOUR ANSWER ──"""

        response = gemini.generate_content(prompt)
        return response.text.strip()

    except ValueError as e:
        if "GEMINI_API_KEY" in str(e):
            return (
                "⚠️ The Gemini API key is not configured. "
                "Please set `GEMINI_API_KEY` in the AI service `.env` file to enable AI-powered answers.\n\n"
                "**Retrieved data preview:**\n" +
                context[:500] + ("..." if len(context) > 500 else "")
            )
        raise
    except Exception as e:
        logger.error(f"Gemini generation failed: {e}")
        return (
            f"I found relevant data but encountered an error generating the answer: {str(e)}\n\n"
            f"**Retrieved data preview:**\n{context[:500]}"
            + ("..." if len(context) > 500 else "")
        )


def get_status(db: Session) -> dict:
    """Get the current status of the RAG index."""
    # Total chunks
    count_row = db.execute(text("SELECT COUNT(*) FROM document_chunks")).fetchone()
    chunks_in_db = count_row[0] if count_row else 0

    # Last sync time
    last_row = db.execute(text(
        "SELECT MAX(created_at) FROM document_chunks"
    )).fetchone()
    last_synced = last_row[0].isoformat() if last_row and last_row[0] else None

    # Breakdown by source type
    breakdown_rows = db.execute(text(
        "SELECT source_type, COUNT(*) FROM document_chunks GROUP BY source_type ORDER BY source_type"
    )).fetchall()
    source_breakdown = {r[0]: r[1] for r in breakdown_rows}

    return {
        "chunks_in_db": chunks_in_db,
        "last_synced": last_synced,
        "source_breakdown": source_breakdown,
    }
