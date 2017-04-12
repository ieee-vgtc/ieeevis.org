var repoPath = "https://github.com/ieee-vgtc/ieeevis.org/";

function getThisPath()
{
    var path = window.location.pathname;
    if (path === "/")
        path = "/index";
    return path;
}

function createPullRequestURL()
{
    return repoPath + "edit/master" + getThisPath() + ".md";
}

function createFileBugURL()
{
    var title = "Fix content problem on " + getThisPath() + ".md";
    return repoPath + "issues/new/?title=" + encodeURIComponent(title);
}

function runMainScript()
{
    d3.select("#file-bug-anchor").attr("href", createFileBugURL());
    d3.select("#pull-request-anchor").attr("href", createPullRequestURL());
    d3.select("#debug-button").on("click", runDebuggingDiagnostics);
}

function runDebuggingDiagnostics()
{
    d3.request("/feed.xml")
        .get(function(error, response) {
            var headers = {};
            response.getAllResponseHeaders().split("\n").map(function(d) {
                return d.split(": ");
            }).forEach(function(d) {
                response[d[0]] = d[1];
            });
            console.log("This was pushed from commit ", response["x-amz-meta-git_sha"]);
        });
}
