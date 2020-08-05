/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter"
], function (Log, library, MessageBox, MessageToast, Controller, Filter, FilterOperator,
		FilterType, Sorter) {
	"use strict";

	var LayoutType = library.LayoutType;

	return Controller.extend("sap.ui.core.sample.odata.v4.FlexibleColumnLayout.Main", {
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

		onCancel : function () {
			this.oModel.resetChanges("UpdateGroup");
		},

		onInit : function () {
			this.initMessagePopover("showMessages");
			this.oModel = this.getView().getModel();
			this.oUIModel = this.getView().getModel("ui");
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			this.setSalesOrderLineItemBindingContext(
				oEvent.getParameters().listItem.getBindingContext());
		},
		onSalesOrderSelect : function (oEvent) {
			var oObjectPage = this.byId("objectPage"),
				oContext = oEvent.getParameters().listItem.getBindingContext();

			// code sample to switch the context using the Context#setKeepAlive
			oContext.setKeepAlive(true);
			if (oObjectPage.getBindingContext()) {
				oObjectPage.getBindingContext().setKeepAlive(false);
			}
			oObjectPage.setBindingContext(oContext);

			this.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
			this.oUIModel.setProperty("/bSalesOrderSelected", true);
		},

		onSave : function () {
			this.submitBatch("UpdateGroup");
		},

		onSortByGrossAmount : function () {
			var oBinding = this.byId("SO_2_SOITEM").getBinding("items"),
				bDescending = this.oUIModel.getProperty("/bSortGrossAmountDescending"),
				oSortOrder;

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot sort due to unsaved changes"
					+ "; save or reset changes before sorting");
				return;
			}

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("GrossAmount", oSortOrder.bDescending)
			);

			this.oUIModel.setProperty("/bSortGrossAmountDescending", oSortOrder.bDescending);
			this.oUIModel.setProperty("/sSortGrossAmountIcon", oSortOrder.sNewIcon);
		},

		onSortBySalesOrderID : function () {
			var oBinding = this.byId("SalesOrderList").getBinding("items"),
				bDescending = this.oUIModel.getProperty("/bSortSalesOrderIDDescending"),
				oSortOrder;

			if (oBinding.hasPendingChanges()) {
				MessageBox.error("Cannot change parameters due to unsaved changes"
					+ "; save or reset changes before sorting");
				return;
			}

			oSortOrder = this.getNextSortOrder(bDescending);
			oBinding.sort(oSortOrder.bDescending === undefined
				? undefined
				: new Sorter("SalesOrderID", oSortOrder.bDescending)
			);

			this.oUIModel.setProperty("/bSortSalesOrderIDDescending", oSortOrder.bDescending);
			this.oUIModel.setProperty("/sSortSalesOrderIDIcon", oSortOrder.sNewIcon);
		},

		setSalesOrderLineItemBindingContext : function (oContext) {
			var oSubObjectPage = this.byId("subObjectPage");

			// code sample to switch the context using the Context#setKeepAlive
			if (oContext) {
				oContext.setKeepAlive(true);
			}
			if (oSubObjectPage.getBindingContext()) {
				oSubObjectPage.getBindingContext().setKeepAlive(false);
			}
			oSubObjectPage.setBindingContext(oContext);

			if (!this.oUIModel.getProperty("/bSalesOrderItemSelected")) {
				this.sLastLayout = this.byId("layout").getLayout();
			}
			this.oUIModel.setProperty("/sLayout", oContext
				? LayoutType.ThreeColumnsMidExpanded
				: this.sLastLayout);
			this.oUIModel.setProperty("/bSalesOrderItemSelected", !!oContext);
		},

		submitBatch : function (sGroupId) {
			var oView = this.getView();

			oView.setBusy(true);
			return this.oModel.submitBatch(sGroupId).finally(function () {
				oView.setBusy(false);
			});
		}
	});
});