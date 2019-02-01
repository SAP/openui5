sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	var MainController = Controller.extend("view.Main", {
		onInit: function () {
			var oViewModel = new JSONModel({
				items: [{
					key: "1",
					name: "Sample11"
				}, {
					key: "2",
					name: "Sample12"
				}, {
					key: "3",
					name: "Sample3"
				}]
			});
			this.getView().setModel(oViewModel, "items");
		},
		onFilterList: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var aFilter = sQuery ? [new Filter("name", FilterOperator.Contains, sQuery)] : [];
			var oList = this.byId("itemList");
			var oListBinding = oList.getBinding("items");

			oListBinding.filter(aFilter);
		},
		onPress: function (oEvent) {
			var oItem = oEvent.getSource();
			var sItemName = oItem.getBindingContext("items").getObject().name;
			var oItemsModel = this.getView().getModel("items");

			oItemsModel.setProperty("selected", sItemName);
			this.byId("app").to(this.getView().byId(sItemName));
		},
		onBack: function () {
			this.byId("app").to(this.byId("list").getId());
		}
	});

	return MainController;

});
