import api from "./api";
import type {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types/sales";

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const res = await api.get<Customer[]>("/customers");
    return res.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const res = await api.get<Customer>(`/customers/${id}`);
    return res.data;
  },

  search: async (name: string): Promise<Customer[]> => {
    const res = await api.get<Customer[]>(`/customers/search?name=${encodeURIComponent(name)}`);
    return res.data;
  },

  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const res = await api.post<Customer>("/customers", data);
    return res.data;
  },

  update: async (id: number, data: UpdateCustomerRequest): Promise<Customer> => {
    const res = await api.put<Customer>(`/customers/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
