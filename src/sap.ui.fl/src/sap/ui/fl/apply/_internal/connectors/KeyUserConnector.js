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

	var PREFIX = "/flex/keyuser";
	var API_VERSION = "/v1";
	var ROUTES = {
		DATA: PREFIX + API_VERSION + "/data/"
	};

	/**
	 * Connector for requesting data from SAPUI5 Flexibility KeyUser service.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.KeyUserConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var KeyUserConnector = merge({}, BaseConnector, { /** @lends sap.ui.fl.apply.api._internal.connectors.KeyUserConnector */

		xsrfToken: undefined,

		/**
		 * Loads the data from the KeyUser service
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @param {string} [mPropertyBag.cacheKey] Cache buster token
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function(mPropertyBag) {
			var mParameters = _pick(mPropertyBag, ["appVersion"]);

			var sDataUrl = ApplyUtils.getUrl(ROUTES.DATA, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "GET", { xsrfToken: this.xsrfToken }).then(function (oResult) {
				var oResponse = oResult.response;
				if (oResult.xsrfToken) {
					this.xsrfToken = oResult.xsrfToken;
				}
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				return oResponse;
			}.bind(this));
		}
	});

	return KeyUserConnector;
}, true);