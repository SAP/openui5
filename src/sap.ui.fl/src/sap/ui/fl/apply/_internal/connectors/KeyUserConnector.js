/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils"
], function(
	merge,
	BaseConnector,
	ApplyUtils
) {
	"use strict";

	var API_VERSION = "/v1";
	var ROUTES = {
		DATA: "/data/",
		SETTINGS: "/settings"
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

		/**
		 * Loads the data from the KeyUser service
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url configured url for the connector
		 * @param {string} mPropertyBag.reference flexibility reference
		 * @param {string} [mPropertyBag.appVersion] version of the application
		 * @param {string} [mPropertyBag.cacheKey] cache buster token
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData : function(mPropertyBag) {
			var mParameters = ApplyUtils.getSubsetOfObject(mPropertyBag, ["appVersion"]);

			var sDataUrl = ApplyUtils.getUrl(API_VERSION + ROUTES.DATA, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl, "GET", { token : this.sXsrfToken }).then(function (oResult) {
				// TODO(when the cacheKey calculation implementation happens): see that the etag / cacheKey is handled accordingly
				var oResponse = oResult.response;
				if (oResult.token) {
					this.sXsrfToken = oResult.token;
				}
				return oResponse;
			}.bind(this));
		}
	});

	return KeyUserConnector;
}, true);