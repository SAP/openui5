/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/base/security/encodeURLParameters",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/internal/connectors/Utils",
	"sap/ui/fl/Utils"
], function(
	merge,
	encodeURLParameters,
	BaseConnector,
	ApplyUtils,
	FlexUtils
) {
	"use strict";

	var ROUTES = {
		DATA: "/flex/data/",
		MODULES: "/flex/modules/"
	};

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
			var mParameters = {
				appVersion: mPropertyBag.appVersion
			};

			var sClient = FlexUtils.getUrlParameter("sap-client");

			sClient && (mParameters["sap-client"] = sClient);

			var sDataUrl = ApplyUtils.getUrl(ROUTES.DATA, mPropertyBag, mParameters);
			return ApplyUtils.sendRequest(sDataUrl).then(function (oResponse) {
				// TODO(when the cacheKey calculation implementation happens): see that the etag / cacheKey is handled accordingly

				if (!oResponse.loadModules) {
					return oResponse;
				}

				var sModulesUrl = ApplyUtils.getUrl(ROUTES.MODULES, mPropertyBag, mParameters);
				return ApplyUtils.sendRequest(sModulesUrl).then(function () {
					return oResponse;
				});
			});
		}
	});

	return LrepConnector;
}, true);
