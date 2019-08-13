/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/internal/connectors/BrowserStorageConnector"
], function(
	merge,
	BrowserStorageConnector
) {
	"use strict";

	/**
	 * Connector for saving data to the <code>window.SessionStorage</code>.
	 *
	 * @namespace sap.ui.fl.write.internal.connectors.SessionStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @ui5-restricted sap.ui.fl.write.internal.Connector
	 */
	var SessionStorageConnector = merge({}, BrowserStorageConnector, /** @lends sap.ui.fl.write.internal.connectors.SessionStorageConnector */ {
		oStorage: window.sessionStorage
	});

	return SessionStorageConnector;
}, true);
