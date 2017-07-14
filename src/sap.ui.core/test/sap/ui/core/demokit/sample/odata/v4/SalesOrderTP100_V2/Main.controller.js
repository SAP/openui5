/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/mvc/Controller'], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrderTP100_V2.Main", {
		onSalesOrdersSelect : function (oEvent) {
			this.getView().byId("SalesOrderItems").setBindingContext(
				oEvent.getParameters().listItem.getBindingContext());
		}
	});
});
