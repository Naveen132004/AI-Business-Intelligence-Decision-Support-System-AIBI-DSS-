import { useState, useEffect } from "react";
import {
  TrendingUp,
  Loader2,
  Play,
  BarChart3,
  Target,
  Calendar,
  Hash,
  AlertTriangle,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { forecastApi } from "../services/forecastApi";
import type {
  ForecastResponse,
  ForecastDataPoint,
  ComponentImportance,
} from "../types/sales";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const COMPONENT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4"];

export default function ForecastPage() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    loadForecast();
  }, []);

  const loadForecast = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await forecastApi.getLatest();
      if (data.empty) {
        setNoData(true);
        setForecast(null);
      } else {
        setNoData(false);
        setForecast(data);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
      if (axiosErr.response?.status === 404) {
        setNoData(true);
      } else {
        setError(axiosErr.response?.data?.error || "Failed to load forecast");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    try {
      setTraining(true);
      setError("");
      await forecastApi.train();
      await loadForecast();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.detail ||
          "Training failed. Ensure the AI service is running."
      );
    } finally {
      setTraining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  // Chart data prep
  const chartData = forecast?.forecast_data.map((dp: ForecastDataPoint) => ({
    month: dp.month,
    actual: dp.actual,
    predicted: dp.predicted,
    lower: dp.lower,
    upper: dp.upper,
    band: [dp.lower, dp.upper],
  })) ?? [];

  const metrics = forecast?.model_metrics;
  const components = forecast?.shap_summary?.components ?? [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Forecast</h1>
          <p className="text-surface-400 text-sm mt-1">
            AI-powered revenue forecasting with Prophet
          </p>
        </div>
        <button
          onClick={handleTrain}
          disabled={training}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {training ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Training Model...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Train Model
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {noData && !forecast && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No Forecast Yet
          </h2>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6">
            Click "Train Model" to generate your first AI-powered sales forecast.
            The model will analyze your historical order data and predict future revenue.
          </p>
          <button
            onClick={handleTrain}
            disabled={training}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white
                       font-semibold hover:shadow-glow transition-all disabled:opacity-50"
          >
            {training ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Training...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Train First Model
              </>
            )}
          </button>
        </div>
      )}

      {/* Forecast Content */}
      {forecast && !forecast.empty && (
        <>
          {/* Model Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Mean Abs. Error",
                value: metrics ? formatCurrency(metrics.mae) : "—",
                icon: Target,
                color: "text-primary-400",
                bg: "bg-primary-500/10",
              },
              {
                label: "MAPE",
                value: metrics ? `${metrics.mape.toFixed(1)}%` : "—",
                icon: BarChart3,
                color: "text-warning",
                bg: "bg-warning/10",
              },
              {
                label: "Data Points",
                value: metrics?.data_points.toString() ?? "—",
                icon: Hash,
                color: "text-success",
                bg: "bg-success/10",
              },
              {
                label: "Forecast Months",
                value: metrics?.forecast_months.toString() ?? "—",
                icon: Calendar,
                color: "text-info",
                bg: "bg-info/10",
              },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="glass rounded-2xl p-4 animate-slide-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Forecast Chart */}
          <div
            className="glass rounded-2xl p-6 mb-6 animate-slide-up"
            style={{ animationDelay: "320ms" }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-white">
                Revenue Forecast
              </h2>
              <p className="text-xs text-surface-500">
                Generated{" "}
                {new Date(forecast.generated_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <p className="text-surface-400 text-sm mb-6">
              Actual revenue vs predicted with confidence interval
            </p>

            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                  }}
                  formatter={(value, name) => {
                    if (value === null || value === undefined) return ["—", name];
                    return [formatCurrency(Number(value)), name];
                  }}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                {/* Confidence Band */}
                <Area
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confidenceGrad)"
                  name="Upper Bound"
                />
                <Area
                  dataKey="lower"
                  stroke="none"
                  fill="transparent"
                  name="Lower Bound"
                />
                {/* Predicted Line */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  name="Predicted"
                />
                {/* Actual Line */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: "#10b981", r: 4 }}
                  connectNulls={false}
                  name="Actual"
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-success rounded" />
                <span className="text-xs text-surface-400">Actual Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary-400 rounded" style={{ borderTop: "2px dashed #6366f1" }} />
                <span className="text-xs text-surface-400">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 rounded bg-primary-500/15" />
                <span className="text-xs text-surface-400">Confidence Interval</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Feature Importance + Forecast Table */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Feature Importance */}
            <div
              className="glass rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: "400ms" }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Feature Importance
              </h2>
              <p className="text-surface-400 text-xs mb-4">
                What drives the forecast
              </p>

              {components.length > 0 ? (
                <div className="space-y-4">
                  {components.map((comp: ComponentImportance, idx: number) => (
                    <div key={comp.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-white font-medium">
                          {comp.name}
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: COMPONENT_COLORS[idx % COMPONENT_COLORS.length] }}
                        >
                          {comp.importance.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-800/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${comp.importance}%`,
                            backgroundColor: COMPONENT_COLORS[idx % COMPONENT_COLORS.length],
                          }}
                        />
                      </div>
                      <p className="text-xs text-surface-500 mt-1">
                        {comp.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-surface-500 text-sm">No component data</p>
              )}
            </div>

            {/* Forecast Table */}
            <div
              className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-up"
              style={{ animationDelay: "480ms" }}
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Forecast Details
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-700/50">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-surface-400 uppercase tracking-wider">
                        Month
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-surface-400 uppercase tracking-wider">
                        Actual
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-surface-400 uppercase tracking-wider">
                        Predicted
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-surface-400 uppercase tracking-wider hidden md:table-cell">
                        Lower
                      </th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-surface-400 uppercase tracking-wider hidden md:table-cell">
                        Upper
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800/50">
                    {forecast.forecast_data.map(
                      (dp: ForecastDataPoint, index: number) => {
                        const isFuture = dp.actual === null;
                        return (
                          <tr
                            key={dp.month}
                            className={`transition-colors ${
                              isFuture
                                ? "bg-primary-500/[0.03]"
                                : "hover:bg-surface-800/30"
                            }`}
                            style={{ animationDelay: `${index * 30}ms` }}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-white font-medium">
                                  {dp.month}
                                </span>
                                {isFuture && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-medium">
                                    FORECAST
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`text-sm font-medium ${
                                  isFuture ? "text-surface-600" : "text-success"
                                }`}
                              >
                                {dp.actual !== null
                                  ? formatCurrency(dp.actual)
                                  : "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-medium text-primary-400">
                                {formatCurrency(dp.predicted)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right hidden md:table-cell">
                              <span className="text-sm text-surface-500">
                                {formatCurrency(dp.lower)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right hidden md:table-cell">
                              <span className="text-sm text-surface-500">
                                {formatCurrency(dp.upper)}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
