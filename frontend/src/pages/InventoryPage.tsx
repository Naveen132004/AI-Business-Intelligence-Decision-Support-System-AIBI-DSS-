import { useState, useEffect } from "react";
import {
  Warehouse,
  Plus,
  Loader2,
  AlertTriangle,
  PackagePlus,
  PackageMinus,
  Settings,
} from "lucide-react";
import { inventoryApi } from "../services/inventoryApi";
import { supplierApi } from "../services/supplierApi";
import { productApi } from "../services/productApi";
import type {
  InventoryItem,
  Supplier,
  Product,
  CreateInventoryRequest,
} from "../types/sales";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSupplier, setFilterSupplier] = useState("");
  const [error, setError] = useState("");

  // Restock modal
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState("");
  const [restockLoading, setRestockLoading] = useState(false);

  // Adjust modal
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Edit modal
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editReorderLevel, setEditReorderLevel] = useState("");
  const [editSupplierId, setEditSupplierId] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Add inventory modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [addProductId, setAddProductId] = useState("");
  const [addQty, setAddQty] = useState("0");
  const [addReorder, setAddReorder] = useState("10");
  const [addSupplierId, setAddSupplierId] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inv, supps] = await Promise.all([
        inventoryApi.getAll(),
        supplierApi.getAll(),
      ]);
      setInventory(inv);
      setSuppliers(supps);
    } catch {
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = inventory.filter((i) => i.lowStock);

  const filteredInventory = filterSupplier
    ? inventory.filter((i) => i.supplierId === parseInt(filterSupplier))
    : inventory;

  const getStockColor = (item: InventoryItem) => {
    if (item.quantityInStock <= item.reorderLevel) return "text-danger";
    if (item.quantityInStock <= item.reorderLevel * 1.5)
      return "text-warning";
    return "text-success";
  };

  const getStockBg = (item: InventoryItem) => {
    if (item.quantityInStock <= item.reorderLevel)
      return "bg-danger/10 border-danger/20";
    if (item.quantityInStock <= item.reorderLevel * 1.5)
      return "bg-warning/10 border-warning/20";
    return "bg-success/10 border-success/20";
  };

  const formatDate = (d: string | null) => {
    if (!d) return "Never";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ── Restock ──
  const handleRestock = async () => {
    if (!restockItem || !restockQty) return;
    setRestockLoading(true);
    try {
      await inventoryApi.restock(restockItem.id, {
        quantity: parseInt(restockQty),
      });
      setRestockItem(null);
      setRestockQty("");
      loadData();
    } catch {
      setError("Failed to restock");
    } finally {
      setRestockLoading(false);
    }
  };

  // ── Adjust ──
  const handleAdjust = async () => {
    if (!adjustItem || !adjustQty) return;
    setAdjustLoading(true);
    try {
      await inventoryApi.adjust(adjustItem.id, {
        quantity: parseInt(adjustQty),
      });
      setAdjustItem(null);
      setAdjustQty("");
      loadData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to adjust stock");
      } else {
        setError("Failed to adjust stock");
      }
    } finally {
      setAdjustLoading(false);
    }
  };

  // ── Edit ──
  const openEditModal = (item: InventoryItem) => {
    setEditItem(item);
    setEditReorderLevel(item.reorderLevel.toString());
    setEditSupplierId(item.supplierId?.toString() || "");
    setError("");
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setEditLoading(true);
    try {
      await inventoryApi.update(editItem.id, {
        reorderLevel: parseInt(editReorderLevel),
        supplierId: editSupplierId ? parseInt(editSupplierId) : undefined,
      });
      setEditItem(null);
      loadData();
    } catch {
      setError("Failed to update inventory");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Add ──
  const openAddModal = async () => {
    setError("");
    try {
      const prods = await productApi.getAll();
      // Filter out products that already have inventory records
      const existingProductIds = new Set(inventory.map((i) => i.productId));
      setProducts(prods.filter((p) => !existingProductIds.has(p.id)));
      setAddProductId("");
      setAddQty("0");
      setAddReorder("10");
      setAddSupplierId("");
      setShowAddModal(true);
    } catch {
      setError("Failed to load products");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addProductId) return;
    setAddLoading(true);
    try {
      const req: CreateInventoryRequest = {
        productId: parseInt(addProductId),
        quantityInStock: parseInt(addQty),
        reorderLevel: parseInt(addReorder),
        supplierId: addSupplierId ? parseInt(addSupplierId) : undefined,
      };
      await inventoryApi.create(req);
      setShowAddModal(false);
      loadData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to add inventory");
      } else {
        setError("Failed to add inventory");
      }
    } finally {
      setAddLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Inventory</h1>
          <p className="text-surface-400 text-sm mt-1">
            {inventory.length} tracked items · {lowStockItems.length} low stock
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Inventory
        </button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="mb-6 px-5 py-4 rounded-2xl bg-danger/5 border border-danger/20 animate-slide-up">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            <span className="text-sm font-semibold text-danger">
              {lowStockItems.length} item{lowStockItems.length !== 1 ? "s" : ""}{" "}
              below reorder level
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                           text-xs font-medium bg-danger/10 text-danger border border-danger/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                {item.productName}: {item.quantityInStock}/{item.reorderLevel}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Supplier Filter */}
      <div className="mb-6">
        <select
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                     text-white text-sm appearance-none cursor-pointer
                     focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <EmptyState
          icon={<Warehouse className="w-8 h-8 text-surface-500" />}
          title="No inventory records"
          description="Add inventory tracking for your products"
          action={
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                         text-sm font-semibold hover:shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Inventory
            </button>
          }
        />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Reorder Level
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider hidden md:table-cell">
                    Supplier
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider hidden lg:table-cell">
                    Last Restocked
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-surface-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {filteredInventory.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-surface-800/30 transition-colors animate-slide-up ${
                      item.lowStock ? "bg-danger/[0.02]" : ""
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">
                        {item.productName}
                      </p>
                      <span className="text-xs text-surface-500 font-mono">
                        {item.productSku}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                    border ${getStockBg(item)} ${getStockColor(item)}`}
                      >
                        {item.lowStock && (
                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
                        )}
                        {item.quantityInStock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm text-surface-400">
                        {item.reorderLevel}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-surface-300">
                        {item.supplierName || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-surface-400">
                        {formatDate(item.lastRestockedAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setRestockItem(item);
                            setRestockQty("");
                            setError("");
                          }}
                          className="p-2 rounded-lg hover:bg-success/10 text-surface-400
                                     hover:text-success transition-all"
                          title="Restock"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustQty("");
                            setError("");
                          }}
                          className="p-2 rounded-lg hover:bg-warning/10 text-surface-400
                                     hover:text-warning transition-all"
                          title="Adjust Stock"
                        >
                          <PackageMinus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400
                                     hover:text-white transition-all"
                          title="Edit Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      <Modal
        isOpen={!!restockItem}
        onClose={() => setRestockItem(null)}
        title={`Restock: ${restockItem?.productName || ""}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-800/30 border border-surface-700/30">
            <span className="text-sm text-surface-400">Current Stock</span>
            <span className="text-lg font-bold text-white">
              {restockItem?.quantityInStock}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Quantity to Add *
            </label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white text-sm focus:outline-none focus:border-primary-500
                         focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="Enter quantity"
              autoFocus
            />
          </div>
          {restockQty && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-success/5 border border-success/20">
              <span className="text-sm text-surface-400">New Stock Level</span>
              <span className="text-lg font-bold text-success">
                {(restockItem?.quantityInStock || 0) + parseInt(restockQty || "0")}
              </span>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRestockItem(null)}
              className="px-5 py-2.5 rounded-xl bg-surface-800/50 text-surface-300 text-sm
                         font-medium hover:bg-surface-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleRestock}
              disabled={!restockQty || restockLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                         text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-50"
            >
              {restockLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Restock
            </button>
          </div>
        </div>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={!!adjustItem}
        onClose={() => setAdjustItem(null)}
        title={`Adjust Stock: ${adjustItem?.productName || ""}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-800/30 border border-surface-700/30">
            <span className="text-sm text-surface-400">Current Stock</span>
            <span className="text-lg font-bold text-white">
              {adjustItem?.quantityInStock}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Quantity to Remove *
            </label>
            <input
              type="number"
              min="1"
              max={adjustItem?.quantityInStock}
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white text-sm focus:outline-none focus:border-primary-500
                         focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="Enter quantity"
              autoFocus
            />
          </div>
          {adjustQty && (
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                (adjustItem?.quantityInStock || 0) - parseInt(adjustQty || "0") <=
                (adjustItem?.reorderLevel || 0)
                  ? "bg-danger/5 border-danger/20"
                  : "bg-surface-800/30 border-surface-700/30"
              }`}
            >
              <span className="text-sm text-surface-400">New Stock Level</span>
              <span
                className={`text-lg font-bold ${
                  (adjustItem?.quantityInStock || 0) - parseInt(adjustQty || "0") <=
                  (adjustItem?.reorderLevel || 0)
                    ? "text-danger"
                    : "text-white"
                }`}
              >
                {(adjustItem?.quantityInStock || 0) - parseInt(adjustQty || "0")}
              </span>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setAdjustItem(null)}
              className="px-5 py-2.5 rounded-xl bg-surface-800/50 text-surface-300 text-sm
                         font-medium hover:bg-surface-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleAdjust}
              disabled={!adjustQty || adjustLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-warning/10 text-warning
                         text-sm font-semibold hover:bg-warning/20 transition-all disabled:opacity-50"
            >
              {adjustLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Adjust Stock
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Settings Modal */}
      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title={`Settings: ${editItem?.productName || ""}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Reorder Level
            </label>
            <input
              type="number"
              min="0"
              value={editReorderLevel}
              onChange={(e) => setEditReorderLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white text-sm focus:outline-none focus:border-primary-500
                         focus:ring-1 focus:ring-primary-500/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Supplier
            </label>
            <select
              value={editSupplierId}
              onChange={(e) => setEditSupplierId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white text-sm appearance-none cursor-pointer
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
            >
              <option value="">No supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditItem(null)}
              className="px-5 py-2.5 rounded-xl bg-surface-800/50 text-surface-300 text-sm
                         font-medium hover:bg-surface-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={editLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                         text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-50"
            >
              {editLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Inventory Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Inventory Record"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Product *
            </label>
            <select
              required
              value={addProductId}
              onChange={(e) => setAddProductId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white text-sm appearance-none cursor-pointer
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            {products.length === 0 && (
              <p className="text-xs text-surface-500 mt-1">
                All products already have inventory records
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-white text-sm focus:outline-none focus:border-primary-500
                           focus:ring-1 focus:ring-primary-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={addReorder}
                onChange={(e) => setAddReorder(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-white text-sm focus:outline-none focus:border-primary-500
                           focus:ring-1 focus:ring-primary-500/30 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Supplier
            </label>
            <select
              value={addSupplierId}
              onChange={(e) => setAddSupplierId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-white text-sm appearance-none cursor-pointer
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
            >
              <option value="">No supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-5 py-2.5 rounded-xl bg-surface-800/50 text-surface-300 text-sm
                         font-medium hover:bg-surface-700/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading || !addProductId}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                         text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-50"
            >
              {addLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
