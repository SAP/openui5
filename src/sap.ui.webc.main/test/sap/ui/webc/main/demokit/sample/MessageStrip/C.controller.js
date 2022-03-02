sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.main.sample.MessageStrip.C", {
		handleClose: function(oEvent) {
			var demoToast = this.getView().byId("demoToast");
			demoToast.setText("Event close fired.");
			demoToast.show();
		}
	});
});