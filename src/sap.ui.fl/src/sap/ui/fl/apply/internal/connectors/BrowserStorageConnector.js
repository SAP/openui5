/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/internal/connectors/BrowserStorageUtils"
], function(
	merge,
	BaseConnector,
	BrowserStorageUtils
) {
	"use strict";

	/**
	 * Base Connector for requesting data from session or local storage
	 *
	 * @namespace sap.ui.fl.apply.internal.connectors.BrowserStorageConnector
	 * @experimental Since 1.70
	 * @since 1.70
	 * @ui5-restricted sap.ui.fl.write.internal.Connector, sap.ui.fl.apply.internal.Connector
	 */
	var BrowserStorageConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.apply.internal.connectors.BrowserStorageConnector */ {
		/**
		 * can be either window.sessionStorage or window.localStorage
		 */
		oStorage: undefined,

		/**
		 * Provides the flex data stored in the session or local storage;
		 * Changes can be filtered by reference and layer.
		 *
		 * @param {object} mPropertyBag properties needed by the connectors
		 * @param {string} [mPropertyBag.reference] reference of the application
		 * @param {string} [mPropertyBag.layer] layer of the changes
		 * @returns {Promise<Object>} resolving with an object containing a data contained in the changes-bundle
		 */
		loadFlexData: function (mPropertyBag) {
			var aChanges = [];
			var oChange;

			// _items is used in the internal keys of the JsObjectStorage
			BrowserStorageUtils.forEachChangeInStorage(this.oStorage._items || this.oStorage, function(sKey) {
				oChange = JSON.parse(this.oStorage.getItem(sKey));
				var bSameReference = oChange.reference === mPropertyBag.reference || oChange.reference + ".Component" === mPropertyBag.reference;
				var bSameLayer = oChange.layer === mPropertyBag.layer;
				if (
					mPropertyBag.reference && !bSameReference
					|| mPropertyBag.layer && !bSameLayer
				) {
					return;
				}
				aChanges.push(oChange);
			}.bind(this));

			var mGroupedChanges = {
				variants: [],
				controlVariantChanges: [],
				controlVariantManagementChanges: [],
				uiChanges: []
			};
			aChanges.forEach(function(oChange) {
				if (oChange.fileType === "ctrl_variant" && oChange.variantManagementReference) {
					mGroupedChanges.variants.push(oChange);
				} else if (oChange.fileType === "ctrl_variant_change") {
					mGroupedChanges.controlVariantChanges.push(oChange);
				} else if (oChange.fileType === "ctrl_variant_management_change") {
					mGroupedChanges.controlVariantManagementChanges.push(oChange);
				} else {
					mGroupedChanges.uiChanges.push(oChange);
				}
			});

			var mResult = BrowserStorageUtils.createChangesMapWithVariants(mGroupedChanges.variants);
			BrowserStorageUtils.addChangesToMap(mResult, mGroupedChanges);
			//now all changes are combined and in the right section => sort them all
			BrowserStorageUtils.sortChanges(mResult);
			BrowserStorageUtils.assignVariantReferenceChanges(mResult);

			return Promise.resolve(mResult);
		}
	});

	return BrowserStorageConnector;
}, true);
