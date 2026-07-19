// scripts/check-frontmatter.ts
import fg from "fast-glob";
// import yaml from "yaml";
import matter from "gray-matter";
import { readFile } from "node:fs/promises";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  layout: z.string().min(1),
  contact: z.email().optional(),
  active_nav: z.enum([
    "Blog",
    "Contribute",
    "Attend",
    "Program",
    "Events & Community",
    "Organization & History",
    "None",
  ]),
});

const files = await fg(["src/pages/**/*.{md,mdx}"], {
  ignore: ["node_modules/**", "dist/**"],
});

let failed = false;

for (const file of files) {
  const raw = await readFile(file, "utf8");
  const { data } = matter(raw);

  const result = schema.safeParse(data);

  if (!result.success) {
    failed = true;
    console.error(`\n${file}`);
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Checked ${files.length} Markdown/MDX files.`);
