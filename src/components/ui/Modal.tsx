"use client";
import clsx from "clsx";
import React, { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function Modal({ open, onClose, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          "glass-bg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-neo-out w-full max-w-xl",
          className
        )}
      >
        {children}
        <button
          aria-label="Закрыть"
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-white hover:text-[#FFB648]"
        >
          ×
        </button>
      </div>
    </div>
  );
}
