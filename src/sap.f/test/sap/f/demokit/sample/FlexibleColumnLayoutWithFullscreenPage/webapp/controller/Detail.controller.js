sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox'
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox) {
	"use strict";

	return Controller.extend("sap.f.FlexibleColumnLayoutWithFullscreenPage.controller.Detail", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this._bDescendingSort = false;

			this.oRouter.getRoute("detail").attachPatternMatched(this._onCategoryMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onCategoryMatched, this);
			this.oRouter.getRoute("detailDetailDetail").attachPatternMatched(this._onCategoryMatched, this);
		},
		onListItemPress: function (oEvent) {
			var productPath = oEvent.getSource().getBindingContext("products").getPath(),
				product = productPath.split("/").slice(-1).pop();

			this.oRouter.navTo("detailDetail", {layout: sap.f.LayoutType.TwoColumnsMidExpanded, category: this._category, product: product});
		},
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [
					new Filter("Name", FilterOperator.Contains, sQuery)];
			}

			oTableSearchState.push(new Filter("Category", FilterOperator.Contains, this._category));
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},

		onAdd: function (oEvent) {
			MessageBox.show("This functionality is not ready yet.", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Aw, Snap!",
				actions: [MessageBox.Action.OK]
			});
		},

		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("Name", this._bDescendingSort);

			oBinding.sort(oSorter);
		},

		_onCategoryMatched: function (oEvent) {
			var oTableSearchState;

			this._category = oEvent.getParameter("arguments").category || this._category;
			oTableSearchState = [new Filter("Category", FilterOperator.Contains, this._category)];
			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		}
	});
});
