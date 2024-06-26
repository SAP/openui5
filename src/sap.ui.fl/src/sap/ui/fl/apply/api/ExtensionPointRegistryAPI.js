/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/extensionPoint/Registry"
], function(
	ExtensionPointRegistry
) {
	"use strict";

	/**
	 * Provides an API to handle specific information about the extension points into the application.
	 *
	 * @namespace sap.ui.fl.apply.api.ExtensionPointRegistryAPI
	 * @since 1.78
	 * @private
	 * @ui5-restricted
	 */
	var ExtensionPointRegistryAPI = /** @lends sap.ui.fl.apply.api.ExtensionPointRegistryAPI */{
		/**
		 * Returns the extension point information.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.name - Name of the extension point
		 * @param {object} mPropertyBag.view - View object
		 * @returns {object} mExtensionPointInfo - Map of extension point information
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getExtensionPointInfo(mPropertyBag) {
			return ExtensionPointRegistry.getExtensionPointInfo(mPropertyBag.name, mPropertyBag.view);
		},

		/**
		 * Returns the extension point information by view ID.
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.viewId - ID of the view
		 * @returns {object} map of extension points
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getExtensionPointInfoByViewId(mPropertyBag) {
			return ExtensionPointRegistry.getExtensionPointInfoByViewId(mPropertyBag.viewId);
		},

		/**
		 * Returns the extension point information by parent ID.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.parentId - ID of the extension point parent control
		 * @returns {Array} Array of extension point information
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		getExtensionPointInfoByParentId(mPropertyBag) {
			return ExtensionPointRegistry.getExtensionPointInfoByParentId(mPropertyBag.parentId);
		},

		/**
		 * Adds the ids of controls created in an extension point to the registry.
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.name - Name of the extension point
		 * @param {object} mPropertyBag.viewId - ID of the view
		 * @param {string[]} mPropertyBag.createdControlsIds - Array with the IDs of the created controls
		 *
		 * @private
		 * @ui5-restricted sap.ui.fl, sap.ui.rta
		 */
		addCreatedControlsToExtensionPointInfo(mPropertyBag) {
			ExtensionPointRegistry.addCreatedControls(
				mPropertyBag.name,
				mPropertyBag.viewId,
				mPropertyBag.createdControlsIds
			);
		}
	};

	return ExtensionPointRegistryAPI;
});
