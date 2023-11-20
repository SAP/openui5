/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([
	"sap/ui/performance/trace/FESR",
	"sap/base/Log",
	"sap/base/config"
], function(FESR, Log, BaseConfig) {

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
		var sUrl,
			bActive = false,
			sFesr = BaseConfig.get({
				name: "sapUiFesr",
				type: BaseConfig.Type.String,
				external: true,
				freeze: true
			});

		if (sFesr) {
			bActive = sFesr != "false";
			sUrl = ["true", "false", "x", "X", undefined].indexOf(sFesr) === -1 ? sFesr : undefined;
		}

		if (typeof window.performance.getEntriesByType === "function") {
			FESR.setActive(bActive, sUrl);
		} else {
			Log.debug("FESR is not supported in clients without support of window.Performance extensions.");
		}

		// *********** Include E2E-Trace Scripts *************
		if (BaseConfig.get({
			name: "sapUiXxE2eTrace",
			type: BaseConfig.Type.Boolean,
			external: true,
			freeze: true
		})) {
			sap.ui.require(["sap/ui/core/support/trace/E2eTraceLib"]);
		}
	};
});