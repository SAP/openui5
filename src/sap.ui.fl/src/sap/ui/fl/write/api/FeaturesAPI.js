/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings"
], function(
	Settings
) {
	"use strict";

	/**
	 * Provides an API to determine which features are available for flexibility.
	 *
	 * @namespace sap.ui.fl.write.api.FeaturesAPI
	 * @experimental Since 1.70
	 * @since 1.70
	 * @public
	 *
	 */

	var FeaturesAPI = /** @lends sap.ui.fl.write.api.FeaturesAPI */ {

		/**
		 * Determines if the current runtime can publish flexibility content in the connected backend.
		 *
		 * @returns {Promise<boolean>} Promise resolving with a flag if publishing is available
		 */
		isPublishAvailable: function () {
			return Settings.getInstance().then(function (oSettings) {
				return !oSettings.isProductiveSystem();
			});
		},

		/**
		 * Checks if key user rights are available for the current user.
		 *
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if key user is available
		 * @private
		 * @ui5-restricted sap.ui.rta.api.startKeyUserAdaptation
		 */
		isKeyUser: function () {
			return Settings.getInstance()
				.then(function (oSettings) {
					return oSettings.isKeyUser();
				});
		}
	};

	return FeaturesAPI;
});