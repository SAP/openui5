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

	var oMyStorage = {
		_items: {},
		setItem: function(sKey, vValue) {
			oMyStorage._items[sKey] = vValue;
		},
		removeItem: function(sKey) {
			delete oMyStorage._items[sKey];
		},
		clear: function() {
			oMyStorage._items = {};
		},
		getItem: function(sKey) {
			return oMyStorage._items[sKey];
		},
		getItems: function() {
			return oMyStorage._items;
		}
	};

	/**
	 * Connector that retrieves data from an internal object.
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.JsObjectConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Connector
	 */
	var JsObjectConnector = merge({}, BrowserStorageConnector, /** @lends sap.ui.fl.apply._internal.connectors.JsObjectConnector */ {
		oStorage: oMyStorage
	});

	return JsObjectConnector;
}, true);
