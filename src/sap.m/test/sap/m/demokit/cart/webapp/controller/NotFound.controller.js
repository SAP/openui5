sap.ui.define([
	'sap/ui/demo/cart/controller/BaseController'
], function (BaseController) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.NotFound", {
		onInit: function () {
			this._router = sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavBack: function () {
			this._router._myNavBack();
		}
	});
});