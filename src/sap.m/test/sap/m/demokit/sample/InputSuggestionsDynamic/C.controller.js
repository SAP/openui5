sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller','sap/ui/model/Filter','sap/ui/model/json/JSONModel'],
	function(jQuery, Controller, Filter, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.InputSuggestionsDynamic.C", {

		onInit: function() {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		handleSuggest: function(oEvent) {
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("Name", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			oEvent.getSource().getBinding("suggestionItems").filter(aFilters);
		}

	});


	return CController;

});