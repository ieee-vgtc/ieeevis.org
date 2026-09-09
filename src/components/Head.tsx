type HeadProps = {
  description?: string;
  title: string;
  url: URL;
  /**
   * Social-card image for og:image / twitter:image. May be an absolute
   * https URL (e.g. a per-paper teaser) or a site-relative path; either way
   * it is resolved to an absolute URL below. Defaults to the branded raster
   * VIS 2026 card. Should be a raster (PNG/JPG) — social scrapers, Bluesky
   * included, do not reliably render SVG.
   */
  image?: string;
  imageAlt?: string;
  /** og:type — "website" for most pages, "article" for paper pages. */
  type?: string;
};

/** Default branded 1200x630 raster social card used when a page sets none. */
const DEFAULT_OG_IMAGE = "/assets/vis2026_social_card.png";

export default function Head({
  description = "Welcome to IEEE VIS 2026, the premier forum for advances in visualization and visual analytics.",
  title,
  url,
  image = DEFAULT_OG_IMAGE,
  imageAlt = "IEEE VIS 2026 — the premier forum for visualization and visual analytics.",
  type = "website",
}: HeadProps) {
  let fullTitle: string;
  if (title) {
    fullTitle = title + " | IEEE VIS 2026";
  } else {
    fullTitle = "Welcome to IEEE VIS 2026";
  }

  // Resolve the social image to an absolute URL. Absolute https URLs (e.g. a
  // per-paper image) pass through untouched; site-relative paths are joined to
  // the origin + base path without introducing a double slash.
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + "/";
  const imageUrl = /^https?:\/\//.test(image)
    ? image
    : `${url.origin}${base}${image.replace(/^\//, "")}`;

  return (
    <>
      <meta charSet="utf-8" />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{fullTitle}</title>
      <meta name="description" content={description}></meta>
      <link rel="canonical" href={url.toString()}></link>
      <meta name="robots" content="index, follow"></meta>
      <meta httpEquiv="Content-Language" content="en"></meta>

      {/* Open Graph (Facebook, LinkedIn, etc.)  */}
      <meta property="og:type" content={type}></meta>
      <meta property="og:title" content={fullTitle}></meta>
      <meta property="og:description" content={description}></meta>
      <meta property="og:url" content={url.toString()}></meta>
      <meta property="og:image" content={imageUrl}></meta>
      <meta property="og:image:width" content="1200"></meta>
      <meta property="og:image:height" content="630"></meta>
      <meta property="og:image:alt" content={imageAlt}></meta>
      <meta property="og:site_name" content="IEEE VIS 2026"></meta>

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image"></meta>
      <meta name="twitter:title" content={fullTitle}></meta>
      <meta name="twitter:description" content={description}></meta>
      <meta name="twitter:image" content={imageUrl}></meta>
      <meta name="twitter:image:alt" content={imageAlt}></meta>

      {/* <!-- favicon --> */}
      <link
        rel="icon"
        type="image/svg+xml"
        href={`${import.meta.env.BASE_URL}/assets/vis2026_icon.svg`}
      />

      <link
        rel="sitemap"
        href={`${import.meta.env.BASE_URL}/sitemap-index.xml`}
      />
    </>
  );
}
