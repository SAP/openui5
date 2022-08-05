/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/dom/includeScript"
], function(
	Utils,
	FlexUtils,
	includeScript
) {
	"use strict";

	var ROUTES = {
		DATA: "/flex/data/",
		MODULES: "/flex/modules/"
	};

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.LrepConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @experimental Since 1.67
	 * @since 1.67
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage, sap.ui.fl.write._internal.transport
	 */
	return {
		layers: [
			"ALL"
		],
		xsrfToken: undefined,
		settings: undefined,

		/**
		 * Loads the modules in a CSP-compliant way via the UI5 core scripting mechanism
		 * This function has been extracted from the function <code>loadFlexData</code>
		 * The purpose of this is to have a function that can be stubbed for testing.
		 *
		 * @param {string} sFlexModulesUri Uri to load flex modules
		 * @returns {Promise} Returns a Promise resolved empty after the script was included
		 * @private
		 */
		 _loadModules: function (sFlexModulesUri) {
			return new Promise(function(resolve, reject) {
				includeScript(sFlexModulesUri, undefined, resolve, reject);
			});
		},

		/**
		 * Adds client information from browser url into request parameters
		 *
		 * @param {object} mParameters Parameters of the request
		 * @private
		 * @ui5-restricted sap.ui.fl.write._internal.connectors.LrepConnector
		 */
		_addClientInfo: function (mParameters) {
			var sClient = FlexUtils.getUrlParameter("sap-client");
			if (!mParameters && sClient) {
				mParameters = {};
			}
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}
		},

		/**
		 * Loads flexibility data from a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to actual component
		 * @param {string} [mPropertyBag.siteId] <code>sideId</code> that belongs to actual component
		 * @param {string} [mPropertyBag.cacheKey] Cache buster token
		 * @param {object} [mPropertyBag.preview] Preview data provided within the asyn hints
		 * @param {string} [mPropertyBag.preview.reference] Reference of the base application for building the preview request
		 * @param {sap.ui.fl.Layer} [mPropertyBag.preview.maxLayer] Limit to which layer the preview data has to be requested
		 * @param {boolean} [mPropertyBag.allContexts] Includes also restricted context
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 * or resolves with undefined in case cache bustering determines that no data is present
		 */
		loadFlexData: function(mPropertyBag) {
			if (mPropertyBag.cacheKey === "<NO CHANGES>") {
				return Promise.resolve();
			}

			var mParameters = {};
			if (mPropertyBag.allContexts) {
				mParameters["allContexts"] = mPropertyBag.allContexts;
			}
			this._addClientInfo(mParameters);
			Utils.addSAPLogonLanguageInfo(mParameters);
			var sAppDescriptorId;
			if (mPropertyBag.appDescriptor && mPropertyBag.appDescriptor["sap.app"]) {
				sAppDescriptorId = mPropertyBag.appDescriptor["sap.app"].id;
			}

			if (mPropertyBag.preview) {
				// IDE may show a preview where only references in a lower app variant hierarchy are known by the back end
				mPropertyBag.reference = mPropertyBag.preview.reference;
				// higher layers are served by other connectors
				mParameters.upToLayerType = mPropertyBag.preview.maxLayer;
			}

			var sDataUrl = Utils.getUrl(ROUTES.DATA, mPropertyBag, mParameters);
			return Utils.sendRequest(sDataUrl, "GET", {
				xsrfToken: this.xsrfToken,
				siteId: mPropertyBag.siteId,
				sAppDescriptorId: sAppDescriptorId
			}).then(function (oResult) {
				var oResponse = oResult.response;
				if (oResult.xsrfToken) {
					this.xsrfToken = oResult.xsrfToken;
				}
				if (oResult.etag) {
					oResponse.cacheKey = oResult.etag;
				} else if (mPropertyBag.cacheKey) {
					oResponse.cacheKey = mPropertyBag.cacheKey;
				}
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				if (oResponse.settings) {
					this.settings = oResponse.settings;
					this.settings.isVariantAdaptationEnabled = !!this.settings.isPublicLayerAvailable;
				}
				if (!oResponse.loadModules) {
					return oResponse;
				}

				var sModulesUrl = Utils.getUrl(ROUTES.MODULES, mPropertyBag, mParameters);
				return this._loadModules(sModulesUrl).then(function () {
					return oResponse;
				});
			}.bind(this));
		}
	};
});
