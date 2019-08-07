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
	 * Connector for saving data to the <code>window.localStorage</code>.
	 *
	 * @namespace sap.ui.fl.write.internal.connectors.LocalStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @ui5-restricted sap.ui.fl.write.internal.Connector
	 */
	var LocalStorageConnector = merge({}, BrowserStorageConnector, /** @lends sap.ui.fl.write.internal.connectors.LocalStorageConnector */ {
		oStorage: window.localStorage
	});

	return LocalStorageConnector;
}, true);
