type HeadProps = {
  description?: string;
  title: string;
  url: URL;
};

export default function Head({
  description = "Welcome to IEEE VIS 2026, the premier forum for advances in visualization and visual analytics.",
  title,
  url,
}: HeadProps) {
  let fullTitle: string;
  if (title) {
    fullTitle = title + " | IEEE VIS 2026";
  } else {
    fullTitle = "Welcome to IEEE VIS 2026";
  }

  return (
    <head>
      <meta charSet="utf-8" />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{fullTitle}</title>
      <meta name="description" content={description}></meta>
      <link rel="canonical" href={url.toString()}></link>
      <meta name="robots" content="index, follow"></meta>
      <meta httpEquiv="Content-Language" content="en"></meta>

      {/* Open Graph (Facebook, LinkedIn, etc.)  */}
      <meta property="og:type" content="website"></meta>
      <meta property="og:title" content={fullTitle}></meta>
      <meta property="og:description" content={description}></meta>
      <meta property="og:url" content={url.toString()}></meta>
      <meta
        property="og:image"
        content={`${url.origin}${import.meta.env.BASE_URL}/assets/vis2026_logo.svg`}
      ></meta>
      <meta property="og:site_name" content="IEEE VIS 2026"></meta>

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image"></meta>
      <meta name="twitter:title" content={fullTitle}></meta>
      <meta name="twitter:description" content={description}></meta>
      <meta
        name="twitter:image"
        content={`${url.origin}${import.meta.env.BASE_URL}/assets/vis2026_logo.svg`}
      ></meta>

      {/* <!-- favicon --> */}
      <link
        rel="icon"
        type="image/svg+xml"
        href={`${import.meta.env.BASE_URL}/assets/vis2026_icon.svg`}
      />

      {/* <!-- Include Material Icons --> */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />

      {/* <!-- Include fonts --> */}
      <link
        href="https://fonts.googleapis.com/css?family=Fira+Sans:400,700|Zilla+Slab:400,500,700&display=swap"
        rel="stylesheet"
      />

      <link
        rel="sitemap"
        href={`${import.meta.env.BASE_URL}/sitemap-index.xml`}
      />
    </head>
  );
}
