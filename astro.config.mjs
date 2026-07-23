// @ts-check
import { defineConfig } from "astro/config";

import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

//https://docs.astro.build/en/guides/integrations-guide/sitemap/
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
// @ts-ignore
import brokenLinksChecker from "astro-broken-links-checker";

// https://astro.build/config
export default defineConfig({
  base: process.env.BASE_PATH || "/year/2026", //this can be accessed in tsx and astro as import.meta.env.BASE_URL
  // Authentication callbacks and protected routes need a request-time runtime.
  // Public routes remain publicly accessible; the data-heavy detail routes
  // below continue to opt into prerendering individually.
  output: "server",
  adapter: netlify({
    // Program data is loaded from the filesystem when a protected page is
    // rendered in Netlify's serverless function.
    includeFiles: ["src/data/program_test/*.json"],
  }),
  integrations: [
    react(),
    sitemap(),
    brokenLinksChecker({
      logFilePath: "broken-links.log",
      checkExternalLinks: false,
      // This checker only validates files emitted at build time. Protected
      // routes are intentionally rendered on demand, so their valid links
      // cannot be checked this way. The checker still writes its report.
      throwError: false,
    }),
  ],
  site: process.env.SITE,
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noopener", "noreferrer"],
        },
      ],
    ],
  },
  vite: {
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
    plugins: [tailwindcss()],
  },
});
