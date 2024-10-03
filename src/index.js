import style from "./styles/index.css";

import Vue from 'vue'
import { createAuth0Client } from "@auth0/auth0-spa-js";

console.log("in index.js")
document.addEventListener('DOMContentLoaded', async () => {
  // main navigation bar
  new Vue({
    el: '#navigation',
    data: function () {
      return {
        bodyElement: null,
        isCollapsed: false,
        isCollapsedPrevious: false,
        isExpanded: false,
        hasMenuItemExpanded: false,
        isAriaHidden: true,
        isAriaExpanded: false,
        menu: {}
      };
    },
    mounted: function () {
      this.isCollapsed = window.innerWidth < 768;
      this.isCollapsedPrevious = window.innerWidth < 768;
      this.bodyElement = document.getElementsByTagName('BODY')[0];
      window.addEventListener('resize', this.debounce(this.handleResize, 25));
    },
    destroyed: function () {
      window.removeEventListener('resize', this.debounce(this.handleResize, 25));
    },
    methods: {
      debounce: function (fn, delay) {
        let timeoutID = null;
        return function () {
          clearTimeout(timeoutID);
          const args = arguments;
          const that = this;
          timeoutID = setTimeout(function () {
            fn.apply(that, args);
          }, delay);
        };
      },

      handleResize: function () {
        this.isCollapsed = window.innerWidth < 768;
        const hasMenuItemsOpen = this.hasMenuItemsOpen();

        // Check if the browser resize caused a change in layout for the menu
        if (this.isCollapsedPrevious !== this.isCollapsed) {
          this.isExpanded = hasMenuItemsOpen;

          if (this.isCollapsed && hasMenuItemsOpen) {
            this.bodyElement.classList.add('overflow-hidden');
          } else {
            this.bodyElement.classList.remove('overflow-hidden');
          }

          this.isCollapsedPrevious = window.innerWidth < 768;
          this.$forceUpdate();
        }
      },

      toggleMenu: function () {
        this.isExpanded = !this.isExpanded;
        this.togglePreventBodyScroll();
        this.resetMenuItems();
        this.$forceUpdate();
      },

      toggleMenuItems: function (menuId) {
        if (this.menu[menuId]) {
          this.menu[menuId] = false;
          this.isAriaHidden = true;
          this.isAriaExpanded = false;
          this.hasMenuItemExpanded = false;
        } else {
          this.resetMenuItems();
          this.menu[menuId] = true;
          this.isAriaHidden = false;
          this.isAriaExpanded = true;
          this.hasMenuItemExpanded = true;
        }
        this.$forceUpdate();
      },

      resetMenuItems: function () {
        for (let key in this.menu) {
          if (this.menu.hasOwnProperty(key)) {
            this.menu[key] = false;
          }
        }
        this.hasMenuItemExpanded = false;
      },

      hasMenuItemsOpen: function () {
        for (let key in this.menu) {
          if (this.menu.hasOwnProperty(key)) {
            if (this.menu[key]) {
              return true;
            }
          }
        }
        return false;
      },

      togglePreventBodyScroll: function () {
        const body = document.getElementsByTagName('BODY')[0];
        body.classList.toggle('overflow-hidden');
      }
    }
  });

  // program navigation bar
  new Vue({
    el: '#program-navigation',
    data: function () {
      return {
        bodyElement: null,
        isCollapsed: false,
        isCollapsedPrevious: false,
        isExpanded: false,
        hasMenuItemExpanded: false,
        isAriaHidden: true,
        isAriaExpanded: false,
        menu: {}
      };
    },
    mounted: function () {
      this.isCollapsed = window.innerWidth < 768;
      this.isCollapsedPrevious = window.innerWidth < 768;
      this.bodyElement = document.getElementsByTagName('BODY')[0];
      window.addEventListener('resize', this.debounce(this.handleResize, 25));
    },
    destroyed: function () {
      window.removeEventListener('resize', this.debounce(this.handleResize, 25));
    },
    methods: {
      debounce: function (fn, delay) {
        let timeoutID = null;
        return function () {
          clearTimeout(timeoutID);
          const args = arguments;
          const that = this;
          timeoutID = setTimeout(function () {
            fn.apply(that, args);
          }, delay);
        };
      },

      handleResize: function () {
        this.isCollapsed = window.innerWidth < 768;
        const hasMenuItemsOpen = this.hasMenuItemsOpen();

        // Check if the browser resize caused a change in layout for the menu
        if (this.isCollapsedPrevious !== this.isCollapsed) {
          this.isExpanded = hasMenuItemsOpen;

          if (this.isCollapsed && hasMenuItemsOpen) {
            this.bodyElement.classList.add('overflow-hidden');
          } else {
            this.bodyElement.classList.remove('overflow-hidden');
          }

          this.isCollapsedPrevious = window.innerWidth < 768;
          this.$forceUpdate();
        }
      },

      toggleMenu: function () {
        this.isExpanded = !this.isExpanded;
        this.togglePreventBodyScroll();
        this.resetMenuItems();
        this.$forceUpdate();
      },

      toggleMenuItems: function (menuId) {
        if (this.menu[menuId]) {
          this.menu[menuId] = false;
          this.isAriaHidden = true;
          this.isAriaExpanded = false;
          this.hasMenuItemExpanded = false;
        } else {
          this.resetMenuItems();
          this.menu[menuId] = true;
          this.isAriaHidden = false;
          this.isAriaExpanded = true;
          this.hasMenuItemExpanded = true;
        }
        this.$forceUpdate();
      },

      resetMenuItems: function () {
        for (let key in this.menu) {
          if (this.menu.hasOwnProperty(key)) {
            this.menu[key] = false;
          }
        }
        this.hasMenuItemExpanded = false;
      },

      hasMenuItemsOpen: function () {
        for (let key in this.menu) {
          if (this.menu.hasOwnProperty(key)) {
            if (this.menu[key]) {
              return true;
            }
          }
        }
        return false;
      },

      togglePreventBodyScroll: function () {
        const body = document.getElementsByTagName('BODY')[0];
        body.classList.toggle('overflow-hidden');
      }
    },
    // mounted: () => {
    //   console.log(window.location.origin)
    //   try {
    //     auth0.isAuthenticated().then(function (authenticated) {
    //       console.log(authenticated, 'authenticated')
    //     })
    //   } catch (err) {
    //     console.log("Log in failed", err);
    //   }



    //   // const is_auth = await auth0.isAuthenticated();
    //   // console.log(is_auth, "--- is_auth");
    //   // if (is_auth) {
    //   // console.log(is_auth)
    //   //   // document.body.style.display = null;

    //   //   // unused atm, hook up later; this won't get executed since we change location above
    //   //   const user = await auth0.getUser();
    //   //   console.log(user)
    //   //   // $(".loginBtn").hide();
    //   //   // $(".logoutBtn").show();
    //   //   // $(".secret").show();
    //   //   // $(".user_name").text(user.name);
    //   //   // $(".login-message").text("You are logged in as ");
    //   //   // $("#download-proceedings-div").html("You can download the proceedings from <a href='https://www.dropbox.com/scl/fo/7smc635unf8ohm9gu8sds/h?rlkey=kacc5v1v9tcdekehkb7lg03fj&dl=0' target='_blank'>this Dropbox link</a> using the password mel23.  Or, use this <a href='https://drive.google.com/drive/folders/1zWW8PPiQenVeUu7jaSx3143_c2Qwfnnk?usp=share_link' target='_blank'>alternative Google Drive mirror.</a>");
    //   // } else {
    //   //   // $(".loginBtn").show();
    //   //   // $(".logoutBtn").hide();
    //   //   // $(".secret").hide();
    //   //   // $(".user_name").text("");
    //   //   // $(".login-message").text("You are currently not authenticated.");
    //   // }
    // }
  });


  /**
   * Authentication
   */

  const updateUI = async (auth0, query) => {
    const is_auth = await auth0.isAuthenticated();
    //console.log("are we auth?", is_auth)
    if (is_auth) {
      document.body.style.display = null;

      // if we have a redirect request, grab it and push the user over to that page they wanted to see
      var queryParams = new URLSearchParams(query);
      var redirectUri = queryParams.get("return");
      if (redirectUri) {
       //console.log("we were gonna redirect here to ", "/" + redirectUri)
        window.location.href = "/" + redirectUri; // important: this also strips out queryParams so we don't infinitely redirect :)
      }

      // unused atm, hook up later; this won't get executed since we change location above
      const user = await auth0.getUser();
      $(".login-button").hide();
      $(".welcome-pill-message").show();
      $(".logout-button").show();
      $(".welcome-pill-message").prop("value", `Welcome, ${user.nickname}`)
      
    } else {
      $(".login-button").show();
      $(".welcome-pill-message").hide();
      $(".logout-button").hide();
      // $(".login-message").show();
      // $(".secret").hide();
      // $(".user_name").text("");
      // $(".login-message").text("You are currently not authenticated.");
    }
  };

  $(".secret").hide();

  const auth0_domain = 'ieeevis.us.auth0.com'
  const auth0_client_id = 'G8onz2A6h59RmuYFUbSLpGmxsGHOyPOv'
  //console.log("origin is " + window.location.origin);
  createAuth0Client({
    domain: auth0_domain,
    clientId: auth0_client_id,
    cacheLocation: "localstorage"
    }).then(async (auth0Client) => {
      // const loginButton = document.getElementById("loginButton");
      // // auth0Client.getTokenSilently()
  
      // loginButton.addEventListener("click", (e) => {
      //   e.preventDefault();
      //   auth0Client.loginWithRedirect();
      // });
        
      // if (location.search.includes("state=") && 
      //     (location.search.includes("code=") || 
      //     location.search.includes("error="))) {
      //   await auth0Client.handleRedirectCallback();
      //   window.history.replaceState({}, document.title, "/");
      // }
  
      // Assumes a button with id "logout" in the DOM
      // const logoutButton = document.getElementById("logout");
  
      // logoutButton.addEventListener("click", (e) => {
      //   e.preventDefault();
      //   auth0Client.logout();
      // });

      // await auth0Client.getTokenSilently()
  
      const isAuthenticated = await auth0Client.isAuthenticated();
      const query = window.location.search;
      const userProfile = await auth0Client.getUser();
  
      console.log(isAuthenticated, 'authenticated')
      console.log(userProfile)

      // const welcomePill = document.getElementById('welcomePill')
      // const loginBtn = document.getElementById('loginButton')

      if (isAuthenticated)
      {
        // document.body.style.display = null;
        await updateUI(auth0Client, query);
        //console.log("WE GOT IN HERE, IS AUTHENTICATED IS TRUE")
        // welcomePill.classList.remove('hidden')
        // welcomePill.innerText = `Welcome, ${userProfile.nickname}`

        // loginBtn.classList.add('hidden')
      }
      else if (query.includes("code=") && query.includes("state=")) {
        // NEW - check for the code and state parameters
        // Process the login state
        //console.log("WE ARE IN THE REDIRECT CALLBACK!!!!!!")
        auth0Client
          .handleRedirectCallback()
          .then((cb) => {
            console.log(cb, "--- cb");
            window.history.replaceState({}, document.title, "/");
            updateUI(auth0Client, query);
          })
          .catch((e) => {
            // eslint-disable-next-line no-console
            console.log(e, "--- error");
          });

        // Use replaceState to redirect the user away and remove the querystring parameters
      } else if (
        window.location.href.includes("redirect") &&
        !window.location.hash.includes("redirect")
      ) {
        console.log("included redirect")
        // we should only trigger login requests if we have a page to return to
        if (query.includes("return=")) {
          // await auth0Client.loginWithRedirect({
          //   redirect_uri: window.location.href,
          //   authorizationParams: {
          //     redirect_uri: window.location.href,
          //   }
          // });
          await auth0Client.loginWithPopup();

          updateUI(auth0Client, query)
        }
      } else  if ( window.location.href.includes("room_") || window.location.href.includes("paper_") ){
          window.location.href = `/year/2024/program/redirect?return=${window.location.pathname.slice(1)}`;
        }
        
    

      // {
        // welcomePill.classList.add('hidden')
        // loginBtn.classList.remove('hidden')

      // }
      //console.log("there is a log in button, I swear!");
      $(".login-button").click(async function () {
        //console.log("HELLO IN LOGIN BUTTON");
        // await auth0Client.loginWithRedirect({
        //   // redirect_uri: `${window.location.origin}/program/redirect.html?return=${window.location.href}`,
        //   authorizationParams: {
        //     redirect_uri: `${window.location.origin}`,
        //     // redirect_uri: `${window.location.origin}/program/redirect.html?return=${window.location.href}`,
        //   }
        // });
        await auth0Client.loginWithPopup();
        updateUI(auth0Client, query)
      });
      $(".logoutBtn").click(async function () {
        await auth0Client.logout({
          redirect_uri: window.location.href,
        });
      });


    })


  // automatically highlight TOC sidebar entries
  const navItems = Array.from(document.querySelectorAll('.sidebar-toc li a'));
  if (navItems.length !== 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = "#" + entry.target.getAttribute('id');
          const navItemIndex = navItems.findIndex(nav_item => nav_item.getAttribute('href') === id);
          if (navItemIndex !== -1) {
            for (let i in navItems) {
              if (i == navItemIndex)
                navItems[i].classList.add('sidebar__link--active');
              else
                navItems[i].classList.remove('sidebar__link--active');
            }
          }
        }
        // OR, can use the following code to show all active, but it's annoying if no header is currently in scroll-view
        // const id = entry.target.getAttribute('id');
        // const selector = ".sidebar-toc li a[href='#" + id + "']";
        // if (entry.intersectionRatio > 0)
        //   document.querySelector(selector).classList.add('sidebar__link--active');
        // else
        //   document.querySelector(selector).classList.remove('sidebar__link--active');
      });
    });

    document.querySelectorAll('article h2, article h3').forEach(section => observer.observe(section));
  }
});
