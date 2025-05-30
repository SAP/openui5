/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/Settings",
	"sap/ui/fl/initial/api/InitialFlexAPI",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	Settings,
	InitialFlexAPI,
	Storage,
	Layer,
	Utils
) {
	"use strict";

	/**
	 * Provides an API to determine which features are available for flexibility.
	 *
	 * @namespace sap.ui.fl.write.api.FeaturesAPI
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
		isPublishAvailable() {
			return Settings.getInstance().then(function(oSettings) {
				return (
					oSettings.getIsPublishAvailable() ||
					// if the flag is not given, publish should be available on ABAP systems (?) which are not productive systems
					!!(
						!oSettings.getIsProductiveSystem()
						// TODO this is pretty arbitrary, not sure what the intention here is
						&& oSettings.getSystem()
						&& oSettings.getClient()
					)
				);
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
		 * When it is not a standalone app.
		 * When the backend supports this feature.
		 * @private
		 * @ui5-restricted
		 */
		isSaveAsAvailable(sLayer) {
			return Promise.all([
				Settings.getInstance(),
				Utils.getUShellService("Navigation")
			])
			.then(function(aPromises) {
				var oSettings = aPromises[0];
				var oCrossAppNav = aPromises[1];
				return (
					!oSettings.getIsContextBasedAdaptationEnabled()
					&& oSettings.getIsAppVariantSaveAsEnabled()
					&& sLayer === Layer.CUSTOMER
					&& oCrossAppNav !== undefined // Not a standalone app
				);
			})
			.catch(function() {
				// either Settings or ushell Navigation service from Unified Shell failed -> disable save as app variant
				return false;
			});
		},

		/**
		 * Determine if the context-based adaptation feature is available in the connected backend
		 *
		 * @param {string} sLayer - Layer to check for key user app variants
		 * @returns {Promise<boolean>} Promise resolving with a flag if the context-based adaptaion is available
		 *
		 * @private
		 * @ui5-restricted
		 */
		isContextBasedAdaptationAvailable(sLayer) {
			return Settings.getInstance().then(function(oSettings) {
				if (oSettings.getIsContextBasedAdaptationEnabled() && sLayer === Layer.CUSTOMER) {
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
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if the key user role is assigned to the user
		 * @public
		 */
		isKeyUser() {
			return InitialFlexAPI.isKeyUser();
		},

		/**
		 * Checks if the data storing implementation for a given layer is capable of handling versioning.
		 *
		 * @param {string} sLayer - Layer to check for the draft versioning
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if versioning is enabled
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		async isVersioningEnabled(sLayer) {
			const oSettings = await Settings.getInstance();
			const oVersionInfo = oSettings.getVersioning();
			return !!(oVersionInfo[sLayer] || oVersionInfo.ALL);
		},

		/**
		 * Checks if key user has also the admin role to enable the translation button
		 *
		 * @param {sap.ui.fl.Layer} sLayer - Current layer
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if the key user is also an admin
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		isKeyUserTranslationEnabled(sLayer) {
			if (sLayer === Layer.CUSTOMER) {
				return Settings.getInstance()
				.then(function(oSettings) {
					return oSettings.getIsKeyUserTranslationEnabled();
				});
			}
			return Promise.resolve(false);
		},

		/**
		 * Checks if context sharing is enabled.
		 *
		 * @param {string} sLayer - Layer to get correct connector
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if context sharing is enabled
		 * @private
		 * @deprecated
		 * @ui5-restricted sap.ui.fl.write.api.ContextSharingAPI
		 */
		isContextSharingEnabled(sLayer) {
			if (sLayer !== Layer.CUSTOMER) {
				return Promise.resolve(false);
			}
			return Settings.getInstance()
			.then(function(oSettings) {
				return oSettings.getIsContextSharingEnabled({layer: sLayer});
			});
		},

		/**
		 * Checks if the backend supports to save already viewed features via What's New.
		 *
		 * @returns {Promise<boolean>} Resolves to a boolean indicating if the feature is available
		 * @ui5-restricted sap.ui.rta
		 */
		async isSeenFeaturesAvailable() {
			const oSettings = await Settings.getInstance();
			return oSettings.getIsSeenFeaturesAvailable();
		},

		/**
		 * Gets the list of all features that the current user has already set to 'Don't show again'.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.layer - Layer to get the correct connector
		 * @returns {Promise<string[]>} Resolves with a list of viewed features
		 * @ui5-restricted sap.ui.rta
		 */
		async getSeenFeatureIds(mPropertyBag) {
			if (!await this.isSeenFeaturesAvailable()) {
				return [];
			}
			return Storage.getSeenFeatureIds(mPropertyBag);
		},

		/**
		 * Sets the list of all features that the current user has already set to 'Don't show again'.
		 * The whole list has to be passed, not only the new entries.
		 *
		 * @param {object} mPropertyBag - Property bag
		 * @param {string} mPropertyBag.layer - Layer to get the correct connector
		 * @param {string[]} mPropertyBag.seenFeatureIds - List of feature IDs
		 * @returns {Promise<string[]>} Resolves with a list of viewed features
		 * @ui5-restricted sap.ui.rta
		 */
		async setSeenFeatureIds(mPropertyBag) {
			if (!await this.isSeenFeaturesAvailable()) {
				return Promise.reject("The backend does not support saving seen features.");
			}
			return Storage.setSeenFeatureIds(mPropertyBag);
		},

		/**
		 * Checks the settings if variant adaptation is enabled. If the settings are not yet loaded, it returns false.
		 *
		 * @returns {boolean} Returns a boolean indicating if the variant adaptation is enabled
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		isVariantAdaptationEnabled() {
			const oSettings = Settings.getInstanceOrUndef();
			return oSettings?.getIsVariantAdaptationEnabled();
		},

		/**
		 * Checks the settings if the local reset is enabled. If the settings are not yet loaded, it returns false.
		 * @returns {boolean} Returns a boolean indicating if the local reset is enabled
		 * @private
		 * @ui5-restricted sap.ui.rta
		 */
		isLocalResetEnabled() {
			const oSettings = Settings.getInstanceOrUndef();
			return oSettings?.getIsLocalResetEnabled();
		},

		/**
		 * Checks the settings if annotation changes are enabled. If the settings are not yet loaded, it returns false.
		 * @returns {boolean} Returns a boolean indicating if annotation changes are enabled
		 * @private
		 * @ui5-restricted sap.ui.rta, controls implementing annotation actions
		 */
		areAnnotationChangesEnabled() {
			const oSettings = Settings.getInstanceOrUndef();
			return oSettings?.getIsAnnotationChangeEnabled();
		}
	};

	return FeaturesAPI;
});
