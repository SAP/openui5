/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/restricted/_pick",
	"sap/ui/dom/includeScript",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/interfaces/BaseLoadConnector",
	"sap/ui/fl/Utils"
], function(
	merge,
	_pick,
	includeScript,
	Utils,
	BaseConnector,
	FlexUtils
) {
	"use strict";

	const ROUTES = {
		DATA: "/flex/data/",
		MODULES: "/flex/modules/",
		SETTINGS: "/flex/settings",
		VARIANTS_AUTHORS: "/variants/authors/"
	};

	let _mFlexDataParameters = {};

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.LrepConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.67
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage, sap.ui.fl.write._internal.transport
	 */
	return merge({}, BaseConnector, {
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
		 _loadModules(sFlexModulesUri) {
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
		_addClientInfo(mParameters) {
			var sClient = FlexUtils.getUrlParameter("sap-client");
			if (!mParameters && sClient) {
				mParameters = {};
			}
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}
		},

		/**
		 * Called to get the flex features.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures(mPropertyBag) {
			if (this.settings) {
				return Promise.resolve(this.settings);
			}
			var mParameters = {};

			this._addClientInfo(mParameters);

			var sFeaturesUrl = Utils.getUrl(ROUTES.SETTINGS, mPropertyBag, mParameters);
			return Utils.sendRequest(sFeaturesUrl, "GET", {initialConnector: this}).then(function(oResult) {
				oResult.response.isVariantAdaptationEnabled = !!oResult.response.isPublicLayerAvailable;
				oResult.response.isContextSharingEnabled = true;
				oResult.response.isLocalResetEnabled = true;
				return oResult.response;
			});
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
		 * @param {string} [mPropertyBag.version] Version to be loaded
		 * @param {string} [mPropertyBag.adaptationId] - Context-based adaptation to be loaded
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 * or resolves with undefined in case cache bustering determines that no data is present
		 */
		loadFlexData(mPropertyBag) {
			if (mPropertyBag.cacheKey === "<NO CHANGES>") {
				return Promise.resolve();
			}

			var mParameters = _pick(mPropertyBag, ["version", "allContexts", "adaptationId"]);
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

			// Store parameters for possible subsequence GET variants' authors names request
			_mFlexDataParameters = mParameters;

			var sDataUrl = Utils.getUrl(ROUTES.DATA, mPropertyBag, mParameters);
			return Utils.sendRequest(sDataUrl, "GET", {
				initialConnector: this,
				xsrfToken: this.xsrfToken,
				siteId: mPropertyBag.siteId,
				cacheable: true,
				sAppDescriptorId
			}).then(function(oResult) {
				var oResponse = oResult.response;
				if (oResult.etag) {
					oResponse.cacheKey = oResult.etag;
				} else if (mPropertyBag.cacheKey) {
					oResponse.cacheKey = mPropertyBag.cacheKey;
				}
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				if (oResponse.settings) {
					this.settings = oResponse.settings;
					this.settings.isVariantAdaptationEnabled = !!this.settings.isPublicLayerAvailable;
					this.settings.isContextSharingEnabled = true;
					this.settings.isLocalResetEnabled = true;
				}
				if (!oResponse.loadModules) {
					return oResponse;
				}

				var sModulesUrl = Utils.getUrl(ROUTES.MODULES, mPropertyBag, mParameters);
				return this._loadModules(sModulesUrl).then(function() {
					return oResponse;
				});
			}.bind(this));
		},

		/**
		 * Get full names of variants' authors.
		 *
		 * @param {object} mPropertyBag Property bag
		 * @param {string} mPropertyBag.url Configured URL for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @returns {Promise<object>} Promise resolves with an object containing maps of variants' IDs and their names
		 */
		loadVariantsAuthors(mPropertyBag) {
			const sVariantsAuthorsUrl = Utils.getUrl(ROUTES.VARIANTS_AUTHORS, mPropertyBag, _mFlexDataParameters);
			return Utils.sendRequest(sVariantsAuthorsUrl, "GET", {initialConnector: this}).then(function(oResult) {
				return oResult.response;
			});
		}
	});
});
