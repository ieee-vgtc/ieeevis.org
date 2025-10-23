const allow_cookies = Cookies.get("miniconf-allow-cookies-2021");
const reject_cookies = Cookies.get("miniconf-reject-cookies-2021");

if (!allow_cookies && !reject_cookies) {
  $(".gdpr").show();
}

if (allow_cookies) {
  _paq.push(['setConsentGiven']);
  _paq.push(['setCookieConsentGiven']);
}

$("#gdpr-btn-accept").on("click", () => {
  Cookies.set("miniconf-allow-cookies-2021", 1, { expires: 7 });
  $(".gdpr").hide();
});

$("#gdpr-btn-reject").on("click", () => {
  Cookies.set("miniconf-reject-cookies-2021", 1, { expires: 7 });
  $(".gdpr").hide();
});
