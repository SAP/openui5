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

	ObjectStorageConnector.storage = ObjectStorageConnector.oStorage;

	return ObjectStorageConnector;
});
