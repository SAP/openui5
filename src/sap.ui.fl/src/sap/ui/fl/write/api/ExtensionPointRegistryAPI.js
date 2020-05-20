/*
 * ! ${copyright}
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
	 * @experimental Since 1.78
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
		getExtensionPointInfo: function (mPropertyBag) {
			return ExtensionPointRegistry.getExtensionPointInfo(mPropertyBag.name, mPropertyBag.view);
		},

		/**
		 * Returns the extension point information by parent ID.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.parentId - ID of the extension point parent control
		 * @returns {object[]} Extension point information
		 */
		getExtensionPointInfoByParentId: function (mPropertyBag) {
			return ExtensionPointRegistry.getExtensionPointInfoByParentId(mPropertyBag.parentId);
		}
	};

	return ExtensionPointRegistryAPI;
}, true);
