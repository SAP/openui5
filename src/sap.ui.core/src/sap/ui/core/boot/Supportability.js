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
	"sap/ui/core/support/Hotkeys"
], (
	Hotkeys
) => {
	"use strict";

	//init Hotkeys for support tools
	Hotkeys.init();

	return {
		run: () => {
			return Promise.resolve();
		}
	};
});
