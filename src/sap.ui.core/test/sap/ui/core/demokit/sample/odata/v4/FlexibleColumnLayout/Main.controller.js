/*!
 * ${copyright}
 */
sap.ui.define([
	"./Formatter", // make it available to the view
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (_Formatter, library, MessageBox, MessageToast, Controller, Filter, FilterOperator,
		Sorter, JSONModel, TestUtils) {
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

		hasPendingChanges : function (vBindingOrContext, sVerb, bIgnoreKeptAlive) {
			if (vBindingOrContext.hasPendingChanges(bIgnoreKeptAlive)) {
				MessageBox.error(
					"There are unsaved changes which will be lost; save or reset changes before "
					+ sVerb);

				return true;
			}
			return false;
		},

		onCancel : function () {
			this.getView().getModel().resetChanges("UpdateGroup");
			this.setSelectionMode("SingleSelectMaster");
			this.mChangedSalesOrders = {};
		},

		onCreateLineItem : function () {
			var oContext,
				oDeliveryDate = new Date();

			oDeliveryDate.setFullYear(oDeliveryDate.getFullYear() + 1);
			oDeliveryDate.setMilliseconds(0);
			this.byId("SO_2_SOITEM").getBinding("items").create({
				CurrencyCode : "EUR",
				DeliveryDate : oDeliveryDate.toJSON(),
				GrossAmount : "42.0",
				ProductID : "HT-1000",
				Quantity : "2.000",
				QuantityUnit : "EA"
			}, false).created().then(function () {
				MessageToast.show("Line item created: " + oContext.getProperty("ItemPosition"));
			}, function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			});
			this.rememberChangedSalesOrderContext();
			this.setSelectionMode("None");
		},

		onDeleteSalesOrder : function (oEvent) {
			oEvent.getSource().getBindingContext().delete("$auto").then(function () {
				MessageBox.success("Sales order deleted");
			});
		},

		onDeleteSalesOrderItem : function (oEvent) {
			this.byId("objectPage").getBindingContext().requestSideEffects(["GrossAmount"], "$auto")
					.catch(function () { /*may fail because of previous request*/ });

			oEvent.getSource().getBindingContext().delete("$auto").then(function () {
				MessageBox.success("Sales order line item deleted");
			});
		},

		onExit : function () {
			this.oUIModel.destroy(); // avoid changes on UI elements if this view destroys
			Controller.prototype.onExit.apply(this);
		},

		onFilterSalesOrders : function (oEvent) {
			var oBinding = this.byId("SalesOrderList").getBinding("items"),
				sQuery = oEvent.getParameter("query");

			if (this.hasPendingChanges(oBinding, "filtering", true)) {
				return;
			}

			oBinding.filter(sQuery ? new Filter("GrossAmount", FilterOperator.GT, sQuery) : null);
		},

		onIncreaseSalesOrderItemsQuantity : function () {
			var oContext = this.byId("objectPage").getBindingContext(),
				oView = this.getView(),
				oAction = oView.getModel().bindContext("com.sap.gateway.default.zui5_epm_sample"
					+ ".v0002.SalesOrderIncreaseItemsQuantity(...)", oContext,
					{$select : ["GrossAmount", "Note"]});

			if (this.hasPendingChanges(this.byId("SalesOrderList").getBinding("items"),
					"invoking action")) {
				return;
			}

			oView.setBusy(true);
			oAction.execute().then(function () {
				MessageToast.show("All items' quantities increased by 1, "
					+ "sales order gross amount is now: "
					+ oAction.getBoundContext().getProperty("GrossAmount"));
			}, function (oError) {
				MessageToast.show(oError.message);
			});

			oContext.requestSideEffects([
					"SO_2_SOITEM/GrossAmount",
					"SO_2_SOITEM/Quantity"
				], "$auto")
				.catch(function () { /*may fail because of previous requests*/ })
				.finally(function () {
					oView.setBusy(false);
				});
		},

		onInit : function () {
			this.mChangedSalesOrders = {};
			this.initMessagePopover("showMessages");
			this.oUIModel = new JSONModel({
					iMessages : 0,
					bRealOData : TestUtils.isRealOData(),
					bSortGrossAmountDescending : true,
					sSortGrossAmountIcon : "",
					bSortSalesOrderIDDescending : undefined,
					sSortSalesOrderIDIcon : ""
				}
			);
			this.getView().setModel(this.oUIModel, "ui");
			this.getView().setModel(this.getView().getModel(), "headerContext");
			// TODO initMessagePopover should expose its "messages" model to the complete view
			this.getView().setModel(sap.ui.getCore().getMessageManager().getMessageModel(),
				"messages");
			this.byId("salesOrderListTitle").setBindingContext(
				this.byId("SalesOrderList").getBinding("items").getHeaderContext(),
				"headerContext");
		},

		onRefreshSalesOrder : function () {
			var oContext = this.byId("objectPage").getBindingContext();

			if (this.hasPendingChanges(oContext, "refreshing")) {
				return;
			}
			oContext.refresh(undefined, true);
		},

		onRefreshSalesOrderList : function () {
			var oBinding = this.byId("SalesOrderList").getBinding("items");

			if (this.hasPendingChanges(oBinding, "refreshing", true)) {
				return;
			}
			oBinding.refresh();
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			this.setSalesOrderLineItemBindingContext(
				oEvent.getParameters().listItem.getBindingContext());
		},

		onSalesOrderSelect : function (oEvent) {
			var oObjectPage = this.byId("objectPage"),
				oContext = oEvent.getParameters().listItem.getBindingContext(),
				that = this;

			oContext.setKeepAlive(true, function () {
				// Handle destruction of a kept-alive context
				that.oUIModel.setProperty("/sLayout", LayoutType.OneColumn);
				that.oUIModel.setProperty("/bSalesOrderSelected", false);
			}, /*bRequestMessages*/true);
			if (oObjectPage.getBindingContext()) {
				oObjectPage.getBindingContext().setKeepAlive(false);
			}
			oObjectPage.setBindingContext(oContext);
			this.byId("lineItemsTitle").setBindingContext(
				this.byId("SO_2_SOITEM").getBinding("items").getHeaderContext(), "headerContext");

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

			if (this.hasPendingChanges(oBinding, "sorting", true)) {
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

			if (this.hasPendingChanges(oBinding, "sorting", true)) {
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

		rememberChangedSalesOrderContext : function () {
			var oContext = this.byId("objectPage").getBindingContext();

			this.mChangedSalesOrders[oContext.getPath()] = oContext;
		},

		setSalesOrderLineItemBindingContext : function (oContext) {
			var oSubObjectPage = this.byId("subObjectPage"),
				that = this;

			// code sample to switch the context using the Context#setKeepAlive
			if (oContext && !oContext.isTransient()) {
				oContext.setKeepAlive(true, function () {
					// Handle destruction of a kept-alive context
					that.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
					that.oUIModel.setProperty("/bSalesOrderItemSelected", false);
				});
			}
			if (oSubObjectPage.getBindingContext()
					&& !oSubObjectPage.getBindingContext().isTransient()) {
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

		setSelectionMode : function (sMode) {
			var oTable = this.getView().byId("SalesOrderList");

			if (sMode === "SingleSelectMaster") {
				oTable.setMode(sMode);
				oTable.setSelectedItem(oTable.getItems()[this.iSelectedSalesOrder]);
				this.iSelectedSalesOrder = undefined;
			} else {
				this.iSelectedSalesOrder = this.iSelectedSalesOrder
					|| oTable.getSelectedItem().getBindingContext().getIndex();
				oTable.setMode("None");
			}
		},

		submitBatch : function (sGroupId) {
			var oView = this.getView(),
				that = this;

			oView.setBusy(true);
			// request new ETag for each sales order touched by changes on item level (containment)
			Object.keys(this.mChangedSalesOrders).forEach(function (sPath) {
				that.mChangedSalesOrders[sPath].requestSideEffects(["GrossAmount"])
					.catch(function () { /*may fail because of previous request*/ });
			});
			return oView.getModel().submitBatch(sGroupId).finally(function () {
				oView.setBusy(false);
				that.setSelectionMode("SingleSelectMaster");
			});
		}
	});
});
