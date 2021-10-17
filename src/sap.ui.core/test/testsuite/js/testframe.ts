import testfwk from "./testfwk";
import require from "require";
import oCore from "sap/ui/core/Core";
var oContentIFrame;
var oContentWindow;
function _onload() {
    var aExpander = document.querySelectorAll(".expander");
    for (var i = 0; i < aExpander.length; i++) {
        aExpander[i].addEventListener("click", toggleToolbar);
    }
    oContentIFrame = document.getElementById("sap-ui-ContentWindowFrame");
    oContentWindow = oContentIFrame.contentWindow;
    oContentWindow.addEventListener("load", testfwk.onContentLoad.bind(testfwk));
    window.addEventListener("popstate", function (evt) {
        var sURL = evt.state;
        if (!sURL) {
            sURL = "../testsuite/welcome.html";
            window.history.replaceState(sURL, null, document.location.href.split("#")[0]);
        }
        oContentWindow.document.location.replace(sURL);
    });
    testfwk.init(oContentWindow);
    var sURL = top.location.hash;
    if (sURL && (sURL.match(/^#(\.\.)?\/\w/))) {
        sURL = sURL.substring(1);
        var themeConstraints = null;
        var m = sURL.match(/.*\/test-resources\/(.*)\/[^\/]+.html/);
        if (m && (m.length > 1)) {
            var libName = m[1].replace(/\//g, ".");
            var themes = testfwk.LIBRARY_THEMES[libName];
            themeConstraints = themes || testfwk.LIBRARY_THEMES["all"];
        }
        testfwk.setContentURL(sURL, themeConstraints);
        if (testfwk.mThemeConfigListeners.length === 0) {
            setTimeout(function () {
                testfwk.fireThemeConfigurationChanged();
            }, 2000);
        }
    }
    else {
        sURL = "welcome.html";
        var loc = top.location.pathname;
        var index = loc.indexOf("testframe.html");
        if (index > -1) {
            sURL = loc.substr(0, index) + "welcome.html";
        }
        testfwk.setContentURL(sURL, null);
    }
    require(["./samples", "./settings", "./title", "./trace"]);
}
function setFrameLayout(layout) {
    if (layout === "newwindow") {
        var url = oContentWindow.document.location.href.replace(/&?sap-ui-theme=[^&#]+/g, "");
        if (url.indexOf("?") > -1) {
            url += "&";
        }
        else {
            url += "?";
        }
        window.open(url + "sap-ui-theme=" + testfwk.getTheme(), "_blank");
    }
    else {
        var oGridContainer = document.querySelector(".mainLayoutContainer");
        oGridContainer.className = "mainLayoutContainer " + layout;
    }
}
function editInSnippix() {
    if (!oContentWindow) {
        return;
    }
    var snippixBaseUrl = "/snippix/";
    var url = oContentWindow.document.location.href;
    url = url.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/&/g, "%26").replace(/#/g, "%23");
    window.open(snippixBaseUrl + "?url=" + url, "_blank");
}
function redirectToTestrunner() {
    var sContentUrl = testfwk.getContentURL(), aMatches = /.*\/test-resources\/(.*\.qunit\.html)$/i.exec(sContentUrl), sTestPage = aMatches && aMatches[0], sTestrunnerUrl = "../sap/ui/qunit/testrunner.html" + (sTestPage ? "?testpage=" + encodeURIComponent(sTestPage) : "");
    window.open(sTestrunnerUrl);
}
function toggleToolbar(oEvent) {
    var oExpander = oEvent.currentTarget;
    var oExpandable = oExpander.dataset.expands && document.getElementById(oExpander.dataset.expands);
    var bExpanded = oExpandable.classList.contains("expanded");
    if (bExpanded) {
        oExpandable.classList.remove("expanded");
        oExpandable.classList.add("collapsed");
    }
    else {
        oExpandable.classList.add("expanded");
        oExpandable.classList.remove("collapsed");
    }
}
oCore.attachInit(_onload);