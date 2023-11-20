sap.ui.define([
	"./testfwk",
	"require",
	"sap/ui/core/Core"
], function(testfwk, require, oCore) {
	"use strict";

	var oContentIFrame;
	var oContentWindow;

	function _onload() {

		var aExpander = document.querySelectorAll(".expander");
		for ( var i = 0; i < aExpander.length; i++ ) {
			aExpander[i].addEventListener("click", toggleToolbar);
		}

		oContentIFrame = document.getElementById('sap-ui-ContentWindowFrame');
		oContentWindow = oContentIFrame.contentWindow;
		oContentWindow.addEventListener("load", testfwk.onContentLoad.bind(testfwk));

		window.addEventListener("popstate", function(evt) {
			var sURL = evt.state;
			if (!sURL) { // can happen when the user directly launches the testsuite with a hash: the browser still creates a history entry with no hash and no data
				sURL = "../testsuite/welcome.html"; // for this additional history entry, just add the homepage as initial page
				window.history.replaceState(sURL, null, document.location.href.split("#")[0]);
			}
			oContentWindow.document.location.replace(sURL);
		});

		testfwk.init(oContentWindow);

		var sURL = top.location.hash;
		if ( sURL && (sURL.match(/^#(\.\.)?\/\w/)) ) { // load a specific page initially, only server-absolute and ascending relative local URLs (/bla or ../bla)
			sURL = sURL.substring(1); // remove the hash

			// try to find out which library the page belongs to, in order to allow and set the appropriate themes
			var themeConstraints = null;
			var m = sURL.match(/.*\/test-resources\/(.*)\/[^\/]+.html/);
			if (m && (m.length > 1)) {
				var libName = m[1].replace(/\//g,".");
				var themes = testfwk.LIBRARY_THEMES[libName]; // try to get theme information for the current library
				themeConstraints = themes || testfwk.LIBRARY_THEMES["all"]; // use the found config - or "all themes" if nothing was found
			}
			testfwk.setContentURL(sURL, themeConstraints);

			// The Theme ComboBox should be updated accordingly, but is usually not instantiated yet... just use a timeout to make it work in most cases
			if (testfwk.mThemeConfigListeners.length === 0) { // ComboBox does not listen yet
				// TODO fix this now that the use frames no longer causes parallelism
				setTimeout(function(){
					testfwk.fireThemeConfigurationChanged();
				}, 2000);
			}

		} else { // load the welcome page initially
			sURL = "welcome.html";
			var loc = top.location.pathname;
			var index = loc.indexOf("testframe.html");
			if (index > -1) { // try to build an absolute URL, so settings changes do not lead to a 404 on the initial screen
				sURL = loc.substr(0, index) + "welcome.html";
			}
			testfwk.setContentURL(sURL, null); // no theme constraints
		}

		require(["./samples", "./settings", "./title", "./trace"]);
	}

	function setFrameLayout(layout) {
		if ( layout === "newwindow" ) {
			// theme is not set via URL parameter and reload, but directly via JS API, so the URL to open now needs to be adapted
			var url = oContentWindow.document.location.href.replace(/&?sap-ui-theme=[^&#]+/g, ""); // remove old theme
			if (url.indexOf("?") > -1) {
				url += "&";
			} else {
				url += "?";
			}
			window.open(url + "sap-ui-theme=" + testfwk.getTheme(), '_blank');
		} else {
			var oGridContainer = document.querySelector('.mainLayoutContainer');
			oGridContainer.className = "mainLayoutContainer " + layout;
		}
	}

	function editInSnippix() {
		if ( !oContentWindow ) {
			return;
		}
		var snippixBaseUrl = "/snippix/"; /* always use the central snippix to avoid spreading snippets across multiple servers; the correct server is ensured when the button is present */
		var url = oContentWindow.document.location.href;
		url = url.replace(/%/g, "%25").replace(/\?/g, "%3F").replace(/&/g, "%26").replace(/#/g, "%23"); // escape special characters in URL
		window.open(snippixBaseUrl + "?url=" + url, '_blank');
	}

	function redirectToTestrunner() {

		var sContentUrl = testfwk.getContentURL(),
			aMatches = /.*\/test-resources\/(.*\.qunit\.html)$/i.exec(sContentUrl),
			sTestPage = aMatches && aMatches[0],
			sTestrunnerUrl = "../sap/ui/qunit/testrunner.html" + (sTestPage ? "?testpage=" + encodeURIComponent(sTestPage) : "");

		window.open(sTestrunnerUrl);

	}

	function toggleToolbar(oEvent) {
		var oExpander = oEvent.currentTarget;
		var oExpandable = oExpander.dataset.expands && document.getElementById(oExpander.dataset.expands);
		var bExpanded = oExpandable.classList.contains("expanded");
		if ( bExpanded ) {
			oExpandable.classList.remove("expanded");
			oExpandable.classList.add("collapsed");
		} else {
			oExpandable.classList.add("expanded");
			oExpandable.classList.remove("collapsed");
		}
	}

	oCore.ready(_onload);

	return {
		setFrameLayout: setFrameLayout,
		editInSnippix: editInSnippix,
		redirectToTestrunner: redirectToTestrunner
	};

});
