/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/Utils",
	"sap/ui/dom/includeScript",
	"sap/base/util/restricted/_pick"
], function(
	Utils,
	FlexUtils,
	includeScript,
	_pick
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
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @param {object} [mPropertyBag.appDescriptor] Manifest that belongs to actual component
		 * @param {string} [mPropertyBag.siteId] <code>sideId</code> that belongs to actual component
		 * @param {string} [mPropertyBag.cacheKey] Cache buster token
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 * or resolves with undefined in case cache bustering determines that no data is present
		 */
		loadFlexData: function(mPropertyBag) {
			if (mPropertyBag.cacheKey === "<NO CHANGES>") {
				return Promise.resolve();
			}

			var mParameters = _pick(mPropertyBag, ["appVersion"]);
			this._addClientInfo(mParameters);
			Utils.addLanguageInfo(mParameters);
			var sAppDescriptorId;
			if (mPropertyBag.appDescriptor && mPropertyBag.appDescriptor["sap.app"]) {
				sAppDescriptorId = mPropertyBag.appDescriptor["sap.app"].id;
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
