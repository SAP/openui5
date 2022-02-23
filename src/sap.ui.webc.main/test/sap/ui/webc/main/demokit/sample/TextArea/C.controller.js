sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.TextArea.C", {
		handleChange: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event change fired.");
			demoToast.show();
		},
		handleInput: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event input fired.");
			demoToast.show();
		}
	});
});