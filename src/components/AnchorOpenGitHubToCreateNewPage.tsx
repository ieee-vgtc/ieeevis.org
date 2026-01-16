export function AnchorOpenGitHubToCreateNewPage() {
  const url = getGitHubURLToCreateNewPage()
  return <a href={url} target="_blank">click on this link</a>
}

function getGitHubURLToCreateNewPage(): string {
  const BASE_URL = "https://github.com/ieee-vgtc/ieeevis.org/new/vis2026";
  const permalink = window.location.pathname.replace(/year\/2026/g, "src/pages");

  const fullPath = `${BASE_URL}${permalink}`;
  const split = fullPath.split("/")
  const pageName = split.pop() || ""
  const filename = pageName + ".md"
  const pathWithoutFilename = split.join("/")
  const yamlFrontMatter = createYAMLFrontMatter(pageName);
  
  return `${pathWithoutFilename}?filename=${filename}&value=${encodeURIComponent(yamlFrontMatter)}`;
}

function createYAMLFrontMatter(title: string): string {
  return [
    "---",
    `title: ${title}`,
    "layout: /src/layouts/PageLayout.astro",
    "contact: [committee-name]@ieeevis.org",
    "---",
    "",
    ""
  ].join("\n");
}