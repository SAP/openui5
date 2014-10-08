sap.ui.controller("sap.m.sample.BusyDialogLight.C", {
	handlePress: function (oEvent) {
		var oDialog = this.getView().byId("BusyDialog");
		oDialog.open();

		jQuery.sap.delayedCall(3000, this, function () {
			oDialog.close();
		});
	}
});
