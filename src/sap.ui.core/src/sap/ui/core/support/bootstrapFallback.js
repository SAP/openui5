/*!
 * ${copyright}
 */

/*global console */

// This file provides a fallback to load UI5 in support.html
(function() {
	'use strict';

	function logError(sMessage) {
		/*eslint-disable no-console */
		console.error(sMessage);
		/*eslint-enable no-console */
	}

	// do nothing if UI5 is already loaded
	if (globalThis.sap?.ui) {
		return;
	}

	// parse URI-Parameter
	var aParamMatch = /sap-ui-xx-support-bootstrap=([^&]*)/.exec(location.search);
	if (!aParamMatch || aParamMatch.length < 2) {
		logError("Could not load 'sap-ui-core.js'. Please provide a URI-Parameter with the boostrap script. 'sap-ui-xx-support-bootstrap=file.js'");
		return;
	}

	var sBootstrapScript = decodeURIComponent(aParamMatch[1]);
	// only load bootstrap scripts from the root folder
	if (sBootstrapScript.indexOf('/') !== -1) {
		logError("Only local (same directory) boostrap script in URI-Parameter is allowed! 'sap-ui-xx-support-bootstrap=" + sBootstrapScript + "'");
		return;
	}

	var oOldScript = document.getElementById("sap-ui-bootstrap");
	if (!oOldScript) {
		logError("Could not find existing sap-ui-boostrap script tag!");
		return;
	}

	var oNewScript = document.createElement("script");
	oNewScript.setAttribute("id", "sap-ui-bootstrap");

	// use the provided bootstrap url as script src (prepending path from this file to the root)
	oNewScript.setAttribute("src", "../../../../" + sBootstrapScript);

	// replace old script tag with new one (changing "src" attribute does not trigger script loading)
	oOldScript.parentNode.replaceChild(oNewScript, oOldScript);

})();
