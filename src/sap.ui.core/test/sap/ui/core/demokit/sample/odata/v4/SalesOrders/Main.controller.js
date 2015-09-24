/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrders.Main", {
		onBeforeRendering: function(oEvent) {
			var oView = this.getView();

			oView.setBusy(true);

			oView.byId("SalesOrders").getBinding("items").attachEventOnce("change",
				function () {
					oView.setBusy(false);
				}
			);
		},

		onSalesOrdersSelect : function (oEvent) {
			var oView = this.getView(),
				oSalesOrderContext = oEvent.getParameters().listItem.getBindingContext();

			oView.byId("SalesOrderLineItems").setBindingContext(oSalesOrderContext);
			oView.byId("SupplierContactData").setBindingContext(undefined);

		},

		onSalesOrderLineItemSelect : function (oEvent) {
			var oView = this.getView(),
				oSalesOrderLineItemContext = oEvent.getParameters().listItem.getBindingContext();

			oView.byId("SupplierContactData").setBindingContext(oSalesOrderLineItemContext);
		}
	});

});