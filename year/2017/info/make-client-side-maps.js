// client-side maps TO BE FILLED.

var maps = {
    "at-a-glance-sat.png": [],
    "at-a-glance-sun-1.png": [],
    "at-a-glance-sun-2.png": [],
    "at-a-glance-mon-1.png": [],
    "at-a-glance-mon-2.png": [],
    "at-a-glance-tue.png": [],
    "at-a-glance-wed.png": [],
    "at-a-glance-thu.png": [],
    "at-a-glance-fri.png": []
};

d3.selectAll("span > img")
    .each(function() {
        var span = d3.select(this.parentNode);
        var path = this.src.split("/");
        var imgName = path[path.length-1];
        var map = span.append("map").attr("id", "map-" + imgName);
        var mapList = maps[imgName];
        debugger;
        this.setAttribute("usemap", "#map-" + imgName);
        map.selectAll("area")
            .data(mapList)
            .enter()
            .append("area")
            .attr("shape", function(d) { return d.shape; })
            .attr("coords", function(d) { return d.coords; })
            .attr("href", function(d) { return d.href; });
    });
