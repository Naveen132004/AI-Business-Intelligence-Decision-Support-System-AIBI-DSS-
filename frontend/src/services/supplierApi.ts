import api from "./api";
import type {
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from "../types/sales";

export const supplierApi = {
  getAll: async (): Promise<Supplier[]> => {
    const res = await api.get<Supplier[]>("/suppliers");
    return res.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const res = await api.get<Supplier>(`/suppliers/${id}`);
    return res.data;
  },

  search: async (name: string): Promise<Supplier[]> => {
    const res = await api.get<Supplier[]>(`/suppliers/search?name=${encodeURIComponent(name)}`);
    return res.data;
  },

  create: async (data: CreateSupplierRequest): Promise<Supplier> => {
    const res = await api.post<Supplier>("/suppliers", data);
    return res.data;
  },

  update: async (id: number, data: UpdateSupplierRequest): Promise<Supplier> => {
    const res = await api.put<Supplier>(`/suppliers/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
