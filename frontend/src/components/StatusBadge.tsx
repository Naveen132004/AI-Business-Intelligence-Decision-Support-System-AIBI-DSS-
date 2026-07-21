import type { OrderStatus } from "../types/sales";

const statusConfig: Record<
  OrderStatus,
  { label: string; bg: string; text: string }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-warning/10 border-warning/20",
    text: "text-warning",
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-info/10 border-info/20",
    text: "text-info",
  },
  SHIPPED: {
    label: "Shipped",
    bg: "bg-primary-400/10 border-primary-400/20",
    text: "text-primary-400",
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-success/10 border-success/20",
    text: "text-success",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-danger/10 border-danger/20",
    text: "text-danger",
  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                  border ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
