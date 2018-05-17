sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.SearchFieldSuggestions.Page", {

		onInit: function () {
			// set explored app's demo model on this sample
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			var oView = this.getView();
			oView.setModel(this.oModel);
			this.oSF = oView.byId("searchField");
		},

		onSearch: function (event) {
			var item = event.getParameter("suggestionItem");
			if (item) {
				sap.m.MessageToast.show("search for: " + item.getText());
			}
		},

		onSuggest: function (event) {
			var value = event.getParameter("suggestValue");
			var filters = [];
			if (value) {
				filters = [
					new sap.ui.model.Filter([
						new sap.ui.model.Filter("ProductId", function(sText) {
							return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						}),
						new sap.ui.model.Filter("Name", function(sDes) {
							return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						})
					], false)
				];
			}

			this.oSF.getBinding("suggestionItems").filter(filters);
			this.oSF.suggest();
		}
	});

	return CController;

});