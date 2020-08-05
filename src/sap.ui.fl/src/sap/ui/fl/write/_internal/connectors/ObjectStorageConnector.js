/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"
], function(
	merge,
	BaseConnector,
	StorageUtils,
	ObjectStorageUtils
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

	function setFlexObjectCreation(oFlexObject, iCounter) {
		if (!oFlexObject.creation) {
			// safari browser uses only 1 ms intervals to create a timestamp. This
			// generates creation timestamp duplicates. But creation timestamp is
			// used to define the order of the changes and needs to be unique
			var nCreationTimestamp = Date.now() + iCounter;
			oFlexObject.creation = new Date(nCreationTimestamp).toISOString();
		}
		return oFlexObject;
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
		 * can be any storage implementing setItem, removeItem, clear, getItem and getItems
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
		},

		/**
		 * @inheritDoc
		 */
		write: function(mPropertyBag) {
			var aPromises = mPropertyBag.flexObjects.map(function(oFlexObject, iIndex) {
				var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
				oFlexObject = setFlexObjectCreation(oFlexObject, ++iIndex);
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
