sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.ShellBar.C", {

		onInit: function() {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},
		handleCoPilotClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event coPilotClick fired.");
			demoToast.show();
		},
		handleLogoClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event logoClick fired.");
			demoToast.show();
		},
		handleMenuItemClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event menuItemClick fired.");
			demoToast.show();
		},
		handleNotificationsClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event notificationsClick fired.");
			demoToast.show();
		},
		handleProductSwitchClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event productSwitchClick fired.");
			demoToast.show();
		},
		handleProfileClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event profileClick fired.");
			demoToast.show();
		}

	});
});