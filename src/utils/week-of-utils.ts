// Modified Tableau 10. Every event type color below draws on these.
export const palette = {
  purple: "#86669c",
  lime: "#a4b200",
  ochre: "#b98200",
  sky: "#86add3",
  teal: "#00a3ac",
  // mint: "#70ea9b",
  clay: "#be7b68",
  sand: "#ebb163",
  olive: "#808358",
  gray: "#b4b3aa",
  // conference branding colors
  visBrown: "#693a19",
  visOrange: "#f79b4d",
};

// Each event type shown in the program gets a palette color, so filters and
// calendar blocks can be told apart. Related types share a color.
export const typeColors: Record<string, string> = {
  // Research
  full: palette.purple,
  short: palette.sky,
  tvcg: palette.teal,
  "cg&a": palette.teal,
  poster: palette.clay,
  panel: palette.clay,
  cluster: palette.lime,
  visap: palette.ochre,

  // Plenary & community
  plenary: palette.visBrown,
  governance: palette.gray,
  "invite-only": palette.gray,
  vis: palette.visOrange,
  conference: palette.visOrange,
  keynote: palette.visOrange,
  "invited-talk": palette.visOrange,
  invited: palette.visOrange,
  capstone: palette.visOrange,
  memorial: palette.visOrange,
  supporter: palette.visOrange,
  industry: palette.visOrange,

  // Co-located events
  workshop: palette.sand,
  tutorial: palette.sand,
  associated: palette.sand,
  symposium: palette.sand,
  challenges: palette.olive,
  Challenge: palette.olive,
  meetup: palette.sand,
  live: palette.sand,
  application: palette.sand,

  // Highlights in the presented research browser
  awards: palette.ochre,
  "workshop-awards": palette.ochre,
  accessible: palette.sky,
  "session-role": palette.gray,
};

// Black or white, whichever has more contrast against the color.
function textColorFor(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? "#111827" : "#ffffff";
}

export const typeTextColors: Record<string, string> = Object.fromEntries(
  Object.entries(typeColors).map(([type, color]) => [
    type,
    textColorFor(color),
  ]),
);
