import api from "./api";
import type { DashboardStats, SalesChartData, Order } from "../types/sales";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>("/dashboard/stats");
    return res.data;
  },

  getSalesChart: async (): Promise<SalesChartData[]> => {
    const res = await api.get<SalesChartData[]>("/dashboard/sales-chart");
    return res.data;
  },

  getRecentOrders: async (): Promise<Order[]> => {
    const res = await api.get<Order[]>("/dashboard/recent-orders");
    return res.data;
  },
};
