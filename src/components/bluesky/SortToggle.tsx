/** Orders the top-level replies: "Most liked" by likes, "Newest" by recency. */

import type { ReplySort } from "./types";

const OPTIONS: Array<{ value: ReplySort; label: string }> = [
  { value: "top", label: "Most liked" },
  { value: "newest", label: "Newest" },
];

export default function SortToggle({
  sort,
  onChange,
}: {
  sort: ReplySort;
  onChange: (sort: ReplySort) => void;
}) {
  return (
    <div
      aria-label="Sort comments"
      role="group"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.82rem",
        color: "var(--color-gray-600)",
      }}
    >
      <span>Sort by:</span>
      {OPTIONS.map((option) => (
        <button
          aria-pressed={sort === option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
          style={{
            padding: "0.2rem 0.7rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-gray-300)",
            backgroundColor:
              sort === option.value
                ? "color-mix(in srgb, var(--color-accent) 12%, white)"
                : "#fff",
            color:
              sort === option.value
                ? "var(--color-accent)"
                : "var(--color-gray-600)",
            cursor: "pointer",
            fontSize: "0.82rem",
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
