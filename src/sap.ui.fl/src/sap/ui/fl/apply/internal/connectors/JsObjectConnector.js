/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/internal/connectors/BrowserStorageConnector"
], function(
	merge,
	BrowserStorageConnector
) {
	"use strict";

	var oMyStorage = {
		_items: {},
		setItem: function(sKey, vValue) {
			this._items[sKey] = vValue;
		},
		clear: function() {
			this._items = {};
		},
		getItem: function(sKey) {
			return this._items[sKey];
		}
	};

	/**
	 * Connector that retrieves data from an internal object.
	 *
	 * @namespace sap.ui.fl.apply.internal.connectors.JsObjectConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @ui5-restricted sap.ui.fl.apply.internal.Connector
	 */
	var JsObjectConnector = merge({}, BrowserStorageConnector, /** @lends sap.ui.fl.apply.internal.connectors.JsObjectConnector */ {
		oStorage: oMyStorage
	});

	return JsObjectConnector;
}, true);
