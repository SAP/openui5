/*!
 * ${copyright}
 */

jQuery.sap.declare('sap-ui-debug');

(function(aScriptIncludes) {

	"use strict";

	//extract base URL from script tag
	var aScripts, i, sSrc, mMatch, sBaseUrl, oScriptTag;

	oScriptTag = document.getElementById("sap-ui-bootstrap");
	if (oScriptTag) {
		sSrc = oScriptTag.getAttribute("src");
		mMatch = sSrc.match(/^(?:.*\/)?resources\//i);
		if (mMatch) {
			sBaseUrl = mMatch[1];
		}
	}

	if (sBaseUrl == null) {
		aScripts = document.getElementsByTagName("script");

		for (i = 0; i < aScripts.length; i++) {
			sSrc = aScripts[i].getAttribute("src");
			if (sSrc) {
				mMatch = sSrc.match(/(.*\/)sap-ui-core.*\.js$/i);
				if (mMatch) {
					sBaseUrl = mMatch[1];
					break;
				}
			}
		}
	}

	if (sBaseUrl == null) {
		throw new Error("sap-ui-debug.js: could not identify script tag!");
	}

	for (i = 0; i < aScriptIncludes.length; i++) {
		sSrc = aScriptIncludes[i];
		sSrc = sBaseUrl + sSrc.slice(4);
		document.write("<script src=\"" + sSrc + "\"></script>");
	}
}([
	"raw:sap/ui/debug/DebugEnv.js"
]));
