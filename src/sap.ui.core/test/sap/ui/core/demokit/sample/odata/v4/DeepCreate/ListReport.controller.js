/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/core/UIComponent"
], function (MessageToast, Controller, UIComponent) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.DeepCreate.ListReport", {
		onCreateSalesOrder : function () {
			var oContext = this.byId("SalesOrderList").getBinding("items").create({
					BuyerID : "0100000000",
					LifecycleStatusDesc : "New"
				}),
				that = this;

			oContext.created().then(function () {
				MessageToast.show("Sales Order created: " + oContext.getProperty("SalesOrderID"));
				oContext.setKeepAlive(true, undefined, /*bRequestMessages*/ true);
			}, function () {
				// creation canceled
				UIComponent.getRouterFor(that).navTo("listReport");
			});
			this.selectSalesOrder(oContext);
		},

		onListItemPressed : function (oEvent) {
			this.selectSalesOrder(oEvent.getSource().getBindingContext());
		},

		selectSalesOrder : function (oContext) {
			if (oContext.isTransient()) {
				this.getView().getModel("ui").setProperty("/oContext", oContext);
				UIComponent.getRouterFor(this).navTo("create");
			} else {
				UIComponent.getRouterFor(this).navTo("objectPage",
					{id : oContext.getProperty("SalesOrderID")});
			}
		}
	});
});
