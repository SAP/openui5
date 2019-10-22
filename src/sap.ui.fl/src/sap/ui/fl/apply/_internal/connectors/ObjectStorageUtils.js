/*
 * ! ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	/**
	 * Util class for Connector implementations (apply and write)
	 *
	 * @namespace sap.ui.fl.apply._internal.connectors.Utils
	 * @since 1.70
	 * @version ${version}
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal, sap.ui.fl.write._internal
	 */

	 // avoid working with other entries in the storage, e.g. some demokit entries in localStorage
	var FL_PREFIX = "sap.ui.fl";

	return {
		/**
		 * The iterator for the fl objects in the given Storage. Filters the objects if a reference or layer is passed
		 * @public
		 * @param {object} mPropertyBag object with necessary information
		 * @param {Storage} mPropertyBag.storage browser storage
		 * @param {string} [mPropertyBag.reference] reference of the application
		 * @param {string} [mPropertyBag.layer] current layer
		 * @param {function} fnPredicate The function to apply for each change
		 */
		forEachObjectInStorage: function(mPropertyBag, fnPredicate) {
			// getItems() is used in the internal keys of the JsObjectStorage
			var oRealStorage = mPropertyBag.storage.getItems && mPropertyBag.storage.getItems() || mPropertyBag.storage;

			// ensure a Promise
			return Promise.resolve(oRealStorage)
				.then(function (oRealStorage) {
					var aPromises = Object.keys(oRealStorage).map(function(sKey) {
						var bIsFlexObject = sKey.includes(FL_PREFIX);

						if (!bIsFlexObject) {
							return;
						}

						var vStorageEntry = oRealStorage[sKey];
						var oFlexObject = mPropertyBag.storage._itemsStoredAsObjects ? vStorageEntry : JSON.parse(vStorageEntry);
						var bSameReference = true;
						if (mPropertyBag.reference) {
							bSameReference = oFlexObject.reference === mPropertyBag.reference || oFlexObject.reference + ".Component" === mPropertyBag.reference;
						}

						var bSameLayer = true;
						if (mPropertyBag.layer) {
							bSameLayer = oFlexObject.layer === mPropertyBag.layer;
						}

						if (!bSameReference || !bSameLayer) {
							return;
						}

						return fnPredicate({
							changeDefinition: oFlexObject,
							key: sKey
						});
					});

					return Promise.all(aPromises);
				});
		},

		/**
		 * Returns an array with all the flex objects in the storage
		 *
		 * @param {object} mPropertyBag - object with the necessary information
		 * @returns {Promise} Returns a Promise resolving with an array containing maps with two keys: 'key' and 'changeDefinition'
		 */
		getAllFlexObjects: function(mPropertyBag) {
			var aFlexObjects = [];
			return this.forEachObjectInStorage(mPropertyBag, function(mFlexObject) {
				aFlexObjects.push(mFlexObject);
			})
			.then(function () {
				return aFlexObjects;
			});
		},

		/**
		 * Creates the fl key
		 * @param  {string} sId The flex object ID
		 * @returns {string} the prefixed ID
		 */
		createFlexKey: function(sId) {
			if (sId) {
				return FL_PREFIX + "." + sId;
			}
		},

		/**
		 * Returns the key for a flex object
		 *
		 * @param {object} oFlexObject The definition of the flex Object
		 * @returns {string} Returns the prefixed ID
		 */
		createFlexObjectKey: function(oFlexObject) {
			return this.createFlexKey(oFlexObject.fileName);
		}

	};
});
