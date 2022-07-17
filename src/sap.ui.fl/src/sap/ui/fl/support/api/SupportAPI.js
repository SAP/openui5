/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/support/_internal/getFlexSettings",
	"sap/ui/fl/support/_internal/getChangeDependencies"
], function(
	getFlexSettings,
	getChangeDependencies
) {
	"use strict";

	/**
	 * Provides an API for support tools
	 *
	 * @namespace sap.ui.fl.support.api.SupportAPI
	 * @since 1.98
	 * @version ${version}
	 * @private
	 * @ui5-restricted ui5 support tools
	 */
	var SupportAPI = /** @lends sap.ui.fl.support.api.SupportAPI */{
		getChangeDependencies: getChangeDependencies,
		getFlexSettings: getFlexSettings
	};

	return SupportAPI;
});
