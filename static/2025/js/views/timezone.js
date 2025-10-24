const current_timezone = getTimezone();
$(".selectedTimezone").html(moment().tz(current_timezone).format("Z"));

function getTimezone() {
    const url_timezone = window.getUrlParameter && getUrlParameter('tz');
    if (url_timezone) return url_timezone;

    const storage_timezone = window.localStorage.getItem("tz")
    if (storage_timezone) return storage_timezone;

    return moment.tz.guess();
}

// compute relative time
$(document).ready(function () {
    $(".relative-time").each((_, e) => {
        const element = $(e);
        const timestamp = element.text();

        let timer = () => {
            if (timestamp.indexOf("–") === -1) {
                element.text(moment(timestamp).tz(current_timezone).fromNow());
                return;
            }

            let parts = timestamp.split(" – ");
            let start = moment.utc(parts[0]).tz(current_timezone);
            let end = moment.utc(parts[1]).tz(current_timezone);

            const isLive = moment().tz(current_timezone).isBetween(start, end);
            const timeString = moment.utc(start).tz(current_timezone).fromNow();
            console.log("start is ", start, " and timeString is ", timeString, " and current_timezone is ", current_timezone)
            if (isLive) {
                element.text(`Live! Started ${timeString}`);
                element.addClass("bg-success text-white p-1");
            }
            else {
                element.removeClass("bg-success text-white p-1");
                const isBefore = moment().tz(current_timezone).isBefore(moment(start).tz(current_timezone));
                if (isBefore)
                    element.text(`Starting ${timeString}`);
                else {
                    let finishedString = moment(end).tz(current_timezone).fromNow();
                    element.text(`Finished ${finishedString}`)
                }
            }

            setTimeout(() => {
                timer();
            }, 30 * 1000);
        };
        timer();

    });

    $(".current-time").each((_, e) => {
        const element = $(e);

        // update every 30s
        let timer = () => {
            const curTime = moment().tz(current_timezone).format("dddd, MMM Do @ HH:mm");
            element.text(`Your current time: ${curTime}`);
            setTimeout(() => {
                timer();
            }, 30 * 1000);
        };
        timer();
    });

    $("#zoom_link").each((_, e) => {
        const element = $(e);
        const timestamp = element.find(".zoom-time").text();

        let parts = timestamp.split(" – ");
        let start = moment(parts[0]).tz(current_timezone).subtract(15, "minutes");
        let end = moment(parts[1]).tz(current_timezone);

        let timer = () => {
            const isLive = moment().tz(current_timezone).isBetween(start, end);
            if (isLive)
                element.css('display', "block");
            else
                element.css('display', "none");
        };

        setTimeout(() => {
            timer();
        }, 30 * 1000);
        timer();
    });
});