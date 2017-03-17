function send_to_create_gh_flow()
{
    var base = "https://github.com/ieee-vgtc/ieeevis.org/new/master";
    var p = base + window.location.pathname;
    var i = p.lastIndexOf("/");
    var filename = p.substr(i+1) + ".md";
    var pWithoutFileName = p.substring(0, i);

    var yaml_front_matter;
    yaml_front_matter = ["---",
                         "layout: main-2017",
                         "permalink: " + p,
                         "---\n\n"];
    yaml_front_matter = yaml_front_matter.join("\n");
    window.location = pWithoutFileName + "?filename=" + filename + "&value=" + encodeURIComponent(yaml_front_matter);
}
