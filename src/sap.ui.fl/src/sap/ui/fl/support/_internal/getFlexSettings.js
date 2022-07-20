/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings"
], function(
	Settings
) {
	"use strict";

	/**
	 * Provides an object with the flex Settings.
	 *
	 * @namespace sap.ui.fl.support._internal.getFlexSettings
	 * @since 1.99
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.support.api.SupportAPI
	 */

	return function () {
		return Settings.getInstance().then(function (oSettings) {
			return Object.keys(oSettings._oSettings).map(function(sKey) {
				var value = oSettings._oSettings[sKey];

				switch (sKey) {
					case "versioning":
						value = value.CUSTOMER || value.ALL;
						break;
					default:
						break;
				}

				return {
					key: sKey,
					value: value
				};
			});
		});
	};
});
