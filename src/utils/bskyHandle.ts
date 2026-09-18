/** A Bluesky handle as typed — with or without the "@", any case — in canonical form. */
export function normalizeBskyHandle(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

/**
 * Whether a canonical handle is one Bluesky could have issued: a hostname, so
 * a stored handle cannot carry anything that is not a name.
 */
export function isBskyHandle(handle: string): boolean {
  return (
    handle.length <= 253 &&
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(handle)
  );
}
