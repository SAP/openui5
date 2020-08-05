/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define(["sap/ui/performance/trace/FESR", "sap/base/Log"], function(FESR, Log) {

	"use strict";

	/**
	 * Determines whether to activate SAP Passport or FESR.
	 *
	 * @function
	 * @since 1.58
	 * @name module:sap/ui/performance/trace/initTraces
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	return function() {
		var oFESRMeta = document.querySelector("meta[name=sap-ui-fesr]"),
			sFESRMetaContent = oFESRMeta ? oFESRMeta.getAttribute("content") : undefined,
			bActive =  !!sFESRMetaContent && sFESRMetaContent !== "false",
			aParamMatches = window.location.search.match(/[\?|&]sap-ui-(?:xx-)?fesr=(true|x|X|false|.+)&?/),
			sUrl = sFESRMetaContent && sFESRMetaContent !== "true" ? sFESRMetaContent : undefined;

		if (aParamMatches) {
			bActive = aParamMatches[1] && aParamMatches[1] != "false";
			// FESR Definition via URL wins over meta
			sUrl = ["true", "false", "x", "X", undefined].indexOf(aParamMatches[1]) === -1 ? aParamMatches[1] : sUrl;
		}

		if (typeof window.performance.getEntriesByType === "function") {
			FESR.setActive(bActive, sUrl);
		} else {
			Log.debug("FESR is not supported in clients without support of window.Performance extensions.");
		}

		// TODO this should be part of a Configuration
		// *********** Include E2E-Trace Scripts *************
		if (/sap-ui-xx-e2e-trace=(true|x|X)/.test(location.search)) {
			sap.ui.requireSync("sap/ui/core/support/trace/E2eTraceLib");
		}
	};
});
