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
	"sap/base/config",
	"sap/base/Log",
	"sap/ui/core/support/Hotkeys"
], (
	config,
	Log,
	Hotkeys
) => {
	"use strict";

	sap.ui.loader._.logger = Log.getLogger("sap.ui.ModuleSystem",
	config.get({
		name: "sapUiXxDebugModuleLoading",
		type: config.Type.Boolean,
		external: true,
		freeze: true
	}) ? Log.Level.DEBUG : Math.min(Log.getLevel(), Log.Level.INFO));

	//init Hotkeys for support tools
	Hotkeys.init();

	return {
		run: () => {
			return Promise.resolve();
		}
	};
});