import api from "./api";
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  CustomerResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  OrderResponse,
  CreateOrderRequest,
  OrderStatus,
  DashboardStats,
  SalesChartDataPoint,
} from "../types/sales";

// ── Products ─────────────────────────────────────────────────

export const productApi = {
  getActive: async (): Promise<ProductResponse[]> => {
    const res = await api.get<ProductResponse[]>("/products");
    return res.data;
  },

  getAll: async (): Promise<ProductResponse[]> => {
    const res = await api.get<ProductResponse[]>("/products/all");
    return res.data;
  },

  getById: async (id: number): Promise<ProductResponse> => {
    const res = await api.get<ProductResponse>(`/products/${id}`);
    return res.data;
  },

  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const res = await api.post<ProductResponse>("/products", data);
    return res.data;
  },

  update: async (
    id: number,
    data: UpdateProductRequest
  ): Promise<ProductResponse> => {
    const res = await api.put<ProductResponse>(`/products/${id}`, data);
    return res.data;
  },

  deactivate: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/products/${id}`);
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get<string[]>("/products/categories");
    return res.data;
  },
};

// ── Customers ────────────────────────────────────────────────

export const customerApi = {
  getAll: async (): Promise<CustomerResponse[]> => {
    const res = await api.get<CustomerResponse[]>("/customers");
    return res.data;
  },

  getById: async (id: number): Promise<CustomerResponse> => {
    const res = await api.get<CustomerResponse>(`/customers/${id}`);
    return res.data;
  },

  search: async (name: string): Promise<CustomerResponse[]> => {
    const res = await api.get<CustomerResponse[]>("/customers/search", {
      params: { name },
    });
    return res.data;
  },

  create: async (data: CreateCustomerRequest): Promise<CustomerResponse> => {
    const res = await api.post<CustomerResponse>("/customers", data);
    return res.data;
  },

  update: async (
    id: number,
    data: UpdateCustomerRequest
  ): Promise<CustomerResponse> => {
    const res = await api.put<CustomerResponse>(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/customers/${id}`);
    return res.data;
  },
};

// ── Orders ───────────────────────────────────────────────────

export const orderApi = {
  getAll: async (status?: OrderStatus): Promise<OrderResponse[]> => {
    const params = status ? { status } : {};
    const res = await api.get<OrderResponse[]>("/orders", { params });
    return res.data;
  },

  getById: async (id: number): Promise<OrderResponse> => {
    const res = await api.get<OrderResponse>(`/orders/${id}`);
    return res.data;
  },

  create: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const res = await api.post<OrderResponse>("/orders", data);
    return res.data;
  },

  updateStatus: async (
    id: number,
    status: OrderStatus
  ): Promise<OrderResponse> => {
    const res = await api.put<OrderResponse>(`/orders/${id}/status`, {
      status,
    });
    return res.data;
  },

  cancel: async (id: number): Promise<{ message: string }> => {
    const res = await api.delete<{ message: string }>(`/orders/${id}`);
    return res.data;
  },
};

// ── Dashboard ────────────────────────────────────────────────

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get<DashboardStats>("/dashboard/stats");
    return res.data;
  },

  getSalesChart: async (): Promise<SalesChartDataPoint[]> => {
    const res = await api.get<SalesChartDataPoint[]>("/dashboard/sales-chart");
    return res.data;
  },

  getRecentOrders: async (): Promise<OrderResponse[]> => {
    const res = await api.get<OrderResponse[]>("/dashboard/recent-orders");
    return res.data;
  },
};
