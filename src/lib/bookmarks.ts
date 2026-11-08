/**
 * Bookmarks (papers, sessions). A signed-in attendee's bookmarks are stored on
 * their Auth0 profile, in `user_metadata`, so they follow them across devices;
 * the Management API is called straight from the browser with the attendee's
 * own token (scopes `read:current_user` and `update:current_user_metadata`,
 * see `getUserMetadataAccess`). localStorage is always kept as well: it is
 * what shows at once on load, and the only store when signed out or when the
 * Auth0 call fails. Changes made while Auth0 can't be reached are remembered
 * as pending adds and removes and merged into the account on the next load
 * that can reach it (e.g. right after signing in), so bookmarks made while
 * signed out are not lost and bookmarks removed meanwhile stay removed.
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

function writeRemote(storageKey: string, ids: string[]): Promise<boolean> {
  const next = writeQueue.then(async () => {
    const access = await getUserMetadataAccess();
    if (!access) return false;
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
      return response.ok;
    } catch (error) {
      console.warn("Unable to save bookmarks to Auth0:", error);
      return false;
    }
  });
  writeQueue = next;
  return next;
}

type Pending = { added: Set<string>; removed: Set<string> };

const pendingKey = (storageKey: string) => `${storageKey}-pending`;

function readPending(storageKey: string): Pending {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(pendingKey(storageKey)) ?? "{}",
    );
    return {
      added: new Set<string>((parsed.added ?? []).map(String)),
      removed: new Set<string>((parsed.removed ?? []).map(String)),
    };
  } catch {
    return { added: new Set(), removed: new Set() };
  }
}

function writePending(storageKey: string, pending: Pending) {
  try {
    if (pending.added.size === 0 && pending.removed.size === 0) {
      localStorage.removeItem(pendingKey(storageKey));
    } else {
      localStorage.setItem(
        pendingKey(storageKey),
        JSON.stringify({
          added: [...pending.added],
          removed: [...pending.removed],
        }),
      );
    }
  } catch {
    // Storage unavailable; nothing to remember.
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
 * After load, a signed-in attendee's Auth0 list is merged with the changes
 * made while it couldn't be reached: pending adds are added, pending removes
 * are removed, and the result is saved back. With no Auth0 list yet, the local
 * bookmarks become it.
 */
export function createBookmarkStore(storageKey: string): BookmarkStore {
  let ids = new Set(readLocal(storageKey));
  const pending = readPending(storageKey);
  let synced = false;
  const syncCallbacks: (() => void)[] = [];

  const save = async () => {
    if (await writeRemote(storageKey, [...ids])) {
      pending.added.clear();
      pending.removed.clear();
      writePending(storageKey, pending);
    }
  };

  void readRemote(storageKey).then(async (remote) => {
    if (remote === undefined) return;
    if (remote !== null) {
      const merged = new Set(remote);
      for (const id of pending.added) merged.add(id);
      for (const id of pending.removed) merged.delete(id);
      ids = merged;
      writeLocal(storageKey, [...ids]);
    }
    synced = true;
    const changed =
      remote === null
        ? ids.size > 0
        : ids.size !== remote.length || remote.some((id) => !ids.has(id));
    if (changed) {
      await save();
    } else {
      pending.added.clear();
      pending.removed.clear();
      writePending(storageKey, pending);
    }
    for (const callback of syncCallbacks) callback();
  });

  return {
    has: (id) => ids.has(id),
    toggle: (id) => {
      if (ids.has(id)) {
        ids.delete(id);
        pending.added.delete(id);
        pending.removed.add(id);
      } else {
        ids.add(id);
        pending.removed.delete(id);
        pending.added.add(id);
      }
      writeLocal(storageKey, [...ids]);
      writePending(storageKey, pending);
      // Before the account's list has been read, saving would overwrite
      // bookmarks made elsewhere; the pending changes are merged in instead.
      if (synced) void save();
    },
    onSync: (callback) => {
      syncCallbacks.push(callback);
    },
  };
}
