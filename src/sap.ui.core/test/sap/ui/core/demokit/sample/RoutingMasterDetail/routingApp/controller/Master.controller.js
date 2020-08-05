sap.ui.define( ["sap/ui/core/mvc/Controller", "sap/ui/Device"], function (Controller, Device) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.RoutingMasterDetail.routingApp.controller.Master", {
		onInit : function () {
			this.getOwnerComponent().getRouter().getRoute("master").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
			/*
			* Navigate to the first item by default only on desktop and tablet (but not phone).
			* Note that item selection is not handled as it is
			* out of scope of this sample
			*/
			if (!Device.system.phone) {
				this.getOwnerComponent().getRouter()
					.navTo("orderDetails", {orderId: 0}, true);
			}
		},
		onSelectionChange: function(oEvent) {
			var sOrderId = oEvent.getSource().getSelectedItem().getBindingContext().getProperty("orderId");
			this.getOwnerComponent().getRouter()
				.navTo("orderDetails",
					{orderId:sOrderId},
					!Device.system.phone);
		}
	});

});
