sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/library",
	"./model/formatter"
], function (Controller, JSONModel, Filter, mobileLibrary, formatter) {
	"use strict";

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;

	return Controller.extend("sap.m.sample.IconTabBarBackgroundDesign.C", {
		formatter: formatter,

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onFilterSelect: function (oEvent) {
			var oBinding = this.byId("productsTable").getBinding("items"),
				sKey = oEvent.getParameter("key"),
				oUnitFilter = new Filter("WeightUnit", "EQ", "KG"),
				oFilter;

			if (sKey === "Ok") {
				oFilter = new Filter({filters: [oUnitFilter, new Filter("WeightMeasure", "LE", 1)], and: true});
				oBinding.filter([oFilter]);
			} else if (sKey === "Heavy") {
				oFilter = new Filter({filters: [oUnitFilter, new Filter("WeightMeasure", "BT", 1, 5)], and: true});
				oBinding.filter([oFilter]);
			} else if (sKey === "Overweight") {
				oFilter = new Filter({filters: [oUnitFilter, new Filter("WeightMeasure", "GT", 5)], and: true});
				oBinding.filter([oFilter]);
			} else {
				oBinding.filter([]);
			}
		},

		onBackgroundDesignSelect: function (oEvent) {
			var oIconTabBar = this.byId("idIconTabBar");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			if (sSelectedValue in BackgroundDesign) {
				oIconTabBar.setBackgroundDesign(sSelectedValue);
			}
		},

		onHeaderBackgroundDesignSelect: function (oEvent) {
			var oIconTabBar = this.byId("idIconTabBar");
			var sSelectedValue = oEvent.getSource().getSelectedButton().getText();

			if (sSelectedValue in BackgroundDesign) {
				oIconTabBar.setHeaderBackgroundDesign(sSelectedValue);
			}
		}

	});
});