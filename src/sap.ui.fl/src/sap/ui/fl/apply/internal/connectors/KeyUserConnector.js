/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/internal/connectors/Utils"
], function(
	merge,
	BaseConnector,
	Utils
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
	 * @namespace sap.ui.fl.apply.connectors.KeyUserConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @ui5-restricted sap.ui.fl.write.internal.connectors.KeyUserConnector
	 */
	var KeyUserConnector = merge({}, BaseConnector, { /** @lends sap.ui.fl.apply.api.connectors.KeyUserConnector */

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
			var mParameters = {};
			mPropertyBag.appVersion && (mParameters.appVersion = mPropertyBag.appVersion);

			var sDataUrl = Utils.getUrl(API_VERSION + ROUTES.DATA, mPropertyBag, mParameters);
			return Utils.sendRequest(sDataUrl);
		}
	});

	return KeyUserConnector;
}, true);