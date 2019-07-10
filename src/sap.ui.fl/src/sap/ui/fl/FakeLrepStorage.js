/*
 * ! ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * Class handling the Fake Lrep in different storages
	 * @param {Storage} oStorage The storage to be used (e.g. window.sessionStorage)
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.58
	 * @alias sap.ui.fl.FakeLrepStorage
	 */

	return function (oStorage) {
		var FL_LREP_CHANGE_KEY = "sap.ui.fl.change";
		var FL_LREP_VARIANT_KEY = "sap.ui.fl.variant";
		var FakeLrepStorage = {};

		/**
		 * Overwrites the Storage that is currently used.
		 *
		 * @param {Storage} oNewStorage The new storage to be used (e.g. window.sessionStorage)
		 */
		FakeLrepStorage.setStorage = function(oNewStorage) {
			oStorage = oNewStorage;
		};

		/**
		 * Creates the  Lrep change key
		 * @public
		 * @param  {String} sId The Lrep change id
		 * @returns {String} the prefixed id
		 */
		FakeLrepStorage.createChangeKey = function(sId) {
			if (sId) {
				return FL_LREP_CHANGE_KEY + "." + sId;
			}
		};

		/**
		 * Creates the  Lrep variant key
		 * @public
		 * @param  {String} sId The Lrep variant id
		 * @returns {String} the prefixed id
		 */
		FakeLrepStorage.createVariantKey = function(sId) {
			if (sId) {
				return FL_LREP_VARIANT_KEY + "." + sId;
			}
		};

		/**
		 * The iterator for the local  Lrep changes (localStorage)
		 * @public
		 * @param {function} fnPredicate The function to apply for each  cahnge
		 */
		FakeLrepStorage.forEachLrepChangeInLocalStorage = function(fnPredicate) {
			var aKeys = Object.keys(oStorage);
			aKeys.forEach(function(sKey) {
				if (sKey.includes(FL_LREP_CHANGE_KEY) || sKey.includes(FL_LREP_VARIANT_KEY)) {
					fnPredicate(sKey);
				}
			});
		};

		/**
		 * Get a specific  Lrep change (localStorage)
		 * @public
		 * @param  {String} sId The Lrep change id
		 * @returns {Object} the specific change
		 */
		FakeLrepStorage.getChange = function(sId) {
			if (sId) {
				var sChange = oStorage.getItem(this.createChangeKey(sId));
				if (!sChange) {
					sChange = oStorage.getItem(this.createVariantKey(sId));
				}
				return JSON.parse(sChange);
			}
		};

		/**
		 * Get all  Lrep changes (localStorage); If a reference or layer is given the changes are filtered
		 *
		 * @param {string} [sReference] Reference to the component
		 * @param {string} [sLayer] Layer of the change
		 * @returns {Object[]} All local changes
		 */
		FakeLrepStorage.getChanges = function(sReference, sLayer) {
			var aChanges = [];
			var oChange;

			this.forEachLrepChangeInLocalStorage(function(sKey) {
				oChange = JSON.parse(oStorage[sKey]);
				var bSameReference = oChange.reference === sReference || oChange.reference + ".Component" === sReference;
				var bSameLayer = oChange.layer === sLayer;
				if (sReference && !bSameReference
					|| sLayer && !bSameLayer
				) {
					return;
				}
				aChanges.push(oChange);
			});

			return aChanges;
		};

		/**
		 * Get the number of  Lrep changes (localStorage)
		 * @returns {Number} the amout of local  Lrep changes
		 */
		FakeLrepStorage.getNumChanges = function() {
			var iChanges = 0;

			this.forEachLrepChangeInLocalStorage(function() {
				iChanges++;
			});

			return iChanges;
		};

		FakeLrepStorage._aModifyCallbacks = [];

		/**
		 * Use this in tests to ensure the modify operation happend
		 * @param {Function} fnCallback callback, which is called, when the local storage is
		 */
		FakeLrepStorage.attachModifyCallback = function(fnCallback) {
			this._aModifyCallbacks.push(fnCallback);
		};

		/**
		 * Stop listening on modify operations
		 * @param {Function} fnCallback callback to be removed
		 */
		FakeLrepStorage.detachModifyCallback = function(fnCallback) {
			var i = this._aModifyCallbacks.indexOf(fnCallback);
			if (i !== -1) {
				this._aModifyCallbacks.splice(i, 1);
			}
		};

		FakeLrepStorage._callModifyCallbacks = function(sModifyType) {
			this._aModifyCallbacks.forEach(function(fnCallback) {
				fnCallback(sModifyType);
			});
		};
		/**
		 * Delete a specific  Lrep change (localStorage)
		 * @public
		 * @param  {String} sId The Lrep change id
		 */
		FakeLrepStorage.deleteChange = function(sId) {
			if (sId) {
				oStorage.removeItem(this.createChangeKey(sId));
				oStorage.removeItem(this.createVariantKey(sId));
			}

			this._callModifyCallbacks("delete");
		};

		/**
		 * Delete all  Lrep changes (localStorage)
		 * @public
		 */
		FakeLrepStorage.deleteChanges = function() {
			this.forEachLrepChangeInLocalStorage(function(sKey) {
				oStorage.removeItem(sKey);
			});
			this._callModifyCallbacks("delete");
		};

		/**
		 * Save a  Lrep change (localStorage)
		 * @public
		 * @param  {String} sId The Lrep change id
		 * @param  {Object} oChange The change object
		 */
		FakeLrepStorage.saveChange = function(sId, oChange) {
			var sChangeKey;
			var sChange;

			if (sId && oChange) {
				if (oChange.fileType === "ctrl_variant" && oChange.variantManagementReference) {
					sChangeKey = this.createVariantKey(sId);
				} else {
					sChangeKey = this.createChangeKey(sId);
				}
				sChange = JSON.stringify(oChange);
				oStorage.setItem(sChangeKey, sChange);
			}
			this._callModifyCallbacks("save");
		};

		return FakeLrepStorage;
	};
}, /* bExport= */ true);