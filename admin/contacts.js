d3.json("../data/contacts.json", function(error, json) {
    if (error) {
        throw new Error("Failed to load /data/contacts.json");
    }
    var trs = d3.select("#contacts_table").selectAll("tr")
            .data(json)
            .enter()
            .append("tr");
    trs.append("td").append("a")
        .attr("href", function(d) {
            if (d.url) {
                if (d.url[0] === '/')
                    return d.url;
                else
                    return '/' + d.url;
            } else {
                return "#";
            }
        }).text(function(d) {
            if (!d.url) {
                return "No URL!";
            } else {
                var v = d.url.split("/");
                return '...' + v[v.length-1];
            }
        });
    trs.append("td").text(function(d) { return d.admin || "no admin assigned"; });
});
