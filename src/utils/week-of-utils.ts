// Modified Tableau 10. Every event type color below draws on these.
export const palette = {
  blue: "#4c78a8",
  // orange: "#f58518",
  red: "#e45756",
  lightBlue: "#72b7b2",
  green: "#54a24b",
  yellow: "#eeca3b",
  purple: "#b279a2",
  pink: "#ff9da6",
  brown: "#9d755d",
  gray: "#bab0ac",
  // conference branding colors
  visBrown: "#693a19",
  visOrange: "#f79b4d",
};

// Each event type shown in the program gets a palette color, so filters and
// calendar blocks can be told apart. Related types share a color.
export const typeColors: Record<string, string> = {
  // Research
  full: palette.blue,
  short: palette.lightBlue,
  tvcg: palette.green,
  "cg&a": palette.yellow,
  poster: palette.purple,
  panel: palette.purple,
  cluster: palette.visOrange,
  visap: palette.red,

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
  supporter: palette.visOrange,
  industry: palette.visOrange,

  // Co-located events
  workshop: palette.brown,
  tutorial: palette.yellow,
  associated: palette.pink,
  symposium: palette.pink,
  challenges: palette.green,
  Challenge: palette.green,
  meetup: palette.pink,
  Meetup: palette.pink,
  live: palette.pink,
  application: palette.pink,

  // Highlights in the presented research browser
  awards: palette.red,
  "workshop-awards": palette.red,
  accessible: palette.lightBlue,
  "session-role": palette.gray,
};

// Black or white, whichever has more contrast against the color.
export function textColorFor(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? "#000" : "#ffffff";
}

export const typeTextColors: Record<string, string> = Object.fromEntries(
  Object.entries(typeColors).map(([type, color]) => [
    type,
    textColorFor(color),
  ]),
);
