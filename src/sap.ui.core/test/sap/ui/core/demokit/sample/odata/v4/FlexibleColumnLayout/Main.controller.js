/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/f/library",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Messaging",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/test/TestUtils"
], function (library, MessageBox, MessageToast, Messaging, UI5Date, Controller, Filter,
		FilterOperator, Sorter, JSONModel, TestUtils) {
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

		newLineItem : function () {
			var oDeliveryDate = UI5Date.getInstance(),
				oType = this.getView().getModel().getMetaModel()
					.getUI5Type("/SalesOrderList/SO_2_SOITEM/DeliveryDate");

			oDeliveryDate.setFullYear(oDeliveryDate.getFullYear() + 1);

			return {
				CurrencyCode : "EUR",
				DeliveryDate : oType.getModelValue(oDeliveryDate),
				GrossAmount : "42.0",
				ProductID : "HT-1000",
				Quantity : "2.000",
				QuantityUnit : "EA"
			};
		},

		onCancel : function () {
			this.getView().getModel().resetChanges("UpdateGroup");
			this.mChangedSalesOrders = {};
		},

		onCreateLineItem : function () {
			var oContext,
				oListBinding = this.byId("SO_2_SOITEM").getBinding("items"),
				bDeepCreate = oListBinding.getContext().isTransient();

			oListBinding.create(this.newLineItem(), false).created().then(function () {
				if (!bDeepCreate) {
					MessageToast.show("Line item created: " + oContext.getProperty("ItemPosition"));
				}
			}, function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
			});
			this.rememberChangedSalesOrderContext();
		},

		onCreateSalesOrder : function () {
			var oContext = this.byId("SalesOrderList").getBinding("items").create({
					BuyerID : "0100000000",
					LifecycleStatus : "N",
					SO_2_SOITEM : [this.newLineItem()]
				}, true),
				that = this;

			oContext.created().then(function () {
				that.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
				MessageToast.show("Sales Order with "
					+ that.byId("SO_2_SOITEM").getBinding("items").getLength() + " items created: "
					+ oContext.getProperty("SalesOrderID"));
			}, function (oError) {
				if (!oError.canceled) {
					throw oError; // unexpected error
				}
				if (that.byId("objectPage").getBindingContext() === oContext) {
					that.oUIModel.setProperty("/sLayout", LayoutType.OneColumn);
					that.oUIModel.setProperty("/bSalesOrderSelected", false);
				}
			});
			this.byId("SalesOrderList").setSelectedItem(
				this.byId("SalesOrderList").getItems()[oContext.getIndex()]);
			this.selectSalesOrder(oContext);
		},

		onDeleteSalesOrder : function (oEvent) {
			oEvent.getSource().getBindingContext().delete("$auto").then(function () {
				MessageBox.success("Sales order deleted");
			});
		},

		onDeleteSalesOrderItem : function (oEvent) {
			var oOrderContext = this.byId("objectPage").getBindingContext();

			if (!oOrderContext.isTransient()) {
				oOrderContext.requestSideEffects(["GrossAmount"], "$auto")
					.catch(function () { /*may fail because of previous request*/ });
			}

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
			oAction.invoke().then(function () {
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
			this.getView().setModel(Messaging.getMessageModel(), "messages");
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

		onResetContext : function (oEvent) {
			oEvent.getSource().getBindingContext().resetChanges();
		},

		onSalesOrderLineItemSelect : function (oEvent) {
			this.setSalesOrderLineItemBindingContext(
				oEvent.getParameters().listItem.getBindingContext());
		},

		onSalesOrderSelect : function (oEvent) {
			this.selectSalesOrder(oEvent.getParameters().listItem.getBindingContext());
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

			if (!oContext.isTransient()) {
				this.mChangedSalesOrders[oContext.getPath()] = oContext;
			}
		},

		selectSalesOrder : function (oContext) {
			var oObjectPage = this.byId("objectPage"),
				oOldPageContext,
				that = this;

			if (!oContext.isTransient()) {
				oContext.setKeepAlive(true, function () {
					// Handle destruction of a kept-alive context
					that.oUIModel.setProperty("/sLayout", LayoutType.OneColumn);
					that.oUIModel.setProperty("/bSalesOrderSelected", false);
				}, /*bRequestMessages*/true);
			}
			oOldPageContext = oObjectPage.getBindingContext();
			if (oOldPageContext && !oOldPageContext.isTransient()) {
				oOldPageContext.setKeepAlive(false);
			}
			oObjectPage.setBindingContext(oContext);
			this.byId("lineItemsTitle").setBindingContext(
				this.byId("SO_2_SOITEM").getBinding("items").getHeaderContext(), "headerContext");

			this.oUIModel.setProperty("/sLayout", LayoutType.TwoColumnsMidExpanded);
			this.oUIModel.setProperty("/bSalesOrderSelected", true);
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

		submitBatch : function (sGroupId) {
			var oView = this.getView();

			oView.setBusy(true);
			// request new ETag for each sales order touched by changes on item level (containment)
			Object.values(this.mChangedSalesOrders).forEach(function (oSalesOrderContext) {
				oSalesOrderContext.requestSideEffects(["GrossAmount"])
					.catch(function () { /*may fail because of previous request*/ });
			});
			this.mChangedSalesOrders = {};
			return oView.getModel().submitBatch(sGroupId).finally(function () {
				oView.setBusy(false);
			});
		}
	});
});
