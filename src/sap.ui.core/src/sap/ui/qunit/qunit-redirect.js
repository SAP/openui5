/*!
 * ${copyright}
 */

(function() {
	"use strict";

	// If running in top window redirect to testrunner
	if (!parent.jsUnitTestSuite) {

		//extract base URL from script to attach the qunit-redirect script
		var aScripts = document.getElementsByTagName("script"),
				sBaseUrl = null,
				sTestTimeout,
				sOrigin = window.location.origin ? window.location.origin : (window.location.protocol + "//" + window.location.host),
				sTestUrl = window.location.href.substr(sOrigin.length);

		for (var i = 0; i < aScripts.length; i++) {
			var oScript = aScripts[i];
			var sSrc = oScript.getAttribute("src");
			if (sSrc) {
				var aBaseUrl = sSrc.match(/(.*)resources\/sap\/ui\/qunit\/qunit-redirect\.js$/i);
				if (aBaseUrl && aBaseUrl.length > 1) {
					sBaseUrl = aBaseUrl[1];
					sTestTimeout = oScript.getAttribute("data-test-timeout");
					break;
				}
			}
		}

		if (sBaseUrl === null) {
			throw new Error("qunit-redirect.js: The script tag seems to be malformed!");
		}

		// forward the testpage to the testrunner
		window.location = sBaseUrl +
			"test-resources/sap/ui/qunit/testrunner.html?testpage=" + encodeURIComponent(sTestUrl) +
			"&autostart=true" +
			(sTestTimeout ? "&test-timeout=" + encodeURIComponent(sTestTimeout) : "");

	}

})();
