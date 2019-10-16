// please do not judge us.
function strikeDates()
{
    var tbl = d3.selectAll("table");
    if (tbl.nodes().length > 1) {
        throw new Error("Expected only one table...");
    }
    var rows = tbl.selectAll("tr");
    var dateRe = /([^ ]+) ([0123456789]+), ([0123456789]+)/;
    var months = { "Jan": "1",
                   "Feb": "2",
                   "Mar": "3",
                   "Apr": "4",
                   "May": "5",
                   "June": "6", // FIXME: inconsistent on important-dates.md
                   "July": "7", // FIXME: inconsistent on important-dates.md
                   "Aug": "8",
                   "Sep": "9",
                   "Oct": "10",
                   "Nov": "11",
                   "Dec": "12" };
    rows.filter(function(d) {
        var date = d3.select(this).selectAll("td").nodes()[1].innerText.trim();
        var match = date.match(dateRe);
        var day = match[2];
        var month = months[match[1]];
        var year = match[3];
        var deadlineDate = new Date(year + "/" + month + "/" + day) ;
        var today = new Date();
        
        // adds one day (?!)
        // https://stackoverflow.com/questions/3818193/how-to-add-number-of-days-to-todays-date
        deadlineDate.setDate(deadlineDate.getDate() + 1); 

        return today > deadlineDate;
    })
        .selectAll("td")
        .each(function(d) {
            this.innerHTML = "<strike>" + this.innerHTML + "</strike>";
        });
}

strikeDates();
