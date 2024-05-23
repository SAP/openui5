
/*!
 * ${copyright}
 */
/**
 * Initialize Logger
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
	// set LogLevel
	const sLogLevel = config.get({
		name: "sapUiLogLevel",
		type: config.Type.String,
		defaultValue: undefined,
		external: true
	});
	if (sLogLevel) {
		Log.setLevel(Log.Level[sLogLevel.toUpperCase()] || parseInt(sLogLevel));
	} else if (!globalThis["sap-ui-optimized"]) {
		Log.setLevel(Log.Level.DEBUG);
	}
	return {
		run: () => {
			Promise.resolve();
		}
	};
});
