sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel',
	'sap/ui/demo/cart/model/LocalStorageModel',
	'sap/ui/demo/cart/model/models'
], function (UIComponent, JSONModel, LocalStorageModel, models) {

	"use strict";

	return UIComponent.extend("sap.ui.demo.cart.Component", {

		metadata: {
			manifest: "json"
		},

		init: function () {
			// call overwritten init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);

			//create and set cart model
			var oCartModel = new LocalStorageModel("SHOPPING_CART", {
				cartEntries: {},
				savedForLaterEntries: {}
			});
			this.setModel(oCartModel, "cartProducts");

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			this.getRouter().initialize();
			this._oRouter = this.getRouter();
		},

		myNavBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this._oRouter.navTo("home", {}, true);
			}
		},

		createContent: function () {
			// create root view
			return sap.ui.view("AppView", {
				viewName: "sap.ui.demo.cart.view.App",
				type: "XML"
			});
		}
	});
});
