sap.ui.controller("sap.m.sample.BusyDialog.C", {

	onOpenDialog : function (oEvent) {

		// instantiate dialog
		if (! this._dialog) {
			this._dialog = sap.ui.xmlfragment("sap.m.sample.BusyDialog.BusyDialog", this);
			this.getView().addDependent(this._dialog);
		}

		// open dialog
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._dialog);
		this._dialog.open();

		// simulate end of operation
		jQuery.sap.delayedCall(3000, this, function () {
			this._dialog.close();
		});
	},

	onDialogClosed : function (oEvent) {
		if (oEvent.getParameter("cancelPressed")) {
			sap.m.MessageToast.show("The operation has been cancelled");
		} else {
			sap.m.MessageToast.show("The operation has been completed");
		}
	}
});