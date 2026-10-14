/** Styles shared by the discussion's controls, so its buttons and notes match. */

import type { CSSProperties } from "react";

export const secondaryButtonStyle: CSSProperties = {
  padding: "0.35rem 0.8rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-gray-400)",
  backgroundColor: "#fff",
  color: "inherit",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  whiteSpace: "nowrap",
};

export const primaryButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  border: "1px solid var(--color-primary)",
  backgroundColor: "var(--color-primary)",
  color: "#fff",
  fontFamily: "var(--font-display, inherit)",
  fontWeight: 600,
};

/** A primary button that cannot be used right now, greyed out. */
export const disabledButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  border: "1px solid var(--color-gray-300)",
  backgroundColor: "var(--color-gray-300)",
  color: "var(--color-gray-500)",
  cursor: "not-allowed",
};

export const hintTextStyle: CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--color-gray-600)",
};

export const errorTextStyle: CSSProperties = {
  fontSize: "0.82rem",
  color: "#b91c1c",
};
