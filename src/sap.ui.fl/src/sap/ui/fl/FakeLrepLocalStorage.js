/*
 * ! ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Class handling the Fake Lrep in localStorage
	 *
	 * @class
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @static
	 * @since 1.48
	 * @alias sap.ui.fl.FakeLrepLocalStorage
	 */

	var FL_LREP_CHANGE_KEY = "sap.ui.fl.change";
	var FL_LREP_VARIANT_KEY = "sap.ui.fl.variant";
	var FakeLrepLocalStorage = {};

	/**
	 * Creates the  Lrep change key
	 * @public
	 * @param  {String} sId - the Lrep change id
	 * @returns {String} the prefixed id
	 */
	FakeLrepLocalStorage.createChangeKey = function(sId) {

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
	FakeLrepLocalStorage.createVariantKey = function(sId) {

		if (sId) {
			return FL_LREP_VARIANT_KEY + "." + sId;
		}
	};

	/**
	 * The iterator for the local  Lrep changes (localStorage)
	 * @public
	 * @param {function} fnPredicate - the function to apply for each  cahnge
	 */
	FakeLrepLocalStorage.forEachLrepChangeInLocalStorage = function(fnPredicate) {

		for (var sKey in window.localStorage) {

			if (sKey.indexOf(FL_LREP_CHANGE_KEY) > -1 || sKey.indexOf(FL_LREP_VARIANT_KEY) > -1) {
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
	FakeLrepLocalStorage.getChange = function(sId) {

		if (sId) {

			var sChange = window.localStorage.getItem(this.createChangeKey(sId));
			if (!sChange) {
				sChange = window.localStorage.getItem(this.createVariantKey(sId));
			}
			return JSON.parse(sChange);
		}
	};

	/**
	 * Get all  Lrep changes (localStorage)
	 * @returns {Object[]} all local  changes
	 */
	FakeLrepLocalStorage.getChanges = function() {

		var aChanges = [],
			oChange;

		this.forEachLrepChangeInLocalStorage(function(sKey) {

			oChange = JSON.parse(window.localStorage[sKey]);
			aChanges.push(oChange);
		});

		return aChanges;
	};

	/**
	 * Get the number of  Lrep changes (localStorage)
	 * @returns {Number} the amout of local  Lrep changes
	 */
	FakeLrepLocalStorage.getNumChanges = function() {

		var iChanges = 0;

		this.forEachLrepChangeInLocalStorage(function(sKey) {
			iChanges++;
		});

		return iChanges;
	};

	FakeLrepLocalStorage._aModifyCallbacks = [];

	/**
	 * Use this in tests to ensure the modify operation happend
	 * @param {Function} fnCallback callback, which is called, when the local storage is
	 */
	FakeLrepLocalStorage.attachModifyCallback = function(fnCallback) {
		this._aModifyCallbacks.push(fnCallback);
	};

	/**
	 * Stop listening on modify operations
	 * @param {Function} fnCallback callback to be removed
	 */
	FakeLrepLocalStorage.detachModifyCallback = function(fnCallback) {
		var i = this._aModifyCallbacks.indexOf(fnCallback);
		if (i !== -1){
			this._aModifyCallbacks.splice(i,1);
		}
	};

	FakeLrepLocalStorage._callModifyCallbacks = function(sModifyType) {
		this._aModifyCallbacks.forEach(function(fnCallback){
			fnCallback(sModifyType);
		});
	};
	/**
	 * Delete a specific  Lrep change (localStorage)
	 * @public
	 * @param  {String} sId - the Lrep change id
	 */
	FakeLrepLocalStorage.deleteChange = function(sId) {

		if (sId) {
			window.localStorage.removeItem(this.createChangeKey(sId));
			window.localStorage.removeItem(this.createVariantKey(sId));
		}

		this._callModifyCallbacks("delete");
	};

	/**
	 * Delete all  Lrep changes (localStorage)
	 * @public
	 */
	FakeLrepLocalStorage.deleteChanges = function() {

		this.forEachLrepChangeInLocalStorage(function(sKey) {
			window.localStorage.removeItem(sKey);
		});
		this._callModifyCallbacks("delete");
	};

	/**
	 * Save a  Lrep change (localStorage)
	 * @public
	 * @param  {String} sId - the Lrep change id
	 * @param  {Object} oChange - the change object
	 */
	FakeLrepLocalStorage.saveChange = function(sId, oChange) {
		var sChangeKey, sChange;

		if (sId && oChange) {

			if (oChange.fileType === "ctrl_variant" && oChange.variantManagementReference) {
				sChangeKey = this.createVariantKey(sId);
			} else {
				sChangeKey = this.createChangeKey(sId);
			}
			sChange = JSON.stringify(oChange);

			window.localStorage.setItem(sChangeKey, sChange);
		}
		this._callModifyCallbacks("save");
	};

	return FakeLrepLocalStorage;

}, /* bExport= */ true);