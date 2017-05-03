sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController'
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.OrderCompleted", {

		onInit: function () {
			this._oRouter = this.getRouter();
		},

		onReturnToShopButtonPress: function () {
			//navigates back to home screen
			this._oRouter.navTo("home");
		}
	});
});