(function () {
	"use strict";

	window["ui5-core-csp-violations"] = [];

	document.addEventListener("securitypolicyviolation", function (e) {
		// Save CSP violations for later checks
		// Only record violations that stem from the level-1 policy
		if ( e.originalPolicy
			 && /script-src\s+[^;]*'unsafe-eval'/.test(e.originalPolicy)
			 && /style-src\s+[^;]*'unsafe-inline'/.test(e.originalPolicy) ) {
			window["ui5-core-csp-violations"].push(e);
		} else {
			// prevent the test starter's listener from complaining
			e.stopImmediatePropagation();
		}
	});

})();