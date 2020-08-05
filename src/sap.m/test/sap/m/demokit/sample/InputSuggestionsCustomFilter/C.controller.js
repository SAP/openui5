sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.InputSuggestionsCustomFilter.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			this.byId("productInput").setFilterFunction(function (sTerm, oItem) {
				// A case-insensitive "string contains" style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
			});
		}

	});
});