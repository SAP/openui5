sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Item"
], function(Controller, JSONModel, Item) {
	"use strict";

	return Controller.extend("sap.m.sample.InputKeyValueTabularSuggestions.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			var oInput = this.byId("productInput");
			oInput.setSuggestionRowValidator(this.suggestionRowValidator);
		},

		suggestionRowValidator: function (oColumnListItem) {
			var aCells = oColumnListItem.getCells();

			return new Item({
				key: aCells[1].getText(),
				text: aCells[0].getText()
			});
		},

		onSuggestionItemSelected: function () {
			var sKey = this.byId("productInput").getSelectedKey();
			this.byId('selectedKeyIndicator').setText(sKey);
		}

	});
});