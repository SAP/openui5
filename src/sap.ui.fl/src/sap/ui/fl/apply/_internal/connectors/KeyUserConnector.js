/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/connectors/BackendConnector",
	"sap/ui/fl/Layer"
], function(
	merge,
	BackendConnector,
	Layer
) {
	"use strict";

	var PREFIX = "/flex/keyuser";
	var API_VERSION = "/v1";

	/**
	 * Connector for requesting data from SAPUI5 Flexibility KeyUser service.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.KeyUserConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	var KeyUserConnector = merge({}, BackendConnector, { /** @lends sap.ui.fl.apply.api._internal.connectors.KeyUserConnector */
		layers: [
			Layer.CUSTOMER
		],
		ROUTES: {
			DATA: PREFIX + API_VERSION + "/data/"
		}
	});

	return KeyUserConnector;
}, true);