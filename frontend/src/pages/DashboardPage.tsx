import { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowUpRight,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { dashboardApi } from "../services/dashboardApi";
import { inventoryApi } from "../services/inventoryApi";
import type { DashboardStats, SalesChartData, Order, InventoryItem } from "../types/sales";
import StatusBadge from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-IN", { month: "short" });
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Ease-out count-up for headline numbers. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setValue(target);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const p = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

const chartTooltipStyle = {
  contentStyle: {
    background: "var(--chart-tip-bg)",
    border: "1px solid var(--chart-tip-border)",
    borderRadius: "6px",
    boxShadow: "var(--shadow-elevated)",
    padding: "8px 12px",
  },
  labelStyle: { color: "var(--text-muted)", fontSize: 12, marginBottom: 2 },
  itemStyle: { color: "var(--chart-tip-fg)", fontWeight: 600 },
} as const;

const axisTick = { fill: "var(--chart-axis)", fontSize: 12 };

const monthLabel = (label: React.ReactNode) => {
  const [y, m] = String(label).split("-");
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

interface StatDef {
  label: string;
  value: number;
  format: (v: number) => string;
  /** Month-over-month change, only where the data supports it. */
  trend?: { pct: number; note: string };
}

function StatCell({ stat }: { stat: StatDef }) {
  const animated = useCountUp(stat.value);
  const up = (stat.trend?.pct ?? 0) >= 0;
  return (
    <div className="relative px-4 py-4 lg:px-5 lg:py-5">
      <p className="text-[13px] font-medium text-surface-400">{stat.label}</p>
      <p className="figure mt-2 text-[1.625rem] lg:text-[2rem]">
        {stat.format(Math.round(animated))}
      </p>
      {stat.trend ? (
        <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${up ? "text-success" : "text-danger"}`}>
          {up ? <TrendingUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> : <TrendingDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
          <span>{up ? "+" : "−"}{Math.abs(stat.trend.pct).toFixed(1)}%</span>
          <span className="font-normal text-surface-500">{stat.trend.note}</span>
        </p>
      ) : (
        <p className="mt-2 text-xs text-surface-500">All time</p>
      )}
    </div>
  );
}

/** Change between the last two complete months in the chart series. */
function monthTrend(data: SalesChartData[], key: "revenue" | "orderCount") {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const complete = data.filter((d) => d.month < current);
  if (complete.length < 2) return undefined;
  const a = complete[complete.length - 2], b = complete[complete.length - 1];
  const prev = Number(a[key]) || 0, curr = Number(b[key]) || 0;
  if (prev === 0) return undefined;
  return { pct: ((curr - prev) / prev) * 100, note: `${formatMonth(b.month)} vs ${formatMonth(a.month)}` };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<SalesChartData[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [s, c, o, low] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSalesChart(),
        dashboardApi.getRecentOrders(),
        inventoryApi.getLowStock(),
      ]);
      setStats(s);
      setChartData(c);
      setRecentOrders(o);
      setLowStockItems(low);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-primary-400 animate-spin" aria-label="Loading dashboard" />
      </div>
    );
  }

  const statCards: StatDef[] = [
    { label: "Revenue", value: stats?.totalRevenue ?? 0, format: (v) => formatCurrency(v), trend: monthTrend(chartData, "revenue") },
    { label: "Orders", value: stats?.totalOrders ?? 0, format: (v) => v.toLocaleString("en-IN"), trend: monthTrend(chartData, "orderCount") },
    { label: "Customers", value: stats?.totalCustomers ?? 0, format: (v) => v.toLocaleString("en-IN") },
    { label: "Active products", value: stats?.activeProducts ?? 0, format: (v) => v.toLocaleString("en-IN") },
    { label: "Expenses", value: stats?.totalExpenses ?? 0, format: (v) => formatCurrency(v) },
  ];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.875rem] sm:text-[2.25rem] font-semibold text-fg leading-[1.1]">
            Good to see you, {user?.fullName?.split(" ")[0]}
          </h1>
          <p className="text-surface-400 mt-1.5">Here is where the business stands today.</p>
        </div>
        <p className="text-sm text-surface-400 shrink-0">{today}</p>
      </div>

      {/* Statement strip — the headline figures, ruled like a ledger */}
      <section aria-label="Key figures" className="statement-strip relative grid-lines grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 mb-6">
        {statCards.map((stat) => (
          <StatCell key={stat.label} stat={stat} />
        ))}
      </section>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <section className="card p-5 lg:p-6" aria-labelledby="rev-title">
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h2 id="rev-title" className="text-lg font-semibold text-fg">Revenue</h2>
            <span className="text-[13px] text-surface-500">Last 12 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatMonth} axisLine={{ stroke: "var(--hairline-strong)" }} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...chartTooltipStyle} cursor={{ stroke: "var(--hairline-strong)" }} labelFormatter={monthLabel} formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} fill="url(#revenueGradient)" activeDot={{ r: 5, stroke: "var(--card-bg)", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <p className="text-surface-500 text-sm">Revenue appears here after the first order.</p>
            </div>
          )}
        </section>

        <section className="card p-5 lg:p-6" aria-labelledby="ord-title">
          <div className="flex items-baseline justify-between gap-3 mb-5">
            <h2 id="ord-title" className="text-lg font-semibold text-fg">Orders per month</h2>
            <span className="text-[13px] text-surface-500">Last 12 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="month" tickFormatter={formatMonth} axisLine={{ stroke: "var(--hairline-strong)" }} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} />
                <Tooltip {...chartTooltipStyle} cursor={{ fill: "var(--s-800)" }} labelFormatter={monthLabel} formatter={(value) => [Number(value), "Orders"]} />
                <Bar dataKey="orderCount" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center">
              <p className="text-surface-500 text-sm">Monthly order counts appear after the first order.</p>
            </div>
          )}
        </section>
      </div>

      {/* Low Stock + Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-5">
        <section className="card p-5 lg:p-6" aria-labelledby="low-title">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 id="low-title" className="text-lg font-semibold text-fg flex items-center gap-2">
              Low stock
              {lowStockItems.length > 0 && (
                <span className="font-sans text-xs font-semibold px-1.5 py-0.5 rounded-sm text-warning" style={{ background: "var(--mark-wash)" }}>
                  {lowStockItems.length} to reorder
                </span>
              )}
            </h2>
            <button
              onClick={() => navigate("/inventory")}
              className="text-[13px] font-semibold text-primary-400 hover:underline underline-offset-4 flex items-center gap-1 py-1"
            >
              Inventory <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {lowStockItems.length > 0 ? (
            <ul className="border-t hairline">
              {lowStockItems.slice(0, 5).map((item) => (
                <li key={item.id} className="flag-row flex items-center justify-between gap-3 py-2.5 px-3 border-b hairline">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{item.productName}</p>
                    <p className="text-xs text-surface-500">Reorder at {item.reorderLevel}</p>
                  </div>
                  <p className="text-right shrink-0">
                    <span className="figure text-lg">{item.quantityInStock}</span>
                    <span className="block text-[11px] text-surface-500">in stock</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center gap-2 text-center">
              <AlertTriangle className="w-5 h-5 text-success" aria-hidden="true" />
              <p className="text-surface-400 text-sm">Every product is above its reorder level.</p>
            </div>
          )}
        </section>

        <section className="lg:col-span-2 card p-5 lg:p-6" aria-labelledby="recent-title">
          <div className="flex items-baseline justify-between gap-3 mb-4">
            <h2 id="recent-title" className="text-lg font-semibold text-fg">Recent orders</h2>
            <button
              onClick={() => navigate("/orders")}
              className="text-[13px] font-semibold text-primary-400 hover:underline underline-offset-4 flex items-center gap-1 py-1"
            >
              All orders <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b hairline-strong">
                    <th className="text-left px-2 py-2 text-xs">Order</th>
                    <th className="text-left px-2 py-2 text-xs">Customer</th>
                    <th className="text-left px-2 py-2 text-xs hidden sm:table-cell">Date</th>
                    <th className="text-left px-2 py-2 text-xs">Status</th>
                    <th className="text-right px-2 py-2 text-xs">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b hairline last:border-0 table-row-hover cursor-pointer"
                      onClick={() => navigate("/orders")}
                    >
                      <td className="px-2 py-2.5 text-primary-400 font-medium">#{order.id}</td>
                      <td className="px-2 py-2.5 text-fg">{order.customerName}</td>
                      <td className="px-2 py-2.5 hidden sm:table-cell text-surface-400">{formatDate(order.orderDate)}</td>
                      <td className="px-2 py-2.5"><StatusBadge status={order.status} /></td>
                      <td className="px-2 py-2.5 text-right font-semibold text-fg">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-surface-500 text-sm">New orders will be listed here.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
