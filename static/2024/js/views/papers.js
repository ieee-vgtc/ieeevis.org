let allPapers = [];
let isPosters = false;
const allKeys = {
  authors: [],
  keywords: [],
  sessions: [],
  titles: [],
};
const posterKeys = {
  authors: [],
  titles: [],
  sessions: [],
};
const filters = {
  authors: null,
  keywords: null,
  session: null,
  title: null,
};

// names for render modes
const MODE = {
  mini: "mini",
  compact: "compact",
  detail: "detail"
}

// import from base.html

function getTimezone() {
  const urlTz = window.getUrlParameter && getUrlParameter('tz');
  if (urlTz) return urlTz;

  const storageTz = window.localStorage.getItem("tz")
  if (storageTz) return storageTz;

  return moment.tz.guess();
}

const currentTZ = getTimezone();

function formatTime(text) {
  let atime = moment(text).clone().tz(currentTZ);
  if (atime.isValid()) {
    return atime.format("dd, MMM D, HH:mm");
  } else {
    return "Date/Time TBA"
  }
}


let render_mode = MODE.compact;
let currentTippy = null;

const updateCards = (papers) => {
  Promise.all([
    API.markGetAll(API.storeIDs.visited),
    API.markGetAll(API.storeIDs.bookmarked)
  ]).then(
    ([visitedPapers, bookmarks]) => {


      papers.forEach((paper) => {
        paper.UID = paper.UID;
        paper.read = visitedPapers[paper.UID] || false;
        paper.bookmarked = bookmarks[paper.UID] || false;
      });

      const visitedCard = (iid, new_value) => {
        API.markSet(API.storeIDs.visited, iid, new_value).then();
      };

      const bookmarkedCard = (iid, new_value) => {
        API.markSet(API.storeIDs.bookmarked, iid, new_value).then();
      };


      const all_mounted_cards = d3
        .select(".cards")
        .selectAll(".myCard", (paper) => paper.UID)
        .data(papers, (d) => d.number)
        .join("div")
        .attr("class", "myCard col-xs-6 col-md-4")
        .html(isPosters ? card_poster_html : card_html);

      all_mounted_cards.select(".card-title").on("click", function (ev, d) {
        const iid = d.UID;
        // to avoid hierarchy issues, search for card again
        all_mounted_cards
          .filter((dd) => dd.UID === iid)
          .select(".checkbox-paper")
          .classed("selected", function () {
            const new_value = true; //! d3.select(this).classed('not-selected');
            visitedCard(iid, new_value);
            return new_value;
          });
      });

      all_mounted_cards.select(".checkbox-paper").on("click", function (ev, d) {
        const new_value = !d3.select(this).classed("selected");
        d.read = new_value;
        visitedCard(d.UID, new_value);
        d3.select(this).classed("selected", new_value);
      });

      all_mounted_cards.select(".checkbox-bookmark").on("click", function (ev, d) {
        const new_value = !d3.select(this).classed("selected");
        d.bookmarked = new_value;
        bookmarkedCard(d.UID, new_value);
        d3.select(this).classed("selected", new_value);
      });


      lazyLoader();
      if (currentTippy) currentTippy.forEach(t => t.destroy());
      currentTippy = tippy(".has_tippy", {trigger: "mouseenter focus"}); //, {trigger: "mouseenter focus"}

    }
  )
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


const render = () => {
  const f_test = [];

  updateSession();

  Object.keys(filters).forEach((k) => {
    filters[k] ? f_test.push([k, filters[k]]) : null;
  });

  // console.log(f_test, filters, "--- f_test, filters");
  if (f_test.length === 0) updateCards(allPapers);
  else {
    const fList = allPapers.filter((d) => {
      let i = 0;
      let pass_test = true;
      while (i < f_test.length && pass_test) {
        const testName = f_test[i][0];
        const testValue = f_test[i][1];
        const testValueSmall = testValue.toLowerCase();
        if (testName === "titles") {
          pass_test &=
            d.title.toLowerCase().indexOf(testValueSmall) >
            -1;
        } else if (testName === "sessions" || testName === "keywords") {
          pass_test &= d[testName]
            .map(s => s.toLowerCase().indexOf(testValueSmall) > -1)
            .reduce((o, n) => o || n, false);
        } else if (testName === "authors") {
          pass_test &= d[testName].map(a => a["name"])
            .map(s => s.toLowerCase().indexOf(testValueSmall) > -1)
            .reduce((o, n) => o || n, false);
        } else {
          pass_test &= d[testName].toLowerCase().indexOf(testValueSmall) > -1;
        }
        i++;
      }
      return pass_test;
    });
    // console.log(fList, "--- fList");
    updateCards(fList);
  }

};

const updateFilterSelectionBtn = (value) => {
  d3.selectAll(".filter_option label").classed("active", function () {
    const v = d3.select(this).select("input").property("value");
    return v === value;
  });
};

const updateSession = () => {
  const urlSession = getUrlParameter("session");
  if (urlSession) {
    filters.session = urlSession;
    d3.select("#session_name").text(urlSession);
    d3.select(".session_notice").classed("d-none", null);
    return true;
  }
  filters.session = null;
  return false;
};

/**
 * START here and load JSON.
 * @param loadPosters - Set to true iff loading posters instead of papers
 */
const start = (loadPosters) => {
  isPosters = !!loadPosters;

  const urlFilter = getUrlParameter("filter") || "titles";
  setQueryStringParameter("filter", urlFilter);
  updateFilterSelectionBtn(urlFilter);

  Promise
    .all([
      !!loadPosters ? API.getPosters() : API.getPapers(),
      API.getConfig()
    ])
    .then(([papers, config]) => {
      console.log(papers, "--- papers");

      // persistor = new Persistor("miniconf-" + config.name);

      shuffleArray(papers);

      allPapers = papers;
      calcAllKeys(allPapers, isPosters ? posterKeys : allKeys);
      console.log(allKeys, "--- allKeys");
      setTypeAhead(urlFilter, isPosters ? posterKeys : allKeys, filters, render);
      updateCards(allPapers);
      papers = allPapers
      let urlSearch = getUrlParameter("search");

      // Total hack to deal with bad plus sign in url
      if (urlSearch.indexOf('MedVis') != -1) {
        urlSearch = 'Bio+Medvis Challenges';
      }
      if (urlSearch !== "" || updateSession()) {
        filters[urlFilter] = urlSearch;
        $(".typeahead_all").val(urlSearch);
        render();
      }
    })
    .catch((e) => console.error(e));
};

/**
 * VIEW EVENTS (card events are in updateCards() )
 * * */

d3.selectAll(".filter_option input").on("click", function () {
  const me = d3.select(this);

  const currentFilter = $('.typeahead_all').eq(1).val();
  const filter_mode = me.property("value");

  filters[filter_mode] = currentFilter;

  setQueryStringParameter("filter", filter_mode);
  setQueryStringParameter("search", currentFilter);
  updateFilterSelectionBtn(filter_mode);

  setTypeAhead(filter_mode, isPosters ? posterKeys : allKeys, filters, render);
  render();
});

d3.selectAll(".remove_session").on("click", () => {
  setQueryStringParameter("session", "");
  render();
});

d3.selectAll(".render_option input").on("click", function () {
  const me = d3.select(this);
  render_mode = me.property("value");

  render();
});


const sortFunctions = {
  "random": (a, b) => null,
  "bookmarked": (a, b) => {
    if (a.bookmarked) {
      if (b.bookmarked) // try to sort by time of presentation ascending
        return new Date(a.time_stamp) - new Date(b.time_stamp);
      return -1
    }
    else if (b.bookmarked) return 1;
    return 0;
  },
  "visited": (a, b) => -(a.read ? 1 : 0) + (b.read ? 1 : 0),
  "visited_not": (a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0),
  "todo": (a, b) => -((a.read ? 0 : 1) + (a.bookmarked ? 2 : 0)) + ((b.read ? 0 : 1) + (b.bookmarked ? 2 : 0))

}

let sortBy = "random";

d3.select(".reshuffle").on("click", () => {
  // shuffleArray(allPapers);
  if (sortBy === "random") {
    shuffleArray(allPapers);
  } else {
    allPapers.sort(sortFunctions[sortBy]);
  }

  render();
});

const sortBySelector = d3.select("#sortBy")
sortBySelector.on("change", (e) => {
  sortBy = sortBySelector.property("value");
  if (sortBy === "random") {
    d3.select(".reshuffle").text("shuffle")
    shuffleArray(allPapers);
  } else {
    d3.select(".reshuffle").text("sort")
    allPapers.sort(sortFunctions[sortBy]);
  }
  render();
})

/**
 * CARDS
 */

const keyword = (kw) => `<a href="papers.html?filter=keywords&search=${kw}"
                       class="text-secondary text-decoration-none">${kw.toLowerCase()}</a>`;

const card_image = (paper, show, forceImage=false) => {
  if (show && (paper.has_image || forceImage))
    return ` <center><img class="lazy-load-img cards_img" data-src="${API.thumbnailPath(paper, forceImage)}" width="80%"/></center>`;
  return "";
};

const card_detail = (paper, show) => {
  if (show)
    return `
     <div class="pp-card-header" style="overflow-y: auto;">
     <div style="width:100%; ">
        <p class="card-text"><span class="font-weight-bold">Keywords:</span>
            ${paper.keywords.map(keyword).join(", ")}
        </p>
        <p class="card-text"> ${paper.abstract}</p>
        </div>
    </div>
`;
  return "";
};

const author_detail = (paper, showDetail) => {
  // Not going to use showDetail for now, we don't have enough space on the card.
  return paper.authors.map(s => 
    `<a href="papers.html?filter=authors&search=${s.name}">${s.name}</a>`)
  .join(", ");
}

const affiliation_detail = (affiliation) => {
  return `<a href="papers.html?filter=affiliations&search=${affiliation}">${affiliation}</a>`
}

const card_time_small = (paper, show) => {
  const cnt = paper;
  return show
    ? `
<!--    <div class="pp-card-footer">-->
    <div class="text-center" style="margin-top: 10px;">
    ${cnt.sessions
      .filter((s) => s.match(/.*[0-9]/g))
      .map(
        (s, i) =>
          `<a class="card-subtitle text-muted" href="?session=${encodeURIComponent(
            s
          )}">${s.replace("Session ", "")}</a> ${card_live(
            cnt.session_links[i]
          )} ${card_cal(paper, i)} `
      )
      .join(", ")}
    </div>
<!--    </div>-->
    `
    : "";
};

const card_icon_video = icon_video(16);
const card_icon_cal = icon_cal(16);

const card_live = (link) =>
  `<a class="text-muted" href="${link}">${card_icon_video}</a>`;
const card_cal = (paper, i) =>
  `<a class="text-muted" href="${API.posterICS(paper,
    i)}">${card_icon_cal}</a>`;

const card_time_detail = (paper, show) => {
  return show ? `
<!--    <div class="pp-card-footer">-->
    <div class="text-center text-monospace small" style="margin-top: 10px;">
    ${paper.sessions.filter(s => s.match(/.*[0-9]/g))
    .map((s, i) => `${s} ${paper.session_times[i]} ${card_live(
      paper.session_links[i])}   `)
    .join('<br>')}
    </div>
<!--    </div>-->
    ` : '';
}

// language=HTML
const card_html = (paper) => 
  `
        <div class="pp-card paper-card-wrapper pp-mode-${render_mode} " data-paper-type="${paper.paper_type}" style="width: 100%">
            <div class="pp-card-header" style="">
              <div class="checkbox-bookmark fas  ${paper.bookmarked ? "selected" : ""}"
              style="display: block;position: absolute; top:-5px;right: 25px;">&#xf02e;</div>
              <h5 class="card-title">
                 ${paper.award != "" ? '<span class="fas paper-award" title="Awarded Paper">&#xf559;</span>' : ""}
                 <a href="${API.paperLink(paper)}" target="_blank" class="text-muted">
                  ${paper.title}
                  </a>
                 ${paper.accessible_pdf ? '<span class="fas paper-award" title="The authors made this paper screen-reader accessible in the IEEE Digital Library.">&#xf29a;</span>' : ""}
                 ${paper.preprint_link != "" ? '<span class="fas paper-award" title="This paper has a preprint available online.">&#xf09c;</span>' : ""}
                 ${paper.open_access_supplemental_link != "" ? '<span class="fas paper-award" title="This paper has additional material, like demos or experimental data, available online.">&#xf0c6;</span>' : ""}
              </h5>
              <span class="session-type" style="color: ${paper.paper_type_color }">
                ${paper.paper_type_name }
              </span>

              <h6 class="card-subtitle text-muted" style="text-align: left;">
               ${author_detail(paper, render_mode !== MODE.mini)}
              </h6>

              ${paperSessionDetail(paper)}


              <div>${card_image(paper, render_mode !== MODE.mini)}</div>
              <div class="card-footer">&nbsp</div>
            </div>


                ${card_detail(paper, render_mode === MODE.detail)}
        </div>`;

const paperSessionDetail = (paper) => {
  if (paper.sessions.length > 0)
    return `
<div class="card-subtitle text-muted mt-2" style="text-align: left;">
  <a class="has_tippy" href ="session_${paper.session_id}.html" target="_blank" data-tippy-content="go to session ${paper.session_title}">
    ${formatTime(paper.time_stamp)}
  </a> -- ${paperSessionsFilterBlurb(paper)}
</div>`;
  else {
    return ""
  }
}

const paperSessionsFilterBlurb = (paper) => {
  return paper.sessions.map(s => 
    `<a class="has_tippy" href="papers.html?filter=sessions&search=${s}" data-tippy-content="filter all papers in session:">${s}</a>`)
    .join(",");
}


const buildSessionFilter = (session_name) => {
  const url = window.location.origin + window.location.pathname;
  let sessionFilterUrl = new URL(url);

  sessionFilterUrl.searchParams.append("filter", "sessions");
  sessionFilterUrl.searchParams.append("search", session_name);

  return sessionFilterUrl;
}

// language=HTML
const card_poster_html = (poster) =>
  `
        <div class="pp-card pp-mode-${render_mode} " style="width: 100%">
            <div class="pp-card-header" style="">
              <div class="checkbox-bookmark fas  ${poster.bookmarked ? "selected" : ""}"
              style="display: block;position: absolute; top:-5px;right: 25px;">&#xf02e;</div>
              <h5 class="card-title">
                ${poster.award != "" ? '<span class="fas paper-award">&#xf559;</span>' : ""}
                <a href="${API.posterLink(poster)}" target="_blank" class="text-muted">
                  ${poster.title}
                </a>
              </h5>
              <h6 class="card-subtitle text-muted" style="text-align: left;">
                ${author_detail(poster, render_mode !== MODE.mini)}
              </h6>

              <div class="card-subtitle text-muted mt-2" style="text-align: left;">
                Session:
                ${poster.sessions.map(
    s => `<a class="has_tippy" href=${buildSessionFilter(s)} data-tippy-content="filter all posters in session:">${s}</a>`)
    .join(",")}
              </div>

              <div>${card_image(poster, render_mode !== MODE.mini, true)}</div>
              <div class="card-footer">&nbsp</div>
            </div>


                ${card_detail(poster, render_mode === MODE.detail)}
        </div>`;

// <div class="card-subtitle text-muted mt-2" style="text-align: left;">
//        Time: ${formatTime(paper.time_stamp)}
// </div>
