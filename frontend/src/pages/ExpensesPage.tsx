import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  Hash,
  DollarSign,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { expenseApi } from "../services/expenseApi";
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CategoryBreakdown,
} from "../types/sales";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

const CATEGORY_COLORS: Record<string, string> = {
  Salaries: "#6366f1",
  "Office Supplies": "#10b981",
  "Software Licenses": "#f59e0b",
  Marketing: "#ec4899",
  Utilities: "#06b6d4",
};

const getColor = (cat: string) =>
  CATEGORY_COLORS[cat] || "#8b5cf6";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [filterCategory, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [exps, cats, brkdwn] = await Promise.all([
        expenseApi.getAll(),
        expenseApi.getCategories(),
        expenseApi.getBreakdown(),
      ]);
      setExpenses(exps);
      setCategories(cats);
      setBreakdown(brkdwn);
    } catch {
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const loadExpenses = async () => {
    try {
      const [exps, brkdwn] = await Promise.all([
        expenseApi.getAll(
          filterCategory || undefined,
          startDate || undefined,
          endDate || undefined
        ),
        expenseApi.getBreakdown(startDate || undefined, endDate || undefined),
      ]);
      setExpenses(exps);
      setBreakdown(brkdwn);
    } catch {
      setError("Failed to load expenses");
    }
  };

  // Summary stats
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.expenseDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + e.amount, 0);
  const months = new Set(expenses.map((e) => e.expenseDate.substring(0, 7)));
  const avgPerMonth = months.size > 0 ? totalExpenses / months.size : 0;

  const openCreateModal = () => {
    setEditingExpense(null);
    setFormData({
      category: "",
      amount: "",
      description: "",
      expenseDate: new Date().toISOString().split("T")[0],
    });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || "",
      expenseDate: expense.expenseDate,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      if (editingExpense) {
        const req: UpdateExpenseRequest = {
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description || undefined,
          expenseDate: formData.expenseDate,
        };
        await expenseApi.update(editingExpense.id, req);
      } else {
        const req: CreateExpenseRequest = {
          category: formData.category,
          amount: parseFloat(formData.amount),
          description: formData.description || undefined,
          expenseDate: formData.expenseDate,
        };
        await expenseApi.create(req);
      }
      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to save expense");
      } else {
        setError("Network error");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expenseApi.delete(id);
      loadData();
    } catch {
      setError("Failed to delete expense");
    }
  };

  const clearFilters = () => {
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
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
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-surface-400 text-sm mt-1">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {error && !showModal && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Expenses",
            value: formatCurrency(totalExpenses),
            icon: DollarSign,
            color: "text-danger",
            bg: "bg-danger/10",
          },
          {
            label: "This Month",
            value: formatCurrency(thisMonthExpenses),
            icon: Calendar,
            color: "text-warning",
            bg: "bg-warning/10",
          },
          {
            label: "Avg per Month",
            value: formatCurrency(avgPerMonth),
            icon: TrendingUp,
            color: "text-primary-400",
            bg: "bg-primary-500/10",
          },
          {
            label: "Entries",
            value: expenses.length.toString(),
            icon: Hash,
            color: "text-success",
            bg: "bg-success/10",
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

      {/* Category Breakdown Chart */}
      {breakdown.length > 0 && (
        <div
          className="glass rounded-2xl p-6 mb-6 animate-slide-up"
          style={{ animationDelay: "320ms" }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Spending by Category
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={breakdown}
              layout="vertical"
              margin={{ left: 20, right: 20, top: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: "#e2e8f0", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#f1f5f9",
                }}
                formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24}>
                {breakdown.map((entry, idx) => (
                  <Cell key={idx} fill={getColor(entry.category)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                     text-white text-sm appearance-none cursor-pointer
                     focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                     text-white text-sm focus:outline-none focus:border-primary-500
                     focus:ring-1 focus:ring-primary-500/30 transition-all"
          placeholder="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                     text-white text-sm focus:outline-none focus:border-primary-500
                     focus:ring-1 focus:ring-primary-500/30 transition-all"
          placeholder="End date"
        />
        {(filterCategory || startDate || endDate) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 rounded-xl bg-surface-700/30 text-surface-400 text-sm
                       hover:bg-surface-700/50 hover:text-white transition-all"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Expenses Table */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8 text-surface-500" />}
          title="No expenses found"
          description={
            filterCategory || startDate || endDate
              ? "Try adjusting your filters"
              : "Get started by recording your first expense"
          }
          action={
            !filterCategory && !startDate && !endDate ? (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                           text-sm font-semibold hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider hidden md:table-cell">
                    Description
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider hidden lg:table-cell">
                    Recorded By
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {expenses.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-surface-800/30 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm text-white">
                        {new Date(expense.expenseDate).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                   text-xs font-medium border"
                        style={{
                          backgroundColor: `${getColor(expense.category)}15`,
                          borderColor: `${getColor(expense.category)}30`,
                          color: getColor(expense.category),
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getColor(expense.category) }}
                        />
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-white">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-surface-400 truncate max-w-[200px] block">
                        {expense.description || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-surface-400">
                        {expense.recordedByName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400
                                     hover:text-white transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-surface-400
                                     hover:text-danger transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingExpense ? "Edit Expense" : "Add Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Category *
            </label>
            <input
              type="text"
              required
              list="category-list"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white placeholder:text-surface-500 text-sm
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="e.g., Salaries, Marketing, Utilities"
            />
            <datalist id="category-list">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-white placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.expenseDate}
                onChange={(e) =>
                  setFormData({ ...formData, expenseDate: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-white text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white placeholder:text-surface-500 text-sm
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="Brief description..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-5 py-2.5 rounded-xl bg-surface-800/50 text-surface-300 text-sm
                         font-medium hover:bg-surface-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                         text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-50"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingExpense ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
