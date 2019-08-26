/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageConnector"
], function(
	merge,
	BrowserStorageConnector
) {
	"use strict";

	/**
	 * Connector for requesting data from <code>window.sessionStorage</code>.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.SessionStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Connector, sap.ui.fl.write._internal.Connector
	 */
	var SessionStorageConnector = merge({}, BrowserStorageConnector, /** @lends sap.ui.fl.apply._internal.connectors.SessionStorageConnector */ {
		oStorage: window.sessionStorage
	});

	return SessionStorageConnector;
}, true);
