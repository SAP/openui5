/*!
 * ${copyright}
 */

/**
 * Apply polyfills and fixes
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/ui/Device"
], (
	Device
) => {
	"use strict";

	// syncXHR fix for firefox
	if (Device.browser.firefox) {
		sap.ui.require(["sap/ui/base/syncXHRFix", "sap/ui/events/PasteEventFix"], (syncXHRFix) => {
			syncXHRFix();
		});
	}

	return {
		run: () => {
			return Promise.resolve();
		}
	};
});