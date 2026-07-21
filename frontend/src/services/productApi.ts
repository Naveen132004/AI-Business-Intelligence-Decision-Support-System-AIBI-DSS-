import api from "./api";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/sales";

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const res = await api.get<Product[]>("/products");
    return res.data;
  },

  getAllIncludingInactive: async (): Promise<Product[]> => {
    const res = await api.get<Product[]>("/products/all");
    return res.data;
  },

  getById: async (id: number): Promise<Product> => {
    const res = await api.get<Product>(`/products/${id}`);
    return res.data;
  },

  create: async (data: CreateProductRequest): Promise<Product> => {
    const res = await api.post<Product>("/products", data);
    return res.data;
  },

  update: async (id: number, data: UpdateProductRequest): Promise<Product> => {
    const res = await api.put<Product>(`/products/${id}`, data);
    return res.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getCategories: async (): Promise<string[]> => {
    const res = await api.get<string[]>("/products/categories");
    return res.data;
  },
};
