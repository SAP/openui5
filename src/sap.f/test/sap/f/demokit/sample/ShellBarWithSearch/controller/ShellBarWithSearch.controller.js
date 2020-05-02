sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/ui/model/Filter"
], function (MessageToast, Controller, JSONModel, Filter) {
	"use strict";

	return Controller.extend("sap.f.sample.ShellBarWithSearch.controller.ShellBarWithSearch", {
		onInit: function () {
			this.oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			var oView = this.getView();
			oView.setModel(this.oModel);
			this.oSF = oView.byId("searchField");
		},
		handlerSearchFieldSearch: function (oEvent) {
			MessageToast.show(oEvent.getSource().getId() + " search event is fired");
		},
		handlerSearchFieldLiveEvent: function (oEvent) {
			MessageToast.show(oEvent.getSource().getId() + " liveChange event value is: " + oEvent.getParameter("newValue"));
		},
		handlerSearchSuggestEvent: function (oEvent) {
			var sValue = oEvent.getParameter("suggestValue"),
				aFilters = [];

			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("ProductId", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						}),
						new Filter("Name", function (sDes) {
							return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					])
				];
			}

			this.oSF.getBinding("suggestionItems").filter(aFilters);
			this.oSF.suggest();
		}
	});
});