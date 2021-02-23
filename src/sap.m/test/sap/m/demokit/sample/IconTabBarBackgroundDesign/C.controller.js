sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/BackgroundDesign",
	"sap/m/sample/IconTabBarBackgroundDesign/model/formatter"
], function (Controller, JSONModel, Filter, BackgroundDesign, formatter) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarBackgroundDesign.C", {
		formatter: formatter,

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onFilterSelect: function (oEvent) {
			var oBinding = this.byId("productsTable").getBinding("items"),
				sKey = oEvent.getParameter("key"),
				oFilter;

			if (sKey === "Ok") {
				oFilter = new Filter("WeightMeasure", "LE", 1000);
				oBinding.filter([oFilter]);
			} else if (sKey === "Heavy") {
				oFilter = new Filter("WeightMeasure", "BT", 1001, 2000);
				oBinding.filter([oFilter]);
			} else if (sKey === "Overweight") {
				oFilter = new Filter("WeightMeasure", "GT", 2000);
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