import { useState, useEffect } from "react";
import {
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp,
  Loader2,
  ArrowUpRight,
  AlertTriangle,
  Warehouse,
  Receipt,
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
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

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
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      format: (v: number) => v.toLocaleString(),
      icon: ShoppingCart,
      color: "text-primary-400",
      bgColor: "bg-primary-500/10",
    },
    {
      label: "Active Products",
      value: stats?.activeProducts ?? 0,
      format: (v: number) => v.toLocaleString(),
      icon: Package,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Total Revenue",
      value: stats?.totalRevenue ?? 0,
      format: (v: number) => formatCurrency(v),
      icon: DollarSign,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Customers",
      value: stats?.totalCustomers ?? 0,
      format: (v: number) => v.toLocaleString(),
      icon: Users,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Total Expenses",
      value: stats?.totalExpenses ?? 0,
      format: (v: number) => formatCurrency(v),
      icon: Receipt,
      color: "text-danger",
      bgColor: "bg-danger/10",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.fullName?.split(" ")[0]} 👋
        </h1>
        <p className="text-surface-400">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300
                       hover:-translate-y-0.5 animate-slide-up"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-surface-600" />
            </div>
            <p className="text-2xl font-bold text-white">
              {stat.format(stat.value)}
            </p>
            <p className="text-sm text-surface-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div
          className="glass rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">
                Revenue Overview
              </h2>
            </div>
            <span className="text-xs text-surface-500">Last 12 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#336bff"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="#336bff"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(v) =>
                    `₹${(v / 1000).toFixed(0)}k`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30,41,59,0.95)",
                    border: "1px solid rgba(148,163,184,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#94a3b8", fontSize: 12 }}
                  itemStyle={{ color: "#e2e8f0" }}
                  labelFormatter={(label) => {
                    const [y, m] = (label as string).split("-");
                    const d = new Date(parseInt(y), parseInt(m) - 1);
                    return d.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                  formatter={(value) => [
                    formatCurrency(Number(value)),
                    "Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#336bff"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <p className="text-surface-500 text-sm">
                No revenue data available yet
              </p>
            </div>
          )}
        </div>

        {/* Order Count Chart */}
        <div
          className="glass rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold text-white">
                Monthly Orders
              </h2>
            </div>
            <span className="text-xs text-surface-500">Last 12 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(148,163,184,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(30,41,59,0.95)",
                    border: "1px solid rgba(148,163,184,0.1)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  }}
                  labelStyle={{ color: "#94a3b8", fontSize: 12 }}
                  itemStyle={{ color: "#e2e8f0" }}
                  labelFormatter={(label) => {
                    const [y, m] = (label as string).split("-");
                    const d = new Date(parseInt(y), parseInt(m) - 1);
                    return d.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    });
                  }}
                  formatter={(value) => [Number(value), "Orders"]}
                />
                <Bar
                  dataKey="orderCount"
                  fill="#336bff"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <p className="text-surface-500 text-sm">
                No order data available yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts + Recent Orders Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div
          className="glass rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: "480ms" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${lowStockItems.length > 0 ? "text-danger" : "text-success"}`} />
              <h2 className="text-lg font-semibold text-white">Low Stock</h2>
            </div>
            <button
              onClick={() => navigate("/inventory")}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium
                         transition-colors flex items-center gap-1"
            >
              View all
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 rounded-xl
                             bg-danger/[0.03] border border-danger/10"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                      <Warehouse className="w-4 h-4 text-danger" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-surface-500">
                        Reorder at {item.reorderLevel}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-danger shrink-0 ml-2">
                    {item.quantityInStock}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center">
              <Warehouse className="w-8 h-8 text-success/40 mb-2" />
              <p className="text-surface-500 text-sm">All stock levels healthy</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div
          className="lg:col-span-2 glass rounded-2xl p-6 animate-slide-up"
          style={{ animationDelay: "560ms" }}
        >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">
              Recent Orders
            </h2>
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="text-xs text-primary-400 hover:text-primary-300 font-medium
                       transition-colors flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-800/30 transition-colors cursor-pointer"
                    onClick={() => navigate("/orders")}
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-mono text-primary-400">
                        #{order.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-white">
                        {order.customerName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-surface-400">
                        {formatDate(order.orderDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-medium text-white">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-surface-500 text-sm">No recent orders</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
