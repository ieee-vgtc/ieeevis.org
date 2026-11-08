/**
 * Bookmarks (papers, sessions). A signed-in attendee's bookmarks are stored on
 * their Auth0 profile, in `user_metadata`, so they follow them across devices;
 * the Management API is called straight from the browser with the attendee's
 * own token (scopes `read:current_user` and `update:current_user_metadata`,
 * see `getUserMetadataAccess`). localStorage is always kept as well: it is
 * what shows at once on load, and the only store when signed out or when the
 * Auth0 call fails.
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

/** The stored list; `null` when signed in with none saved yet, `undefined` when the profile can't be reached. */
async function readRemote(
  storageKey: string,
): Promise<string[] | null | undefined> {
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
    return Array.isArray(value) ? value.map(String) : null;
  } catch (error) {
    console.warn("Unable to read bookmarks from Auth0:", error);
    return undefined;
  }
}

// Writes go one at a time so the last toggle is the last one saved.
let writeQueue: Promise<unknown> = Promise.resolve();

function writeRemote(storageKey: string, ids: string[]): Promise<void> {
  const next = writeQueue.then(async () => {
    const access = await getUserMetadataAccess();
    if (!access) return;
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
    } catch (error) {
      console.warn("Unable to save bookmarks to Auth0:", error);
    }
  });
  writeQueue = next;
  return next;
}

export type BookmarkStore = {
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  /** Runs when the Auth0 copy replaces the local one after load. */
  onSync: (callback: () => void) => void;
};

/**
 * A bookmark list under a localStorage key. Reads are synchronous (local copy);
 * after load, a signed-in attendee's Auth0 copy takes over. If Auth0 has none
 * yet, the local bookmarks are saved there.
 */
export function createBookmarkStore(storageKey: string): BookmarkStore {
  let ids = new Set(readLocal(storageKey));
  let changedSinceLoad = false;
  const syncCallbacks: (() => void)[] = [];

  void readRemote(storageKey).then((remote) => {
    if (remote === undefined || changedSinceLoad) return;
    if (remote === null) {
      if (ids.size > 0) void writeRemote(storageKey, [...ids]);
      return;
    }
    ids = new Set(remote);
    writeLocal(storageKey, remote);
    for (const callback of syncCallbacks) callback();
  });

  return {
    has: (id) => ids.has(id),
    toggle: (id) => {
      changedSinceLoad = true;
      if (ids.has(id)) ids.delete(id);
      else ids.add(id);
      writeLocal(storageKey, [...ids]);
      void writeRemote(storageKey, [...ids]);
    },
    onSync: (callback) => {
      syncCallbacks.push(callback);
    },
  };
}
