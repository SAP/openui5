/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageBox",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (MessageBox, Controller, UIComponent, Filter, FilterOperator, Sorter) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Draft.ListReport", {
		getNextSortOrder : function (bDescending) {
			var sNewIcon;

			// choose next sort order: no sort => ascending <-> descending
			if (bDescending) {
				sNewIcon = "sap-icon://sort-ascending";
				bDescending = false;
			} else {
				sNewIcon = "sap-icon://sort-descending";
				bDescending = true;
			}
			return {bDescending : bDescending, sNewIcon : sNewIcon};
		},

		hasPendingChanges : function (vBindingOrContext, sVerb, bIgnoreKeptAlive) {
			if (vBindingOrContext.hasPendingChanges(bIgnoreKeptAlive)) {
				MessageBox.error(
					"There are unsaved changes which will be lost; save or reset changes before "
					+ sVerb);

				return true;
			}
			return false;
		},

		onFilterProducts : function (oEvent) {
			var oBinding = this.byId("Products").getBinding("items"),
				sQuery = oEvent.getParameter("query");

			if (this.hasPendingChanges(oBinding, "filtering", true)) {
				return;
			}

			oBinding.filter(sQuery ? new Filter("amount", FilterOperator.GT, sQuery) : null);
		},

		onInit : function () {
			var oRouter = UIComponent.getRouterFor(this);

			oRouter.getRoute("objectPage").attachPatternMatched(this.onPatternMatched, this);
			oRouter.getRoute("objectPageNoList").attachPatternMatched(this.onPatternMatched, this);

			// The view does not have the default model yet, so wait for it
			this.getView().attachModelContextChange(this.onModelContextChange, this);
		},

		onModelContextChange : function () {
			var oProductsTable = this.byId("Products"),
				oListBinding = oProductsTable.getBinding("items");

			this.getView().setModel(this.getView().getModel(), "headerContext");
			this.byId("productsTitle").setBindingContext(
				oListBinding.getHeaderContext(),
				"headerContext");
		},

		onPatternMatched : function (oEvent) {
			var sPath = "/Products" + oEvent.getParameter("arguments").key,
				oTable = this.byId("Products"),
				oSelectedItem = oTable.getItems().find(function (oItem) {
					return oItem.getBindingContext().getPath() === sPath;
				});

			if (oSelectedItem) {
				oTable.setSelectedItem(oSelectedItem);
			}
		},

		onProductSelect : function (oEvent) {
			var oContext = oEvent.getParameters().listItem.getBindingContext(),
				sPath = oContext.getPath(),
				sKey = sPath.slice(sPath.lastIndexOf("("));

			UIComponent.getRouterFor(this).navTo("objectPage", {key : sKey});
		},

		onRefreshProducts : function () {
			var oBinding = this.byId("Products").getBinding("items");

			if (this.hasPendingChanges(oBinding, "refreshing")) {
				return;
			}
			oBinding.refresh();
		},

		onSortByProductID : function () {
			var oBinding = this.byId("Products").getBinding("items"),
				oUIModel = this.oView.getModel("ui"),
				bDescending = oUIModel.getProperty("/bSortProductIDDescending"),
				oSortOrder;

			if (this.hasPendingChanges(oBinding, "sorting", true)) {
				return;
			}

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("ID", oSortOrder.bDescending)
			);

			oUIModel.setProperty("/bSortProductIDDescending", oSortOrder.bDescending);
			oUIModel.setProperty("/sSortProductIDIcon", oSortOrder.sNewIcon);
		}
	});
});
