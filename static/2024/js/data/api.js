/* eslint-disable no-underscore-dangle */
class API {
  /**
   * get and cache config object
   * @return object
   */
  static getConfig() {
    if (API.configCache == null) {
      API.configCache = $.get("serve_config.json");
    }
    return API.configCache;
  }

  static getCalendar() {
    return $.get("serve_main_calendar.json");
  }

  static getPapers() {
    if (API.paperCache == null) {
      API.paperCache = $.get("papers.json");
    }
    return API.paperCache;
  }

  static getPosters() {
    if (API.posterCache == null) {
      API.posterCache = $.get("posters.json");
    }
    return API.posterCache;
  }

  static getPapersAndProjection() {
    return Promise.all([
      API.getPapers(),
      $.get("serve_papers_projection.json"),
    ]);
  }

  /**
   * lazy store creation/loading - not needed if own store backend
   * @see API.storeIDs
   * @return object
   */
  static getStore(storeID) {
    if (!(storeID in API._storeCaches)) {
      API._storeCaches[storeID] = new Persistor(
        `miniconf-${API.getConfig().name}-${storeID}`
      );
    }
    return API._storeCaches[storeID];
  }

  /**
   * get marks for all papers of a specific type
   * @see API.storeIDs
   * @param storeID
   * @return {Promise<object>}
   */
  static async markGetAll(storeID) {
    return API.getStore(storeID).getAll();
  }

  static async markSet(storeID, paperID, read = true) {
    return API.getStore(storeID).set(paperID, read);
  }

  static async markGet(storeID, paperID) {
    return API.getStore(storeID).get(paperID);
  }

  /*
   * Resource paths
   */

  /**
   * Link to thumbnails derived from paper object
   * @param paperOrPoster
   * @return {string}
   */
  static thumbnailPath(paperOrPoster, forceImage=true) {
    console.log("thumbnailPath is ", `https://ieeevis.b-cdn.net/vis_2024/paper_images_small/${paperOrPoster.id}.png`)
    if (!forceImage && !paperOrPoster.has_image)
      return "https://ieeevis.b-cdn.net/vis_2024/paper_images_small/blank.png";
    return `https://ieeevis.b-cdn.net/vis_2024/paper_images_small/${paperOrPoster.id}.png`;
  }

  /**
   * Link to paper detail derived from paper object
   * @param paper
   * @return {string}
   */
  static paperLink(paper) {
    return `paper_${paper.id}.html`;
  }

  /**
   * Link to poster detail derived from poster object
   * @param poster
   * @return {string}
   */
   static posterLink(poster) {
    return `poster_${poster.id}.html`;
  }

  /**
   * link to the poster ICAL file for poster and repetition i
   * @param paper
   * @param i
   * @return {string}
   */
  static posterICS(paper, i) {
    return `webcal://iclr.github.io/iclr-images/calendars/poster_${paper.UID}.${i}.ics`;
  }
}

API.configCache = null;
API.paperCache = null;
API.posterCache = null;
API._storeCaches = {};
API.storeIDs = {
  visited: "visited",
  bookmarked: "bookmark",
};
