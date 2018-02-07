/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	function check(oScript, rUrlPattern) {
		var sUrl = oScript && oScript.getAttribute("src");
		var oMatch = rUrlPattern.exec(sUrl);
		if ( oMatch ) {
			return {
				tag: oScript,
				url: sUrl,
				resourceRoot: oMatch[1] || ""
			};
		}
	}

	var rResources = /^((?:.*\/)?resources\/)/,
		rBootScripts, aScripts, i, oResult;

	// Prefer script tags which have the sap-ui-bootstrap ID
	// This prevents issues when multiple script tags point to files named
	// "sap-ui-core.js", for example when using the cache buster for UI5 resources
	oResult = check(document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), rResources);

	if ( !oResult ) {
		aScripts = document.querySelectorAll('SCRIPT[src]');
		rBootScripts = /^(.*\/)?(?:sap-ui-(core|custom|boot|merged)(?:-.*)?)\.js(?:[?#]|$)/;
		for ( i = 0; i < aScripts.length; i++ ) {
			oResult = check(aScripts[i], rBootScripts);
			if ( oResult ) {
				break;
			}
		}
	}

	return oResult || {};

});