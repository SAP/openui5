(function () {
	"use strict";

	window["ui5-core-csp-violations"] = [];

	document.addEventListener("securitypolicyviolation", function (e) {
		// Save CSP violations for later checks
		window["ui5-core-csp-violations"].push(e);
	});
})();