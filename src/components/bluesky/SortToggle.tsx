/** Orders the top-level replies: "Top" by likes, "Newest" by recency. */

import type { ReplySort } from "./types";

const OPTIONS: Array<{ value: ReplySort; label: string }> = [
  { value: "top", label: "Top" },
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
      style={{ display: "flex", gap: "0.4rem" }}
    >
      {OPTIONS.map((option) => (
        <button
          aria-pressed={sort === option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
          style={{
            padding: "0.2rem 0.7rem",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
            backgroundColor: sort === option.value ? "#eff6ff" : "#fff",
            color: sort === option.value ? "#2563eb" : "#6b7280",
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
