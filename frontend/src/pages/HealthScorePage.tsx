import { useState, useEffect } from "react";
import {
  HeartPulse,
  Loader2,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Package,
  DollarSign,
  Lightbulb,
} from "lucide-react";
import { healthScoreApi } from "../services/healthScoreApi";
import type {
  HealthScoreResponse,
  ComponentScore,
  HealthRecommendation,
} from "../types/sales";

// ── Gauge Chart (SVG arc) ────────────────────────────────────

function GaugeChart({ score }: { score: number }) {
  const radius = 100;
  const cx = 120;
  const cy = 120;
  const strokeWidth = 18;
  const startAngle = -225;
  const endAngle = 45;
  const totalAngle = endAngle - startAngle; // 270°

  const scoreAngle = startAngle + (score / 100) * totalAngle;

  const polarToCartesian = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (start: number, end: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const getColor = () => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#6366f1"; // indigo
    if (score >= 40) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="200" viewBox="0 0 240 200">
        {/* Background arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={describeArc(startAngle, scoreAngle)}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()}40)`,
            transition: "all 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        {/* Center score */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="white"
          fontSize="42"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          {Math.round(score)}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          fill={getColor()}
          fontSize="14"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          {getLabel()}
        </text>
        {/* Min / Max labels */}
        <text x="18" y="180" fill="#64748b" fontSize="11" fontFamily="Inter, sans-serif">
          0
        </text>
        <text x="215" y="180" fill="#64748b" fontSize="11" fontFamily="Inter, sans-serif">
          100
        </text>
      </svg>
    </div>
  );
}

// ── Component Progress Ring ──────────────────────────────────

function ProgressRing({
  score,
  size = 56,
  stroke = 5,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return "#10b981";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s ease-out" }}
      />
      <text
        x={size / 2}
        y={size / 2 + 4}
        textAnchor="middle"
        fill="white"
        fontSize="13"
        fontWeight="bold"
        fontFamily="Inter, sans-serif"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────

const COMPONENT_ICONS: Record<string, typeof TrendingUp> = {
  "Sales Performance": ShieldCheck,
  "Revenue Growth": TrendingUp,
  "Inventory Health": Package,
  "Expense Efficiency": DollarSign,
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/20" },
  MEDIUM: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" },
  LOW: { bg: "bg-success/10", text: "text-success", border: "border-success/20" },
};

export default function HealthScorePage() {
  const [healthScore, setHealthScore] = useState<HealthScoreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    loadHealthScore();
  }, []);

  const loadHealthScore = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await healthScoreApi.getLatest();
      if (data.empty) {
        setNoData(true);
        setHealthScore(null);
      } else {
        setNoData(false);
        setHealthScore(data);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
      if (axiosErr.response?.status === 404) {
        setNoData(true);
      } else {
        setError(axiosErr.response?.data?.error || "Failed to load health score");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      setError("");
      await healthScoreApi.calculate();
      await loadHealthScore();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
      setError(
        axiosErr.response?.data?.error ||
          axiosErr.response?.data?.detail ||
          "Calculation failed. Ensure the AI service is running."
      );
    } finally {
      setCalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Health</h1>
          <p className="text-surface-400 text-sm mt-1">
            AI-powered composite business health assessment
          </p>
        </div>
        <button
          onClick={handleCalculate}
          disabled={calculating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Recalculate
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
      {noData && !healthScore && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
            <HeartPulse className="w-8 h-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No Health Score Yet
          </h2>
          <p className="text-surface-400 text-sm max-w-md mx-auto mb-6">
            Click "Recalculate" to analyze your sales, inventory, and expense data
            and generate a comprehensive business health assessment.
          </p>
          <button
            onClick={handleCalculate}
            disabled={calculating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white
                       font-semibold hover:shadow-glow transition-all disabled:opacity-50"
          >
            {calculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <HeartPulse className="w-4 h-4" />
                Calculate Health Score
              </>
            )}
          </button>
        </div>
      )}

      {/* Health Score Content */}
      {healthScore && !healthScore.empty && (
        <>
          {/* Gauge + Summary Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Gauge Chart */}
            <div
              className="glass rounded-2xl p-6 flex flex-col items-center justify-center animate-slide-up"
              style={{ animationDelay: "0ms" }}
            >
              <GaugeChart score={healthScore.overall_score} />
              <p className="text-surface-400 text-xs mt-2">
                Last calculated{" "}
                {new Date(healthScore.generated_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Component Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              {healthScore.component_scores.map((comp: ComponentScore, i: number) => {
                const Icon = COMPONENT_ICONS[comp.name] || HeartPulse;
                return (
                  <div
                    key={comp.name}
                    className="glass rounded-2xl p-4 animate-slide-up"
                    style={{ animationDelay: `${(i + 1) * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <ProgressRing score={comp.score} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-primary-400 shrink-0" />
                          <h3 className="text-sm font-semibold text-white truncate">
                            {comp.name}
                          </h3>
                        </div>
                        <p className="text-xs text-surface-500 mb-1.5">
                          Weight: {(comp.weight * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-surface-400 leading-relaxed line-clamp-2">
                          {comp.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div
            className="glass rounded-2xl p-6 animate-slide-up"
            style={{ animationDelay: "500ms" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-semibold text-white">
                Recommendations
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {healthScore.recommendations.map(
                (rec: HealthRecommendation, i: number) => {
                  const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.LOW;
                  return (
                    <div
                      key={i}
                      className={`rounded-xl p-4 border ${style.bg} ${style.border}
                                  animate-slide-up`}
                      style={{ animationDelay: `${600 + i * 80}ms` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase
                                     ${style.bg} ${style.text} border ${style.border}`}
                        >
                          {rec.priority}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-800/50 text-surface-400">
                          {rec.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-surface-400 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
