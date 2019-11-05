/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/SaveAs",
	"sap/ui/fl/write/_internal/Storage"
], function(
	ChangesController,
	SaveAs,
	Storage
) {
	"use strict";

	/**
	 * Provides an API for tools to create, update, delete app variants.
	 *
	 * @namespace sap.ui.fl.write.api.AppVariantWriteAPI
	 * @experimental Since 1.72
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var AppVariantWriteAPI = /**@lends sap.ui.fl.write.api.AppVariantWriteAPI */ {
		/**
		 * Saves the app variant to backend.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {string} mPropertyBag.id - App variant ID
		 * @param {sap.ui.fl.Layers} mPropertyBag.layer - Current working layer
		 * @param {string} [mPropertyBag.package] - Package info for the app variant - Smart Business must pass the package
		 * @param {string} [mPropertyBag.transport] - Transport request for the app variant - Smart Business must pass the transport
		 * @param {string} [mPropertyBag.version] - Version of the app variant
		 * @param {string} [mPropertyBag.isForSAPDeveloper=false] - Determines whether app variant creation is intended for SAP developer
		 * @param {boolean} [mPropertyBag.skipIam=false] - Indicates whether the default IAM item creation and registration is skipped. This is S4/Hana specific flag passed by only Smart Business
		 *
		 * @returns {Promise} Promise that resolves with the app variant save response
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		saveAs: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			return SaveAs.saveAs(mPropertyBag);
		},

		/**
		 * Deletes the app variant from the backend
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layers} mPropertyBag.layer - Connectors are now determined based on the layer - Smart Business must pass the layer
		 * @param {string} [mPropertyBag.transport] - Transport request for the app variant - Smart Business must pass the transport
		 * @param {string} [mPropertyBag.isForSAPDeveloper=false] - Determines whether app variant deletion is intended for SAP developer
		 * @param {boolean} [mPropertyBag.skipIam=false] - Indicates whether the default IAM item creation and registration is skipped. This is S4/Hana specific flag passed by only Smart Business
		 * @returns {Promise} Promise that resolves with the app variant deletion response
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		deleteAppVariant: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.referenceAppId = oFlexController.getComponentName();

			return SaveAs.deleteAppVariant(mPropertyBag);
		},
		/**
		 * Lists all the app variants based on the reference application
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layers} mPropertyBag.layer - Connectors are now determined based on the layer
		 * @returns {Promise} Promise that resolves with the list of app variant entries
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		listAllAppVariants: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag["sap.app/id"] = oFlexController.getComponentName();

			return Storage.appVariant.list(mPropertyBag);
		},
		/**
		 * Gets the manifest of an app(variant) from backend
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layers} mPropertyBag.layer - Connectors are now determined based on the layer
		 * @returns {Promise} Promise that resolves with the app(variant) manifest
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		getManifest: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			return Storage.appVariant.getManifest(mPropertyBag);
		},
		/**
		 * Loads the app(variant) design time configuration from backend
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layers} mPropertyBag.layer - Connectors are now determined based on the layer
		 * @returns {Promise} Promise that resolves with the app(variant) design time configuration
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		loadAppVariant: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			return Storage.appVariant.load(mPropertyBag);
		},
		/**
		 * Assigns the same catalogs to app varriant as of reference application
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layers} mPropertyBag.layer - Connectors are now determined based on the layer
		 * @param {string} mPropertyBag.assignFromAppId - Reference application ID
		 * @param {string} mPropertyBag.action - Action name e.g. assignCatalogs
		 * @returns {Promise} Promise that resolves with the app variant catalog assignment information
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		assignCatalogs: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			return Storage.appVariant.assignCatalogs(mPropertyBag);
		},
		/**
		 * Assigns the same catalogs to app varriant as of reference application
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layers} mPropertyBag.layer - Connectors are now determined based on the layer
		 * @param {string} mPropertyBag.action - Action name e.g. unassignCatalogs
		 * @returns {Promise} Promise that resolves with the app variant unassignment information
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		unassignCatalogs: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			return Storage.appVariant.unassignCatalogs(mPropertyBag);
		}
	};
	return AppVariantWriteAPI;
}, true);