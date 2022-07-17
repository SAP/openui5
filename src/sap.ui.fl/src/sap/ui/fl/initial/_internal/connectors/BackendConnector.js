/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick"
], function(
	InitialUtils,
	_pick
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
	return {
		xsrfToken: undefined,
		settings: undefined,
		/**
		 * Loads flexibility data from a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.version] Version of the adaptation to be loaded
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function(mPropertyBag) {
			var mParameters = _pick(mPropertyBag, ["version"]);

			if (this.isLanguageInfoRequired) {
				InitialUtils.addLanguageInfo(mParameters);
			}
			var sDataUrl = InitialUtils.getUrl(this.ROUTES.DATA, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sDataUrl, "GET", { xsrfToken: this.xsrfToken}).then(function (oResult) {
				var oResponse = oResult.response;
				if (oResult.xsrfToken) {
					this.xsrfToken = oResult.xsrfToken;
				}
				if (oResult.etag) {
					oResponse.cacheKey = oResult.etag;
				}
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				if (oResponse.settings) {
					this.settings = oResponse.settings;
				}
				return oResponse;
			}.bind(this));
		}
	};
});