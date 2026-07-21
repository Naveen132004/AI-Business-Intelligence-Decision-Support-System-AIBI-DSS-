import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { orderApi } from "../services/orderApi";
import { customerApi } from "../services/customerApi";
import { productApi } from "../services/productApi";
import type {
  Order,
  OrderStatus,
  CreateOrderRequest,
  OrderItemRequest,
  Customer,
  Product,
} from "../types/sales";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

const STATUS_TABS: { label: string; value: OrderStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "SHIPPED",
  SHIPPED: "DELIVERED",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | "">("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  // Create order form
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantity: string }[]
  >([{ productId: "", quantity: "1" }]);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = activeTab
        ? await orderApi.getAll(activeTab as OrderStatus)
        : await orderApi.getAll();
      setOrders(data);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = async () => {
    setError("");
    try {
      const [custs, prods] = await Promise.all([
        customerApi.getAll(),
        productApi.getAll(),
      ]);
      setCustomers(custs);
      setProducts(prods);
      setSelectedCustomer("");
      setNotes("");
      setOrderItems([{ productId: "", quantity: "1" }]);
      setShowCreateModal(true);
    } catch {
      setError("Failed to load form data");
    }
  };

  const addItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: "1" }]);
  };

  const removeItem = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: "productId" | "quantity",
    value: string
  ) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.productId));
      if (!product) return sum;
      return sum + product.unitPrice * parseInt(item.quantity || "0");
    }, 0);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const items: OrderItemRequest[] = orderItems
      .filter((i) => i.productId)
      .map((i) => ({
        productId: parseInt(i.productId),
        quantity: parseInt(i.quantity),
      }));

    if (items.length === 0) {
      setError("Add at least one item");
      return;
    }

    const req: CreateOrderRequest = {
      customerId: parseInt(selectedCustomer),
      notes: notes || undefined,
      items,
    };

    setFormLoading(true);
    try {
      await orderApi.create(req);
      setShowCreateModal(false);
      loadOrders();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to create order");
      } else {
        setError("Network error");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;
    try {
      await orderApi.updateStatus(order.id, nextStatus);
      loadOrders();
    } catch {
      setError("Failed to update status");
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await orderApi.cancel(id);
      loadOrders();
    } catch {
      setError("Failed to cancel order");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-surface-400 text-sm mt-1">
            Track and manage customer orders
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                       ${
                         activeTab === tab.value
                           ? "gradient-primary text-white shadow-glow"
                           : "glass text-surface-400 hover:text-white"
                       }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-surface-500" />}
          title="No orders found"
          description={
            activeTab
              ? "No orders with this status"
              : "Create your first order to get started"
          }
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order, index) => (
            <div
              key={order.id}
              className="glass rounded-2xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* Order Header Row */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer
                           hover:bg-surface-800/30 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === order.id ? null : order.id)
                }
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary-500/10 items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-400">
                      #{order.id}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      <span className="sm:hidden text-surface-400">#{order.id} · </span>
                      {order.customerName}
                    </p>
                    <p className="text-xs text-surface-500">
                      {formatDate(order.orderDate)}
                      {order.notes && ` · ${order.notes}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-semibold text-white hidden sm:block">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  {expandedId === order.id ? (
                    <ChevronUp className="w-4 h-4 text-surface-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-surface-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === order.id && (
                <div className="px-5 pb-5 border-t border-surface-700/50 animate-fade-in">
                  <div className="sm:hidden text-sm font-semibold text-white mb-3 pt-3">
                    Total: {formatCurrency(order.totalAmount)}
                  </div>

                  {/* Items Table */}
                  <table className="w-full mt-3">
                    <thead>
                      <tr className="text-xs text-surface-500 uppercase">
                        <th className="text-left pb-2">Item</th>
                        <th className="text-center pb-2">Qty</th>
                        <th className="text-right pb-2">Price</th>
                        <th className="text-right pb-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-800/50">
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 text-sm text-white">
                            {item.productName}
                            <span className="text-xs text-surface-500 ml-2">
                              {item.productSku}
                            </span>
                          </td>
                          <td className="py-2 text-sm text-surface-400 text-center">
                            {item.quantity}
                          </td>
                          <td className="py-2 text-sm text-surface-400 text-right">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2 text-sm text-white text-right font-medium">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-3 border-t border-surface-800/50">
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => handleAdvanceStatus(order)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg gradient-primary text-white
                                   text-xs font-semibold hover:shadow-glow transition-all"
                      >
                        Mark as {NEXT_STATUS[order.status]}
                      </button>
                    )}
                    {order.status !== "CANCELLED" &&
                      order.status !== "DELIVERED" && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-danger/10
                                     text-danger text-xs font-semibold hover:bg-danger/20 transition-all"
                        >
                          Cancel Order
                        </button>
                      )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Order"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Customer *
            </label>
            <select
              required
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white text-sm appearance-none cursor-pointer
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Order Items *
            </label>
            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <select
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(idx, "productId", e.target.value)
                    }
                    className="flex-1 px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                               text-white text-sm appearance-none
                               focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.unitPrice)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", e.target.value)
                    }
                    className="w-20 px-3 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                               text-white text-sm text-center
                               focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                    placeholder="Qty"
                  />
                  {orderItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="px-3 py-2.5 rounded-xl bg-danger/10 text-danger text-sm
                                 hover:bg-danger/20 transition-all"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              + Add another item
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white placeholder:text-surface-500 text-sm
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="Optional order notes"
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-surface-800/30 border border-surface-700/30">
            <span className="text-sm text-surface-400">Estimated Total</span>
            <span className="text-lg font-bold text-white">
              {formatCurrency(calculateTotal())}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-5 py-2.5 rounded-xl bg-surface-800/50 text-surface-300 text-sm
                         font-medium hover:bg-surface-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                         text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-50"
            >
              {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
