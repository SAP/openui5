sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.TreeBase.C", {

		handleItemClick: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemClick fired.");
			demoToast.show();
		},
		handleItemMouseout: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemMouseout fired.");
			demoToast.show();
		},
		handleItemMouseover: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemMouseover fired.");
			demoToast.show();
		}

	});
});