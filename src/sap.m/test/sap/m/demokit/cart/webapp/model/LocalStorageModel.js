sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/util/Storage"
], function(JSONModel, Storage) {
	"use strict";

	return JSONModel.extend("sap.ui.demo.cart.model.CartModel", {

		_STORAGE_KEY : "LOCALSTORAGE_MODEL",
		_storage : new Storage(Storage.Type.local),

		/**
		 * Fetches the favorites from local storage and sets up the JSON model
		 * By default the string "LOCALSTORAGE_MODEL" is used but it is recommended to set a custom key
		 * to avoid name clashes with other apps or other instances of this model class

		 * @param {string} sStorageKey storage key that will be used as an id for the local storage data
		 * @param {Object} oSettings settings objec that is passed to the JSON model constructor
		 * @return {sap.ui.demo.cart.model.LocalStorageModel} the local storage model instance
		 */
		constructor : function(sStorageKey, oSettings) {
			// call super constructor with everything from the second argument
			JSONModel.apply(this, [].slice.call(arguments, 1));
			this.setSizeLimit(1000000);

			// override default storage key
			if (sStorageKey) {
				this._STORAGE_KEY = sStorageKey;
			}

			// load data from local storage
			this._loadData();

			return this;
		},

		/**
		 * Loads the current state of the model from local storage
		 */
		_loadData : function() {
			var sJSON = this._storage.get(this._STORAGE_KEY);

			if (sJSON) {
				this.setData(JSON.parse(sJSON));
			}
			this._bDataLoaded = true;
		},

		/**
		 * Saves the current state of the model to local storage
		 */
		_storeData : function() {
			var oData = this.getData();

			// update local storage with current data
			var sJSON = JSON.stringify(oData);
			this._storage.put(this._STORAGE_KEY, sJSON);
		},

		/**
		 * Sets a property for the JSON model
		 * @override
		 */
		setProperty : function () {
			JSONModel.prototype.setProperty.apply(this, arguments);
			this._storeData();
		},

		/**
		 * Sets the data for the JSON model
		 * @override
		 */
		setData : function () {
			JSONModel.prototype.setData.apply(this, arguments);
			// called from constructor: only store data after first load
			if (this._bDataLoaded) {
				this._storeData();
			}
		},

		/**
		 * Refreshes the model with the current data
		 * @override
		 */
		refresh : function () {
			JSONModel.prototype.refresh.apply(this, arguments);
			this._storeData();
		}
	});
});
