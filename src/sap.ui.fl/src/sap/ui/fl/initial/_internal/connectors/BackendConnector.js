/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/util/restricted/_pick",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/interfaces/BaseLoadConnector"
], function(
	merge,
	_pick,
	InitialUtils,
	BaseConnector
) {
	"use strict";

	/**
	 * Base connector for requesting flexibility data from a back end.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.BackendConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.connectors, sap.ui.fl.write._internal.connectors
	 */
	const BackendConnector = merge({}, BaseConnector, {
		xsrfToken: undefined,
		settings: undefined,
		/**
		 * Sends request to a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.version] Version of the adaptation to be loaded
		 * @param {boolean} [mPropertyBag.cacheable] <code>true</code> if the request can be cached in browsers
		 * @returns {Promise<object>} Promise resolving with the raw JSON parsed server response of the flex data request
		 */
		sendRequest(mPropertyBag) {
			var mParameters = _pick(mPropertyBag, ["version", "allContexts"]);

			if (this.isLanguageInfoRequired) {
				InitialUtils.addLanguageInfo(mParameters);
			}
			var sDataUrl = InitialUtils.getUrl(this.ROUTES.DATA, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sDataUrl, "GET", {
				initialConnector: this,
				xsrfToken: this.xsrfToken,
				cacheable: mPropertyBag.cacheable}
			).then(function(oResult) {
				var oResponse = oResult.response;
				if (oResult.etag) {
					oResponse.cacheKey = oResult.etag;
				}
				if (oResponse.settings) {
					this.settings = oResponse.settings;
				}
				return oResponse;
			}.bind(this));
		},

		/**
		 * Called to get the flex features.
		 * @param {object} mPropertyBag - Property bag
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures(mPropertyBag) {
			if (this.settings) {
				return Promise.resolve({response: this.settings});
			}
			var sFeaturesUrl = InitialUtils.getUrl(this.ROUTES.SETTINGS, mPropertyBag);
			return InitialUtils.sendRequest(sFeaturesUrl, "GET", {initialConnector: this}).then(function(oResult) {
				return oResult.response;
			});
		},

		/**
		 * Loads flexibility data from a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.version] Version of the adaptation to be loaded
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData(mPropertyBag) {
			mPropertyBag.cacheable = true;
			return this.sendRequest(mPropertyBag).then(function(oResponse) {
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				return oResponse;
			});
		}
	});

	return BackendConnector;
});