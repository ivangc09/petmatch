"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((opts) => {
    const id = ++idRef.current;
    const toast = {
      id,
      message: opts?.message ?? "",
      title: opts?.title,
      variant: opts?.variant ?? "info", // success | error | info | warning
      duration: opts?.duration ?? 3500,
    };
    setToasts((prev) => [...prev, toast]);
    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}
      {/* Container */}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 w-[min(92vw,360px)]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />)
        )}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

function variantStyles(variant) {
  switch (variant) {
    case "success":
      return "border-l-4 border-[#7d9a75] bg-white text-[#2b3136]";
    case "error":
      return "border-l-4 border-[#eb3507] bg-white text-[#2b3136]";
    case "warning":
      return "border-l-4 border-amber-500 bg-white text-[#2b3136]";
    default:
      return "border-l-4 border-[#607859] bg-white text-[#2b3136]"; // info
  }
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    function onEsc(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`shadow-lg rounded-xl px-4 py-3 border ${variantStyles(toast.variant)} relative`}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-2 top-2 rounded-md p-1 text-[#61666b] hover:bg-gray-100"
      >✕</button>
      {toast.title && <div className="font-semibold">{toast.title}</div>}
      <div className="text-sm leading-5">{toast.message}</div>
    </div>
  );
}

/** =====================
 *  Confirm Dialog (useConfirm)
 *  await confirm({ title, description, confirmText, cancelText, variant })
 *  ===================== */
const ConfirmCtx = createContext(null);

export function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({});
  const resolver = useRef(null);

  const confirm = useCallback((options = {}) => {
    setOpts(options);
    setOpen(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback(() => setOpen(false), []);
  const onCancel = useCallback(() => { resolver.current?.(false); close(); }, [close]);
  const onConfirm = useCallback(() => { resolver.current?.(true); close(); }, [close]);

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}

      {/* Modal */}
      <div className={`${open ? "" : "hidden"} fixed inset-0 z-[1100] flex items-center justify-center`}> 
        <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
        <div className="relative z-10 w-[min(92vw,520px)] rounded-2xl bg-white p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-[#2b3136]">
            {opts.title ?? "¿Estás seguro?"}
          </h3>
          {opts.description && (
            <p className="mt-2 text-[#61666b]">{opts.description}</p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border"
            >
              {opts.cancelText ?? "Cancelar"}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-white ${
                opts.variant === "danger"
                  ? "bg-[#e0795e] hover:bg-[#D3764C]"
                  : "bg-[#7d9a75] hover:bg-[#607859]"
              }`}
            >
              {opts.confirmText ?? "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}

/** =====================
 *  AlertBanner (inline, sin contexto)
 *  ===================== */
export function AlertBanner({ variant = "info", children }) {
  const styles = {
    success: "border-green-300 bg-green-50 text-green-800",
    error: "border-red-300 bg-red-50 text-red-800",
    warning: "border-amber-300 bg-amber-50 text-amber-800",
    info: "border-[#607859] bg-[#eef2ee] text-[#2b3136]",
  }[variant] || styles?.info;

  return (
    <div role="status" className={`mb-4 rounded-md border px-4 py-3 ${styles}`}>
      {children}
    </div>
  );
}