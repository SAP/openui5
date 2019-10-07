sap.ui.define([
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(MessageToast, Fragment, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.SegmentedButtonVSD.C", {

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleOpenDialog: function () {
			if (!this._oDialog) {
				Fragment.load({
					id: "dialogFrag",
					name: "sap.m.sample.SegmentedButtonVSD.Dialog",
					controller: this
				}).then(function(oDialog){
					this._oDialog = oDialog;
					this._oDialog.setModel(this.getView().getModel());
					this._oDialog.open();
				}.bind(this));
			} else {
				this._oDialog.setModel(this.getView().getModel());
				this._oDialog.open();
			}
		},

		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		}
	});

});
