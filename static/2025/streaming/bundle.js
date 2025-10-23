(() => {
  // ieeevisdb.ts
  var IeeeVisDb = class {
    constructor() {
      this.initFirebase();
    }
    initFirebase() {
      firebase.initializeApp({
        apiKey: "AIzaSyCfFQ-eN52od55QBFZatFImgZgEDHK_P4E",
        authDomain: "ieeevis.firebaseapp.com",
        databaseURL: "https://ieeevis-default-rtdb.firebaseio.com",
        projectId: "ieeevis",
        storageBucket: "ieeevis.appspot.com",
        messagingSenderId: "542997735159",
        appId: "1:542997735159:web:6d9624111ec276a61fd5f2",
        measurementId: "G-SNC8VC6RFM"
      });
      firebase.analytics();
      this.logsRef = firebase.database().ref("logs/");
    }
    loadRoom(roomId2, onRoomUpdated) {
      this.roomRef = firebase.database().ref("rooms/" + roomId2);
      this.roomRef.on("value", (snapshot) => {
        onRoomUpdated(snapshot.val());
      });
    }
    loadSession(sessionId, onSessionUpdated) {
      this.sessionRef = firebase.database().ref("sessions/" + sessionId);
      this.sessionRef.on("value", (snapshot) => {
        onSessionUpdated(snapshot.val());
      });
    }
    loadAllSessions(callback) {
      const ref = firebase.database().ref("sessions/");
      ref.on("value", (snapshot) => callback(snapshot.val()));
    }
    loadAdmins(callback) {
      this.adminsRef = firebase.database().ref("admins");
      this.adminsRef.on("value", (snapshot) => {
        callback(snapshot.val());
      });
    }
    set(path, value) {
      this.sessionRef?.child(path).set(value);
    }
    setRoom(path, value) {
      this.roomRef?.child(path).set(value);
    }
    log(log) {
      const date = new Date(log.time);
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      const year = date.getUTCFullYear();
      const dayString = `${year}-${month}-${day}`;
      const hour = date.getUTCHours();
      const minute = date.getUTCMinutes();
      const second = date.getUTCSeconds();
      const milli = date.getUTCMilliseconds();
      const timeString = `${hour}:${minute}:${second}:${milli}`;
      this.logsRef?.child(dayString).child(log.room).child(timeString).set(log);
    }
    loadLogs(room, day, callback) {
      const logsRef = firebase.database().ref(`logs/${day}/${room}`);
      logsRef.on("value", (snapshot) => {
        callback(snapshot.val());
      });
    }
  };

  // youtubeplayer.ts
  var PlayerState;
  (function(PlayerState2) {
    PlayerState2[PlayerState2["UNSTARTED"] = -1] = "UNSTARTED";
    PlayerState2[PlayerState2["ENDED"] = 0] = "ENDED";
    PlayerState2[PlayerState2["PLAYING"] = 1] = "PLAYING";
    PlayerState2[PlayerState2["PAUSED"] = 2] = "PAUSED";
    PlayerState2[PlayerState2["BUFFERING"] = 3] = "BUFFERING";
    PlayerState2[PlayerState2["CUED"] = 5] = "CUED";
  })(PlayerState || (PlayerState = {}));

  // videoplayer.ts
  var IeeeVisVideoPlayer = class {
    constructor(elementId, getCurrentStage, getCurrentVideoId, getCurrentSessionStatus) {
      this.elementId = elementId;
      this.getCurrentStage = getCurrentStage;
      this.getCurrentVideoId = getCurrentVideoId;
      this.getCurrentSessionStatus = getCurrentSessionStatus;
      this.audioContext = new AudioContext();
      this.width = 400;
      this.height = 300;
      this.youtubeApiReady = false;
      this.youtubePlayerLoaded = false;
      this.youtubePlayerReady = false;
      this.lastVideoId = "";
      this.lastCatchupChecksLedToCatchup = [];
      this.init();
    }
    onYouTubeIframeAPIReady() {
      this.youtubeApiReady = true;
    }
    updateVideo() {
      if (!this.youtubeApiReady) {
        return;
      }
      const currentVideoId = this.getCurrentVideoId();
      if (!this.youtubePlayerLoaded) {
        this.loadYoutubePlayer();
      } else {
        if (!currentVideoId && this.player) {
          this.player.stopVideo();
        } else {
          if (currentVideoId && this.lastVideoId !== currentVideoId) {
            this.changeYoutubeVideo();
          }
        }
      }
      this.lastVideoId = currentVideoId;
    }
    setSize(width, height) {
      this.width = width;
      this.height = height;
      if (!this.player) {
        return;
      }
      this.player.setSize(width, height);
    }
    init() {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
    onPlayerReady() {
      console.log("player ready", this.player);
      this.youtubePlayerReady = true;
      if (this.audioContext.state === "suspended") {
        this.player.mute();
      }
      this.player.playVideo();
      this.updateVideo();
    }
    onPlayerStateChange(state) {
      if (!this.getCurrentVideoId()) {
        return;
      }
      if (state.data === PlayerState.UNSTARTED) {
        this.player.seekTo(this.getCurrentStartTimeS() || 0, true);
      }
      if (state.data === PlayerState.PLAYING || state.data === PlayerState.BUFFERING) {
        const startTime = this.getCurrentStartTimeS() || 0;
        const currentTime = this.player.getCurrentTime();
        const shouldCatchUp = Math.abs(startTime - currentTime) > 5;
        this.lastCatchupChecksLedToCatchup.push(shouldCatchUp);
        const consideredChecks = 4;
        this.lastCatchupChecksLedToCatchup = this.lastCatchupChecksLedToCatchup.slice(-1 * consideredChecks);
        const numChecks = this.lastCatchupChecksLedToCatchup.length;
        const enoughChecks = numChecks >= consideredChecks;
        const notAllLastChecksForcedCatchup = this.lastCatchupChecksLedToCatchup.indexOf(false) !== -1;
        if (shouldCatchUp && (notAllLastChecksForcedCatchup || !enoughChecks)) {
          this.player.seekTo(startTime, true);
          console.log("lagging behind. seek.", this.getCurrentStartTimeS(), this.player.getCurrentTime(), this.player.getDuration(), this.player);
        }
        if (shouldCatchUp && !notAllLastChecksForcedCatchup) {
          console.log("would normally catch up now, but skipping to prevent multi-seek.", this.lastCatchupChecksLedToCatchup, numChecks, enoughChecks);
        }
      }
    }
    loadYoutubePlayer() {
      this.youtubePlayerLoaded = true;
      this.player = new YT.Player(this.elementId, {
        width: this.width,
        height: this.height,
        videoId: this.getCurrentVideoId(),
        playerVars: {
          "playsinline": 1,
          "autoplay": 1,
          "controls": 1,
          "rel": 0,
          "modestbranding": 1,
          "mute": 0,
          start: this.getCurrentStartTimeS()
        },
        events: {
          "onReady": this.onPlayerReady.bind(this),
          "onStateChange": this.onPlayerStateChange.bind(this)
        }
      });
    }
    changeYoutubeVideo() {
      const currentVideoId = this.getCurrentVideoId();
      if (!currentVideoId) {
        return;
      }
      this.player.loadVideoById(currentVideoId, this.getCurrentStartTimeS());
      this.player.playVideo();
    }
    getCurrentStartTimeS() {
      if (!this.getCurrentStage().live || !this.youtubePlayerReady) {
        const timeMs = new Date().getTime();
        const videoStartTimestampMs = this.getCurrentSessionStatus()?.videoStartTimestamp || 0;
        return Math.round((timeMs - videoStartTimestampMs) / 1e3);
      } else if (this.getCurrentStage().live) {
        const videoStartTimestampMs = this.getCurrentSessionStatus()?.liveStreamStartTimestamp;
        if (!videoStartTimestampMs) {
          return 0;
        }
        const timeDiffMs = new Date().getTime() - videoStartTimestampMs;
        return Math.round(timeDiffMs / 1e3);
      }
    }
  };

  // main.ts
  var _IeeeVisStream = class {
    constructor(ROOM_ID) {
      this.ROOM_ID = ROOM_ID;
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.PANEL_WIDTH_PERCENT = 40;
      this.CHAT_PADDING_LEFT_PX = 20;
      this.HORIZONTAL_PADDING = 30;
      this.CAPTIONS_HEIGHT_PX = 150;
      this.currentPanelFocus = "none";
      this.db = new IeeeVisDb();
      this.player = new IeeeVisVideoPlayer(_IeeeVisStream.PLAYER_ELEMENT_ID, this.getCurrentStage.bind(this), this.getCurrentVideoId.bind(this), () => this.currentSession?.currentStatus);
      this.db.loadRoom(ROOM_ID, (room) => this.onRoomUpdated(room));
      this.loadPreviewImage();
      this.resize();
      window.addEventListener("resize", this.resize.bind(this));
      this.checkPanelFocus();
    }
    onYouTubeIframeAPIReady() {
      this.player.onYouTubeIframeAPIReady();
    }
    loadChat() {
      document.getElementById("discord-wrap").innerHTML = `
            <iframe
                id="discord-iframe"
                src="https://ieeevis-e.widgetbot.co/channels/884159773287805038/${this.room.discord}"
            ></iframe>`;
    }
    loadSlido() {
      const frame = document.getElementById("slido-frame");
      const url = `https://app.sli.do/event/${this.room.slido}?section=${this.room.slido_room}`;
      frame.setAttribute("src", url);
    }
    checkPanelFocus() {
      window.setInterval(() => {
        const lastFocus = this.currentPanelFocus;
        if (document.activeElement == document.getElementById("discord-iframe")) {
          this.currentPanelFocus = "chat";
        } else if (document.activeElement == document.getElementById("slido-frame")) {
          this.currentPanelFocus = "qa";
        } else {
          this.currentPanelFocus = "none";
        }
        if (lastFocus != this.currentPanelFocus) {
          this.resize();
        }
      }, 200);
    }
    updateGathertown() {
      const gatherWrap = document.getElementById(_IeeeVisStream.GATHERTOWN_WRAPPER_ID);
      gatherWrap.innerHTML = this.getCurrentStage()?.state !== "SOCIALIZING" ? "" : `<iframe title="gather town"
                              allow="camera;microphone"
                              id="gathertown-iframe"
                              src="https://gather.town/app/uT2p5cFP0oXFZg4E/ieee-vis-2021?spawnToken=nLvBRdVP_nCJOs3p"></iframe>`;
    }
    loadPreviewImage() {
      console.log("loading preview", this.getCurrentStage()?.imageUrl);
      const url = this.getCurrentStage()?.imageUrl;
      const html = !url ? "" : `<img src="${url}"  alt="Preview Image" id="preview-img" />`;
      const previewWrap = document.getElementById("image-outer");
      previewWrap.innerHTML = html;
    }
    onRoomUpdated(room) {
      this.room = room;
      this.loadChat();
      this.loadSlido();
      this.db.loadSession(room.currentSession, (session) => this.onSessionUpdated(room.currentSession, session));
    }
    onSessionUpdated(id, session) {
      if (this.room?.currentSession != id) {
        return;
      }
      const lastSession = this.currentSession ? {...this.currentSession} : void 0;
      const lastYtId = this.getCurrentVideoId();
      this.currentSession = session;
      document.getElementById("session-name").innerText = this.getCurrentStage()?.title || "";
      this.player.updateVideo();
      if (this.getCurrentStage()?.imageUrl != this.getCurrentStageOfSession(lastSession)?.imageUrl) {
        this.loadPreviewImage();
      }
      this.updateGathertown();
      this.updateCaptions();
      this.resize();
    }
    updateCaptions() {
      const captionsWrap = document.getElementById("captions-outer");
      if (this.getCurrentStage()?.has_live_captions) {
        captionsWrap.style.display = "";
        const url = this.getCurrentStage().live_captions_url;
        captionsWrap.innerHTML = `<iframe id="captions-iframe" src="${url}" height="${this.CAPTIONS_HEIGHT_PX}" width="100%"></iframe>`;
      } else {
        captionsWrap.style.display = "none";
      }
    }
    getCurrentStage() {
      return this.getCurrentStageOfSession(this.currentSession);
    }
    getCurrentStageOfSession(session) {
      if (!session || !session?.currentStatus) {
        return;
      }
      return session?.stages[session?.currentStatus?.videoIndex];
    }
    getCurrentVideoId() {
      return this.getCurrentStage()?.youtubeId;
    }
    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight - 15;
      const state = this.getCurrentStage()?.state;
      if (!state) {
        return;
      }
      if (state === "SOCIALIZING") {
        document.getElementById("youtube-outer").style.display = "none";
        document.getElementById("image-outer").style.display = "none";
        document.getElementById("gathertown-outer").style.display = "";
      } else if (state === "PREVIEW") {
        document.getElementById("youtube-outer").style.display = "none";
        document.getElementById("image-outer").style.display = "";
        document.getElementById("gathertown-outer").style.display = "none";
      } else {
        document.getElementById("youtube-outer").style.display = "";
        document.getElementById("image-outer").style.display = "none";
        document.getElementById("gathertown-outer").style.display = "none";
      }
      const contentWidth = this.width * (100 - this.PANEL_WIDTH_PERCENT) / 100 - this.HORIZONTAL_PADDING;
      const mainContentHeight = this.height - _IeeeVisStream.HEADERS_HEIGHT;
      let playerHeight = mainContentHeight;
      if (this.getCurrentStage()?.has_live_captions && this.getCurrentStage()?.live_captions_url) {
        playerHeight -= this.CAPTIONS_HEIGHT_PX;
      }
      const contentWrap = document.getElementById(_IeeeVisStream.CONTENT_WRAPPER_ID);
      contentWrap.style.width = `${contentWidth}px`;
      this.player.setSize(contentWidth, playerHeight);
      const previewImg = document.getElementById("preview-img");
      if (previewImg) {
        document.getElementById("image-outer").style.height = `${mainContentHeight}px`;
        previewImg.style.maxWidth = `${contentWidth}px`;
        previewImg.style.maxHeight = `${mainContentHeight}px`;
      }
      const gatherFrame = document.getElementById("gathertown-iframe");
      if (gatherFrame) {
        gatherFrame.setAttribute("width", `${contentWidth}`);
        gatherFrame.setAttribute("height", `${mainContentHeight}`);
      }
      const qaShown = ["WATCHING", "QA"].indexOf(state) !== -1;
      const numHeaders = qaShown ? 2 : 1;
      const panelWidth = this.width * this.PANEL_WIDTH_PERCENT / 100 - this.CHAT_PADDING_LEFT_PX;
      const panelContentHeight = this.height - _IeeeVisStream.HEADERS_HEIGHT * numHeaders;
      const qaWrap = document.getElementById("qa");
      qaWrap.style.display = qaShown ? "" : "none";
      let qaHeightPercent = 0;
      if (qaShown) {
        qaHeightPercent = 40;
        if (state === "QA") {
          qaHeightPercent = 60;
        }
        if (this.currentPanelFocus === "qa") {
          qaHeightPercent = 70;
        } else if (this.currentPanelFocus === "chat") {
          qaHeightPercent = 30;
        }
      }
      document.getElementById("sidepanel").style.width = `${panelWidth}px`;
      const slidoFrame = document.getElementById("slido-frame");
      const slidoTopOffset = 0;
      const slidoHeight = qaHeightPercent / 100 * panelContentHeight + slidoTopOffset;
      if (slidoFrame) {
        slidoFrame.setAttribute("width", `${panelWidth}`);
        slidoFrame.style.height = `${slidoHeight}px`;
        document.getElementById("slido-wrap").style.height = `${slidoHeight - slidoTopOffset}px`;
      }
      const discordFrame = document.getElementById("discord-iframe");
      if (discordFrame) {
        discordFrame.setAttribute("width", `${panelWidth}`);
        discordFrame.style.height = `${(100 - qaHeightPercent) / 100 * panelContentHeight}px`;
        document.getElementById("discord-wrap").style.height = `${(100 - qaHeightPercent) / 100 * panelContentHeight}px`;
      }
    }
  };
  var IeeeVisStream = _IeeeVisStream;
  IeeeVisStream.PLAYER_ELEMENT_ID = "ytplayer";
  IeeeVisStream.CONTENT_WRAPPER_ID = "content";
  IeeeVisStream.GATHERTOWN_WRAPPER_ID = "gathertown";
  IeeeVisStream.HEADERS_HEIGHT = 41;
  var roomId = location.search.indexOf("room=") === -1 ? "" : location.search.substr(location.search.indexOf("room=") + "room=".length);
  if (roomId) {
    const stream = new IeeeVisStream(roomId);
    document.getElementById("wrapper").style.display = "flex";
    onYouTubeIframeAPIReady = () => {
      stream.onYouTubeIframeAPIReady();
    };
  } else {
    document.getElementById("param-error").style.display = "block";
  }
})();
//# sourceMappingURL=bundle.js.map
