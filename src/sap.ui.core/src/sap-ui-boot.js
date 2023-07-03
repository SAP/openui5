/*!
 * ${copyright}
 */

/**
 * IMPORTANT: This is a private module, its API must not be used in production and is
 * subject to change.
 *
 * It may be used to experiment with an alternative bootstrap of a UI5 application.
 *
 * Currently, it does not fully recreate the environment of the regular UI5 bootstrap
 * (<code>sap-ui-core.js</code>), but only a subset as required by UI5 Controls
 * (<code>sap.m</code>) or UI5 Web Components.
 *
 * @private
 * @experimental
 */

/*global document, sap */
(function() {

	"use strict";

	//extract base URL from script tag
	var oScriptTag, mMatch, sBaseUrl;

	oScriptTag = document.getElementById("sap-ui-bootstrap");
	if (oScriptTag) {
		mMatch = /^(?:.*\/)?resources\//.exec(oScriptTag.getAttribute("src"));
		if (mMatch) {
			sBaseUrl = mMatch[0];
		}
	}

	if (sBaseUrl == null) {
		throw new Error("sap-ui-boot.js: could not identify script tag!");
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

	// cascade 1: the loader
	loadScripts([
		"ui5loader.js"
	], function() {
		// cascade 2: the loader configuration script
		sap.ui.loader.config({
			async: true
		});
		loadScripts([
			"sap/ui/core/boot/_bootConfig.js"
		], function() {
			// cascade 3: load autoconfig
			loadScripts([
				"ui5loader-autoconfig.js"
			], function() {
				// cascade 4: the boot script
				loadScripts(["sap/ui/core/boot/_runBoot.js"]);
			});
		});
	});

}());
