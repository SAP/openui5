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
			VERSIONS: {
				GET: PREFIX + API_VERSION + "/versions/",
				ACTIVATE: PREFIX + API_VERSION + "/versions/draft/activate/"

			}
		}
	});

	KeyUserConnector.versions = {
		load: function (mPropertyBag) {
			var sVersionsUrl = ApplyUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.GET, mPropertyBag);
			return ApplyUtils.sendRequest(sVersionsUrl).then(function (oResult) {
				return oResult.response;
			});
		},

		activateDraft: function (mPropertyBag) {
			var sVersionsUrl = ApplyUtils.getUrl(KeyUserConnector.ROUTES.VERSIONS.ACTIVATE, mPropertyBag);
			return ApplyUtils.sendRequest(sVersionsUrl, "POST").then(function (oResult) {
				return oResult.response;
			});
		}

	};

	KeyUserConnector.applyConnector = ApplyConnector;
	return KeyUserConnector;
}, true);
