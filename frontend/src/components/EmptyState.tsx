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
      <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mb-4">
        {icon || <Package className="w-8 h-8 text-surface-500" />}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-surface-400 text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
