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
	 * @ui5-restricted sap.ui.fl.write._internal.Connector
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
			mPropertyBag.flexObjects.forEach(function(oFlexObject) {
				var sChangeKey = BrowserStorageUtils.createFlexObjectKey(oFlexObject);
				var sChange;
				sChange = JSON.stringify(oFlexObject);
				this.oStorage.setItem(sChangeKey, sChange);
			}.bind(this));
			return Promise.resolve();
		},

		/**
		 * @inheritDoc
		 */
		reset: function(mPropertyBag) {
			BrowserStorageUtils.forEachChangeInStorage({
				storage: this.oStorage,
				reference: mPropertyBag.reference,
				layer: mPropertyBag.layer
			}, function(mFlexObject) {
				if (shouldChangeBeDeleted(mPropertyBag, mFlexObject.changeDefinition)) {
					this.oStorage.removeItem(mFlexObject.key);
				}
			}.bind(this));

			return Promise.resolve();
		},

		/**
		 * @inheritDoc
		 */
		remove: function(mPropertyBag) {
			var sChangeKey = BrowserStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			this.oStorage.removeItem(sChangeKey);
			return Promise.resolve();
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
			return Promise.resolve({
				isResetEnabled: BrowserStorageUtils.getAllFlexObjects(mPropertyBag).length > 0
			});
		}
	});

	return BrowserStorageConnector;
}, true);
