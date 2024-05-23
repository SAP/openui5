/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, it must not be listed as a direct module dependency,
 *            nor must it be required by code outside this package.
 */

(function() {
	"use strict";

	/*
	 * Mark the runTest.js script tag with the "sap-ui-boostrap" ID so that ui5loader-config.js
	 * will use it to determine the root URL
	 */
	var oScriptTag = document.querySelector("[src$='runTest.js']");
	if (oScriptTag && !oScriptTag.id && document.getElementById("sap-ui-bootstrap") == null ) {
		oScriptTag.id = "sap-ui-bootstrap";
	}

	// Configure boot manifest location
	globalThis["sap-ui-config"] = Object.assign({}, window["sap-ui-config"]);
	globalThis["sap-ui-config"].bootManifest = "sap/ui/test/starter/qunitBoot.json";
}());
