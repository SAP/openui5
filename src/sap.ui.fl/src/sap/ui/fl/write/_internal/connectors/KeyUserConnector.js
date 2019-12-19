/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/BackendConnector",
	"sap/ui/fl/apply/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/apply/_internal/connectors/Utils",
	"sap/ui/fl/Layer"
], function(
	merge,
	BackendConnector,
	ApplyConnector,
	ApplyUtils,
	Layer
) {
	"use strict";

	var PREFIX = "/flex/keyuser";
	var API_VERSION = "/v1";

	/**
	 * Connector for saving and deleting data from SAPUI5 Flexibility KeyUser service.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.KeyUserConnector
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var KeyUserConnector = merge({}, BackendConnector, /** @lends sap.ui.fl.write._internal.connectors.KeyUserConnector */ {
		layers: [
			Layer.CUSTOMER
		],
		ROUTES: {
			CHANGES: PREFIX + API_VERSION + "/changes/",
			SETTINGS: PREFIX + API_VERSION + "/settings",
			TOKEN: PREFIX + API_VERSION + "/settings",
			VERSIONS: PREFIX + API_VERSION + "/versions/"
		}
	});

	/**
	 * Called to get the versions.
	 *
	 * @return {Promise<object>} Promise resolves with an list of the versions
	 */
	KeyUserConnector.loadVersions = function (mPropertyBag) {
		var sVersionsUrl = ApplyUtils.getUrl(this.ROUTES.VERSIONS, mPropertyBag);
		return ApplyUtils.sendRequest(sVersionsUrl).then(function (oResult) {
			return oResult.response;
		});
	};

	KeyUserConnector.applyConnector = ApplyConnector;
	return KeyUserConnector;
}, true);
