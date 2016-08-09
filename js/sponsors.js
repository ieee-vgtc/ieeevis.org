function guessYear()
{
    // Tries to guess current year based on the HREF
    try {
        var year = window.location.pathname.split("/")[2];
        return Number(year) || 2016;
    } catch (e) {
        console.error("Could not guess year! Defaulting to 2016", window.location);
        return 2016;
    }
}

function loadSponsors() {
    d3.json("/js/all_sponsors.json", function(json) {
        var year = guessYear();
        var div = d3.select("#supporters");
        var currentClass;
        for (var i=0; i<json.length; ++i) {
            var o = json[i];
            if (o.year !== year)
                continue;
            if (o.class !== currentClass) {
                currentClass = o.class;
                div.append("br");
                div.append("div").classed("supporter-level", true).text(o.class);
            }
            div.append("center")
                .append("a").attr("href", o.href)
                .append("img").attr("src", o.src).attr("width", "120");
        }
    });
}
