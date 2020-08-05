/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer"
], function(
	Settings,
	FlexUtils,
	Layer
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
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		isPublishAvailable: function () {
			return Settings.getInstance().then(function (oSettings) {
				return !oSettings.isProductiveSystem();
			});
		},

		/**
		 * Determines if Save As app variants feature is available in the connected backend.
		 *
		 * @param {string} sLayer - Layer to check for key user app variants
		 * @returns {Promise<boolean>} Promise resolving with a flag if Save As is available
		 *
		 * @description App variant functionality is only supported in S/4HANA Cloud Platform & S/4HANA on Premise.
		 * App variant functionality should be available if the following conditions are met:
		 * When the current layer is 'CUSTOMER'.
		 * When it is not a standalone app runing on Neo Cloud.
		 * When the backend supports this feature.
		 * @private
	 	 * @ui5-restricted
		 */
		isSaveAsAvailable: function (sLayer) {
			return Settings.getInstance().then(function (oSettings) {
				if (
					oSettings.isAppVariantSaveAsEnabled()
					&& sLayer === Layer.CUSTOMER
					&& !!sap.ushell_abap // Not a standalone app
				) {
					return true;
				}
				return false;
			});
		},

		/**
		 * Checks if key user rights are available for the current user.
		 * Application developers can use this API to decide if the key user adaptation
		 * feature should be visible to the current user. This only applies if key user adaptation
		 * should be handled standalone without an SAP Fiori launchpad.
		 *
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if key user is available
		 * @public
		 */
		isKeyUser: function () {
			return Settings.getInstance()
				.then(function (oSettings) {
					return oSettings.isKeyUser();
				});
		},

		/**
		 * Checks if the data storing implementation for a given layer is capable of handling versioning.
		 *
		 * @param {string} sLayer - Layer to check for the draft versioning
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if versioning is enabled
		 * @public
		 */
		isVersioningEnabled: function (sLayer) {
			return Settings.getInstance()
				.then(function (oSettings) {
					return oSettings.isVersioningEnabled(sLayer);
				});
		}
	};

	return FeaturesAPI;
});
