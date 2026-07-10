// @ts-check
import { defineConfig } from "astro/config";

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
  integrations: [
    react(),
    sitemap(),
    brokenLinksChecker({
      logFilePath: "broken-links.log",
      checkExternalLinks: false,
      throwError: true,
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
