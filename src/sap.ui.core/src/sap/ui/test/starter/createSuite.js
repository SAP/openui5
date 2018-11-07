/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

/*global document, sap */
(function(deps, callback) {

	"use strict";

	//extract base URL from script tag
	var oScriptTag, mMatch, sBaseUrl;

	oScriptTag = document.querySelector("[src$='createSuite.js']");
	if (oScriptTag) {
		mMatch = /^(.*\/)?createSuite.js/.exec(oScriptTag.getAttribute("src"));
		if (mMatch) {
			sBaseUrl = mMatch[1] + "../../../../";
		}
	}

	if (sBaseUrl == null) {
		throw new Error("createSuite.js: could not identify script tag!");
	}

	function loadScripts(urls, callback) {
		var pending = urls.length,
			errors = 0;

		function listener(e) {
			pending--;
			if ( e.type === 'error' ) {
				errors++;
			}
			e.target.removeEventListener("load", listener);
			e.target.removeEventListener("error", listener);
			if ( pending === 0 && errors === 0 && callback ) {
				callback();
			}
		}

		for ( var i = 0; i < urls.length; i++ ) {
			var script = document.createElement("script");
			script.addEventListener("load", listener);
			script.addEventListener("error", listener);
			script.src = sBaseUrl + urls[i];
			document.head.appendChild(script);
		}
	}

	// check for optimized sources
	window["sap-ui-optimized"] = window["sap-ui-optimized"]
		|| (/\.head/.test(loadScripts) && !/pending/.test(loadScripts));

	// prevent a reboot in full debug mode as this would invalidate our listeners
	window["sap-ui-debug-no-reboot"] = true;

	// cascade 1: polyfills, can all be loaded in parallel
	loadScripts([
		"sap/ui/thirdparty/baseuri.js",
		"sap/ui/thirdparty/es6-promise.js",
		"sap/ui/thirdparty/es6-string-methods.js",
		"sap/ui/thirdparty/es6-object-assign.js"
	], function() {
		// cascade 2: the loader
		loadScripts([
			"ui5loader.js"
		], function() {
			// cascade 3: the loader configuration script
			sap.ui.loader.config({
				async:true
			});
			loadScripts([
				"ui5loader-autoconfig.js"
			], function() {
				sap.ui.require(deps, callback);
			});
		});
	});

}([
	"sap/ui/test/starter/_utils"
], function(utils) {
	"use strict";

	function render(sHTML) {
		// style is added to the head, no need to wait for DOM ready
		utils.addStylesheet("sap/ui/thirdparty/qunit-2.css");
		utils.addStylesheet("sap/ui/test/starter/testsuite.css");
		return utils.whenDOMReady().then(function() {
			var elem = document.body.querySelector("#qunit");
			if ( elem == null ) {
				elem = document.createElement("div");
				elem.id = "qunit";
				document.body.insertBefore(elem, document.body.firstChild);
			}
			elem.innerHTML = sHTML;
		});
	}

	function redirectToTestRunner() {
		// As IE11 doesn't properly resolve relative URLs when assigning to location.href, use an anchor tag
		var anchor = document.createElement("A");
		document.head.appendChild(anchor);
		anchor.href = sap.ui.require.toUrl("") + "/../test-resources/sap/ui/qunit/testrunner.html"
			+ "?testpage=" + encodeURIComponent(window.location.pathname) + "&autostart=true";
		window.location.href = anchor.href;
	}

	function renderList(oSuiteConfig) {

		document.title = "Available Unit Tests - " + oSuiteConfig.name;

		var sLinkHTML = "<h1 id='qunit-header' style='color:#C2CCD1;'>" + document.title + "</h1>"
			+ "<h2 id='qunit-banner' style='background-color:#4646E7;'></h2>"
			+ "<div id='qunit-testrunner-toolbar'>"
			+ "<button id='redirect'>Run All</button>"
			+ "</div>"
			+ "<ol id='qunit-tests'>";
		oSuiteConfig.sortedTests.forEach(function(oTestConfig) {
			var sPageUrl = sap.ui.require.toUrl("") + "/../" + oTestConfig.page;
			sLinkHTML += "<li class='" + (oTestConfig.skip ? "skipped" : "pass") + "'>" +
					(oTestConfig.skip ? "<em class='qunit-skipped-label'>skipped</em>" : "") +
					"<strong>" +
					(oTestConfig.group ? "<span class='module-name'>" + oTestConfig.group + "<span>: " : "") +
					"<a class='test-name' href='" + sPageUrl + "' target='_blank'>" + oTestConfig.name + "</a></strong></li>";
		});
		sLinkHTML += "</ol>"
			+ "<div id='redirect-hint'><div>"
			+ "<div>Tests will start in</div>"
			+ "<div id='remaining-time'>*</div>"
			+ "<div>Click or press 'ESC' to cancel</div></div></div>";

		render(sLinkHTML).then(function() {
			// Note: we use a 0.1 second timer resolution so that the blocking div disappears quickly
			var count = 10 * (parseInt(utils.getAttribute("data-sap-ui-delay")) || 2) + 9;

			function countDown() {
				if ( count === 6 ) {
					redirectToTestRunner();
				} else if ( count > 6 ){
					document.getElementById("remaining-time").textContent = String(Math.floor(count / 10));
					count--;
					setTimeout(countDown, 100);
				} else {
					document.removeEventListener("click", maybeStop);
					document.removeEventListener("keydown", maybeStop);
					var hintOverlay = document.getElementById("redirect-hint");
					hintOverlay.parentNode.removeChild(hintOverlay);
				}
			}

			function maybeStop(e) {
				if ( e.type === "click" || e.key === "Escape" ) {
					count = -1;
					e.preventDefault();
				}
			}

			document.addEventListener("keydown", maybeStop);
			document.addEventListener("click", maybeStop);
			document.getElementById("redirect").addEventListener("click", redirectToTestRunner);
			countDown();
		});

	}

	function renderError(oErr) {

		render(
			"<h1 id='qunit-header' style='color:#C2CCD1;'>Failed to load Testsuite</h1>"
			+ "<h2 id='qunit-banner' class='qunit-fail'></h2>"
			+ "<ol id='qunit-tests'>"
			+ "<li class='pass'><strong>" + utils.encode(oErr.message || String(oErr)) + "</strong></li>"
			+ "</ol>"
		);

	}

	var sSuiteName = utils.getAttribute("data-sap-ui-testsuite");
	var whenLoaded = utils.getSuiteConfig(sSuiteName);


	var JSUnitSuite = parent.jsUnitTestSuite;
	if ( !JSUnitSuite ) {
		// If running in top window, render list and redirect to testrunner after a while
		whenLoaded.then(renderList).catch(renderError);
		return;
	}

	/*
	* Note: the window.suite function must be provided early,
	* only its answer can be a promise. The TestRunner.js will call this method
	* immediately after the window load event.
	*/
	window.suite = function() {

		function createSuite(oSuiteConfig) {
			var sContextPath = "/" + window.location.pathname.split("/")[1] + "/";
			var oSuite = new JSUnitSuite();
			oSuiteConfig.sortedTests.forEach(function(oTestConfig) {
				if (!oTestConfig.skip) {
					oSuite.addTestPage(sContextPath + oTestConfig.page, oTestConfig);
				}
			});
			return oSuite;
		}

		return whenLoaded.then(createSuite).catch(renderError);

	};

	var oSuiteReadyEvent = document.createEvent("CustomEvent");
	oSuiteReadyEvent.initCustomEvent("sap-ui-testsuite-ready", true, true, {});
	window.dispatchEvent(oSuiteReadyEvent);

}));
