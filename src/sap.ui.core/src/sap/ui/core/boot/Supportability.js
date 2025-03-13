/*!
 * ${copyright}
 */

/**
 * Initialize Support related stuff
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Supportability",
	"sap/ui/core/support/Hotkeys"
], (
	Log,
	Supportability,
	Hotkeys
) => {
	"use strict";

	const aSupportModules = [];

	//init Hotkeys for support tools
	Hotkeys.init();

	// init support assistant
	if (Supportability.getSupportSettings() !== null) {
		aSupportModules.push(
			new Promise((res, rej) => {
				sap.ui.require(["sap/ui/core/support/Support", "sap/ui/support/Bootstrap"], (Support, Bootstrap) => {
					Support.initializeSupportMode(Supportability.getSupportSettings());
					Bootstrap.initSupportRules(Supportability.getSupportSettings());
					res();
				}, rej);
			}).catch((oError) => {
				Log.error("Could not load support mode modules:", oError);
			})
		);
	}

	// Initialize test tools
	if (Supportability.getTestRecorderSettings() !== null) {
		aSupportModules.push(
			new Promise((res, rej) => {
				sap.ui.require(["sap/ui/testrecorder/Bootstrap"], (Bootstrap) => {
					Bootstrap.init(Supportability.getTestRecorderSettings());
					res();
				}, rej);
			}).catch((oError) => {
				Log.error("Could not load test recorder:", oError);
			})
		);
	}

	const pReady = aSupportModules.length ? Promise.all(aSupportModules) : Promise.resolve();

	return {
		run: () => {
			return pReady;
		}
	};
});
