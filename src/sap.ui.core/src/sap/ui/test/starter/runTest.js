/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the Core tests must not yet introduce dependencies to this module.
 */

(function() {

	"use strict";

	//extract base URL from script tag
	var oScriptTag, mMatch, sBaseUrl;

	oScriptTag = document.querySelector("[src$='runTest.js']");
	if (oScriptTag) {
		mMatch = /^([^?#]*\/)?runTest.js/.exec(oScriptTag.getAttribute("src"));
		if (mMatch) {
			sBaseUrl = mMatch[1] + "../../../../";
		}
	}

	if (sBaseUrl == null) {
		throw new Error("runTest.js: could not identify script tag!");
	}

	function loadScripts(urls, callback) {
		var pending = urls.length,
			errors = 0;

		if (pending === 0) {
			callback();
			return;
		}

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

	// check for optimized sources by testing variable names in a local function
	// (check for native API ".head" to make sure that the function's source can be retrieved)
	window["sap-ui-optimized"] = window["sap-ui-optimized"]
		|| (/\.head/.test(loadScripts) && !/pending/.test(loadScripts));

	// prevent a reboot in full debug mode as this would invalidate our listeners
	window["sap-ui-debug-no-reboot"] = true;

	// define the necessary polyfills to be loaded
	var aPolyfills = [];
	if (/(trident)\/[\w.]+;.*rv:([\w.]+)/i.test(window.navigator.userAgent)) {
		aPolyfills.push("sap/ui/thirdparty/baseuri.js");
		aPolyfills.push("sap/ui/thirdparty/es6-promise.js");
		aPolyfills.push("sap/ui/thirdparty/es6-shim-nopromise.js");
	} else if (/(edge)[ \/]([\w.]+)/i.test(window.navigator.userAgent) ||
			/(Version\/(11\.0)|PhantomJS).*Safari/.test(window.navigator.userAgent)) {
		// for Microsoft Edge and Safari 11.0 the Promise polyfill is still needed
		aPolyfills.push("sap/ui/thirdparty/es6-promise.js");
	}

	// cascade 1: polyfills, can all be loaded in parallel
	loadScripts(aPolyfills, function() {
		// cascade 2: the loader
		loadScripts([
			"ui5loader.js"
		], function() {
			// cascade 3: loader configuration, specific for the runTest scenario
			loadScripts([
				"sap/ui/test/starter/_configureLoader.js"
			], function() {
				// cascade 4: generic loader configuration
				loadScripts([
					"ui5loader-autoconfig.js"
				], function() {
					// cascade 5: bootstrap the test
					sap.ui.require(["sap/ui/test/starter/_setupAndStart"]);
				});
			});
		});
	});

}());
