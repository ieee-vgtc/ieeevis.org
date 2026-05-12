export function toTitleLabel(input: string): string {
  return input
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function getProgramEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    full: "VIS Full Papers",
    short: "VIS Short Papers",
    vis: "Conference Events",
    visap: "VIS Arts Program",
    poster: "VIS Posters",
    invited: "Invited Partnership Presentations",
    panel: "VIS Panels",
    tutorial: "Tutorials",
    workshop: "Workshops",
    associated: "Associated Events",
    meetup: "Meetups",
    keynote: "Keynotes",
    other: "Other",
  };

  return labels[eventType] || toTitleLabel(eventType);
}
