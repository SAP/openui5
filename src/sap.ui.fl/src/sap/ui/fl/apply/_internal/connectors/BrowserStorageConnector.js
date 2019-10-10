/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/library",
	"sap/ui/fl/apply/connectors/BaseConnector",
	"sap/ui/fl/apply/_internal/connectors/BrowserStorageUtils",
	"sap/ui/fl/LayerUtils"
], function(
	merge,
	library,
	BaseConnector,
	BrowserStorageUtils,
	LayerUtils
) {
	"use strict";

	function loadDataFromStorage (mPropertyBag) {
		var aFlexObjects = [];

		return BrowserStorageUtils.forEachObjectInStorage(mPropertyBag, function(mFlexObject) {
			aFlexObjects.push(mFlexObject.changeDefinition);
		}).then(function () {
			return aFlexObjects;
		});
	}

	function getGroupedFlexObjects (aFlexObjects) {
		var mGroupedFlexObjects = {};

		// build empty groups
		Object.keys(library.Layer).forEach(function (sLayer) {
			mGroupedFlexObjects[sLayer] = {
				variants: [],
				variantChanges: [],
				variantManagementChanges: [],
				variantDependentControlChanges: [],
				changes: [],
				index: LayerUtils.getLayerIndex(sLayer)
			};
		});

		// fill groups
		aFlexObjects.forEach(function(oFlexObject) {
			var sLayer = oFlexObject.layer;

			if (oFlexObject.fileType === "ctrl_variant" && oFlexObject.variantManagementReference) {
				mGroupedFlexObjects[sLayer].variants.push(oFlexObject);
			} else if (oFlexObject.fileType === "ctrl_variant_change") {
				mGroupedFlexObjects[sLayer].variantChanges.push(oFlexObject);
			} else if (oFlexObject.fileType === "ctrl_variant_management_change") {
				mGroupedFlexObjects[sLayer].variantManagementChanges.push(oFlexObject);
			} else if (oFlexObject.fileType === "change") {
				if (oFlexObject.variantReference) {
					mGroupedFlexObjects[sLayer].variantDependentControlChanges.push(oFlexObject);
				} else {
					mGroupedFlexObjects[sLayer].changes.push(oFlexObject);
				}
			}
		});

		// sort groups
		Object.keys(mGroupedFlexObjects).forEach(function (sLayer) {
			BrowserStorageUtils.sortGroupedFlexObjects(mGroupedFlexObjects[sLayer]);
		});

		return mGroupedFlexObjects;
	}

	function filterAndSortResponses(mGroupedFlexObjects) {
		var aResponses = [];
		Object.keys(mGroupedFlexObjects).forEach(function (sLayer) {
			aResponses.push(mGroupedFlexObjects[sLayer]);
		});

		aResponses = aResponses.filter(function (oResponse) {
			return oResponse.changes.length > 0
				|| oResponse.variants.length > 0
				|| oResponse.variantChanges.length > 0
				|| oResponse.variantManagementChanges.length > 0
				|| oResponse.variantDependentControlChanges.length > 0;
		});

		aResponses.sort(function(a, b) {
			return a.index - b.index;
		});

		return aResponses;
	}

	/**
	 * Base Connector for requesting data from session or local storage
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.BrowserStorageConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Connector, sap.ui.fl.apply._internal.Storage
	 */
	var BrowserStorageConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.apply._internal.connectors.BrowserStorageConnector */ {
		/**
		 * can be either window.sessionStorage or window.localStorage
		 */
		oStorage: undefined,

		/**
		 * Provides the flex data stored in the session or local storage;
		 * Changes can be filtered by reference and layer.
		 *
		 * @param {object} mPropertyBag properties needed by the connectors
		 * @param {string} mPropertyBag.reference reference of the application
		 * @returns {Promise<Object>} resolving with an object containing a data contained in the changes-bundle
		 */
		loadFlexData: function (mPropertyBag) {
			return loadDataFromStorage({
				storage: this.oStorage,
				reference: mPropertyBag.reference
			}).then(function (aFlexObjects) {
				var mGroupedFlexObjects = getGroupedFlexObjects(aFlexObjects);
				return filterAndSortResponses(mGroupedFlexObjects);
			});
		}
	});

	return BrowserStorageConnector;
}, true);
