sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/sample/IconTabBarResponsivePadding/model/formatter"
], function (Controller, JSONModel, Filter, formatter) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarResponsivePadding.C", {
		formatter: formatter,

		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onFilterSelect: function (oEvent) {
			var oBinding = this.byId("productsTable").getBinding("items"),
				sKey = oEvent.getParameter("key"),
				// Array to combine filters
				aFilters = [],
				// Values for Filter
				fMaxOkWeightKG = 1,
				fMaxOkWeightG = fMaxOkWeightKG * 1000,
				fMaxHeavyWeightKG = 5,
				fMaxHeavyWeightG = fMaxHeavyWeightKG * 1000;

			if (sKey === "Ok") {
				aFilters.push(
					new Filter([
						new Filter([new Filter("WeightMeasure", "LT", fMaxOkWeightG), new Filter("WeightUnit", "EQ", "G")], true),
						new Filter([new Filter("WeightMeasure", "LT", fMaxOkWeightKG), new Filter("WeightUnit", "EQ", "KG")], true)
					], false)
				);
			} else if (sKey === "Heavy") {
				aFilters.push(
					new Filter([
						new Filter([new Filter("WeightMeasure", "BT", fMaxOkWeightG, fMaxHeavyWeightG), new Filter("WeightUnit", "EQ", "G")], true),
						new Filter([new Filter("WeightMeasure", "BT", fMaxOkWeightKG, fMaxHeavyWeightKG), new Filter("WeightUnit", "EQ", "KG")], true)
					], false)
				);
			} else if (sKey === "Overweight") {
				aFilters.push(
					new Filter([
						new Filter([new Filter("WeightMeasure", "GT", fMaxHeavyWeightKG), new Filter("WeightUnit", "EQ", "KG")], true),
						new Filter([new Filter("WeightMeasure", "GT", fMaxHeavyWeightG), new Filter("WeightUnit", "EQ", "G")], true)
					], false)
				);
			}

			oBinding.filter(aFilters);
		}

	});
});