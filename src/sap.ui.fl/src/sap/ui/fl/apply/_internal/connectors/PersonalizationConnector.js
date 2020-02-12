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

	var PREFIX = "/flex/personalization";
	var API_VERSION = "/v1";

	/**
	 * Connector for requesting data from SAPUI5 Flexibility Personalization service.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.PersonalizationConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	var PersonalizationConnector = merge({}, BackendConnector, { /** @lends sap.ui.fl.apply._internal.connectors.PersonalizationConnector */
		layers: [
			Layer.USER
		],
		ROUTES: {
			DATA: PREFIX + API_VERSION + "/data/"
		}
	});

	return PersonalizationConnector;
}, true);