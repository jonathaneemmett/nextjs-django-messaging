"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

export interface ToastData {
  id: number;
  sender: string;
  subject: string;
}

let addToastFn: ((toast: ToastData) => void) | null = null;

export function showToast(toast: ToastData) {
  addToastFn?.(toast);
}

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`flex items-start gap-3 w-80 rounded-lg bg-slate-800 p-4 shadow-lg transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <Link
        href={`/inbox/${toast.id}`}
        className="flex-1 min-w-0"
        onClick={handleDismiss}
      >
        <p className="text-sm font-semibold text-white truncate">
          {toast.sender}
        </p>
        <p className="text-sm text-slate-300 truncate">{toast.subject}</p>
      </Link>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
      >
        <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = (toast: ToastData) => {
      setToasts((prev) => [...prev, toast]);
    };
    return () => {
      addToastFn = null;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}
