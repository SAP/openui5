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
	 * Provides an API to handle specific information about the Extension Points into the Application.
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
		 * Returns the extension point information by parent id.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {string} mPropertyBag.parentId - Id of the extension point parent control
		 * @returns {object[]} of extension point informations.
		 */
		getExtensionPointInfoByParentId: function (mPropertyBag) {
			return ExtensionPointRegistry.getExtensionPointInfoByParentId(mPropertyBag.parentId);
		}
	};

	return ExtensionPointRegistryAPI;
}, true);
