import api from "./api";
import type {
  Expense,
  CreateExpenseRequest,
  UpdateExpenseRequest,
  CategoryBreakdown,
  ExpenseChartDataPoint,
} from "../types/sales";

export const expenseApi = {
  getAll: async (
    category?: string,
    startDate?: string,
    endDate?: string
  ): Promise<Expense[]> => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get<Expense[]>(`/expenses${query}`);
    return res.data;
  },

  getById: async (id: number): Promise<Expense> => {
    const res = await api.get<Expense>(`/expenses/${id}`);
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get<string[]>("/expenses/categories");
    return res.data;
  },

  getBreakdown: async (
    startDate?: string,
    endDate?: string
  ): Promise<CategoryBreakdown[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get<CategoryBreakdown[]>(`/expenses/breakdown${query}`);
    return res.data;
  },

  getMonthlyChart: async (): Promise<ExpenseChartDataPoint[]> => {
    const res = await api.get<[string, number][]>("/expenses/monthly-chart");
    return res.data.map(([month, total]) => ({ month, total }));
  },

  getTotal: async (): Promise<number> => {
    const res = await api.get<{ total: number }>("/expenses/total");
    return res.data.total;
  },

  create: async (data: CreateExpenseRequest): Promise<Expense> => {
    const res = await api.post<Expense>("/expenses", data);
    return res.data;
  },

  update: async (id: number, data: UpdateExpenseRequest): Promise<Expense> => {
    const res = await api.put<Expense>(`/expenses/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`);
  },
};
