"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6">
      <h1 className="text-xl font-semibold text-[var(--text)] mb-2">Something went wrong</h1>
      <p className="text-[var(--text-muted)] text-sm mb-6 text-center max-w-md">
        An error occurred. Please try again or refresh the page.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
