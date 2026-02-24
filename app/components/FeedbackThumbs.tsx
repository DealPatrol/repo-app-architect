"use client";

import { useState } from "react";

type FeedbackThumbsProps = {
  target: string;
  feedbackType: string;
};

export function FeedbackThumbs({ target, feedbackType }: FeedbackThumbsProps) {
  const [voted, setVoted] = useState<1 | -1 | null>(null);

  async function submit(rating: 1 | -1) {
    if (voted !== null) return;
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, feedbackType, rating }),
      });
      if (res.ok) setVoted(rating);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-1 text-[var(--text-muted)]">
      <span className="text-xs mr-2">Was this helpful?</span>
      <button
        onClick={() => submit(1)}
        disabled={voted !== null}
        className={`p-1.5 rounded-lg transition-colors ${voted === 1 ? "bg-green-500/20 text-green-400" : voted !== null ? "opacity-50 cursor-default" : "hover:bg-white/5 hover:text-green-400"}`}
        title="Thumbs up"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </button>
      <button
        onClick={() => submit(-1)}
        disabled={voted !== null}
        className={`p-1.5 rounded-lg transition-colors ${voted === -1 ? "bg-red-500/20 text-red-400" : voted !== null ? "opacity-50 cursor-default" : "hover:bg-white/5 hover:text-red-400"}`}
        title="Thumbs down"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
      </button>
    </div>
  );
}
