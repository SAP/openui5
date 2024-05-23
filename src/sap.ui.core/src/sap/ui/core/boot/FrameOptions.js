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
	"sap/base/config"
], (
	config
) => {
	"use strict";

	let pLoaded = Promise.resolve();

	// initialize frameOptions script (anti-clickjacking, etc.)
	const oFrameOptionsConfig = config.get({
		name: "sapUiFrameOptionsConfig",
		type: config.Type.Object,
		defaultValue: (value) => {
			return value;
		}
	});

	if (oFrameOptionsConfig) {
		pLoaded = new Promise((resolve, reject) => {
			sap.ui.require(["sap/ui/security/FrameOptions", "sap/ui/security/Security"], (FrameOptions, Security) => {
				oFrameOptionsConfig.mode = Security.getFrameOptions();
				oFrameOptionsConfig.allowlistService = Security.getAllowlistService();
				resolve(new FrameOptions(oFrameOptionsConfig));
			}, reject);
		});
	}

	return {
		run: () => {
			return pLoaded;
		}
	};
});