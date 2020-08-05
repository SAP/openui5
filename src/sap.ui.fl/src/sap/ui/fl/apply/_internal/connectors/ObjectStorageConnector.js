/*
 * ! ${copyright}
 */


sap.ui.define([
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils",
	"sap/ui/fl/initial/_internal/StorageUtils"
], function(
	ObjectStorageUtils,
	StorageUtils
) {
	"use strict";

	function loadDataFromStorage (mPropertyBag) {
		var aFlexObjects = [];

		return ObjectStorageUtils.forEachObjectInStorage(mPropertyBag, function(mFlexObject) {
			aFlexObjects.push(mFlexObject.changeDefinition);
		}).then(function () {
			return aFlexObjects;
		});
	}

	/**
	 * Base Connector for requesting data from session or local storage
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.ObjectStorageConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.Storage, sap.ui.fl.write._internal.Storage, WebIDE
	 */
	return {
		/**
		 * can be either window.sessionStorage or window.localStorage
		 */
		oStorage: undefined,
		layers: [
			"ALL"
		],

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
				var mGroupedFlexObjects = StorageUtils.getGroupedFlexObjects(aFlexObjects);
				return StorageUtils.filterAndSortResponses(mGroupedFlexObjects);
			});
		}
	};
});
