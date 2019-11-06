/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageConnector"
], function(
	merge,
	ObjectStorageConnector
) {
	"use strict";

	/**
	 * Connector for requesting data from <code>window.localStorage</code>.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.LocalStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Connector, sap.ui.fl.write._internal.Connector
	 */
	var LocalStorageConnector = merge({}, ObjectStorageConnector, /** @lends sap.ui.fl.apply._internal.connectors.LocalStorageConnector */ {
		oStorage: window.localStorage
	});

	return LocalStorageConnector;
}, true);
