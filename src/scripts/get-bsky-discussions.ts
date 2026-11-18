/**
 * Writes src/data/bsky_discussions.json: the `at://` URI of each Bluesky
 * discussion post, keyed by the paper or session page it belongs to.
 *
 * The announce bot posted one thread per paper, panel, invited talk and
 * session-level event from the papers account, and each post links to its page
 * on this site. That link is how a post is matched to its page, so this reads
 * only public Bluesky data and needs no key. Posts that link elsewhere, such as
 * the test posts, are skipped.
 *
 * The conference is over and the set of posts no longer changes, so the output
 * is committed and the pages read the threads straight from Bluesky.
 *
 * Usage: npm run get-bsky-discussions
 */
import { writeFileSync } from "fs";

const ANNOUNCE_DID = "did:plc:zbr4ntavbfy6nzkupgdgn4sz"; // @papers.ieeevis.org
const PAGE_LINK =
  /^https:\/\/ieeevis\.org\/year\/2026\/program\/(content|session)\/([^/#?]+)\/?$/;
const OUT_FILE = "src/data/bsky_discussions.json";

interface PostRecord {
  uri: string;
  value: {
    reply?: unknown;
    facets?: { features?: { $type: string; uri?: string }[] }[];
  };
}

interface Discussions {
  content: Record<string, string>;
  session: Record<string, string>;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}.`);
  }
  return (await response.json()) as T;
}

async function resolvePds(did: string): Promise<string> {
  const doc = await getJson<{
    service?: { id: string; serviceEndpoint: string }[];
  }>(`https://plc.directory/${did}`);
  const pds = doc.service?.find((service) => service.id === "#atproto_pds");
  if (!pds) {
    throw new Error(`${did} has no PDS in its DID document.`);
  }
  return pds.serviceEndpoint;
}

async function listPosts(pds: string, did: string): Promise<PostRecord[]> {
  const posts: PostRecord[] = [];
  let cursor: string | undefined;
  do {
    const params = new URLSearchParams({
      repo: did,
      collection: "app.bsky.feed.post",
      limit: "100",
    });
    if (cursor) params.set("cursor", cursor);
    const page = await getJson<{ records: PostRecord[]; cursor?: string }>(
      `${pds}/xrpc/com.atproto.repo.listRecords?${params}`,
    );
    posts.push(...page.records);
    cursor = page.records.length > 0 ? page.cursor : undefined;
  } while (cursor);
  return posts;
}

function pageOf(post: PostRecord) {
  const links = (post.value.facets ?? [])
    .flatMap((facet) => facet.features ?? [])
    .flatMap((feature) => (feature.uri ? [feature.uri] : []));
  for (const link of links) {
    const match = PAGE_LINK.exec(link);
    if (match) {
      return { kind: match[1] as keyof Discussions, id: match[2] };
    }
  }
  return null;
}

const posts = await listPosts(await resolvePds(ANNOUNCE_DID), ANNOUNCE_DID);
const discussions: Discussions = { content: {}, session: {} };

for (const post of posts) {
  if (post.value.reply) continue;
  const page = pageOf(post);
  if (!page) continue;
  if (discussions[page.kind][page.id]) {
    throw new Error(`Two posts link to ${page.kind}/${page.id}.`);
  }
  discussions[page.kind][page.id] = post.uri;
}

const sorted = (entries: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)),
  );

writeFileSync(
  OUT_FILE,
  `${JSON.stringify(
    {
      content: sorted(discussions.content),
      session: sorted(discussions.session),
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Wrote ${Object.keys(discussions.content).length} paper and ${
    Object.keys(discussions.session).length
  } session discussions to ${OUT_FILE}.`,
);
