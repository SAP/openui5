/*
 * ! ${copyright}
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * Class handling the Fake Lrep in different storages
	 * @param {Storage} oStorage - The storage to be used (e.g. window.sessionStorage)
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
		 * Creates the  Lrep change key
		 * @public
		 * @param  {String} sId - the Lrep change id
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
		 * @param  {String} sId - the Lrep variant id
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
		 * @param {function} fnPredicate - the function to apply for each  cahnge
		 */
		FakeLrepStorage.forEachLrepChangeInLocalStorage = function(fnPredicate) {

			for (var sKey in oStorage) {

				if (sKey.includes(FL_LREP_CHANGE_KEY) || sKey.includes(FL_LREP_VARIANT_KEY)) {
					fnPredicate(sKey);
				}
			}
		};

		/**
		 * Get a specific  Lrep change (localStorage)
		 * @public
		 * @param  {String} sId - the Lrep change id
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
		 * Get all  Lrep changes (localStorage)
		 * @returns {Object[]} all local  changes
		 */
		FakeLrepStorage.getChanges = function() {

			var aChanges = [],
				oChange;

			this.forEachLrepChangeInLocalStorage(function(sKey) {

				oChange = JSON.parse(oStorage[sKey]);
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

			this.forEachLrepChangeInLocalStorage(function(sKey) {
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
			if (i !== -1){
				this._aModifyCallbacks.splice(i,1);
			}
		};

		FakeLrepStorage._callModifyCallbacks = function(sModifyType) {
			this._aModifyCallbacks.forEach(function(fnCallback){
				fnCallback(sModifyType);
			});
		};
		/**
		 * Delete a specific  Lrep change (localStorage)
		 * @public
		 * @param  {String} sId - the Lrep change id
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
		 * @param  {String} sId - the Lrep change id
		 * @param  {Object} oChange - the change object
		 */
		FakeLrepStorage.saveChange = function(sId, oChange) {
			var sChangeKey, sChange;

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