import type { ReactNode } from "react";

/** The amber "Experimental Feature" tag shown on the account page's new sections. */
export default function ExperimentalBadge() {
  return (
    <span className="inline-block rounded bg-amber-300 px-1.5 py-0.5 text-sm font-bold whitespace-nowrap text-amber-950">
      Experimental Feature
    </span>
  );
}

interface ExperimentalHeadingProps {
  as?: "h2" | "h3";
  id?: string;
  children: ReactNode;
}

/**
 * A section heading with the badge: centred next to the heading on wide
 * screens, and on its own line below it on narrow ones, where a long heading
 * would push it onto a wrapped line anyway.
 */
export function ExperimentalHeading({
  as: Heading = "h2",
  id,
  children,
}: ExperimentalHeadingProps) {
  return (
    <div className="mb-4 flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3">
      {/* The site's heading margin would throw off the centring; the row spaces it instead. */}
      <Heading id={id} className="font-bold" style={{ margin: 0 }}>
        {children}
      </Heading>
      <ExperimentalBadge />
    </div>
  );
}
