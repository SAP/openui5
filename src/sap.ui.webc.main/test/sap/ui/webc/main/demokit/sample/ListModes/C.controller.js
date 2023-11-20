sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.ListModes.C", {

		handleItemDelete: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event itemDelete fired.");
			demoToast.show();
		},
		handleSelectionChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event selectionChange fired.");
			demoToast.show();
		}

	});
});