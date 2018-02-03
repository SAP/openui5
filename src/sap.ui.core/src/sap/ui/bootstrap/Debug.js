/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(['sap/ui/bootstrap/Info'], function(_oBootstrap) {

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

	/*
	 * Determine whether sap-bootstrap-debug is set, run debugger statement and allow
	 * to restart the core from a new URL
	 */
	if (/sap-bootstrap-debug=(true|x|X)/.test(location.search)) {
		// Dear developer, the way to reload UI5 from a different location has changed: it can now be directly configured in the support popup (Ctrl-Alt-Shift-P),
		// without stepping into the debugger.
		// However, for convenience or cases where this popup is disabled, or for other usages of an early breakpoint, the "sap-bootstrap-debug" URL parameter option is still available.
		// To reboot an alternative core just step down a few lines and set sRebootUrl
		/*eslint-disable no-debugger */
		debugger;
		/*eslint-enable no-debugger */
	}

	// Check local storage for booting a different core
	var sRebootUrl;
	try { // Necessary for FF when Cookies are disabled
		sRebootUrl = window.localStorage.getItem("sap-ui-reboot-URL");
		window.localStorage.removeItem("sap-ui-reboot-URL"); // only reboot once from there (to avoid a deadlock when the alternative core is broken)
	} catch (e) { /* no warning, as this will happen on every startup, depending on browser settings */ }

	if (sRebootUrl && sRebootUrl !== "undefined") { // sic! It can be a string.
		/*eslint-disable no-alert*/
		var bUserConfirmed = confirm("WARNING!\n\nUI5 will be booted from the URL below.\nPress 'Cancel' unless you have configured this.\n\n" + sRebootUrl);
		/*eslint-enable no-alert*/

		if (bUserConfirmed) {
			// replace the bootstrap tag with a newly created script tag to enable restarting the core from a different server
			var oScript = _oBootstrap.tag,
			sScript = "<script id=\"sap-ui-bootstrap\" src=\"" + sRebootUrl + "\"";
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

			// now this core commits suicide to enable clean loading of the other core
			var oRestart = new Error("This is not a real error. Aborting UI5 bootstrap and rebooting from: " + sRebootUrl);
			oRestart.name = "Restart";
			throw oRestart;
		}
	}
});
