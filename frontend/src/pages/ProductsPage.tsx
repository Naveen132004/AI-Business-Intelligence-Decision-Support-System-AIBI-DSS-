import { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Filter,
} from "lucide-react";
import { productApi } from "../services/productApi";
import type { Product, CreateProductRequest, UpdateProductRequest } from "../types/sales";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    costPrice: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productApi.getAll(),
        productApi.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", sku: "", category: "", unitPrice: "", costPrice: "", description: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category || "",
      unitPrice: product.unitPrice.toString(),
      costPrice: product.costPrice?.toString() || "",
      description: product.description || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      if (editingProduct) {
        const req: UpdateProductRequest = {
          name: formData.name,
          category: formData.category || undefined,
          unitPrice: parseFloat(formData.unitPrice),
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
          description: formData.description || undefined,
        };
        await productApi.update(editingProduct.id, req);
      } else {
        const req: CreateProductRequest = {
          name: formData.name,
          sku: formData.sku,
          category: formData.category || undefined,
          unitPrice: parseFloat(formData.unitPrice),
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
          description: formData.description || undefined,
        };
        await productApi.create(req);
      }
      setShowModal(false);
      loadData();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to save product");
      } else {
        setError("Network error");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this product?")) return;
    try {
      await productApi.deactivate(id);
      loadData();
    } catch {
      setError("Failed to deactivate product");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

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
          <h1 className="text-2xl font-bold text-fg">Products</h1>
          <p className="text-surface-400 text-sm mt-1">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                       text-fg placeholder:text-surface-500 text-sm
                       focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                       transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                       text-fg text-sm appearance-none cursor-pointer
                       focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                       transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-surface-500" />}
          title="No products found"
          description={
            search || filterCategory
              ? "Try adjusting your search or filter"
              : "Get started by adding your first product"
          }
          action={
            !search && !filterCategory ? (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                           text-sm font-semibold hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400">
                    Product
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400">
                    SKU
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-surface-400">
                    Category
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-surface-400">
                    Price
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-surface-400">
                    Cost
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-surface-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-surface-800/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-fg">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-surface-500 mt-0.5 truncate max-w-[250px]">
                          {product.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-surface-300 font-mono">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-300 border border-primary-500/20">
                        {product.category || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-medium text-fg">
                        {formatCurrency(product.unitPrice)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm text-surface-400">
                        {product.costPrice
                          ? formatCurrency(product.costPrice)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 rounded-lg hover:bg-surface-700/50 text-surface-400
                                     hover:text-fg transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(product.id)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-surface-400
                                     hover:text-danger transition-all"
                          title="Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? "Edit Product" : "Add Product"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                           transition-all"
                placeholder="e.g. MacBook Pro 16"
              />
            </div>

            {!editingProduct && (
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">
                  SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                             text-fg placeholder:text-surface-500 text-sm font-mono
                             focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                             transition-all"
                  placeholder="ELEC-001"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                           transition-all"
                placeholder="Electronics"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Unit Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({ ...formData, unitPrice: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                           transition-all"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Cost Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({ ...formData, costPrice: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                           transition-all"
                placeholder="0.00"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm resize-none
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30
                           transition-all"
                placeholder="Brief product description..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
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
              {editingProduct ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
