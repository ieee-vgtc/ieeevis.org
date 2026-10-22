function toTitleLabel(input: string): string {
  return input
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export function getProgramEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    full: "Full Papers",
    short: "Short Papers",
    tvcg: "TVCG Papers",
    "cg&a": "CG&A Papers",
    vis: "Conference Events",
    plenary: "Plenary",
    governance: "Governance",
    "invite-only": "Invite Only",
    cluster: "Practitioner Summit",
    visap: "Arts Program",
    poster: "Posters",
    invited: "Invited Partnership Presentations",
    panel: "Panels",
    tutorial: "Tutorials",
    workshop: "Workshops",
    associated: "Associated Events",
    meetup: "Meetups",
    keynote: "Keynotes",
    "invited-talk": "Keynotes & VISions",
    other: "Other",
  };

  return labels[eventType] || toTitleLabel(eventType);
}

type TypeLayout = { label: string; types: string[]; rest?: boolean }[];

// Layout of the type filter pills. Groups and the types inside them appear in
// this order. A group with no label is shown as plain pills; a labeled group
// is collapsed into a dropdown. Types not listed land in the `rest` group.
export const programTypeLayout: TypeLayout = [
  {
    label: "",
    types: ["full", "short", "cluster", "visap", "cg&a", "tvcg", "poster"],
  },
  {
    label: "Plenary & Community",
    types: ["plenary", "governance", "invite-only", "keynote", "invited-talk"],
  },
  { label: "Other Events", types: ["panel"], rest: true },
];

// Same, for the presented research (papers) browser.
export const presentedResearchTypeLayout: TypeLayout = [
  { label: "", types: ["full", "short", "cg&a", "tvcg"] },
  {
    label: "Other contributions",
    types: [],
    rest: true,
  },
  {
    label: "Highlights",
    types: ["invited-talk", "awards", "workshop-awards", "accessible"],
  },
];

export const getDropdownGroups = (layout: TypeLayout) =>
  layout.map((group) => group.label).filter(Boolean);

export const programTypeDropdownGroups = getDropdownGroups(programTypeLayout);

export function groupProgramTypeOptions<T extends { value: string }>(
  options: T[],
  layout: TypeLayout = programTypeLayout,
): (T & { group: string })[] {
  const fallback = Math.max(
    layout.findIndex((group) => group.rest),
    0,
  );
  const position = (value: string) => {
    const found = layout.findIndex((g) => g.types.includes(value));
    const group = found === -1 ? fallback : found;
    const within = layout[group].types.indexOf(value);
    return { group, within: within === -1 ? Infinity : within };
  };
  return options
    .map((option) => ({
      ...option,
      group: layout[position(option.value).group].label,
    }))
    .sort((a, b) => {
      const pa = position(a.value);
      const pb = position(b.value);
      return pa.group - pb.group || pa.within - pb.within;
    });
}

// Cards keep the "VIS" prefix that the filter labels drop.
const cardLabelOverrides: Record<string, string> = {
  full: "VIS Full Papers",
  short: "VIS Short Papers",
  visap: "VIS Arts Program",
  poster: "VIS Posters",
  panel: "VIS Panels",
};

export function getProgramEventTypeCardLabel(eventType: string): string {
  return cardLabelOverrides[eventType] || getProgramEventTypeLabel(eventType);
}
