/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/ManifestUtils",
	"sap/ui/fl/write/_internal/SaveAs",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/_internal/init"
], function(
	ManifestUtils,
	SaveAs,
	LrepConnector,
	FeaturesAPI,
	Versions
) {
	"use strict";

	var _callAppVariantFunction = function(sFunctionName, mPropertyBag) {
		if (!mPropertyBag.layer) {
			return Promise.reject(new Error("Layer must be provided"));
		}

		// Since this method is only called for Save As App Variant scenario on ABAP platform, the direct usage of write LrepConnector is triggered.
		return LrepConnector.appVariant[sFunctionName]({
			...mPropertyBag,
			reference: ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector),
			url: "/sap/bc/lrep"
		});
	};

	/**
	 * Provides an API for tools to create, update, delete app variants.
	 *
	 * @namespace sap.ui.fl.write.api.AppVariantWriteAPI
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.rta, similar tools
	 *
	 */
	var AppVariantWriteAPI = /** @lends sap.ui.fl.write.api.AppVariantWriteAPI */ {
		/**
		 * Saves the app variant to backend.
		 *
		 * @param {object} mPropertyBag - Object with parameters as properties
		 * @param {sap.ui.fl.Selector} mPropertyBag.selector - Selector
		 * @param {string} mPropertyBag.id - App variant ID
		 * @param {object} [mPropertyBag.oParsedHash] - Parsed Hash containing semantic object, action and parameters for inbound
		 * @param {sap.ui.fl.Layer} mPropertyBag.layer - Current working layer
		 * @returns {Promise} Promise that resolves with the app variant save response
		 *
		 * @private
	 	 * @ui5-restricted
		 */
		saveAs(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject(new Error("Layer must be provided"));
			}
			if (!mPropertyBag.id) {
				return Promise.reject(new Error("App variant ID must be provided"));
			}
			const sReference = ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector);
			return FeaturesAPI.isVersioningEnabled(mPropertyBag.layer)
			.then(function(bVersioningEnabled) {
				return SaveAs.saveAs({
					...mPropertyBag,
					reference: sReference,
					...(bVersioningEnabled && {
						parentVersion: Versions.getVersionsModel({ ...mPropertyBag, reference: sReference }).getProperty("/displayedVersion")
					})
				});
			});
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
		deleteAppVariant(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject(new Error("Layer must be provided"));
			}
			return SaveAs.deleteAppVariant({
				...mPropertyBag,
				id: ManifestUtils.getFlexReferenceForSelector(mPropertyBag.selector)
			});
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
		listAllAppVariants(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject(new Error("Layer must be provided"));
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
		getManifest(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject(new Error("Layer must be provided"));
			}
			if (!mPropertyBag.appVarUrl) {
				return Promise.reject(new Error("appVarUrl must be provided"));
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
		assignCatalogs(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject(new Error("Layer must be provided"));
			}
			if (!mPropertyBag.assignFromAppId) {
				return Promise.reject(new Error("assignFromAppId must be provided"));
			}
			if (!mPropertyBag.action) {
				return Promise.reject(new Error("action must be provided"));
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
		unassignCatalogs(mPropertyBag) {
			if (!mPropertyBag.layer) {
				return Promise.reject(new Error("Layer must be provided"));
			}
			if (!mPropertyBag.action) {
				return Promise.reject(new Error("action must be provided"));
			}
			return _callAppVariantFunction("unassignCatalogs", mPropertyBag);
		}
	};
	return AppVariantWriteAPI;
});