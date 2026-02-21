"use client";

import { useEffect } from "react";

export function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}: {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);
  const bg = type === "error" ? "bg-red-500/20 border-red-500/40 text-red-300" : "bg-[var(--accent-muted)] border-[var(--accent)]/40 text-[var(--accent)]";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl animate-fade-in ${bg}`}
    >
      {message}
    </div>
  );
}
