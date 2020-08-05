sap.ui.define( ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/ui/Device"], function (Controller, History, Device) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.RoutingMasterDetail.routingApp.controller.Detail2", {
		onInit : function () {
			this.getOwnerComponent().getRouter().getRoute("productDetails").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
			var orderId = oEvent.getParameter("arguments").orderId;
			var productId = oEvent.getParameter("arguments").productId;
			this.getView().bindElement("/orders/" + orderId + "/products/" + productId);
		},
		onToProduct1C: function() {
			this.getOwnerComponent().getRouter()
				.navTo("productDetails",
					{orderId:0, productId: 2});
		},
		onToProduct2D: function() {
			this.getOwnerComponent().getRouter()
				.navTo("productDetails",
					{orderId:1, productId: 3});
		},
		onNavBack : function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with order id 0 (will not add an history entry)
				this.getOwnerComponent().getRouter()
					.navTo("orderDetails",
						{orderId:0}, !Device.system.phone);
			}
		}
	});

});
