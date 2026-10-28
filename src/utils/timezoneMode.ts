// The program's timezone display setting ("conference" | "local" | "both"),
// shared by every page that shows times so a choice made on one carries over.
export type TimezoneMode = "conference" | "local" | "both";

export const TIMEZONE_MODE_STORAGE_KEY = "program-timezone-mode";
export const TIMEZONE_MODE_EVENT = "program-timezone-mode-change";

// Keys used before the setting was shared; read as a fallback so existing
// visitors keep their choice.
const LEGACY_STORAGE_KEYS = [
  "program-calendar-timezone-mode",
  "program-sessions-timezone-mode",
];

export const isTimezoneMode = (value: unknown): value is TimezoneMode =>
  value === "conference" || value === "local" || value === "both";

export function getSavedTimezoneMode(): TimezoneMode {
  try {
    for (const key of [TIMEZONE_MODE_STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
      const value = localStorage.getItem(key);
      if (isTimezoneMode(value)) return value;
    }
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
  }
  return "conference";
}

export function saveTimezoneMode(mode: TimezoneMode) {
  try {
    localStorage.setItem(TIMEZONE_MODE_STORAGE_KEY, mode);
  } catch {
    // Ignore; the setting just won't persist.
  }
  window.dispatchEvent(new CustomEvent(TIMEZONE_MODE_EVENT, { detail: mode }));
}

const cache = new Map<string, Intl.DateTimeFormat>();
const formatter = (
  key: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) => {
  const cacheKey = `${key}|${timeZone}`;
  let f = cache.get(cacheKey);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, ...options });
    cache.set(cacheKey, f);
  }
  return f;
};

const dayKey = (d: Date, tz: string) =>
  formatter("day", tz, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
const time = (d: Date, tz: string) =>
  formatter("time", tz, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
const date = (d: Date, tz: string, long: boolean) =>
  formatter(long ? "dateLong" : "dateShort", tz, {
    weekday: long ? "long" : "short",
    month: "short",
    day: "numeric",
  }).format(d);

/** Plain text, or the text for one moment, to mark up as `<time datetime>`. */
export type TimePart = string | { datetime: string; text: string };

const moment = (d: Date, text: string): TimePart => ({
  datetime: d.toISOString(),
  text,
});

/** Replaces the element's content, with each moment in a `<time>` element. */
export function renderTimeParts(node: Element, parts: TimePart[]) {
  node.replaceChildren(
    ...parts.map((part) => {
      if (typeof part === "string") return part;
      const element = document.createElement("time");
      element.dateTime = part.datetime;
      element.textContent = part.text;
      return element;
    }),
  );
}

function rangeParts(
  start: Date,
  end: Date,
  tz: string,
  withDate: boolean,
): TimePart[] {
  const sameDay = dayKey(start, tz) === dayKey(end, tz);
  if (sameDay) {
    const startText = withDate
      ? `${date(start, tz, true)} @ ${time(start, tz)}`
      : time(start, tz);
    return [moment(start, startText), " - ", moment(end, time(end, tz))];
  }
  return [
    moment(start, `${date(start, tz, false)} ${time(start, tz)}`),
    " - ",
    moment(end, `${date(end, tz, false)} ${time(end, tz)}`),
  ];
}

export function describeTimezone(
  mode: TimezoneMode,
  conferenceTimeZone: string,
  localTimeZone: string,
) {
  if (mode === "conference") return conferenceTimeZone;
  if (mode === "local") return `your local timezone (${localTimeZone})`;
  return `both ${conferenceTimeZone} and your local timezone (${localTimeZone})`;
}

/**
 * A start/end pair for the chosen mode. With `withDate`, a single-day range
 * starts with the full weekday and date.
 */
export function rangePartsForMode(
  startISO: string,
  endISO: string,
  mode: TimezoneMode,
  conferenceTimeZone: string,
  options: { withDate?: boolean; suffix?: boolean } = {},
): TimePart[] {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const localTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const withDate = options.withDate ?? false;
  const parts: TimePart[] = [];
  const showConference = mode === "conference" || mode === "both";
  if (showConference) {
    parts.push(...rangeParts(start, end, conferenceTimeZone, withDate));
    if (options.suffix) parts.push(` (${conferenceTimeZone})`);
  }
  if (mode === "local" || mode === "both") {
    if (showConference) parts.push(" | Local: ");
    parts.push(...rangeParts(start, end, localTimeZone, withDate));
    if (options.suffix) parts.push(` (${localTimeZone})`);
  }
  return parts;
}

/** A single instant, e.g. "Mon, Oct 20, 09:00", for the chosen mode. */
export function instantPartsForMode(
  iso: string,
  mode: TimezoneMode,
  conferenceTimeZone: string,
): TimePart[] {
  const instant = new Date(iso);
  const localTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const format = (tz: string) =>
    moment(
      instant,
      formatter("instant", tz, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(instant),
    );
  const showConference = mode === "conference" || mode === "both";
  const parts: TimePart[] = [];
  if (showConference) parts.push(format(conferenceTimeZone));
  if (mode === "local" || mode === "both") {
    if (showConference) parts.push(" | Local: ");
    parts.push(format(localTimeZone));
  }
  return parts;
}
