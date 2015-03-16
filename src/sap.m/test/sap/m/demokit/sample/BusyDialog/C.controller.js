sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, MessageToast, Fragment, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.BusyDialog.C", {

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
				MessageToast.show("The operation has been cancelled");
			} else {
				MessageToast.show("The operation has been completed");
			}
		}
	});

	return CController;

});
