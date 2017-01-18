sap.ui.controller("sap.ui.demo.cart.controller.NotFound", {

	onInit : function () {
		this._router = sap.ui.core.UIComponent.getRouterFor(this);
	},

	onNavBack : function () {
		this._router._myNavBack();
	}
});