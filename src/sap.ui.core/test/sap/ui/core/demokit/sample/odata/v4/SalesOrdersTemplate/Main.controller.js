/*!
 * ${copyright}
 */
sap.ui.define([
		'sap/ui/core/mvc/Controller'
	], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.SalesOrdersTemplate.Main", {
		onBeforeRendering : function (oEvent) {
			var oView = this.getView();

			//TODO: if there is no data returned we got no change event -> we have to
			// attach to dataReceived event to get the view enabled again
			oView.setBusy(true);

			oView.byId("SalesOrders").getBinding("items").attachEventOnce("change",
				function () {
					oView.setBusy(false);
				}
			);
		},
	});

});