/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/write/_internal/extensionPoint/Registry"
], function(
	ExtensionPointRegistry
) {
	"use strict";

	/**
	 * Provides an API to handle specific information about the extension points into the application.
	 *
	 * @namespace sap.ui.fl.write.api.ExtensionPointRegistryAPI
	 * @since 1.78
	 * @private
	 * @ui5-restricted
	 */
	var ExtensionPointRegistryAPI = /** @lends sap.ui.fl.write.api.ExtensionPointRegistryAPI */{
		/**
		 * Returns the extension point information.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.name - Name of the extension point
		 * @param {object} mPropertyBag.view - View object
		 * @returns {object} mExtensionPointInfo - Map of extension point information
		 */
		getExtensionPointInfo(mPropertyBag) {
			return ExtensionPointRegistry.getExtensionPointInfo(mPropertyBag.name, mPropertyBag.view);
		},

		/**
		 * Returns the extension point information by view ID.
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.viewId - ID of the view
		 * @returns {object} map of extension points
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
