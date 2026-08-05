"""Business Health Score computation service."""

import json
import logging
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def _score_sales_performance(db: Session) -> dict:
    """Score based on order volume, avg order value, and cancellation rate."""
    query = text("""
        SELECT
            COUNT(*) FILTER (WHERE status <> 'CANCELLED'
                AND order_date >= NOW() - INTERVAL '3 months') AS recent_orders,
            COUNT(*) FILTER (WHERE status <> 'CANCELLED'
                AND order_date >= NOW() - INTERVAL '6 months'
                AND order_date < NOW() - INTERVAL '3 months') AS prev_orders,
            COALESCE(AVG(total_amount) FILTER (WHERE status <> 'CANCELLED'
                AND order_date >= NOW() - INTERVAL '3 months'), 0) AS recent_avg_value,
            COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled,
            COUNT(*) AS total
        FROM orders
    """)
    row = db.execute(query).fetchone()

    recent = row[0] or 0
    prev = row[1] or 0
    avg_value = float(row[2] or 0)
    cancelled = row[3] or 0
    total = row[4] or 1

    # Volume score (0-40): more recent orders = better
    volume_score = min(40, recent * 4)

    # Growth score (0-30): recent vs previous period
    if prev > 0:
        growth_ratio = recent / prev
        growth_score = min(30, max(0, (growth_ratio - 0.5) * 30))
    else:
        growth_score = 15 if recent > 0 else 0

    # Quality score (0-30): low cancellation rate = better
    cancel_rate = cancelled / total if total > 0 else 0
    quality_score = max(0, 30 - cancel_rate * 100)

    score = min(100, volume_score + growth_score + quality_score)

    parts = []
    parts.append(f"{recent} orders in last 3 months (vs {prev} prior)")
    if avg_value > 0:
        parts.append(f"Avg order value: ₹{avg_value:,.0f}")
    parts.append(f"Cancellation rate: {cancel_rate*100:.1f}%")

    return {
        "name": "Sales Performance",
        "score": round(score, 1),
        "weight": 0.30,
        "explanation": ". ".join(parts),
        "_data": {"recent": recent, "prev": prev, "cancel_rate": cancel_rate, "avg_value": avg_value}
    }


def _score_revenue_growth(db: Session) -> dict:
    """Score based on revenue trend — recent month vs 3-month average."""
    query = text("""
        SELECT
            COALESCE(SUM(total_amount) FILTER (
                WHERE status <> 'CANCELLED'
                AND order_date >= DATE_TRUNC('month', NOW()) - INTERVAL '1 month'
                AND order_date < DATE_TRUNC('month', NOW())
            ), 0) AS last_month,
            COALESCE(AVG(monthly_rev), 0) AS avg_3m
        FROM (
            SELECT SUM(total_amount) AS monthly_rev
            FROM orders
            WHERE status <> 'CANCELLED'
              AND order_date >= NOW() - INTERVAL '4 months'
              AND order_date < DATE_TRUNC('month', NOW())
            GROUP BY DATE_TRUNC('month', order_date)
        ) sub
    """)
    row = db.execute(query).fetchone()

    last_month = float(row[0] or 0)
    avg_3m = float(row[1] or 0)

    if avg_3m > 0:
        growth = (last_month - avg_3m) / avg_3m
        # Map growth -50% to +50% → score 0 to 100
        score = min(100, max(0, (growth + 0.5) * 100))
    elif last_month > 0:
        score = 60
    else:
        score = 20

    explanation = f"Last month revenue: ₹{last_month:,.0f}. 3-month avg: ₹{avg_3m:,.0f}."
    if avg_3m > 0:
        pct = ((last_month - avg_3m) / avg_3m) * 100
        explanation += f" Growth: {pct:+.1f}%"

    return {
        "name": "Revenue Growth",
        "score": round(score, 1),
        "weight": 0.25,
        "explanation": explanation,
        "_data": {"last_month": last_month, "avg_3m": avg_3m}
    }


def _score_inventory_health(db: Session) -> dict:
    """Score based on low-stock ratio and tracking coverage."""
    query = text("""
        SELECT
            COUNT(*) AS total_items,
            COUNT(*) FILTER (WHERE quantity_in_stock <= reorder_level) AS low_stock,
            (SELECT COUNT(*) FROM products WHERE is_active = true) AS total_products
        FROM inventory
    """)
    row = db.execute(query).fetchone()

    total_items = row[0] or 0
    low_stock = row[1] or 0
    total_products = row[2] or 1

    # Stock health (0-60): lower low-stock ratio = better
    if total_items > 0:
        low_ratio = low_stock / total_items
        stock_score = max(0, 60 - low_ratio * 120)
    else:
        stock_score = 30

    # Coverage (0-40): more products tracked = better
    coverage = total_items / total_products if total_products > 0 else 0
    coverage_score = min(40, coverage * 40)

    score = min(100, stock_score + coverage_score)

    explanation = f"{low_stock} of {total_items} items below reorder level. {total_items}/{total_products} products tracked."

    return {
        "name": "Inventory Health",
        "score": round(score, 1),
        "weight": 0.25,
        "explanation": explanation,
        "_data": {"low_stock": low_stock, "total_items": total_items, "total_products": total_products}
    }


def _score_expense_efficiency(db: Session) -> dict:
    """Score based on expense-to-revenue ratio."""
    query = text("""
        SELECT
            COALESCE(SUM(amount), 0) AS total_expenses,
            COALESCE((SELECT SUM(total_amount) FROM orders WHERE status <> 'CANCELLED'), 0) AS total_revenue,
            COALESCE(SUM(amount) FILTER (
                WHERE expense_date >= NOW() - INTERVAL '3 months'
            ), 0) AS recent_expenses
        FROM expenses
    """)
    row = db.execute(query).fetchone()

    total_expenses = float(row[0] or 0)
    total_revenue = float(row[1] or 1)
    recent_expenses = float(row[2] or 0)

    # Expense ratio (lower = better)
    ratio = total_expenses / total_revenue if total_revenue > 0 else 1.0

    # Map ratio: 0.0 = score 100, 1.0+ = score 0
    score = max(0, min(100, (1.0 - ratio) * 100))

    explanation = (
        f"Total expenses: ₹{total_expenses:,.0f} vs revenue: ₹{total_revenue:,.0f}. "
        f"Expense ratio: {ratio*100:.1f}%. Recent 3-month expenses: ₹{recent_expenses:,.0f}."
    )

    return {
        "name": "Expense Efficiency",
        "score": round(score, 1),
        "weight": 0.20,
        "explanation": explanation,
        "_data": {"ratio": ratio, "total_expenses": total_expenses, "total_revenue": total_revenue}
    }


def _generate_recommendations(components: list) -> list:
    """Generate actionable recommendations based on weak components."""
    recommendations = []

    for comp in components:
        data = comp.get("_data", {})
        score = comp["score"]
        name = comp["name"]

        if name == "Sales Performance" and score < 60:
            if data.get("cancel_rate", 0) > 0.15:
                recommendations.append({
                    "category": "Sales",
                    "priority": "HIGH",
                    "title": "Reduce Order Cancellations",
                    "description": f"Cancellation rate is {data['cancel_rate']*100:.1f}%. "
                                   "Review cancelled orders for common patterns and improve order confirmation workflow."
                })
            if data.get("recent", 0) < data.get("prev", 0):
                recommendations.append({
                    "category": "Sales",
                    "priority": "MEDIUM",
                    "title": "Boost Sales Volume",
                    "description": "Order volume has declined compared to the previous period. "
                                   "Consider promotional campaigns or customer outreach."
                })

        if name == "Revenue Growth" and score < 50:
            recommendations.append({
                "category": "Revenue",
                "priority": "HIGH",
                "title": "Address Revenue Decline",
                "description": f"Last month revenue (₹{data.get('last_month', 0):,.0f}) is below the 3-month average "
                               f"(₹{data.get('avg_3m', 0):,.0f}). Review pricing strategy and sales pipeline."
            })

        if name == "Inventory Health" and score < 60:
            low = data.get("low_stock", 0)
            if low > 0:
                recommendations.append({
                    "category": "Inventory",
                    "priority": "HIGH",
                    "title": f"Restock {low} Low-Stock Items",
                    "description": f"{low} items are below their reorder level. "
                                   "Place purchase orders with suppliers to avoid stockouts."
                })
            total_items = data.get("total_items", 0)
            total_products = data.get("total_products", 0)
            if total_products > 0 and total_items < total_products * 0.8:
                recommendations.append({
                    "category": "Inventory",
                    "priority": "MEDIUM",
                    "title": "Improve Inventory Tracking",
                    "description": f"Only {total_items} of {total_products} products have inventory tracking. "
                                   "Add inventory records for untracked products."
                })

        if name == "Expense Efficiency" and score < 50:
            recommendations.append({
                "category": "Finance",
                "priority": "MEDIUM",
                "title": "Optimize Expense-to-Revenue Ratio",
                "description": f"Expenses consume {data.get('ratio', 0)*100:.1f}% of revenue. "
                               "Review high-cost categories and identify areas to reduce spending."
            })

    # If everything is good, add a positive note
    if not recommendations:
        recommendations.append({
            "category": "General",
            "priority": "LOW",
            "title": "Business Performing Well",
            "description": "All health metrics are within healthy ranges. Continue monitoring and maintain current strategies."
        })

    return recommendations


def calculate_health_score(db: Session) -> int:
    """Full pipeline: compute all components → weighted score → recommendations → store."""

    # 1. Compute all component scores
    sales = _score_sales_performance(db)
    revenue = _score_revenue_growth(db)
    inventory = _score_inventory_health(db)
    expense = _score_expense_efficiency(db)

    components = [sales, revenue, inventory, expense]

    # 2. Weighted overall score
    overall = sum(c["score"] * c["weight"] for c in components)
    overall = round(min(100, max(0, overall)), 1)

    # 3. Generate recommendations
    recommendations = _generate_recommendations(components)

    # 4. Build explanations
    explanations = []
    if overall >= 80:
        explanations.append("Your business is in excellent health across all dimensions.")
    elif overall >= 60:
        explanations.append("Your business is performing well but has some areas for improvement.")
    elif overall >= 40:
        explanations.append("Your business shows mixed signals. Several areas need attention.")
    else:
        explanations.append("Your business health requires immediate attention in multiple areas.")

    for c in components:
        label = "Strong" if c["score"] >= 70 else "Fair" if c["score"] >= 40 else "Weak"
        explanations.append(f"{c['name']}: {label} ({c['score']:.0f}/100)")

    # 5. Clean component data for storage (remove _data)
    clean_components = [
        {"name": c["name"], "score": c["score"], "weight": c["weight"], "explanation": c["explanation"]}
        for c in components
    ]

    # 6. Store in database
    insert_query = text("""
        INSERT INTO health_scores (overall_score, component_scores, explanations, recommendations)
        VALUES (:overall_score, :component_scores, :explanations, :recommendations)
        RETURNING id
    """)

    result = db.execute(insert_query, {
        "overall_score": overall,
        "component_scores": json.dumps(clean_components),
        "explanations": json.dumps(explanations),
        "recommendations": json.dumps(recommendations),
    })
    db.commit()

    score_id = result.scalar()
    logger.info(f"Health score stored with ID: {score_id}, overall: {overall}")
    return score_id


def get_latest_health_score(db: Session) -> Optional[dict]:
    """Retrieve the most recent health score."""
    query = text("""
        SELECT id, overall_score, component_scores, explanations, recommendations, generated_at
        FROM health_scores
        ORDER BY generated_at DESC
        LIMIT 1
    """)
    row = db.execute(query).fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "overall_score": float(row[1]),
        "component_scores": row[2] if isinstance(row[2], list) else json.loads(row[2]),
        "explanations": row[3] if isinstance(row[3], list) else json.loads(row[3]),
        "recommendations": row[4] if isinstance(row[4], list) else json.loads(row[4]),
        "generated_at": row[5].isoformat() if row[5] else None,
    }
