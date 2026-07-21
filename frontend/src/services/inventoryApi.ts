import api from "./api";
import type {
  InventoryItem,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  StockAdjustmentRequest,
} from "../types/sales";

export const inventoryApi = {
  getAll: async (supplierId?: number): Promise<InventoryItem[]> => {
    const params = supplierId ? `?supplierId=${supplierId}` : "";
    const res = await api.get<InventoryItem[]>(`/inventory${params}`);
    return res.data;
  },

  getById: async (id: number): Promise<InventoryItem> => {
    const res = await api.get<InventoryItem>(`/inventory/${id}`);
    return res.data;
  },

  getByProduct: async (productId: number): Promise<InventoryItem> => {
    const res = await api.get<InventoryItem>(`/inventory/product/${productId}`);
    return res.data;
  },

  getLowStock: async (): Promise<InventoryItem[]> => {
    const res = await api.get<InventoryItem[]>("/inventory/low-stock");
    return res.data;
  },

  getLowStockCount: async (): Promise<number> => {
    const res = await api.get<{ count: number }>("/inventory/low-stock/count");
    return res.data.count;
  },

  create: async (data: CreateInventoryRequest): Promise<InventoryItem> => {
    const res = await api.post<InventoryItem>("/inventory", data);
    return res.data;
  },

  update: async (id: number, data: UpdateInventoryRequest): Promise<InventoryItem> => {
    const res = await api.put<InventoryItem>(`/inventory/${id}`, data);
    return res.data;
  },

  restock: async (id: number, data: StockAdjustmentRequest): Promise<InventoryItem> => {
    const res = await api.put<InventoryItem>(`/inventory/${id}/restock`, data);
    return res.data;
  },

  adjust: async (id: number, data: StockAdjustmentRequest): Promise<InventoryItem> => {
    const res = await api.put<InventoryItem>(`/inventory/${id}/adjust`, data);
    return res.data;
  },
};
