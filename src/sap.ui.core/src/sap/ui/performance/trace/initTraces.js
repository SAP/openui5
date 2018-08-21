/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/performance/trace/FESR"], function(FESR) {

    "use strict";

    /**
	 * Determine wether to activate SAP Passport or FESR
	 *
	 * @function
	 * @alias module:sap/ui/performance/trace/initTraces
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
    return function() {
		var bActive = !!document.querySelector("meta[name=sap-ui-fesr][content=true]"),
			aParamMatches = window.location.search.match(/[\?|&]sap-ui-(?:xx-)?fesr=(true|x|X|false)&?/);
		if (aParamMatches) {
			bActive = aParamMatches[1] && aParamMatches[1] != "false";
		}

		FESR.setActive(bActive);

		// TODO this should be part of a Configuration
		// *********** Include E2E-Trace Scripts *************
		if (/sap-ui-xx-e2e-trace=(true|x|X)/.test(location.search)) {
			sap.ui.requireSync("sap/ui/core/support/trace/E2eTraceLib");
		}
    };
});
