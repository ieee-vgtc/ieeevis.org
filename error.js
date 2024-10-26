function send_to_create_gh_flow() {
  var base = "https://github.com/ieee-vgtc/ieeevis.org/new/vis2025";
  var p = base + window.location.pathname;
  var i = p.lastIndexOf("/");
  var filename = p.substr(i + 1) + ".md";
  var pWithoutFileName = p.substring(0, i);

  var yaml_front_matter;
  yaml_front_matter = ["---",
    "title: " + p.substr(i + 1),
    "layout: page",
    "permalink: " + window.location.pathname,
    "---\n\n"];
  yaml_front_matter = yaml_front_matter.join("\n");
  window.location = pWithoutFileName + "?filename=" + filename + "&value=" + encodeURIComponent(yaml_front_matter);
}

// ALPER try for vis2025
function send_to_create_gh_flow_new() {
  var base = "https://github.com/ieee-vgtc/ieeevis.org/new/vis2025";

  var permalink = window.location.pathname;
  // try to strip out year/2025/ and replace with content/ if possible to get the actual permaline
  var year2025 = /year\/2025/g;
  permalink = permalink.replace(year2025, "content");

  var p = base + permalink;
  var i = p.lastIndexOf('/');
  var pWithoutFilename = p.substring(0, i);

  // filename should contain last directory (see <https://github.com/isaacs/github/issues/1527> for discussion)
  var dirAndFile = permalink.match(/.*\/(.+\/.+)/);
  var filename = dirAndFile.length === 2 ? dirAndFile[1] + ".md" : p.substr(i + 1) + ".md";

  var yaml_front_matter;
  yaml_front_matter = ["---",
    "title: " + p.substr(i + 1),
    "layout: page",
    "permalink: " + permalink.replace("content/", ""),
    "contact: [committee-name]@ieeevis.org",
    "---\n\n"];
  yaml_front_matter = yaml_front_matter.join("\n");
  window.location = pWithoutFilename + "?filename=" + filename + "&value=" + encodeURIComponent(yaml_front_matter);
}
