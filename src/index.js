import style from "./styles/index.css";
import jQuery from 'jquery';

import Vue from 'vue'
import { createAuth0Client } from "@auth0/auth0-spa-js";



const updateUI = async (auth0, query) => {
  const is_auth = await auth0.isAuthenticated();
  //console.log("are we auth?", is_auth)
  if (is_auth) {
    document.body.style.display = null;

    let toast = document.getElementById('loginToastMessage');
    if (toast) {
      toast.style.display = "none";
    }

    // if we have a redirect request, grab it and push the user over to that page they wanted to see
    var queryParams = new URLSearchParams(query);
    var redirectUri = queryParams.get("return");
    if (redirectUri) {
      //console.log("we were gonna redirect here to ", "/" + redirectUri)
      window.location.href = "/" + redirectUri; // important: this also strips out queryParams so we don't infinitely redirect :)
    }

    // unused atm, hook up later; this won't get executed since we change location above
    const user = await auth0.getUser();
    // $(".login-button").hide();
    // $(".welcome-pill-message").show();
    // $(".logout-button").show();
    // $(".welcome-pill-message").prop("value", `Welcome, ${user.nickname}`)

    Array.from(document.getElementsByClassName('login-button')).map((item) => {
      item.classList.add('hide-auth-controls')
    })

    Array.from(document.getElementsByClassName('welcome-pill')).map((item) => {
      item.classList.remove('hide-auth-controls')
    })

    Array.from(document.getElementsByClassName('discord-public-link')).map((item) => {
      item.classList.remove('hide-auth-controls')
    })
    // Array.from(document.getElementsByClassName('logout-button')).map((item) => {
    //   item.classList.remove('hide-auth-controls')
    // })

    Array.from(document.getElementsByClassName('welcome-pill-message')).map((item) => {
      item.value = `Welcome, ${user.nickname}`
    })

  } else {
    // $(".login-button").show();
    Array.from(document.getElementsByClassName('login-button')).map((item) => {
      item.classList.remove('hide-auth-controls')
    })
    // $(".welcome-pill-message").hide();
    // $(".logout-button").hide();

    // Array.from(document.getElementsByClassName('logout-button')).map((item) => {
    //   item.classList.add('hide-auth-controls')
    // })

    Array.from(document.getElementsByClassName('welcome-pill-message')).map((item) => {
      item.attributes.value = ''
    })

    Array.from(document.getElementsByClassName('welcome-pill')).map((item) => {
      item.classList.add('hide-auth-controls')
    })

  }
};


const authenticate = () => {
  const auth0_domain = 'ieeevis.us.auth0.com'
  const auth0_client_id = 'oF5BXUklWOjSjUeg5Tzai2DysHITXYhT'
  //console.log("origin is " + window.location.origin);
  createAuth0Client({
    domain: auth0_domain,
    clientId: auth0_client_id,
    cacheLocation: "localstorage"
  }).then(async (auth0Client) => {
    const isAuthenticated = await auth0Client.isAuthenticated();
    const query = window.location.search;
    const userProfile = await auth0Client.getUser();

    console.log(isAuthenticated, 'authenticated')
    console.log(userProfile)

    if (isAuthenticated) {
      await updateUI(auth0Client, query);
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
    } else if (window.location.href.includes("room_") || window.location.href.includes("paper_") || window.location.href.includes("poster_")) {
      // window.location.href = `/year/2025/program/redirect?return=${window.location.pathname.slice(1)}`;

      window.location.href = "/year/2025/welcome?loginMsg=true";
    }


    // $(".login-button").click(async function () {
    //   await auth0Client.loginWithPopup();
    //   updateUI(auth0Client, query)
    // });

    Array.from(document.getElementsByClassName('login-button')).forEach((item) => {
      item.addEventListener('click', async () => {
        await auth0Client.loginWithPopup();
        updateUI(auth0Client, query)
      })
    })


    Array.from(document.getElementsByClassName('logout-button')).forEach((item) => {
      item.addEventListener('click', async () => {
        await auth0Client.logout({
          redirect_uri: window.location.href,
        });
      })
    })

    // document.getElementsByClassName('login-button').addEventListener('click', async () => {
    //   await auth0Client.loginWithPopup();
    //   updateUI(auth0Client, query);
    // })

    // $(".logout-button").click(async function () {
    //   await auth0Client.logout({
    //     redirect_uri: window.location.href,
    //   });
    // });

  })
}


var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  console.log("sPageURL is ", sPageURL);
  console.log("sURLVariables is ", sURLVariables);
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
};

document.addEventListener('DOMContentLoaded', async () => {


  // console.log("URL parameter is ", getUrlParameter('loginMsg'), " and is it true? ", getUrlParameter('loginMsg') == true);

  if (getUrlParameter('loginMsg')) {
    // $("#loginToastMessage").show();
    // document.getElementById('loginToastMessage').classList.remove('hidden')
    document.getElementById('loginToastMessage').style.display = "block";
  }


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
    mounted: () => {
      console.log('is mounted')
      authenticate()
      const auth0_domain = 'ieeevis.us.auth0.com'
      const auth0_client_id = 'G8onz2A6h59RmuYFUbSLpGmxsGHOyPOv'
      //console.log("origin is " + window.location.origin);
      createAuth0Client({
        domain: auth0_domain,
        clientId: auth0_client_id,
        cacheLocation: "localstorage"
      }).then(async (auth0Client) => {
        const isAuthenticated = await auth0Client.isAuthenticated();
        const query = window.location.search;
        const userProfile = await auth0Client.getUser();

        console.log(isAuthenticated, 'authenticated')
        console.log(userProfile)

        if (isAuthenticated) {
          await updateUI(auth0Client, query);
        }
      })
    }
  });


  /**
   * Authentication
   */


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
