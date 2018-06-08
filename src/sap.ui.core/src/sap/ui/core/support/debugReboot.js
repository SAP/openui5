/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */

/*
 * This is not an AMD module, because it is only loaded as a script tag with document.write when the ui5loader gets
 * configured and before the application starts.
 */
(function() {
	// @evo-todo: get rid of window and its configuration
	// @evo-todo: window.localstorage?

	"use strict";

	/*
	 * Remove an element from the DOM
	 */
	function remove(element) {
		if ( element && element.parentNode ) {
			element.parentNode.removeChild(element);
		}
	}

	// Check local storage for booting a different core
	var sRebootUrl;
	try { // Necessary for FF when Cookies are disabled
		sRebootUrl = window.localStorage.getItem("sap-ui-reboot-URL");
		window.localStorage.removeItem("sap-ui-reboot-URL"); // only reboot once from there (to avoid a deadlock when the alternative core is broken)
	} catch (e) { /* no warning, as this will happen on every startup, depending on browser settings */ }

	/*
	 * Determine whether sap-bootstrap-debug is set, run debugger statement and allow
	 * to restart the core from a new URL
	 */
	if (/sap-bootstrap-debug=(true|x|X)/.test(location.search)) {
		// Dear developer, the way to reload UI5 from a different location has changed: it can now be directly configured in the support popup (Ctrl-Alt-Shift-P),
		// without stepping into the debugger.
		// However, for convenience or cases where this popup is disabled, or for other usages of an early breakpoint, the "sap-bootstrap-debug" URL parameter option is still available.
		// To reboot an alternative core just set sRebootUrl
		/*eslint-disable no-debugger */
		debugger;
		/*eslint-enable no-debugger */
	}

	if (sRebootUrl && sRebootUrl !== "undefined") { // sic! It can be a string.
		/*eslint-disable no-alert*/
		var bUserConfirmed = confirm("WARNING!\n\nUI5 will be booted from the URL below.\nPress 'Cancel' unless you have configured this.\n\n" + sRebootUrl);
		/*eslint-enable no-alert*/

		if (bUserConfirmed) {
			// replace the bootstrap tag with a newly created script tag to enable restarting the core from a different server
			var _getScript = function(oScript, rRegex) {
				if (oScript && oScript.getAttribute("src") && rRegex.exec(oScript.getAttribute("src"))) {
					return oScript;
				}
			};

			var oScript = _getScript(document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), /^((?:.*\/)?resources\/)/);
			if (!oScript) {
				var aScripts = document.querySelectorAll('SCRIPT[src]');
				var rBootScripts = /^(.*\/)?(?:sap-ui-(core|custom|boot|merged)(?:-.*)?)\.js(?:[?#]|$)/;
				for (var iScriptIndex = 0; iScriptIndex < aScripts.length; iScriptIndex++ ) {
					oScript = _getScript(aScripts[iScriptIndex], rBootScripts);
					if ( oScript ) {
						break;
					}
				}
			}

			var sScript = "<script id=\"sap-ui-bootstrap\" src=\"" + sRebootUrl + "\"";
			for (var i = 0; i < oScript.attributes.length; i++) {
				var oAttr = oScript.attributes[i];
				if (oAttr.nodeName === "data-sap-ui-resourceroots") {
					var oResourceRootsCfg = JSON.parse(oAttr.nodeValue + "");
					// Reset resource root configuration to prevent it from overruling the bootstrap tag
					if (oResourceRootsCfg) {
						oResourceRootsCfg[""] = undefined;
						sScript += " data-sap-ui-resourceroots=\"" + JSON.stringify(oResourceRootsCfg).replace(/"/g, "&quot;") + "\"";
					}
				} else if (oAttr.nodeName.indexOf("data-sap-ui-") === 0) {
					sScript += " " + oAttr.nodeName + "=\"" + oAttr.nodeValue.replace(/"/g, "&quot;") + "\"";
				}
			}
			sScript += "></script>";
			remove(oScript);

			// clean up cachebuster stuff
			remove(document.getElementById("sap-ui-bootstrap-cachebusted"));

			var oCfg = window["sap-ui-config"];
			if (oCfg && oCfg.resourceRoots) {
				// Reset resource root configuration to prevent it from overruling the bootstrap tag
				oCfg.resourceRoots[""] = undefined;
			}

			document.write(sScript);
		}
	}
}());
