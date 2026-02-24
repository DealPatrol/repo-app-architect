"use client";

type CostEstimateProps = {
  /** Rough cost in USD (e.g. 0.03) */
  estimate: number;
  /** Short label (e.g. "per analysis") */
  label?: string;
};

export function CostEstimate({ estimate, label = "" }: CostEstimateProps) {
  const formatted = estimate < 0.01 ? "<$0.01" : `~$${estimate.toFixed(2)}`;
  return (
    <span
      className="text-xs text-[var(--text-muted)]"
      title="Approximate OpenAI API cost. Actual cost may vary."
    >
      {formatted}
      {label ? ` ${label}` : ""}
    </span>
  );
}
