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
