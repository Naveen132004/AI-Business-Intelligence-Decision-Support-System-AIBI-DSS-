// ── Product Types ────────────────────────────────────────────

export interface ProductResponse {
  id: number;
  name: string;
  sku: string;
  category: string | null;
  unitPrice: number;
  costPrice: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category?: string;
  unitPrice: number;
  costPrice?: number;
  description?: string;
}

export interface UpdateProductRequest {
  name: string;
  category?: string;
  unitPrice: number;
  costPrice?: number;
  description?: string;
}

// ── Customer Types ───────────────────────────────────────────

export interface CustomerResponse {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

// ── Order Types ──────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  customerId: number | null;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  createdByName: string;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerId: number;
  notes?: string;
  items: OrderItemRequest[];
}

// ── Dashboard Types ──────────────────────────────────────────

export interface DashboardStats {
  totalOrders: number;
  activeProducts: number;
  totalRevenue: number;
  totalCustomers: number;
  totalExpenses: number;
}

export interface SalesChartDataPoint {
  month: string;
  revenue: number;
  orderCount: number;
}

// ── Supplier Types ───────────────────────────────────────────

export interface SupplierResponse {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierRequest {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// ── Inventory Types ──────────────────────────────────────────

export interface InventoryResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantityInStock: number;
  reorderLevel: number;
  supplierId: number | null;
  supplierName: string | null;
  lastRestockedAt: string | null;
  updatedAt: string;
  lowStock: boolean;
}

export interface CreateInventoryRequest {
  productId: number;
  quantityInStock?: number;
  reorderLevel?: number;
  supplierId?: number;
}

export interface UpdateInventoryRequest {
  reorderLevel?: number;
  supplierId?: number;
}

export interface StockAdjustmentRequest {
  quantity: number;
}

// ── Expense Types ────────────────────────────────────────────

export interface ExpenseResponse {
  id: number;
  category: string;
  amount: number;
  description: string | null;
  expenseDate: string;
  recordedByName: string | null;
  createdAt: string;
}

export interface CreateExpenseRequest {
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
}

export interface UpdateExpenseRequest {
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
}

export interface ExpenseChartDataPoint {
  month: string;
  total: number;
}

// ── Aliases (used by pages & API services) ───────────────────

export type Product = ProductResponse;
export type Customer = CustomerResponse;
export type Order = OrderResponse;
export type OrderItem = OrderItemResponse;
export type SalesChartData = SalesChartDataPoint;
export type Supplier = SupplierResponse;
export type InventoryItem = InventoryResponse;
export type Expense = ExpenseResponse;
