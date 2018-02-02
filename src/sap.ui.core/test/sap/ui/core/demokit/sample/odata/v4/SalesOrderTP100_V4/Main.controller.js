/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/mvc/Controller'], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrderTP100_V4.Main", {
		onBeforeRendering : function () {
			this.byId("SalesOrdersTitle").setBindingContext(
				this.byId("SalesOrders").getBinding("items").getHeaderContext());
		},
		onSalesOrdersSelect : function (oEvent) {
			this.byId("SalesOrderItems").setBindingContext(
				oEvent.getParameters().listItem.getBindingContext());
		}
	});
});
