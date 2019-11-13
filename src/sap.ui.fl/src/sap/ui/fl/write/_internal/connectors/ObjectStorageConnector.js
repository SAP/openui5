/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"
], function(
	merge,
	BaseConnector,
	ObjectStorageUtils
) {
	"use strict";

	function shouldChangeBeDeleted(mPropertyBag, oChangeDefinition) {
		var bDelete = true;

		if (mPropertyBag.selectorIds) {
			if (oChangeDefinition.selector) {
				bDelete = mPropertyBag.selectorIds.indexOf(oChangeDefinition.selector.id) > -1;
			} else {
				bDelete = false;
			}
		}

		if (bDelete && mPropertyBag.changeTypes) {
			bDelete = mPropertyBag.changeTypes.indexOf(oChangeDefinition.changeType) > -1;
		}

		return bDelete;
	}

	/**
	 * Base Connector for requesting data from session or local storage
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.ObjectStorageConnector
	 * @extends sap.ui.fl.write.connectors.BaseConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var ObjectStorageConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.ObjectStorageConnector */ {
		/**
		 * can be either window.sessionStorage or window.localStorage or just a JS map
		 */
		oStorage: undefined,

		layers: ["ALL"],

		/**
		 * @inheritDoc
		 */
		write: function(mPropertyBag) {
			var aPromises = mPropertyBag.flexObjects.map(function(oFlexObject) {
				var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
				var vFlexObject = this.oStorage._itemsStoredAsObjects ? oFlexObject : JSON.stringify(oFlexObject);
				return this.oStorage.setItem(sKey, vFlexObject);
			}.bind(this));

			return Promise.all(aPromises).then(function () {
				// return nothing
			});
		},

		/**
		 * @inheritDoc
		 */
		update: function(mPropertyBag) {
			var oFlexObject = mPropertyBag.flexObject;
			var sKey = ObjectStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			var vFlexObject = this.oStorage._itemsStoredAsObjects ? oFlexObject : JSON.stringify(oFlexObject);
			var vSetResponse = this.oStorage.setItem(sKey, vFlexObject);
			// ensure a Promise
			return Promise.resolve(vSetResponse);
		},

		/**
		 * @inheritDoc
		 */
		reset: function(mPropertyBag) {
			return ObjectStorageUtils.forEachObjectInStorage({
				storage: this.oStorage,
				reference: mPropertyBag.reference,
				layer: mPropertyBag.layer
			}, function(mFlexObject) {
				if (shouldChangeBeDeleted(mPropertyBag, mFlexObject.changeDefinition)) {
					return this.oStorage.removeItem(mFlexObject.key);
				}
			}.bind(this));
		},

		/**
		 * @inheritDoc
		 */
		remove: function(mPropertyBag) {
			var sKey = ObjectStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			this.oStorage.removeItem(sKey);
			var vRemoveResponse = this.oStorage.removeItem(sKey);
			// ensure a Promise
			return Promise.resolve(vRemoveResponse);
		},

		/**
		 * @inheritDoc
		 */
		loadFeatures: function() {
			return Promise.resolve({
				isKeyUser: true,
				isVariantSharingEnabled: true
			});
		},

		/**
		 * @inheritDoc
		 */
		getFlexInfo: function(mPropertyBag) {
			mPropertyBag.storage = this.oStorage;
			return ObjectStorageUtils.getAllFlexObjects(mPropertyBag).then(function (aFlexObjects) {
				return {
					isResetEnabled: aFlexObjects.length > 0
				};
			});
		}
	});

	return ObjectStorageConnector;
});
