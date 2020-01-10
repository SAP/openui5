sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Core"
], function(Controller, Filter, JSONModel, Core) {
	"use strict";

	return Controller.extend("sap.m.sample.IconTabBarResponsivePadding.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);

			// reuse table sample component
			var oComp = Core.createComponent({
				name : 'sap.m.sample.Table'
			});
			oComp.setModel(this.getView().getModel());
			this._oTable = oComp.getTable();
			this.byId("idIconTabBar").insertContent(this._oTable);

			// update table
			this._oTable.setHeaderText(null);
			this._oTable.setShowSeparators("Inner");
		},

		handleIconTabBarSelect: function (oEvent) {
			var oBinding = this._oTable.getBinding("items"),
				sKey = oEvent.getParameter("key"),
				// Array to combine filters
				aFilters = [],
				oCombinedFilterG,
				oCombinedFilterKG,
				// Boarder values for Filter
				fMaxOkWeightKG = 1,
				fMaxOkWeightG = fMaxOkWeightKG * 1000,
				fMaxHeavyWeightKG = 5,
				fMaxHeavyWeightG = fMaxHeavyWeightKG * 1000;

			if (sKey === "Ok") {
				oCombinedFilterG = new Filter([new Filter("WeightMeasure", "LT", fMaxOkWeightG), new Filter("WeightUnit", "EQ", "G")], true);
				oCombinedFilterKG = new Filter([new Filter("WeightMeasure", "LT", fMaxOkWeightKG), new Filter("WeightUnit", "EQ", "KG")], true);
				aFilters.push(new Filter([oCombinedFilterKG, oCombinedFilterG], false));
			} else if (sKey === "Heavy") {
				oCombinedFilterG = new Filter([new Filter("WeightMeasure", "BT", fMaxOkWeightG, fMaxHeavyWeightG), new Filter("WeightUnit", "EQ", "G")], true);
				oCombinedFilterKG = new Filter([new Filter("WeightMeasure", "BT", fMaxOkWeightKG, fMaxHeavyWeightKG), new Filter("WeightUnit", "EQ", "KG")], true);
				aFilters.push(new Filter([oCombinedFilterKG, oCombinedFilterG], false));
			} else if (sKey === "Overweight") {
				oCombinedFilterKG = new Filter([new Filter("WeightMeasure", "GT", fMaxHeavyWeightKG), new Filter("WeightUnit", "EQ", "KG")], true);
				oCombinedFilterG = new Filter([new Filter("WeightMeasure", "GT", fMaxHeavyWeightG), new Filter("WeightUnit", "EQ", "G")], true);
				aFilters.push(new Filter([oCombinedFilterKG, oCombinedFilterG], false));
			}
			oBinding.filter(aFilters);
		}

	});
});