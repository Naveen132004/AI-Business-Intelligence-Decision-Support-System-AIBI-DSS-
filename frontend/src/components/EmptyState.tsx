import { Package } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div
        className="w-12 h-12 rounded-md flex items-center justify-center mb-4 text-surface-500"
        style={{ background: "var(--s-800)" }}
        aria-hidden="true"
      >
        {icon || <Package className="w-6 h-6" />}
      </div>
      <h3 className="font-display text-xl font-semibold text-fg mb-1.5">{title}</h3>
      <p className="text-surface-400 text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
