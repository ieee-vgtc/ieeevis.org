import assert from "node:assert/strict";
import type { OAuthSession } from "@atproto/oauth-client-browser";
import type { APIContext } from "astro";
import { createWriterForSession } from "../components/bluesky/native";
import { GET, prerender } from "../pages/oauth/client-metadata.json";
import { siteBase } from "../utils/withBaseURL";

const did = "did:plc:abcdefghijklmnopqrstuvwx";
const uri = `at://${did}/app.bsky.feed.post/test`;
const likeUri = `at://${did}/app.bsky.feed.like/test`;
const cid = "bafyreie5cvha7yu7xqd6j7c3rjo5zklpkd7ts7lvfvscgm22ivxj7w7hju";
const requests: { path: string; proxy: string | null }[] = [];
const session = {
  did,
  async fetchHandler(path: string, init?: RequestInit) {
    const proxy = new Headers(init?.headers).get("atproto-proxy");
    requests.push({ path, proxy });
    const endpoint = new URL(path, "https://pds.example.com").pathname;
    const appViewRead = endpoint.startsWith("/xrpc/app.bsky.");
    assert.equal(
      proxy,
      appViewRead ? "did:web:api.bsky.app#bsky_appview" : null,
    );
    let data: unknown;
    if (endpoint.endsWith("getProfile")) {
      data = { did, handle: "reader.example.com" };
    } else if (endpoint.endsWith("getPosts")) {
      data = {
        posts: [
          {
            uri,
            cid,
            author: { did, handle: "reader.example.com" },
            record: {},
            indexedAt: new Date().toISOString(),
            viewer: { like: likeUri },
          },
        ],
      };
    } else if (endpoint.endsWith("createRecord")) {
      data = { uri, cid };
    } else if (endpoint.endsWith("deleteRecord")) {
      data = {};
    } else {
      throw new Error(`Unexpected request: ${path}`);
    }
    return Response.json(data);
  },
} as unknown as OAuthSession;

const writer = await createWriterForSession(session);
assert.equal(writer.profile.handle, "reader.example.com");
assert.deepEqual(await writer.syncLikes([uri]), new Set([uri]));
await writer.setLike({ uri, cid }, false);
await writer.setLike({ uri, cid }, true);
await writer.reply({ uri, cid }, { uri, cid }, "A reply from another PDS");
await writer.remove(uri);
assert.equal(requests.length, 6);

assert.equal(prerender, true);
const savedPreview = process.env.DEPLOY_PRIME_URL;
try {
  for (const preview of [
    undefined,
    "https://deploy-preview-2778.netlify.app",
  ]) {
    if (preview) process.env.DEPLOY_PRIME_URL = preview;
    else delete process.env.DEPLOY_PRIME_URL;
    const response = await GET({
      site: new URL("https://staging.ieeevis.org"),
      url: new URL(
        "https://build.example.com/year/2026/oauth/client-metadata.json",
      ),
    } as APIContext);
    const metadata = await response.json();
    const origin = preview || "https://staging.ieeevis.org";
    assert.equal(
      metadata.client_id,
      `${origin}${siteBase()}/oauth/client-metadata.json`,
    );
    assert.deepEqual(metadata.redirect_uris, [
      `${origin}${siteBase()}/oauth/bluesky/`,
    ]);
  }
} finally {
  if (savedPreview === undefined) delete process.env.DEPLOY_PRIME_URL;
  else process.env.DEPLOY_PRIME_URL = savedPreview;
}
console.log("Bluesky routing and deployment metadata checks passed.");
