import type { ReactNode } from "react";

/** The amber "Experimental Feature" tag shown on the account page's new sections. */
export default function ExperimentalBadge() {
  return (
    <span className="inline-block rounded bg-amber-300 px-1.5 py-0.5 text-sm font-bold whitespace-nowrap text-amber-950">
      Experimental Feature
    </span>
  );
}

/**
 * A section heading with the badge: next to the heading on wide screens, and
 * on its own line below it on narrow ones, where a long heading would push it
 * onto a wrapped line anyway.
 */
export function ExperimentalHeading({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 md:mb-0 md:flex md:flex-wrap md:items-baseline md:gap-x-3">
      {children}
      <ExperimentalBadge />
    </div>
  );
}
