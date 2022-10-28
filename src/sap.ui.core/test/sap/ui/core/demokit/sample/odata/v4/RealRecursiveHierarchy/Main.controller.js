/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, Sorter, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.RealRecursiveHierarchy.Main", {
		onFilter : function () {
			var sFilter = this.getView().getModel("ui").getProperty("/sFilter");

			this.byId("table").getBinding("rows")
				.filter(new Filter("Description", FilterOperator.Contains, sFilter));
		},

		onInit : function () {
			var oTable = this.byId("table"),
				oRowsBinding = oTable.getBinding("rows");

			this.getView().setModel(new JSONModel({
				sFilter : "",
				sIcon : ""
			}), "ui");
			this.bDescending = undefined;

			// enable V4 tree table flag
			oTable._oProxy._bEnableV4 = true;

			this._oAggregation = {
				expandTo : 2,
				hierarchyQualifier : "I_SADL_RS_HIERARCHY"
			};
			oRowsBinding.setAggregation(this._oAggregation);
			oRowsBinding.resume();
		},

		onSort : function () {
			var sNewIcon,
				oSorter;

			// choose next sort order: no sort -> ascending -> descending -> no sort
			switch (this.bDescending) {
				case false:
					this.bDescending = true;
					sNewIcon = "sap-icon://sort-descending";
					oSorter = new Sorter("Quantity", /*bDescending*/true);
					break;

				case true:
					this.bDescending = undefined;
					sNewIcon = "";
					break;

				default: // undefined
					this.bDescending = false;
					sNewIcon = "sap-icon://sort-ascending";
					oSorter = new Sorter("Quantity", /*bDescending*/false);
			}

			this.getView().getModel("ui").setProperty("/sIcon", sNewIcon);
			this.byId("table").getBinding("rows").sort(oSorter);
		}
	});
});
