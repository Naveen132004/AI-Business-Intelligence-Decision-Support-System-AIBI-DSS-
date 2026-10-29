import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${maxWidth} glass-panel rounded-lg
                    modal-content max-h-[85vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b hairline">
          <h2 className="font-display text-xl font-semibold text-fg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-md hover:bg-surface-800 text-surface-400
                       hover:text-fg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
