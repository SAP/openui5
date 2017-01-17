/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"jquery.sap.storage"
], function(JSONModel, jQuery) {
	"use strict";

	return JSONModel.extend("sap.ui.demo.cart.model.CartModel", {

		_STORAGE_KEY : "LOCALSTORAGE_MODEL",
		_storage : jQuery.sap.storage(jQuery.sap.storage.Type.local),

		/**
		 * Fetches the favorites from local storage and sets up the JSON model
		 * @param oSettings
		 * @return {sap.ui.demo.cart.model.CartModel}
		 */
		constructor : function(sStorageKey, oSettings) {
			// call super constructor with everything from the second argument
			JSONModel.apply(this, [].slice.call(arguments, 1));
			this.setSizeLimit(1000000);

			// override default storage key
			if(sStorageKey) {
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

			if(sJSON) {
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
