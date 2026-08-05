"""Sales forecasting service using Facebook Prophet."""

import json
import logging
from datetime import datetime
from typing import Optional

import numpy as np
import pandas as pd
from prophet import Prophet
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


def _fetch_monthly_revenue(db: Session) -> pd.DataFrame:
    """Query orders table and aggregate monthly revenue (non-cancelled orders)."""
    query = text("""
        SELECT TO_CHAR(order_date, 'YYYY-MM-01')::date AS month,
               COALESCE(SUM(total_amount), 0)           AS revenue
        FROM orders
        WHERE status <> 'CANCELLED'
        GROUP BY TO_CHAR(order_date, 'YYYY-MM-01')::date
        ORDER BY month
    """)
    rows = db.execute(query).fetchall()

    if not rows:
        raise ValueError("No order data available for forecasting")

    df = pd.DataFrame(rows, columns=["month", "revenue"])
    df["month"] = pd.to_datetime(df["month"])
    df["revenue"] = df["revenue"].astype(float)
    return df


def _train_prophet(df: pd.DataFrame, forecast_months: int = 6):
    """Train Prophet model and generate forecast."""
    # Prepare Prophet format
    prophet_df = df.rename(columns={"month": "ds", "revenue": "y"})

    # Fit model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative",
    )
    model.fit(prophet_df)

    # Create future dataframe
    future = model.make_future_dataframe(periods=forecast_months, freq="MS")
    forecast = model.predict(future)

    return model, forecast, prophet_df


def _compute_metrics(prophet_df: pd.DataFrame, forecast: pd.DataFrame) -> dict:
    """Compute in-sample MAE and MAPE."""
    # Align historical data with predictions
    historical = forecast[forecast["ds"].isin(prophet_df["ds"])]
    actuals = prophet_df.set_index("ds")["y"]
    predictions = historical.set_index("ds")["yhat"]

    # Join on index
    aligned = pd.DataFrame({"actual": actuals, "predicted": predictions}).dropna()

    if len(aligned) == 0:
        return {"mae": 0, "mape": 0}

    errors = (aligned["actual"] - aligned["predicted"]).abs()
    mae = float(errors.mean())
    mape = float((errors / aligned["actual"].replace(0, np.nan)).dropna().mean() * 100)

    return {"mae": round(mae, 2), "mape": round(mape, 2)}


def _compute_component_importance(model: Prophet, forecast: pd.DataFrame) -> list:
    """Extract feature importance from Prophet component decomposition."""
    components = []

    # Trend component
    trend_range = forecast["trend"].max() - forecast["trend"].min()
    total_range = forecast["yhat"].max() - forecast["yhat"].min()

    if total_range > 0:
        trend_importance = min(abs(trend_range / total_range), 1.0)
    else:
        trend_importance = 1.0

    components.append({
        "name": "Trend",
        "importance": round(float(trend_importance) * 100, 1),
        "description": "Long-term growth or decline in revenue"
    })

    # Yearly seasonality
    if "yearly" in forecast.columns:
        yearly_range = forecast["yearly"].max() - forecast["yearly"].min()
        if total_range > 0:
            yearly_importance = min(abs(yearly_range / total_range), 1.0)
        else:
            yearly_importance = 0.0
        components.append({
            "name": "Yearly Seasonality",
            "importance": round(float(yearly_importance) * 100, 1),
            "description": "Recurring annual patterns in revenue"
        })

    # Residual / noise
    remaining = max(0, 100 - sum(c["importance"] for c in components))
    components.append({
        "name": "Residual / Noise",
        "importance": round(remaining, 1),
        "description": "Unexplained variance and random fluctuations"
    })

    return components


def train_forecast(db: Session, forecast_months: int = 6) -> int:
    """Full pipeline: fetch data → train → store results → return forecast ID."""

    # 1. Fetch data
    df = _fetch_monthly_revenue(db)
    logger.info(f"Fetched {len(df)} months of revenue data")

    # 2. Train
    model, forecast, prophet_df = _train_prophet(df, forecast_months)
    logger.info("Prophet model trained successfully")

    # 3. Build forecast data
    forecast_data = []
    actual_map = dict(zip(prophet_df["ds"], prophet_df["y"]))

    for _, row in forecast.iterrows():
        ds = row["ds"]
        actual_val = actual_map.get(ds)
        forecast_data.append({
            "month": ds.strftime("%Y-%m"),
            "actual": round(float(actual_val), 2) if actual_val is not None else None,
            "predicted": round(float(row["yhat"]), 2),
            "lower": round(float(row["yhat_lower"]), 2),
            "upper": round(float(row["yhat_upper"]), 2),
        })

    # 4. Model metrics
    metrics = _compute_metrics(prophet_df, forecast)
    metrics["data_points"] = len(prophet_df)
    metrics["forecast_months"] = forecast_months

    # 5. Component importance
    components = _compute_component_importance(model, forecast)

    # 6. Determine period range
    period_start = forecast["ds"].min().date()
    period_end = forecast["ds"].max().date()

    # 7. Store in database
    insert_query = text("""
        INSERT INTO forecasts (forecast_type, period_start, period_end,
                               forecast_data, model_metrics, shap_summary)
        VALUES (:forecast_type, :period_start, :period_end,
                :forecast_data, :model_metrics, :shap_summary)
        RETURNING id
    """)

    result = db.execute(insert_query, {
        "forecast_type": "REVENUE",
        "period_start": period_start,
        "period_end": period_end,
        "forecast_data": json.dumps(forecast_data),
        "model_metrics": json.dumps(metrics),
        "shap_summary": json.dumps({"components": components}),
    })
    db.commit()

    forecast_id = result.scalar()
    logger.info(f"Forecast stored with ID: {forecast_id}")
    return forecast_id


def get_latest_forecast(db: Session) -> Optional[dict]:
    """Retrieve the most recent forecast from the database."""
    query = text("""
        SELECT id, forecast_type, generated_at, period_start, period_end,
               forecast_data, model_metrics, shap_summary
        FROM forecasts
        WHERE forecast_type = 'REVENUE'
        ORDER BY generated_at DESC
        LIMIT 1
    """)
    row = db.execute(query).fetchone()

    if not row:
        return None

    return {
        "id": row[0],
        "forecast_type": row[1],
        "generated_at": row[2].isoformat() if row[2] else None,
        "period_start": row[3].isoformat() if row[3] else None,
        "period_end": row[4].isoformat() if row[4] else None,
        "forecast_data": row[5] if isinstance(row[5], list) else json.loads(row[5]),
        "model_metrics": row[6] if isinstance(row[6], dict) else json.loads(row[6]),
        "shap_summary": row[7] if isinstance(row[7], dict) else json.loads(row[7]),
    }
