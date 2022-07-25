/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/strings/hash",
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"
], function(
	hash,
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

	function calculateCacheKey(aFlexObjects) {
		return hash(aFlexObjects.reduce(function(sKey, oFlexObject) {
			return sKey + new Date(oFlexObject.creation).getTime();
		}, ""));
	}

	/**
	 * Abstract connector class for requesting data from a storage.
	 * The inherited objects must implement the <code>storage</code> object.
	 *
	 * @alias sap.ui.fl.write.api.connectors.ObjectStorageConnector
	 * @namespace sap.ui.fl.write.api.connectors.ObjectStorageConnector
	 * @extends sap.ui.fl.write.connectors.BaseConnector
	 * @since 1.84
	 * @private
	 * @ui5-restricted sap.ui.fl, SAPUI5 Visual Editor, UX Tools
	 * @abstract
	 */
	var ObjectStorageConnector = merge({}, BaseConnector, /** @lends sap.ui.fl.write.api.connectors.ObjectStorageConnector */ {
		/**
		 * Object implementing the functions setItem, removeItem, clear, getItem and getItems.
		 * By default the items are handled as stringified objects.
		 * If the saved are stored as js objects the property <code>_itemsStoredAsObjects</code> has to be set to true.
		 */
		storage: undefined,
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
		loadFlexData: function(mPropertyBag) {
			return loadDataFromStorage({
				storage: this.storage,
				reference: mPropertyBag.reference
			}).then(function (aFlexObjects) {
				StorageUtils.sortFlexObjects(aFlexObjects);
				var mGroupedFlexObjects = StorageUtils.getGroupedFlexObjects(aFlexObjects);
				var aResponses = StorageUtils.filterAndSortResponses(mGroupedFlexObjects);
				if (aResponses.length) {
					aResponses[0].cacheKey = calculateCacheKey(aFlexObjects);
				}
				return aResponses;
			});
		},

		/**
		 * @inheritDoc
		 */
		write: function(mPropertyBag) {
			var aPromises = mPropertyBag.flexObjects.map(function(oFlexObject, iIndex) {
				var sKey = ObjectStorageUtils.createFlexObjectKey(oFlexObject);
				oFlexObject = setFlexObjectCreation(oFlexObject, ++iIndex);
				var vFlexObject = this.storage._itemsStoredAsObjects ? oFlexObject : JSON.stringify(oFlexObject);
				return this.storage.setItem(sKey, vFlexObject);
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
			var vFlexObject = this.storage._itemsStoredAsObjects ? oFlexObject : JSON.stringify(oFlexObject);
			var vSetResponse = this.storage.setItem(sKey, vFlexObject);
			// ensure a Promise
			return Promise.resolve(vSetResponse);
		},

		/**
		 * @inheritDoc
		 */
		reset: function(mPropertyBag) {
			return ObjectStorageUtils.forEachObjectInStorage({
				storage: this.storage,
				reference: mPropertyBag.reference,
				layer: mPropertyBag.layer
			}, function(mFlexObject) {
				if (shouldChangeBeDeleted(mPropertyBag, mFlexObject.changeDefinition)) {
					return Promise.resolve(this.storage.removeItem(mFlexObject.key)).then(function () {
						return {
							fileName: mFlexObject.changeDefinition && mFlexObject.changeDefinition.fileName
						};
					});
				}
			}.bind(this))
			.then(function(aResponse) {
				return {
					response: aResponse.filter(function (oChangeDefinition) {
						return !!oChangeDefinition;
					})
				};
			});
		},

		/**
		 * @inheritDoc
		 */
		remove: function(mPropertyBag) {
			var sKey = ObjectStorageUtils.createFlexObjectKey(mPropertyBag.flexObject);
			this.storage.removeItem(sKey);
			var vRemoveResponse = this.storage.removeItem(sKey);
			// ensure a Promise
			return Promise.resolve(vRemoveResponse);
		},

		/**
		 * @inheritDoc
		 */
		loadFeatures: function() {
			return Promise.resolve({
				isKeyUser: true,
				isVariantSharingEnabled: true,
				isProductiveSystem: false
			});
		},

		/**
		 * @inheritDoc
		 */
		getFlexInfo: function(mPropertyBag) {
			mPropertyBag.storage = this.storage;
			return ObjectStorageUtils.getAllFlexObjects(mPropertyBag).then(function (aFlexObjects) {
				return {
					isResetEnabled: aFlexObjects.length > 0
				};
			});
		}
	});

	return ObjectStorageConnector;
});
