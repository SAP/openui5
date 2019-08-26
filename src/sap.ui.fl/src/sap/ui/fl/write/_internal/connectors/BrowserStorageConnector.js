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

		/**
		 * @inheritDoc
		 */
		write: function(mPropertyBag) {
			mPropertyBag.flexObjects.forEach(function(mFlexObject) {
				var sId = mFlexObject.fileName;
				var sChangeKey;
				var sChange;
				if (mFlexObject.fileType === "ctrl_variant" && mFlexObject.variantManagementReference) {
					sChangeKey = BrowserStorageUtils.createVariantKey(sId);
				} else {
					sChangeKey = BrowserStorageUtils.createChangeKey(sId);
				}
				sChange = JSON.stringify(mFlexObject);
				this.oStorage.setItem(sChangeKey, sChange);
			}.bind(this));
			return Promise.resolve();
		},

		/**
		 * @inheritDoc
		 */
		reset: function(mPropertyBag) {
			//TODO implement other selectors
			if (mPropertyBag.changeTypes) {
				BrowserStorageUtils.forEachChangeInStorage(function(sKey) {
					var mChange = JSON.parse(this.oStorage.getItem(sKey));
					if (mPropertyBag.changeTypes) {
						if (mPropertyBag.changeTypes.indexOf(mChange.changeType) !== -1) {
							this.oStorage.removeItem(sKey);
						}
					}
				});
			} else {
				this.oStorage.clear();
			}
		}
	});

	return BrowserStorageConnector;
}, true);
