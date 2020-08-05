sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
],  function (Controller, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.m.sample.ComparisonPattern.app.controller.Main", {

		onAfterRendering : function () {
			var oTableFilter = [new Filter("Category", FilterOperator.EQ, "Laptops")];

			// Filter only laptops to be shown in order to compare items form the same kind.
			// Not needed step for data with similar items.
			this.getView().byId("idProductsTable").getBinding("items").filter(oTableFilter, "Application");
			this._oCompareButton = this.getView().byId("compareBtn");
		},

		onToNextPage : function () {
			this.getOwnerComponent().getRouter().navTo("page2");
		},

		onSelection: function(oEvent) {
			var iSelectedItemsCount,
				bShowCompareButton;

			this.getOwnerComponent().aSelectedItems = oEvent.getSource().getSelectedContextPaths();
			iSelectedItemsCount = this.getOwnerComponent().aSelectedItems.length;
			bShowCompareButton = iSelectedItemsCount > 1;

			if (bShowCompareButton) {
				this._oCompareButton.setText("Compare (" + this.getOwnerComponent().aSelectedItems.length + ")");
			}

			this._oCompareButton.setVisible(bShowCompareButton);
		}
	});

});