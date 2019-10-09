sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(MessageToast, Fragment, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.ViewSettingsDialog.C", {
		_openDialog : function (sState) {
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.ViewSettingsDialog.Dialog",
					controller: this
				}).then(function(oDialog){
					this._oDialog = oDialog;
					this.getView().addDependent(this._oDialog);
					this._oDialog.open(sState);
				}.bind(this));
			} else {
				this._oDialog.open(sState);
			}
		},

		handleOpenDialog: function () {
			this._openDialog();
		},

		handleOpenDialogFilter: function () {
			this._openDialog("filter");
		},

		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		}
	});

});
