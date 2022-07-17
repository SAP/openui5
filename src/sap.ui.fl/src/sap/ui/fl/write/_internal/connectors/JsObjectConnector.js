/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/api/connectors/ObjectStorageConnector"
], function(
	merge,
	ObjectStorageConnector
) {
	"use strict";

	var oMyStorage = {
		_itemsStoredAsObjects: true,
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
	 * Connector that saves the data in an internal object.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.JsObjectConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var JsObjectConnector = merge({}, ObjectStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.JsObjectConnector */ {
		storage: oMyStorage
	});

	JsObjectConnector.loadFeatures = function() {
		return ObjectStorageConnector.loadFeatures.apply(this, arguments).then(function(oFeatures) {
			return merge({
				isPublicLayerAvailable: true,
				isVariantAdaptationEnabled: true
			}, oFeatures);
		});
	};

	return JsObjectConnector;
});
