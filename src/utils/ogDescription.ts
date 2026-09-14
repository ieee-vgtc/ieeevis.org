/**
 * Build a clean, social-card-friendly description snippet from arbitrary text
 * (typically a paper abstract). Strips HTML tags, collapses whitespace, and
 * truncates on a word boundary with an ellipsis so Open Graph / Twitter cards
 * show a tidy summary rather than a wall of text or a mid-word cut.
 *
 * @param text   the source text (may contain HTML and newlines)
 * @param maxLen target maximum length in characters (default 200)
 */
export function ogDescription(
  text: string | null | undefined,
  maxLen = 200,
): string {
  if (!text) {
    return "";
  }

  // Strip HTML tags, decode a few common entities, and collapse whitespace.
  const cleaned = text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLen) {
    return cleaned;
  }

  // Truncate to maxLen, then back off to the last word boundary so we don't
  // cut a word in half. Trim trailing punctuation before adding the ellipsis.
  const slice = cleaned.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  const truncated = (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(
    /[\s.,;:!?-]+$/,
    "",
  );

  return `${truncated}…`;
}
