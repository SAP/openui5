/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/_internal/connectors/ObjectStorageConnector"
], function(
	merge,
	ObjectStorageConnector
) {
	"use strict";

	/**
	 * Connector for saving data to the <code>window.SessionStorage</code>.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.SessionStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var SessionStorageConnector = merge({}, ObjectStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.SessionStorageConnector */ {
		oStorage: window.sessionStorage
	});

	return SessionStorageConnector;
});
