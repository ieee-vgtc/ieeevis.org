/**
 * Mints a short-lived HS256 token that lets a signed-in attendee comment and
 * like on the VIS Bluesky bridge (https://bsky.tech.ieeevis.org) without
 * having a Bluesky account. The bridge verifies it with the same shared
 * secret; there is no JWKS fetch and no Auth0 SDK on the bridge side.
 *
 * The token carries `sub`, `name`, and — only when the attendee has linked a
 * Bluesky account — an optional `bluesky` claim with their handle. It is an
 * attendee assertion, not an Auth0 access token, and must never be minted for
 * an anonymous visitor.
 *
 * NEW ENVIRONMENT VARIABLE
 *   AUTH_EMBED_TOKEN_SECRET — random string, at least 32 characters.
 *   Set it in the local `.env` and in the Netlify site environment. The
 *   identical value is stored on the bridge as the `bsky_keys` table row
 *   `BSKY_EMBED_TOKEN_SECRET`. Rotating one side breaks guest comments until
 *   the other side is updated.
 */

import type { APIRoute } from "astro";
import { SignJWT } from "jose";
import { readSession } from "../../lib/auth0";

export const prerender = false;

/** Minutes of validity. Short: the embed re-mints from the session as needed. */
const TOKEN_MAX_AGE_SECONDS = 60 * 10;

function getTokenSecret() {
  // Astro loads values from .env into import.meta.env for local development.
  // Netlify exposes runtime values through process.env in the server function.
  const value = (
    import.meta.env.AUTH_EMBED_TOKEN_SECRET ??
    process.env.AUTH_EMBED_TOKEN_SECRET
  )?.trim();
  if (!value || value.startsWith("replace-with-")) {
    throw new Error(
      "Missing required environment variable: AUTH_EMBED_TOKEN_SECRET",
    );
  }
  if (value.length < 32) {
    throw new Error(
      "AUTH_EMBED_TOKEN_SECRET must be at least 32 characters long.",
    );
  }
  return new TextEncoder().encode(value);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    headers: {
      // Never cached: it is per-user and expires in minutes.
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    },
    status,
  });
}

export const GET: APIRoute = async ({ cookies, url }) => {
  const user = await readSession(cookies, url);
  if (!user) {
    // Expected for a signed-out visitor. The embed reads this as "show the
    // discussion read-only" and does not surface an error.
    return json({ error: "not_authenticated" }, 401);
  }

  try {
    const expiresAt = new Date(Date.now() + TOKEN_MAX_AGE_SECONDS * 1000);
    // Include the linked Bluesky handle only when present; the bridge reads it
    // from a top-level `bluesky` claim.
    const claims: { name?: string; bluesky?: string } = { name: user.name };
    if (user.bskyHandle) {
      claims.bluesky = user.bskyHandle;
    }
    const token = await new SignJWT(claims)
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.sub)
      .setIssuedAt()
      .setExpirationTime(`${TOKEN_MAX_AGE_SECONDS}s`)
      .sign(getTokenSecret());

    return json({ expiresAt: expiresAt.toISOString(), token }, 200);
  } catch (error) {
    console.error("Unable to mint a discussion token:", error);
    return json({ error: "token_unavailable" }, 500);
  }
};
