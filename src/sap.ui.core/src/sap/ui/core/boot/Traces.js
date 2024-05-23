/*!
 * ${copyright}
 */

/**
 * Initialize FrameOptions
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/config",
	"sap/base/Log"
], (
	config,
	Log
) => {
	"use strict";

	let sUrl,
		pFESRLoaded = Promise.resolve();

	const sFesr = config.get({
		name: "sapUiFesr",
		type: config.Type.String,
		external: true,
		freeze: true
	});
	const e2eTrace = config.get({
		name: "sapUiXxE2eTrace",
		type: config.Type.Boolean,
		external: true,
		freeze: true
	});

	const bActive = sFesr !== "" && sFesr !== "false";

	if (bActive) {
		pFESRLoaded = new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/performance/trace/FESR"], (FESR) => {
				sUrl = ["true", "false", "x", "X", undefined].indexOf(sFesr) === -1 ? sFesr : undefined;

				if (typeof performance.getEntriesByType === "function") {
					FESR.setActive(bActive, sUrl);
				} else {
					Log.debug("FESR is not supported in clients without support of window.Performance extensions.");
				}
				resolve();
			}, reject);
		});
	}

	// *********** Include E2E-Trace Scripts *************
	if (e2eTrace) {
		sap.ui.require(["sap/ui/core/support/trace/E2eTraceLib"]);
	}

	return {
		run: () => {
			return pFESRLoaded;
		}
	};
});