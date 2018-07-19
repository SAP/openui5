/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(function() {
    "use strict";

    /**
	 * Determine wether to activate SAP Passport or FESR
	 *
	 * @function
	 */
    return function() {
		var bActive = !!document.querySelector("meta[name=sap-ui-fesr][content=true]"),
			aParamMatches = window.location.search.match(/[\?|&]sap-ui-(?:xx-)?fesr=(true|x|X|false)&?/);
		if (aParamMatches) {
			bActive = aParamMatches[1] && aParamMatches[1] != "false";
		}

		if (bActive === true) {
			sap.ui.require(["sap/ui/performance/trace/FESR"], function(FESR) {
				FESR.setActive(true);
			});
		}

		// TODO this should be part of a Configuration
		// *********** Include E2E-Trace Scripts *************
		if (/sap-ui-xx-e2e-trace=(true|x|X)/.test(location.search)) {
			sap.ui.requireSync("sap/ui/core/support/trace/E2eTraceLib");
		}
    };
});
