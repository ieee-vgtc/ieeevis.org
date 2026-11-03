/** Current time in ms; `?now=<ISO>` overrides it for testing. */
export function currentTimeMs(): number {
  const override = Date.parse(
    new URLSearchParams(window.location.search).get("now") || "",
  );
  return Number.isNaN(override) ? Date.now() : override;
}

/** Toggles `is-live` on cards whose data-start/data-end contain now. */
export function markLiveCards(cards: HTMLElement[], now: number) {
  for (const card of cards) {
    const start = Date.parse(card.dataset.start || "");
    const end = Date.parse(card.dataset.end || "");
    card.classList.toggle("is-live", now >= start && now < end);
  }
}

/**
 * Wires the mobile "scroll to happening now" button. It is shown only while
 * some card matching `cardSelector` is live and not hidden by filters.
 */
export function setupScrollToLive(
  button: HTMLElement | null,
  root: ParentNode,
  cardSelector: string,
) {
  const findTarget = () =>
    Array.from(
      root.querySelectorAll<HTMLElement>(`${cardSelector}.is-live`),
    ).find((card) => card.getClientRects().length > 0);

  button?.addEventListener("click", () => {
    findTarget()?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "center",
    });
  });

  return () => {
    if (button) button.hidden = !findTarget();
  };
}
