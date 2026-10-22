/** Styles shared by the discussion's controls, so its buttons and notes match. */

import type { CSSProperties } from "react";

export const secondaryButtonStyle: CSSProperties = {
  padding: "0.35rem 0.8rem",
  borderRadius: "0.25rem",
  border: "1px solid var(--color-gray-400)",
  backgroundColor: "#fff",
  color: "inherit",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.85rem",
  whiteSpace: "nowrap",
};

/** Like the site's own "Sign in" buttons (AuthGate, AccountMenu). */
export const primaryButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  border: "1px solid var(--color-accent)",
  backgroundColor: "var(--color-accent)",
  color: "#fff",
  fontWeight: 700,
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

/** A link-like button for the rare case, so it does not compete with the real one. */
export const textButtonStyle: CSSProperties = {
  border: "none",
  background: "none",
  padding: 0,
  color: "var(--color-accent)",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.82rem",
  textDecoration: "underline",
};

export const errorTextStyle: CSSProperties = {
  fontSize: "0.82rem",
  color: "#b91c1c",
};

/** The box of the site's sign-in prompts (AuthGate), so they all match. */
export const signInBoxStyle: CSSProperties = {
  padding: "0.75rem 1rem",
  border: "1px dashed var(--color-gray-400)",
  borderRadius: "6px",
  backgroundColor: "var(--color-gray-100)",
  color: "var(--color-gray-800)",
  fontSize: "0.9rem",
};
