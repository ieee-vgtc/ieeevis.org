/** Styles shared by the discussion's controls, so its buttons and notes match. */

import type { CSSProperties } from "react";

export const secondaryButtonStyle: CSSProperties = {
  padding: "0.35rem 0.8rem",
  borderRadius: "0.5rem",
  border: "1px solid #d1d5db",
  backgroundColor: "#fff",
  color: "inherit",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  whiteSpace: "nowrap",
};

export const primaryButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  border: "1px solid #2563eb",
  backgroundColor: "#2563eb",
  color: "#fff",
};

export const hintTextStyle: CSSProperties = {
  fontSize: "0.8rem",
  color: "#6b7280",
};

export const errorTextStyle: CSSProperties = {
  fontSize: "0.82rem",
  color: "#b91c1c",
};
