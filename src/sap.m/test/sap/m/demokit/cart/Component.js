sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel',
	'sap/ui/demo/cart/model/LocalStorageModel'
], function (UIComponent,
			JSONModel,
			LocalStorageModel) {

	"use strict";

	return UIComponent.extend("sap.ui.demo.cart.Component", {

		metadata : {
			manifest : "json"
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

			// set device model
			var oDeviceModel = new JSONModel({
				// feature toggle for a save for later functionality in the Cart.view.xml
				isTouch: sap.ui.Device.support.touch,
				isNoTouch: !sap.ui.Device.support.touch,
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
				listMode: (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType: (sap.ui.Device.system.phone) ? "Active" : "Inactive"
			});
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			this.getRouter().initialize();
			this._router = this.getRouter();
		},

		myNavBack : function () {
			var oHistory = sap.ui.core.routing.History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this._router.navTo("home", {}, true);
			}
		},

		createContent: function () {
			// create root view
			return sap.ui.view({
				viewName: "sap.ui.demo.cart.view.App",
				type: "XML"
			});
		}
	});

});
