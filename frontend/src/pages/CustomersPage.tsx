import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { customerApi } from "../services/customerApi";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "../types/sales";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch {
      setError("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormData({ name: "", email: "", phone: "", address: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      if (editingCustomer) {
        const req: UpdateCustomerRequest = {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        };
        await customerApi.update(editingCustomer.id, req);
      } else {
        const req: CreateCustomerRequest = {
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
        };
        await customerApi.create(req);
      }
      setShowModal(false);
      loadCustomers();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to save customer");
      } else {
        setError("Network error");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await customerApi.delete(id);
      loadCustomers();
    } catch {
      setError("Failed to delete customer");
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
          <h1 className="text-2xl font-bold text-fg">Customers</h1>
          <p className="text-surface-400 text-sm mt-1">
            {customers.length} customer{customers.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                     text-sm font-semibold hover:shadow-glow transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 pl-10 pr-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                     text-fg placeholder:text-surface-500 text-sm
                     focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
        />
      </div>

      {/* Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8 text-surface-500" />}
          title="No customers found"
          description={
            search
              ? "Try adjusting your search"
              : "Get started by adding your first customer"
          }
          action={
            !search ? (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white
                           text-sm font-semibold hover:shadow-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCustomers.map((customer, index) => (
            <div
              key={customer.id}
              className="glass rounded-2xl p-5 hover:shadow-glow transition-all duration-300
                         hover:-translate-y-0.5 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-fg">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-fg">
                      {customer.name}
                    </h3>
                    <p className="text-xs text-surface-500">
                      Added{" "}
                      {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(customer)}
                    className="p-1.5 rounded-lg hover:bg-surface-700/50 text-surface-400 hover:text-fg transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-surface-400 hover:text-danger transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {customer.email && (
                  <div className="flex items-center gap-2 text-surface-400">
                    <Mail className="w-3.5 h-3.5 text-surface-500" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-surface-400">
                    <Phone className="w-3.5 h-3.5 text-surface-500" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <p className="text-xs text-surface-500 truncate pt-1 border-t border-surface-800/50">
                    {customer.address}
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
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Company / Customer Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-fg placeholder:text-surface-500 text-sm
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="TechCorp Solutions"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="contact@company.com"
              />
            </div>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50
                         text-fg placeholder:text-surface-500 text-sm resize-none
                         focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-all"
              placeholder="Full address"
            />
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
              {editingCustomer ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
