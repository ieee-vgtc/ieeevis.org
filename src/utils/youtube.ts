const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * A YouTube video id from a bare id or a watch / youtu.be / live / embed URL,
 * or null when the input is not a YouTube video. Mirrors extractVideoId in
 * conferentech (supabase/functions/_shared/youtube_videos.ts), which writes
 * these links.
 */
export function youtubeVideoId(
  idOrUrl: string | null | undefined,
): string | null {
  const value = idOrUrl?.trim();
  if (!value) return null;
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let candidate: string | null = null;
  if (host === "youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    candidate =
      url.searchParams.get("v") ??
      /^\/(?:live|embed|shorts|v)\/([^/]+)/.exec(url.pathname)?.[1] ??
      null;
  }
  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

/**
 * Embed URL for a session's recording, cued to `startSeconds` (a talk's
 * offset into its session's video) when given.
 */
export function youtubeEmbedUrl(
  idOrUrl: string | null | undefined,
  startSeconds?: number | null,
): string | null {
  const id = youtubeVideoId(idOrUrl);
  if (!id) return null;
  const url = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  if (startSeconds && startSeconds > 0) {
    url.searchParams.set("start", String(Math.floor(startSeconds)));
  }
  return url.toString();
}
