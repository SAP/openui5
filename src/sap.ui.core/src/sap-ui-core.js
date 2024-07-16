/*!
 * ${copyright}
 */

(function() {
	"use strict";

	//extract base URL from script tag
	function find(selector, regex) {
		const elements = document.querySelectorAll(selector);
		for (let i = 0; i < elements.length; i++) {
			const match = elements[i].getAttribute("src")?.match(regex);
			if ( match ) {
				return match[1] || "";
			}
		}
	}

	const sBaseUrl =
		find("SCRIPT[src][id='sap-ui-bootstrap']", /^((?:[^?#]*\/)?resources\/)/) // full path up to "resources/"
		?? find("SCRIPT[src]", /^([^?#]*\/)?sap-ui-core\.js(?:[?#]|$)/); // or base dir of sap-ui-core.js (can be empty)

	if (sBaseUrl == null) {
		throw new Error("sap-ui-core.js: could not identify script tag!");
	}

	function loadScripts(urls, callback) {
		let pending = urls.length,
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

		for ( let i = 0; i < urls.length; i++ ) {
			const script = document.createElement("script");
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

	// cascade 1: the loader
	loadScripts([
		"ui5loader.js"
	], function() {
		// cascade 2: generic loader configuration
		loadScripts([
			"ui5loader-autoconfig.js"
		], function() {
			// cascade 3: bootstrap (old) Core
			sap.ui.require(["sap/ui/core/Core"], function(Core) {
				Core.boot();
			});
		});
	});

}());
