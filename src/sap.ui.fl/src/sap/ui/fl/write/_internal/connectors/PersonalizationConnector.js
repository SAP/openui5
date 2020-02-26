/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/BackendConnector",
	"sap/ui/fl/apply/_internal/connectors/PersonalizationConnector"
], function(
	merge,
	BackendConnector,
	ApplyConnector
) {
	"use strict";

	var PREFIX = "/flex/personalization";
	var API_VERSION = "/v1";

	var FEATURES = {
		isProductiveSystem: true
	};

	/**
	 * Connector for communication with SAPUI5 Flexibility Personalization Service
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.PersonalizationConnector
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var PersonalizationConnector = merge({}, BackendConnector, {  /** @lends sap.ui.fl.write._internal.connectors.PersonalizationConnector */
		layers: ApplyConnector.layers,

		ROUTES: {
			CHANGES: PREFIX + API_VERSION + "/changes/",
			TOKEN: PREFIX + API_VERSION + "/actions/getcsrftoken"
		},

		/**
		 * Called to get the flex features.
		 *
		 * @returns {Promise<object>} Promise resolves with an object containing the flex features
		 */
		loadFeatures: function () {
			return Promise.resolve(FEATURES);
		}
	});

	PersonalizationConnector.applyConnector = ApplyConnector;
	return PersonalizationConnector;
}, true);
