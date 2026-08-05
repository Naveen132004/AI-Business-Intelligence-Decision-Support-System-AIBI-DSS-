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

// ── Forecast Types ───────────────────────────────────────────

export interface ForecastDataPoint {
  month: string;
  actual: number | null;
  predicted: number;
  lower: number;
  upper: number;
}

export interface ModelMetrics {
  mae: number;
  mape: number;
  data_points: number;
  forecast_months: number;
}

export interface ComponentImportance {
  name: string;
  importance: number;
  description: string;
}

export interface ForecastResponse {
  id: number;
  forecast_type: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  forecast_data: ForecastDataPoint[];
  model_metrics: ModelMetrics;
  shap_summary: { components: ComponentImportance[] };
  empty?: boolean;
  message?: string;
}

// ── Health Score Types ───────────────────────────────────────

export interface ComponentScore {
  name: string;
  score: number;
  weight: number;
  explanation: string;
}

export interface HealthRecommendation {
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
}

export interface HealthScoreResponse {
  id: number;
  overall_score: number;
  component_scores: ComponentScore[];
  explanations: string[];
  recommendations: HealthRecommendation[];
  generated_at: string;
  empty?: boolean;
  message?: string;
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

// ── RAG Assistant Types ─────────────────────────────────────

export interface AssistantSource {
  source_type: string;
  source_id: string | null;
  content: string;
  score: number;
}

export interface AssistantResponse {
  answer: string;
  sources: AssistantSource[];
  chunks_in_db: number;
}

export interface AssistantSyncResponse {
  message: string;
  chunks_created: number;
  chunks_deleted: number;
}

export interface AssistantStatus {
  chunks_in_db: number;
  last_synced: string | null;
  source_breakdown: Record<string, number>;
}

