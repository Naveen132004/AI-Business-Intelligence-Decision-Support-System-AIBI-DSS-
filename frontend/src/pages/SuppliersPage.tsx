import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { supplierApi } from "../services/supplierApi";
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from "../types/sales";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierApi.getAll();
      setSuppliers(data);
    } catch {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      if (editingSupplier) {
        const req: UpdateSupplierRequest = {
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        };
        await supplierApi.update(editingSupplier.id, req);
      } else {
        const req: CreateSupplierRequest = {
          name: formData.name,
          contactPerson: formData.contactPerson || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        };
        await supplierApi.create(req);
      }
      setShowModal(false);
      loadSuppliers();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to save supplier");
      } else {
        setError("Network error");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await supplierApi.delete(id);
      loadSuppliers();
    } catch {
      setError("Failed to delete supplier. It may be linked to inventory records.");
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
          <h1 className="text-2xl font-bold text-fg">Suppliers</h1>
          <p className="text-surface-400 text-sm mt-1">
            {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {error && !showModal && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          placeholder="Search by name, contact person, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 pl-10 pr-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                     text-fg placeholder:text-surface-500 text-sm
                     focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
        />
      </div>

      {/* Supplier Cards */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-8 h-8 text-surface-500" />}
          title="No suppliers found"
          description={
            search
              ? "Try adjusting your search"
              : "Get started by adding your first supplier"
          }
          action={
            !search ? (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                           text-sm font-semibold hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier, index) => (
            <div
              key={supplier.id}
              className="glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300
                         hover:-translate-y-0.5 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-fg">
                      {supplier.name}
                    </h3>
                    {supplier.contactPerson && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-surface-500" />
                        <span className="text-xs text-surface-500">
                          {supplier.contactPerson}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(supplier)}
                    className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-fg transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-surface-400 hover:text-danger transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-surface-400">
                    <Mail className="w-3.5 h-3.5 text-surface-500" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-surface-400">
                    <Phone className="w-3.5 h-3.5 text-surface-500" />
                    <span>{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <p className="text-xs text-surface-500 truncate pt-1 border-t border-surface-800/50">
                    {supplier.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-fg placeholder:text-surface-500 text-sm
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="TechDistributors India"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                placeholder="Ramesh Kumar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                placeholder="contact@supplier.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                           text-fg placeholder:text-surface-500 text-sm
                           focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
                placeholder="Full address"
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
              {editingSupplier ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
