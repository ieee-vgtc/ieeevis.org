/**
 * We want to ensure that all links and hrefs in the site are properly prepended with the site's base url
 * But we also don't want to mess with absolute URLs
 * @param url the raw link (ex "/welcome")
 * @returns   the link with our base url, if necessary
 */
export function withBaseURL(url: string) {
  //if the link is an absolute URL or already starts with our base url
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith(import.meta.env.BASE_URL)
  ) {
    return url; //we don't need to modify the link
  }

  //prepend the link with our URL
  return import.meta.env.BASE_URL + (url.startsWith("/") ? "" : "/") + url;
}

/** The base path without its trailing slash, for building paths by hand. */
export function siteBase(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, "");
}

/**
 * Only permit paths within this deployment as post-login destinations. Used
 * by the Auth0 login (server) and the Bluesky login (browser) alike.
 */
export function safeReturnTo(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }
  return value;
}
