sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Fragment',
	'sap/m/MessageToast'
], function(Controller, Fragment, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.ViewSettingsDialogCustomTabs.C", {
		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
			if (this._oDialogSingleCustomTab) {
				this._oDialogSingleCustomTab.destroy();
			}
		},

		handleOpenDialog: function () {
			if (this._oDialogSingleCustomTab) {
				this._oDialogSingleCustomTab.destroy();
				this._oDialogSingleCustomTab = null;
			}
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.m.sample.ViewSettingsDialogCustomTabs.Dialog",
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

		handleOpenDialogSingleCustomTab: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null;
			}
			if (!this._oDialogSingleCustomTab) {
				Fragment.load({
					name: "sap.m.sample.ViewSettingsDialogCustomTabs.DialogSingleCustomTab",
					controller: this
				}).then(function(oDialog){
					this._oDialogSingleCustomTab = oDialog;
					this._oDialogSingleCustomTab.setModel(this.getView().getModel());
					this._oDialogSingleCustomTab.open();
				}.bind(this));
			} else {
				this._oDialogSingleCustomTab.setModel(this.getView().getModel());
				this._oDialogSingleCustomTab.open();
			}
		},

		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		}
	});
});
