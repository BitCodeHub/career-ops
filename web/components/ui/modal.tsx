"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const maxWidthStyles: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
  maxWidth = "md",
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`
          relative w-full ${maxWidthStyles[maxWidth]}
          rounded-xl border border-white/[0.08]
          bg-[#111118] shadow-2xl
          animate-scale-in
          ${className}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Close button when there is no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
