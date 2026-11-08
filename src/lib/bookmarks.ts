/**
 * Bookmarks (papers, sessions). A signed-in attendee's bookmarks are stored on
 * their Auth0 profile, in `user_metadata`, so they follow them across devices;
 * the Management API is called straight from the browser with the attendee's
 * own token (scopes `read:current_user` and `update:current_user_metadata`,
 * see `getUserMetadataAccess`). localStorage is always kept as well: it is
 * what shows at once on load, and the only store when signed out or when the
 * Auth0 call fails. The last list synced with an account is remembered too
 * (`<key>-synced`), so the next load that can reach Auth0 (e.g. right after
 * signing in) does a three-way merge: whatever the browser has that the last
 * sync didn't is an add, whatever the last sync had that the browser no longer
 * does is a remove, and both are applied to the account's list. Bookmarks made
 * while signed out are therefore kept, and ones removed meanwhile stay removed.
 *
 * Each list is a root-level `user_metadata` key, `bookmarks_<storage key>`,
 * because Auth0 only merges user_metadata at the root.
 */

import { getUserMetadataAccess } from "./auth0Client";

const metadataField = (storageKey: string) => `bookmarks_${storageKey}`;

function readLocal(storageKey: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeLocal(storageKey: string, ids: string[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // Storage unavailable; the bookmark just won't persist locally.
  }
}

/**
 * The account's stored list (`ids` is null when none is saved yet), or
 * `undefined` when the profile can't be reached (signed out, or an error).
 */
async function readRemote(
  storageKey: string,
): Promise<{ sub: string; ids: string[] | null } | undefined> {
  const access = await getUserMetadataAccess();
  if (!access) return undefined;
  try {
    const response = await fetch(
      `https://${access.domain}/api/v2/users/${encodeURIComponent(access.sub)}?fields=user_metadata&include_fields=true`,
      { headers: { authorization: `Bearer ${access.token}` } },
    );
    if (!response.ok) return undefined;
    const body = (await response.json()) as {
      user_metadata?: Record<string, unknown>;
    };
    const value = body.user_metadata?.[metadataField(storageKey)];
    return {
      sub: access.sub,
      ids: Array.isArray(value) ? value.map(String) : null,
    };
  } catch (error) {
    console.warn("Unable to read bookmarks from Auth0:", error);
    return undefined;
  }
}

// Writes go one at a time so the last toggle is the last one saved.
let writeQueue: Promise<unknown> = Promise.resolve();

function writeRemote(
  storageKey: string,
  ids: string[],
): Promise<string | null> {
  const next = writeQueue.then(async () => {
    const access = await getUserMetadataAccess();
    if (!access) return null;
    try {
      const response = await fetch(
        `https://${access.domain}/api/v2/users/${encodeURIComponent(access.sub)}`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${access.token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            user_metadata: { [metadataField(storageKey)]: ids },
          }),
        },
      );
      if (!response.ok) {
        console.warn(`Saving bookmarks to Auth0 failed (${response.status}).`);
      }
      return response.ok ? access.sub : null;
    } catch (error) {
      console.warn("Unable to save bookmarks to Auth0:", error);
      return null;
    }
  });
  writeQueue = next;
  return next;
}

const syncedKey = (storageKey: string) => `${storageKey}-synced`;

/** The list last synced with `sub`'s account, empty if none or another account's. */
function readSynced(storageKey: string, sub: string): Set<string> {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(syncedKey(storageKey)) ?? "{}",
    );
    return parsed.sub === sub && Array.isArray(parsed.ids)
      ? new Set<string>(parsed.ids.map(String))
      : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function writeSynced(storageKey: string, sub: string, ids: Set<string>) {
  try {
    localStorage.setItem(
      syncedKey(storageKey),
      JSON.stringify({ sub, ids: [...ids] }),
    );
  } catch {
    // Storage unavailable; the next merge treats everything as new.
  }
}

export type BookmarkStore = {
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  /** Runs when the Auth0 copy has been merged in after load. */
  onSync: (callback: () => void) => void;
};

/**
 * A bookmark list under a localStorage key. Reads are synchronous (local copy).
 * After load, a signed-in attendee's Auth0 list is merged with the browser's
 * (see the file comment) and the result saved back to both.
 */
export function createBookmarkStore(storageKey: string): BookmarkStore {
  let ids = new Set(readLocal(storageKey));
  let synced = false;
  const syncCallbacks: (() => void)[] = [];

  const save = async () => {
    const snapshot = new Set(ids);
    const sub = await writeRemote(storageKey, [...snapshot]);
    if (sub) writeSynced(storageKey, sub, snapshot);
  };

  void readRemote(storageKey).then(async (remote) => {
    if (!remote) return;
    const base = readSynced(storageKey, remote.sub);
    const merged = new Set(remote.ids ?? []);
    for (const id of ids) if (!base.has(id)) merged.add(id);
    for (const id of base) if (!ids.has(id)) merged.delete(id);
    ids = merged;
    writeLocal(storageKey, [...ids]);
    synced = true;
    const unchanged =
      remote.ids !== null &&
      remote.ids.length === ids.size &&
      remote.ids.every((id) => ids.has(id));
    if (unchanged) {
      writeSynced(storageKey, remote.sub, ids);
    } else {
      await save();
    }
    for (const callback of syncCallbacks) callback();
  });

  return {
    has: (id) => ids.has(id),
    toggle: (id) => {
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      writeLocal(storageKey, [...ids]);
      // Before the account's list has been read, saving would overwrite
      // bookmarks made elsewhere; the merge picks this change up instead.
      if (synced) void save();
    },
    onSync: (callback) => {
      syncCallbacks.push(callback);
    },
  };
}
