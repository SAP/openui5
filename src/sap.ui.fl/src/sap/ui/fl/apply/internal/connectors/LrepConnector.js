/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/security/encodeURLParameters",
	"sap/base/util/UriParameters",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/internal/connectors/Utils"
], function(
	merge,
	encodeURLParameters,
	UriParameters,
	BaseConnector,
	ApplyUtils
) {
	"use strict";

	var ROUTES = {
		DATA: "/flex/data/",
		MODULES: "/flex/modules/"
	};


	/**
	 * Returns the tenant number for the communication with the ABAP back end.
	 *
	 * @private
	 * @function
	 * @returns {string} the current client
	 * @name sap.ui.fl.Utils.getClient
	 */
	function getClient () {
		var oUriParameter = UriParameters.fromQuery(window.location.search);
		var sClient = oUriParameter.get("sap-client");
		return sClient || undefined;
	}

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.apply.connectors.LrepConnector
	 * @experimental Since 1.67
	 * @since 1.67
	 * @ui5-restricted sap.ui.fl.write.internal.Connector
	 */
	var LrepConnector = merge({}, BaseConnector,  /** @lends sap.ui.fl.apply.internal.connectors.LrepConnector */ {

		/**
		 * Loads the data from the back end and triggers a second request for modules in case the back end responses with
		 * a flag that such modules are present.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.appVersion Version of the application
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.cacheKey] Cache-Buster token
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function (mPropertyBag) {
			var mParameters = {};

			var sClient = getClient();
			if (sClient) {
				mParameters["sap-client"] = sClient;
			}

			var sDataUrl = ApplyUtils.getUrlWithQueryParameters(ROUTES.DATA, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl).then(function (oResponse) {
				// TODO(when the cacheKey calculation implementation happens): see that the etag / cacheKey is handled accordingly

				if (!oResponse.loadModules) {
					return oResponse;
				}

				var sModulesUrl = ApplyUtils.getUrlWithQueryParameters(ROUTES.MODULES, mPropertyBag, mParameters);
				return ApplyUtils.sendRequest(sModulesUrl).then(function () {
					return oResponse;
				});
			});
		}
	});

	return LrepConnector;
}, true);
