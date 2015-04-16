/*!
 * ${copyright}
 */

(function(aScriptIncludes) {

	"use strict";

	//extract base URL from script tag
	var aScripts = document.getElementsByTagName("script"),
		i,sSrc,mMatch,sBaseUrl,bCoreRequired = false;

	for (i = 0; i < aScripts.length; i++) {
		sSrc = aScripts[i].getAttribute("src");
		if (sSrc) {
			mMatch = sSrc.match(/(.*\/)sap-ui-core(?:-nojQuery)?\.js$/i);
			if (mMatch) {
				sBaseUrl = mMatch[1];
				break;
			}
		}
	}

	if (sBaseUrl == null) {
		throw new Error("sap-ui-core-nojQuery.js: could not identify script tag!");
	}

	function exec(sUrl) {
		var req = new window.XMLHttpRequest();
		req.open('GET', sUrl, false);
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				var script = req.responseText + "\n//# sourceURL=" + sSrc;
				// execute the loaded script
				if (window.execScript) {
					window.execScript(script);
				} else {
					window.eval(script);
				}
			}
		};
		req.send(null);
	}

	var lowerIE10 = /MSIE (8|9)\.0/i.test(navigator.userAgent);

	for (i = 0; i < aScriptIncludes.length; i++) {
		sSrc = aScriptIncludes[i];
		if ( sSrc.indexOf("raw:") === 0 ) {
			sSrc = sBaseUrl + sSrc.slice(4);
			if (lowerIE10) {
				// IE < 10 does not execute inserted script tags in correct order
				// -> load script synchronously and eval it
				exec(sSrc);
			} else {
				document.write("<script src=\"" + sSrc + "\"></script>");
			}
		} else if ( sSrc.indexOf("require:") === 0 ) {
			sSrc = sSrc.slice(8);
			bCoreRequired = bCoreRequired || sSrc === "sap.ui.core.Core";
			document.write("<script>jQuery.sap.require(\"" + sSrc + "\");</script>");
		}
	}
	if ( bCoreRequired ) {
		document.write("<script>sap.ui.getCore().boot && sap.ui.getCore().boot();</script>");
	}
}([
	"raw:sap/ui/Device.js",
	"raw:sap/ui/thirdparty/URI.js",
	"raw:jquery.sap.promise.js",
	"raw:jquery.sap.global.js",
	"require:sap.ui.core.Core"
]));
