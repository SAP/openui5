/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/BrowserStorageConnector"
], function(
	merge,
	LocalObjectConnectorApply,
	BrowserStorageConnector
) {
	"use strict";


	/**
	 * Connector that saves the data in an internal object.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.JsObjectConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var JsObjectConnector = merge({}, BrowserStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.JsObjectConnector */ {
		oStorage: LocalObjectConnectorApply.oStorage
	});

	return JsObjectConnector;
}, true);
