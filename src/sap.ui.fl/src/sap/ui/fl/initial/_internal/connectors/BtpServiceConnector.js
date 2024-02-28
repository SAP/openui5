/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/Layer"
], function(
	merge,
	KeyUserConnector,
	Layer
) {
	"use strict";

	var PREFIX = "/flex/all";
	var API_VERSION = "/v3";
	const ROOT = `${PREFIX}/${API_VERSION}`;

	/**
	 * Connector for requesting all data from SAPUI5 Flexibility KeyUser service - including personalization.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.BtpServiceConnector
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	const BtpServiceConnector = merge({}, KeyUserConnector, {
		/** @lends sap.ui.fl.initial._internal.connectors.BtpServiceConnector */
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],
		ROOT,
		ROUTES: {
			DATA: `${ROOT}/data`,
			SETTINGS: `${ROOT}/settings`
		}
	});

	return BtpServiceConnector;
});