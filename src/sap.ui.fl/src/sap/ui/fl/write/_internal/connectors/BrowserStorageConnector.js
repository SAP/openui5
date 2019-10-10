/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils"
], function(
	merge,
	BaseConnector,
	BrowserStorageUtils
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
	 * @namespace sap.ui.fl.write._internal.connectors.BrowserStorageConnector
	 * @extends sap.ui.fl.write.connectors.BaseConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var BrowserStorageConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write._internal.connectors.BrowserStorageConnector */ {
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
				var sChangeKey = BrowserStorageUtils.createFlexObjectKey(oFlexObject);
				var sChange;
				sChange = JSON.stringify(oFlexObject);
				var oSetPromise = this.oStorage.setItem(sChangeKey, sChange);
				// ensure a Promise
				return Promise.resolve(oSetPromise);
			}.bind(this));

			return Promise.all(aPromises).then(function () {
				// return nothing
			});
		},

		/**
		 * @inheritDoc
		 */
		update: function(mPropertyBag) {
			var sChangeKey = BrowserStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			var sChange = JSON.stringify(mPropertyBag.flexObject);
			var oSetPromise = this.oStorage.setItem(sChangeKey, sChange);
			// ensure a Promise
			return Promise.resolve(oSetPromise);
		},

		/**
		 * @inheritDoc
		 */
		reset: function(mPropertyBag) {
			return BrowserStorageUtils.forEachObjectInStorage({
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
			var sChangeKey = BrowserStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			this.oStorage.removeItem(sChangeKey);
			var oRemovePromise = this.oStorage.removeItem(sChangeKey);
			// ensure a Promise
			return Promise.resolve(oRemovePromise);
		},

		/**
		 * @inheritDoc
		 */
		loadFeatures: function() {
			return Promise.resolve({});
		},

		/**
		 * @inheritDoc
		 */
		getFlexInfo: function(mPropertyBag) {
			mPropertyBag.storage = this.oStorage;
			return BrowserStorageUtils.getAllFlexObjects(mPropertyBag).then(function (aFlexObjects) {
				return {
					isResetEnabled: aFlexObjects.length > 0
				};
			});
		}
	});

	return BrowserStorageConnector;
}, true);
