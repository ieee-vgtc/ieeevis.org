window.onload = async () => {
  document.body.style.display = "none";
  $(".secret").hide();
  const auth0 = await createAuth0Client({
    domain: auth0_domain,
    client_id: auth0_client_id,
    cacheLocation: "localstorage",
  });

  const isAuthenticated = await auth0.isAuthenticated();
  const query = window.location.search;

  const updateUI = async () => {
    const is_auth = await auth0.isAuthenticated();
    if (is_auth) {
      document.body.style.display = null;

      // if we have a redirect request, grab it and push the user over to that page they wanted to see
      var queryParams = new URLSearchParams(query);
      var redirectUri = queryParams.get("return");
      if (redirectUri)
        window.location.href = "/" + redirectUri; // important: this also strips out queryParams so we don't infinitely redirect :)

      // unused atm, hook up later; this won't get executed since we change location above
      const user = await auth0.getUser();
      $(".loginBtn").hide();
      $(".logoutBtn").show();
      $(".secret").show();
      $(".user_name").text(user.name);
      $(".login-message").text("You are logged in as");
    } else {
      $(".loginBtn").show();
      $(".logoutBtn").hide();
      $(".secret").hide();
      $(".user_name").text("");
      $(".login-message").text("You are currently not authenticated.");
    }
  };

  if (isAuthenticated) {
    document.body.style.display = null;
    await updateUI();
  } else if (query.includes("code=") && query.includes("state=")) {
    // NEW - check for the code and state parameters
    // Process the login state
    auth0
      .handleRedirectCallback()
      .then((cb) => {
        // console.log(cb, "--- cb");
        window.history.replaceState({}, document.title, "/");
        updateUI();
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e, "--- error");
      });

    // Use replaceState to redirect the user away and remove the querystring parameters
  } else if (
    window.location.href.includes("redirect.html") &&
    !window.location.hash.includes("redirect.html")
  ) {
    // we should only trigger login requests if we have a page to return to
    if (query.includes("return=")) {
      await auth0.loginWithRedirect({
        redirect_uri: window.location.href,
      });
    }
  } else {
    window.location.href = `redirect.html?return=${window.location.pathname.slice(1)}`;
  }

  // $(".loginBtn").click(async function () {
  //   await auth0.loginWithRedirect({
  //     redirect_uri: `redirect.html?return=${window.location.href}`,
  //   });
  // });
  // $(".logoutBtn").click(async function () {
  //   await auth0.logout({
  //     redirect_uri: window.location.href,
  //   });
  // });
};
