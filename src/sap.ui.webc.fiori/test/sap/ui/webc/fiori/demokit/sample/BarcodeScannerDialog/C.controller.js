sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("sap.ui.webc.fiori.sample.BarcodeScannerDialog.C", {

		openBarcodeScannerDialog: function(oEvent) {
			this.byId("bsd").show();
		},
		handleScanError: function(oEvent) {
			this.byId("scanResultLabel").setText("Error result: " + oEvent.getParameter("message"));
			this.byId("bsd").close();
		},
		handleScanSuccess: function(oEvent) {
			this.byId("scanResultLabel").setText("Success result: " + oEvent.getParameter("text"));
			this.byId("bsd").close();
		}

	});
});