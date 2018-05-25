sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller','sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.InputSuggestionsCustomFilter.C", {

		onInit: function(oEvent) {

			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);

			this.byId("productInput").setFilterFunction(function(sTerm, oItem) {
				// A case-insensitive 'string contains' style filter
				return oItem.getText().match(new RegExp(sTerm, "i"));
			});
		}
	});


	return CController;

});