sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/BackgroundDesign"
], function (Controller, Core, JSONModel, Filter, BackgroundDesign) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarBackgroundDesign.C", {

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);

			// reuse table sample component
			var oComp = Core.createComponent({
				name: 'sap.m.sample.Table'
			});
			oComp.setModel(this.getView().getModel());
			this._oTable = oComp.getTable();
			this.byId("idIconTabBar").addContent(this._oTable);

			// update table
			this._oTable.setHeaderText(null);
			this._oTable.setShowSeparators("Inner");
		},

		onFilterSelect: function (oEvent) {
			var oBinding = this._oTable.getBinding("items"),
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