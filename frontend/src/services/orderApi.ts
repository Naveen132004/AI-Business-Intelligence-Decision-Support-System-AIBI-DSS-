import api from "./api";
import type { Order, CreateOrderRequest, OrderStatus } from "../types/sales";

export const orderApi = {
  getAll: async (status?: OrderStatus): Promise<Order[]> => {
    const params = status ? `?status=${status}` : "";
    const res = await api.get<Order[]>(`/orders${params}`);
    return res.data;
  },

  getById: async (id: number): Promise<Order> => {
    const res = await api.get<Order>(`/orders/${id}`);
    return res.data;
  },

  create: async (data: CreateOrderRequest): Promise<Order> => {
    const res = await api.post<Order>("/orders", data);
    return res.data;
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const res = await api.put<Order>(`/orders/${id}/status`, { status });
    return res.data;
  },

  cancel: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};
