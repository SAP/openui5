/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils",
	"sap/ui/fl/write/_internal/CompatibilityConnector",
	"sap/ui/fl/Utils"
], function(
	ManifestUtils,
	CompatibilityConnector,
	Utils
) {
	"use strict";

	/**
	 * Class for loading Flex Data from the backend via the Connectors.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.Loader
	 * @experimental
	 * @since 1.74
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.flexState
	 */
	return {
		/**
		 * Provides the flex data for a given application based on the configured connectors;
		 * This function needs a manifest object, async hints and either an ID to an instantiated component or component data as parameter
		 *
		 * @param {object} mPropertyBag - Contains additional data needed for loading changes
		 * @param {object} mPropertyBag.manifest - ManifestObject that belongs to current component
		 * @param {object} mPropertyBag.reference - Flex Reference
		 * @param {string} mPropertyBag.componentData - Component data of the current component
		 * @param {object} [mPropertyBag.asyncHints] - Async hints passed from the app index to the component processing
		 * @param {string} [mPropertyBag.draftLayer] - Layer for which the draft should be loaded
		 * @returns {Promise<object>} resolves with the change file for the given component from the Storage
		 */
		loadFlexData: function (mPropertyBag) {
			var mComponent = {
				name: mPropertyBag.reference,
				appVersion: Utils.getAppVersionFromManifest(mPropertyBag.manifest) || Utils.DEFAULT_APP_VERSION
			};
			var mProperties = {
				appName: ManifestUtils.getBaseComponentNameFromManifest(mPropertyBag.manifest),
				cacheKey: ManifestUtils.getCacheKeyFromAsyncHints(mPropertyBag.asyncHints, mPropertyBag.reference),
				siteId: Utils.getSiteIdByComponentData(mPropertyBag.componentData),
				appDescriptor: mPropertyBag.manifest.getRawJson ? mPropertyBag.manifest.getRawJson() : mPropertyBag.manifest,
				draftLayer: mPropertyBag.draftLayer
			};
			return CompatibilityConnector.loadChanges(mComponent, mProperties);
		}
	};
});
