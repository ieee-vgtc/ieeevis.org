//Astro recommend we generate robots.txt this way
//https://github.com/withastro/astro/issues/5219#issuecomment-1294222194
//https://docs.astro.build/en/guides/endpoints/#static-file-endpoints

import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  return new Response(ROBOTS);
};

const ROBOTS = `User-agent: *
Allow: /

Sitemap: ${import.meta.env.SITE}${import.meta.env.BASE_URL}/sitemap-index.xml
`