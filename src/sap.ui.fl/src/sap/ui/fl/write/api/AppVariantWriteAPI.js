/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/ChangesController",
	"sap/ui/fl/write/_internal/SaveAs",
	"sap/ui/fl/write/_internal/connectors/LrepConnector"
], function(
	ChangesController,
	SaveAs,
	LrepConnector
) {
	"use strict";

	var _callAppVariantFunction = function(sFunctionName, mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject("Layer must be provided");
		}

		var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
		mPropertyBag.reference = oFlexController.getComponentName();
		mPropertyBag.url = "/sap/bc/lrep";
		// Since this method is only called for Save As App Variant scenario on ABAP platform, the direct usage of write LrepConnector is triggered.
		return LrepConnector.appVariant[sFunctionName](mPropertyBag);
	};

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
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Current working layer
		 * @returns {Promise} Promise that resolves with the app variant save response
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		saveAs: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			if (!mPropertyBag.id) {
				return Promise.reject("App variant ID must be provided");
			}
			var oFlexController = ChangesController.getDescriptorFlexControllerInstance(mPropertyBag.selector);
			mPropertyBag.reference = oFlexController.getComponentName();

			return SaveAs.saveAs(mPropertyBag);
		},

		/**
		 * Deletes the app variant from the backend
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Connectors are now determined based on the layer - Smart Business must pass the layer
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
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Connectors are now determined based on the layer
		 * @returns {Promise} Promise that resolves with the list of app variant entries
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		listAllAppVariants: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			return _callAppVariantFunction("list", mPropertyBag);
		},
		/**
		 * Gets the manifest of an app(variant) from backend
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Connectors are now determined based on the layer
		 * @param {sap.ui.fl.Layer} mPropertyBag.appVarUrl - Contains full url of app variant manifest
		 * @returns {Promise} Promise that resolves with the app(variant) manifest
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		getManifest: function(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject("Layer must be provided");
			}
			if (!mPropertyBag.appVarUrl) {
				return Promise.reject("appVarUrl must be provided");
			}
			// Since this method is only called for Save As App Variant scenario on ABAP platform, the direct usage of write LrepConnector is triggered.
			return LrepConnector.appVariant.getManifest(mPropertyBag);
		},
		/**
		 * Assigns the same catalogs to app variant as of reference application
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Connectors are now determined based on the layer
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
			if (!mPropertyBag.assignFromAppId) {
				return Promise.reject("assignFromAppId must be provided");
			}
			if (!mPropertyBag.action) {
				return Promise.reject("action must be provided");
			}
			return _callAppVariantFunction("assignCatalogs", mPropertyBag);
		},
		/**
		 * Assigns the same catalogs to app varriant as of reference application
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Connectors are now determined based on the layer
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
			if (!mPropertyBag.action) {
				return Promise.reject("action must be provided");
			}
			return _callAppVariantFunction("unassignCatalogs", mPropertyBag);
		}
	};
	return AppVariantWriteAPI;
}, true);