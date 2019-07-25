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
	ApplyUtils
) {
	"use strict";

	var ROUTES = {
		FLEX_DATA: "/flex/data/"
	};

	/**
	 * Connector for requesting data from an LRep based back end.
	 *
	 * @namespace sap.ui.fl.apply.connectors.PersonalizationConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @version ${version}
	 * @private
	 */
	var PersonalizationConnector = merge({}, BaseConnector, { /** @lends sap.ui.fl.apply.internal.connectors.PersonalizationConnector */

		/**
		 * Loads the data from the back end
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} [mPropertyBag.appVersion] Version of the application
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function (mPropertyBag) {
			var sDataUrl = ApplyUtils.getUrlWithQueryParameters(ROUTES.FLEX_DATA, mPropertyBag);
			return ApplyUtils.sendRequest(sDataUrl);
		}
	});

	return PersonalizationConnector;
}, true);