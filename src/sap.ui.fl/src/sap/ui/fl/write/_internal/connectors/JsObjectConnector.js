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
		setItem(sKey, vValue) {
			oMyStorage._items[sKey] = vValue;
		},
		removeItem(sKey) {
			delete oMyStorage._items[sKey];
		},
		clear() {
			oMyStorage._items = {};
		},
		getItem(sKey) {
			return oMyStorage._items[sKey];
		},
		getItems() {
			return oMyStorage._items;
		}
	};

	/**
	 * Connector that saves the data in an internal object.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.JsObjectConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
	 */
	var JsObjectConnector = merge({}, ObjectStorageConnector, /** @lends sap.ui.fl.write._internal.connectors.JsObjectConnector */ {
		storage: oMyStorage
	});

	JsObjectConnector.loadFeatures = function(...aArgs) {
		return ObjectStorageConnector.loadFeatures.apply(this, aArgs)
		.then(function(oFeatures) {
			return merge({
				isPublicLayerAvailable: true,
				isVariantAdaptationEnabled: true
			}, oFeatures);
		});
	};

	return JsObjectConnector;
});
