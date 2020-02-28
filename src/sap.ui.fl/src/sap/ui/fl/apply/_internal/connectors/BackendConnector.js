/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick"
], function(
	merge,
	BaseConnector,
	ApplyUtils,
	_pick
) {
	"use strict";

	/**
	 * Base connector for requesting flexibility data from a back end.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.BackendConnector
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.connectors, sap.ui.fl.write._internal.connectors
	 */
	var BackendConnector = merge({}, BaseConnector, { /** @lends sap.ui.fl.apply.api._internal.connectors.BackendConnector */

		xsrfToken: undefined,
		settings: undefined,
		/**
		 * Loads flexibility data from a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.draftLayer] Layer for which a draft should be loaded
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function(mPropertyBag) {
			var mParameters = _pick(mPropertyBag, ["appVersion"]);

			if (mPropertyBag.draftLayer) {
				mParameters.version = "0";
			}

			var sDataUrl = ApplyUtils.getUrl(this.ROUTES.DATA, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "GET", { xsrfToken: this.xsrfToken}).then(function (oResult) {
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
	});

	return BackendConnector;
}, true);