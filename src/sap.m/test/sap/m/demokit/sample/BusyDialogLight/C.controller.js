sap.ui.define(['jquery.sap.global','sap/ui/core/mvc/Controller'],
	function(jQuery, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.BusyDialogLight.C", {
		handlePress: function (oEvent) {
			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			jQuery.sap.delayedCall(3000, this, function () {
				oDialog.close();
			});
		}
	});


	return CController;

});
