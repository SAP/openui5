/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/api/connectors/ObjectStorageConnector"
], function(
	merge,
	PublicObjectStorageConnector
) {
	"use strict";

	/**
	 * Base Connector for requesting data from session or local storage
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.ObjectStorageConnector
	 * @since 1.70
	 * @deprecated
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var ObjectStorageConnector = merge({}, PublicObjectStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.ObjectStorageConnector */ {
		oStorage: undefined
	});

	ObjectStorageConnector.storage = ObjectStorageConnector.oStorage;

	return ObjectStorageConnector;
});
