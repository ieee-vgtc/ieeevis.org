/**
 * Client for the conference discussion service (https://bsky.tech.ieeevis.org),
 * which addresses threads by the paper's stable id — the page never handles
 * post URIs — and is the only source that can accept writes, since guest
 * comments and likes are bridged through it.
 *
 * A client owns the ordered list of origins it was built with and remembers
 * which one last answered, so build it once per list rather than per request.
 */

import { normalizeServiceThread } from "./normalize";
import type { ThreadResponse } from "./types";

/**
 * GET /api/threads/{paperId}/my-likes — the URIs of the posts in this thread
 * that the bearer's own reader has liked through the service. Empty without a
 * token. Likes are per-post, so this is a set of URIs rather than one flag.
 */
export interface MyLikesResponse {
  postUris: string[];
}

/**
 * GET /api/me — who the bearer token belongs to. `name` is the attendee's real
 * name from their conference login and is null when the service has none;
 * `pseudonym` is their stable stand-in and is always present. `bluesky` is the
 * reader's own Bluesky handle when they have linked an account, and null
 * otherwise — its presence invites them to reply natively on Bluesky and gates
 * nothing.
 */
export interface MeResponse {
  name: string | null;
  pseudonym: string;
  bluesky: string | null;
}

export interface ServiceClient {
  fetchThread(
    paperId: string,
    options?: { signal?: AbortSignal; fresh?: boolean },
  ): Promise<ThreadResponse>;
  fetchMyLikes(paperId: string, token: string): Promise<Response>;
  fetchMe(token: string, options?: { signal?: AbortSignal }): Promise<Response>;
  postComment(
    paperId: string,
    token: string,
    text: string,
    anonymous: boolean,
  ): Promise<Response>;
  setLike(
    paperId: string,
    token: string,
    postUri: string,
    liked: boolean,
  ): Promise<Response>;
}

export function createServiceClient(bases: string[]): ServiceClient {
  let baseIndex = 0;

  /**
   * One pass over the API bases in order. A base is only abandoned when the
   * request never completed (offline, DNS, blocked origin) — an HTTP error is
   * an answer, and trying the next base would not produce a better one.
   */
  async function request(path: string, init?: RequestInit): Promise<Response> {
    let lastError: unknown = new Error("No API base configured.");

    for (let attempt = 0; attempt < bases.length; attempt++) {
      const index = (baseIndex + attempt) % bases.length;
      try {
        const response = await fetch(`${bases[index]}${path}`, init);
        baseIndex = index; // stick with whatever answered
        return response;
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          throw err;
        }
        lastError = err;
      }
    }

    throw lastError;
  }

  function threadPath(paperId: string, suffix = ""): string {
    return `/api/threads/${encodeURIComponent(paperId)}${suffix}`;
  }

  return {
    async fetchThread(paperId, options = {}) {
      // `fresh` busts the shared nginx cache, for reading back one's own write.
      const query = options.fresh ? `?fresh=${Date.now()}` : "";
      const response = await request(threadPath(paperId) + query, {
        signal: options.signal,
        headers: { accept: "application/json" },
        // Never serve a poll/reload a stale browser-cached copy; the shared
        // nginx cache still absorbs the load.
        cache: "no-store",
      });

      if (response.status === 404) {
        return { state: "unavailable", paperId };
      }
      if (!response.ok) {
        throw new Error(`The discussion service returned ${response.status}.`);
      }

      return normalizeServiceThread(await response.json(), paperId);
    },

    fetchMyLikes(paperId, token) {
      return request(threadPath(paperId, "/my-likes"), {
        headers: {
          accept: "application/json",
          authorization: `Bearer ${token}`,
        },
      });
    },

    fetchMe(token, options = {}) {
      return request("/api/me", {
        signal: options.signal,
        headers: {
          accept: "application/json",
          authorization: `Bearer ${token}`,
        },
      });
    },

    postComment(paperId, token, text, anonymous) {
      return request(threadPath(paperId, "/comments"), {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ text, anonymous }),
      });
    },

    setLike(paperId, token, postUri, liked) {
      // Likes are per-post: the body names which post in the thread, and the
      // service validates that it is one a guest may like (the announcement or
      // another guest comment, never a native Bluesky reply).
      return request(threadPath(paperId, "/like"), {
        method: liked ? "POST" : "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ postUri }),
      });
    },
  };
}
