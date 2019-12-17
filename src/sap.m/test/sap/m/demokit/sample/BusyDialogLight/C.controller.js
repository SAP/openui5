sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.BusyDialogLight.C", {

		handlePress: function () {
			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			setTimeout(function () {
				oDialog.close();
			}, 3000);
		}

	});
});