/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils"
], function(
	Settings,
	Utils
) {
	"use strict";

	async function getSettings() {
		const oSettings = await Settings.getInstance();
		return Object.keys(oSettings._oSettings).map(function(sKey) {
			var vValue = oSettings._oSettings[sKey];

			if (sKey === "versioning") {
				vValue = vValue.CUSTOMER || vValue.ALL;
			}

			return {
				key: sKey,
				value: vValue
			};
		});
	}

	/**
	 * Provides an object with the flex Settings.
	 *
	 * @namespace sap.ui.fl.support._internal.getFlexSettings
	 * @since 1.99
	 * @version ${version}
	 * @param {sap.ui.core.UIComponent} oAppComponent - Application Component
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */
	return async function(oAppComponent) {
		// in most scenarios the appComponent will already be passed, but in iFrame cases (like cFLP) the appComponent is not available
		// outside of the iFrame. In this case the function is called from inside the iFrame and has to fetch the appComponent
		if (!oAppComponent) {
			const oAppLifeCycleService = await Utils.getUShellService("AppLifeCycle");
			return getSettings(oAppLifeCycleService.getCurrentApplication().componentInstance);
		}
		return getSettings(oAppComponent);
	};
});
