supporters_div = d3.selectAll("div.content")
    .filter(function() {
	return d3.select(this)
	    .selectAll("div")
	    .filter(function() {
		return this.innerText == "Supporters\n(Become One)";
	    }).node() !== null;
    }).node();

year = 2012;
currentClass = "none";

var entries = [];

function matchesSel(v, sel) {
    return d3.selectAll([v]).filter(sel).node() !== null;
}

d3.selectAll(supporters_div.childNodes).each(function() {
    if (matchesSel(this, "div.supporter-level")) {
        console.log("Switching to ", this.innerText);
        currentClass = this.innerText;
        return;
    }
    if (matchesSel(this, "center")) {
        var a = d3.select(this).selectAll("a");
        var href = a.node().href;
        var src = a.selectAll("img").node().src;
        entries.push({
            year: year,
            class: currentClass,
            src: src,
            href: href
        });
    }
});
			       
