/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/CompatibilityConnector"
], function(
	CompatibilityConnector
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
		 * Provides the flex data for a given application based on the configured connectors.
		 *
		 * @param {object} mPropertyBag - Contains additional data needed for loading changes
		 * @param {map} mPropertyBag.component - Contains component data needed for loading changes
		 * @param {string} mPropertyBag.component.name - Name of the component
		 * @param {string} [mPropertyBag.component.appName] - Name where bundled changes from the application development are stored
		 * @param {string} [mPropertyBag.component.appVersion] - Current running version of application
		 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to actual component
		 * @param {string} [mPropertyBag.siteId] - <code>siteId</code> that belongs to actual component
		 * @param {string} [mPropertyBag.cacheKey] - Key to validate the client side stored cache entry
		 * @returns {Promise<object>} resolves with the change file for the given component, either from cache or back end
		 */
		loadFlexData: function (mPropertyBag) {
			return CompatibilityConnector.loadChanges(mPropertyBag.component, mPropertyBag);
		}
	};
});
