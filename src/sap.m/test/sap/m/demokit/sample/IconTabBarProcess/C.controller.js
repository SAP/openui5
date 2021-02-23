sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/m/sample/IconTabBarProcess/model/formatter"
], function (Controller, JSONModel, Filter, formatter) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarProcess.C", {
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
				oCombinedFilterG,
				oCombinedFilterKG,

				// Values for Filter
				fMaxOkWeightKG = 1,
				fMaxOkWeightG = fMaxOkWeightKG * 1000,
				fMaxHeavyWeightKG = 5,
				fMaxHeavyWeightG = fMaxHeavyWeightKG * 1000;

			if (sKey === "Ok") {
				oCombinedFilterG = new Filter([new Filter("WeightMeasure", "LT", fMaxOkWeightG), new Filter("WeightUnit", "EQ", "G")], true);
				oCombinedFilterKG = new Filter([new Filter("WeightMeasure", "LT", fMaxOkWeightKG), new Filter("WeightUnit", "EQ", "KG")], true);
			} else if (sKey === "Heavy") {
				oCombinedFilterG = new Filter([new Filter("WeightMeasure", "BT", fMaxOkWeightG, fMaxHeavyWeightG), new Filter("WeightUnit", "EQ", "G")], true);
				oCombinedFilterKG = new Filter([new Filter("WeightMeasure", "BT", fMaxOkWeightKG, fMaxHeavyWeightKG), new Filter("WeightUnit", "EQ", "KG")], true);
			} else if (sKey === "Overweight") {
				oCombinedFilterKG = new Filter([new Filter("WeightMeasure", "GT", fMaxHeavyWeightKG), new Filter("WeightUnit", "EQ", "KG")], true);
				oCombinedFilterG = new Filter([new Filter("WeightMeasure", "GT", fMaxHeavyWeightG), new Filter("WeightUnit", "EQ", "G")], true);
			}

			aFilters.push(new Filter([oCombinedFilterKG, oCombinedFilterG], false));
			oBinding.filter(aFilters);
		}

	});
});