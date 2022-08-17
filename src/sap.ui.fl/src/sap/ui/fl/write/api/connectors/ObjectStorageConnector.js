/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/strings/hash",
	"sap/base/util/restricted/_uniqBy",
	"sap/base/util/each",
	"sap/base/util/merge",
	"sap/ui/fl/write/connectors/BaseConnector",
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils"
], function(
	hash,
	_uniqBy,
	each,
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

	/* the structure of create and update is like
		{
			<fileType>:[
				{
					<fileName>: <content>
				},
				...
			],
			...
		}
	*/
	function forEveryMapInArrayInMap(mMap, fnCallback) {
		each(mMap, function(sOuterKey, aArray) {
			aArray.forEach(function(mInnerMap) {
				// eslint-disable-next-line max-nested-callbacks
				each(mInnerMap, function(sInnerKey, oContent) {
					fnCallback(oContent, sInnerKey);
				});
			});
		});
	}

	function handleCondenseCreate(oCreateInfos, aCondensedChanges) {
		var aReturn = [];
		forEveryMapInArrayInMap(oCreateInfos, function(oFlexObjectFileContent, sChangeId) {
			var sKey = ObjectStorageUtils.createFlexKey(sChangeId);
			var oFlexObject = aCondensedChanges.find(function(oCurrentFlexObject) {
				return oCurrentFlexObject.getId() === oFlexObjectFileContent.fileName;
			});
			aReturn.push({key: sKey, value: oFlexObject});
		});

		return aReturn;
	}

	function handleCondenseUpdate(oUpdateInfos, aCondenserChanges) {
		// the FlexObject instance is already up to date, so the new file content can be taken from there
		var aReturn = [];
		forEveryMapInArrayInMap(oUpdateInfos, function(oCurrentFlexObject, sChangeId) {
			var sKey = ObjectStorageUtils.createFlexKey(sChangeId);
			var oUpdatedFlexObject;
			aCondenserChanges.some(function(oCurrentFlexObject) {
				if (oCurrentFlexObject.getId() === sChangeId) {
					oUpdatedFlexObject = oCurrentFlexObject;
					return true;
				}
			});
			aReturn.push({key: sKey, value: oUpdatedFlexObject});
		});

		return aReturn;
	}

	function handleCondenseReorder(oReorderInfos, aCondensedChanges) {
		var aReturn = [];
		each(oReorderInfos, function(sFileType, aChangeIds) {
			if (aChangeIds.length < 2) {
				return;
			}

			// sorting is based solely on the creation timestamp
			// aCondensedChanges is already in the new, correct order
			// starting from the first FlexObject in the reorder section
			// each subsequent FlexObject has to have a higher creation timestamp
			// to achieve that the getTime result is increased by 1
			var aFilteredFlexObjects = aCondensedChanges.filter(function(oFlexObject) {
				return oFlexObject.getFileType() === sFileType;
			});
			aFilteredFlexObjects.forEach(function(oFlexObject, iIndex) {
				if (aChangeIds.indexOf(oFlexObject.getId()) > -1 && iIndex < aFilteredFlexObjects.length - 1) {
					var oNextFlexObject = aFilteredFlexObjects[iIndex + 1];
					var oCurrentDate = new Date(oFlexObject.getCreation());
					var oNextDate = new Date(oNextFlexObject.getCreation());

					if (oNextFlexObject && oCurrentDate >= oNextDate) {
						var oNewDateTime = oCurrentDate.getTime() + 1;
						oNextFlexObject.setCreation(new Date(oNewDateTime).toISOString());
						var sKey = ObjectStorageUtils.createFlexKey(oNextFlexObject.getId());
						aReturn.push({key: sKey, value: oNextFlexObject});
					}
				}
			});
		});

		return aReturn;
	}

	function handleCondenseDelete(oDeleteInformation) {
		var aPromises = [];
		Object.entries(oDeleteInformation).forEach(function(aChangeIds) {
			aChangeIds.forEach(function(sChangeId) {
				var sKey = ObjectStorageUtils.createFlexKey(sChangeId);
				aPromises.push(this.storage.removeItem(sKey));
			}.bind(this));
		}.bind(this));

		return aPromises;
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
				isProductiveSystem: false,
				isCondensingEnabled: true
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
		},

		/**
		 * @inheritDoc
		 */
		condense: function(mPropertyBag) {
			// the functionality below would normally be done in the back end
			// but in this case the storage can't be extended, so the logic has to be included in the connector
			var oCondenseInformation = mPropertyBag.flexObjects;
			var aObjectsToSet = [];
			// the same FlexObject can be in multiple sections of the condense information, so the instance has to be set in the array
			aObjectsToSet = aObjectsToSet.concat(handleCondenseCreate(oCondenseInformation.create, mPropertyBag.condensedChanges));
			aObjectsToSet = aObjectsToSet.concat(handleCondenseUpdate(oCondenseInformation.update, mPropertyBag.condensedChanges));
			aObjectsToSet = aObjectsToSet.concat(handleCondenseReorder(oCondenseInformation.reorder, mPropertyBag.condensedChanges));
			aObjectsToSet = _uniqBy(aObjectsToSet, "key");

			var aPromises = [];
			aPromises = aPromises.concat(handleCondenseDelete.call(this, oCondenseInformation.delete));
			aObjectsToSet.forEach(function(oItemToSet) {
				var oFileContent = oItemToSet.value.convertToFileContent();
				var vFlexObject = this.storage._itemsStoredAsObjects ? oFileContent : JSON.stringify(oFileContent);
				aPromises.push(this.storage.setItem(oItemToSet.key, vFlexObject));
			}.bind(this));

			return Promise.all(aPromises);
		}
	});

	return ObjectStorageConnector;
});
