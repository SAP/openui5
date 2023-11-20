sap.ui.define([
	"sap/ui/demo/iconexplorer/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/util/Storage",
	"sap/base/Log"
], function(Sorter, JSONModel, Storage, Log) {
	"use strict";

	return JSONModel.extend("sap.ui.demo.iconexplorer.model.FavoriteModel", {

		_STORAGE_KEY : "ICON_EXPLORER_FAVORITES",
		_storage : new Storage(Storage.Type.local),

		/**
		 * Fetches the favorites from local storage and sets up the JSON model
		 * @param {Object} oSettings a settings object passed to the JSON model
		 * @return {sap.ui.demo.iconexplorer.model.FavoriteModel} the new model instance
		 */
		constructor : function(oSettings) {
			// call super constructor
			JSONModel.apply(this, arguments);

			this.setSizeLimit(1000000);

			// load data from local storage
			var sJSON = this._storage.get(this._STORAGE_KEY);
			var oData;

			try {
				oData = JSON.parse(sJSON);
			} catch (oException) {
				Log.warning("FavoriteModel: Could not parse the data read from local storage");
			}

			// default data if storage is empty
			if (!oData) {
				oData = {
					count : 0,
					icons : []
				};
			}

			// set data
			this.setData(oData);

			return this;
		},

		/**
		 * Checks if a given icon is a favorite
		 * @param {string} sName the icon name
		 * @return {boolean} the favorite state of the icon
		 */
		isFavorite : function(sName) {
			var oData = this.getData();

			return oData.icons.some(function(oItem) {
				return oItem.name === sName;
			});
		},

		/**
		 * Toogles the favorite state of a given icon
		 * @param {sap.ui.model.Context} oBindingContext the binding context of the icon to be toggled
		 * @return {boolean} the new favorite state of the icon
		 */
		toggleFavorite : function(oBindingContext) {
			var sName = oBindingContext.getProperty("name"),
				bFavorite = this.isFavorite(sName),
				oData = this.getData();

			if (bFavorite) {
				oData.icons = oData.icons.filter(function(oIcon){
					return oIcon.name !== sName;
				});
			} else {
				oData.icons.push(oBindingContext.getObject());
			}
			oData.count = oData.icons.length;

			// sort icons by name
			oData.icons.sort(Sorter.sortByName);

			// update model
			this.setData(oData);

			// update local storage
			var sJSON = JSON.stringify(oData);
			this._storage.put(this._STORAGE_KEY, sJSON);

			return !bFavorite;
		}
	});
});
