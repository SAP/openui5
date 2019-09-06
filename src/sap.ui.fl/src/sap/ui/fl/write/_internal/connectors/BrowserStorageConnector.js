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
			BrowserStorageUtils.forEachChangeInStorage({
				storage: this.oStorage,
				reference: mPropertyBag.reference,
				layer: mPropertyBag.layer
			}, function(mFlexObject) {
				var bDelete = true;

				if (mPropertyBag.selectorIds) {
					if (mFlexObject.changeDefinition.selector) {
						bDelete = mPropertyBag.selectorIds.indexOf(mFlexObject.changeDefinition.selector.id) > -1;
					} else {
						bDelete = false;
					}
				}

				if (bDelete && mPropertyBag.changeTypes) {
					bDelete = mPropertyBag.changeTypes.indexOf(mFlexObject.changeDefinition.changeType) > -1;
				}

				if (bDelete) {
					this.oStorage.removeItem(mFlexObject.key);
				}
			}.bind(this));

			return Promise.resolve();
		}
	});

	return BrowserStorageConnector;
}, true);
