/** A Bluesky handle as typed — with or without the "@", any case — in canonical form. */
export function normalizeBskyHandle(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

/** Endings the AT Protocol handle spec reserves, so no real handle uses them. */
const RESERVED_TLDS = new Set([
  "alt",
  "arpa",
  "example",
  "internal",
  "invalid",
  "local",
  "localhost",
  "onion",
  // Not reserved outright, but the spec limits it to development use.
  "test",
]);

/**
 * Whether a canonical handle follows the AT Protocol handle syntax
 * (https://atproto.com/specs/handle): a hostname, so a stored handle cannot
 * carry anything that is not a name.
 */
export function isBskyHandle(handle: string): boolean {
  return (
    handle.length <= 253 &&
    // The last label (the TLD) may not start with a digit; the others may.
    /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
      handle,
    ) &&
    !RESERVED_TLDS.has(handle.slice(handle.lastIndexOf(".") + 1))
  );
}
