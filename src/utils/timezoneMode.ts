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

function range(start: Date, end: Date, tz: string, withDate: boolean) {
  const sameDay = dayKey(start, tz) === dayKey(end, tz);
  if (sameDay) {
    const times = `${time(start, tz)} - ${time(end, tz)}`;
    return withDate ? `${date(start, tz, true)} @ ${times}` : times;
  }
  return `${date(start, tz, false)} ${time(start, tz)} - ${date(end, tz, false)} ${time(end, tz)}`;
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
 * Formats a start/end pair for the chosen mode. With `withDate`, a single-day
 * range is prefixed with the full weekday and date.
 */
export function formatRangeForMode(
  startISO: string,
  endISO: string,
  mode: TimezoneMode,
  conferenceTimeZone: string,
  options: { withDate?: boolean; suffix?: boolean } = {},
) {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const localTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const withDate = options.withDate ?? false;
  const parts: string[] = [];
  const showConference = mode === "conference" || mode === "both";
  if (showConference) {
    const text = range(start, end, conferenceTimeZone, withDate);
    parts.push(options.suffix ? `${text} (${conferenceTimeZone})` : text);
  }
  if (mode === "local" || mode === "both") {
    const text = range(start, end, localTimeZone, withDate);
    const labeled = options.suffix ? `${text} (${localTimeZone})` : text;
    parts.push(showConference ? `Local: ${labeled}` : labeled);
  }
  return parts.join(" | ");
}

/** Formats a single instant, e.g. "Mon, Oct 20, 09:00", for the chosen mode. */
export function formatInstantForMode(
  iso: string,
  mode: TimezoneMode,
  conferenceTimeZone: string,
) {
  const instant = new Date(iso);
  const localTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const format = (tz: string) =>
    formatter("instant", tz, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(instant);
  const showConference = mode === "conference" || mode === "both";
  const parts: string[] = [];
  if (showConference) parts.push(format(conferenceTimeZone));
  if (mode === "local" || mode === "both") {
    const text = format(localTimeZone);
    parts.push(showConference ? `Local: ${text}` : text);
  }
  return parts.join(" | ");
}
