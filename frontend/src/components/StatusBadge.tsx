import type { OrderStatus } from "../types/sales";

const statusConfig: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "badge-pending" },
  CONFIRMED: { label: "Confirmed", cls: "badge-confirmed" },
  SHIPPED: { label: "Shipped", cls: "badge-shipped" },
  DELIVERED: { label: "Delivered", cls: "badge-delivered" },
  CANCELLED: { label: "Cancelled", cls: "badge-cancelled" },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}
