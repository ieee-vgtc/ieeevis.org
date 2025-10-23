window.onload = async () => {
  document.body.style.display = "none";
  $(".secret").hide();
  const auth0Client = await auth0.createAuth0Client({
    domain: auth0_domain,
    clientId: auth0_client_id,
    cacheLocation: "localstorage"
  })

  const isAuthenticated = await auth0Client.isAuthenticated();
  const query = window.location.search;

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
  } else if (window.location.href.includes("room_") || window.location.href.includes("paper_") || window.location.href.includes("poster_") || window.location.href.includes("session_")) {
    // window.location.href = `/year/2025/program/redirect?return=${window.location.pathname.slice(1)}`;

    window.location.href = `/year/2025/welcome?loginMsg=true&return=${window.location.pathname.slice(1)}`;
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
};


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

    // Array.from(document.getElementsByClassName('welcome-pill-message')).map((item) => {
    //   item.value = `Welcome, ${user.nickname}`
    // })

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

    // Array.from(document.getElementsByClassName('welcome-pill-message')).map((item) => {
    //   item.attributes.value = ''
    // })

    Array.from(document.getElementsByClassName('welcome-pill')).map((item) => {
      item.classList.add('hide-auth-controls')
    })

  }
};