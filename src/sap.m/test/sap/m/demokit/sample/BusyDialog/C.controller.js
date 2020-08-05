sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageToast"
], function (Controller, Fragment, syncStyleClass, MessageToast) {
	"use strict";

	var iTimeoutId;

	return Controller.extend("sap.m.sample.BusyDialog.C", {

		onOpenDialog: function () {
			// load BusyDialog fragment asynchronously
			if (!this._oBusyDialog) {
				Fragment.load({
					name: "sap.m.sample.BusyDialog.BusyDialog",
					controller: this
				}).then(function (oFragment) {
					this._oBusyDialog = oFragment;
					this.getView().addDependent(this._oBusyDialog);
					syncStyleClass("sapUiSizeCompact", this.getView(), this._oBusyDialog);
					this._oBusyDialog.open();
					this.simulateServerRequest();
				}.bind(this));
			} else {
				this._oBusyDialog.open();
				this.simulateServerRequest();
			}
		},

		simulateServerRequest: function () {
			// simulate a longer running operation
			iTimeoutId = setTimeout(function() {
				this._oBusyDialog.close();
			}.bind(this), 3000);
		},

		onDialogClosed: function (oEvent) {
			clearTimeout(iTimeoutId);

			if (oEvent.getParameter("cancelPressed")) {
				MessageToast.show("The operation has been cancelled");
			} else {
				MessageToast.show("The operation has been completed");
			}
		}

	});
});