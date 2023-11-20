sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/core/Fragment',
	'sap/m/MessageToast'
], function(Controller, Fragment, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.ViewSettingsDialogCustomTabs.C", {

		handleOpenDialog: function () {
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					name: "sap.m.sample.ViewSettingsDialogCustomTabs.Dialog",
					controller: this
				});
			}
			this._pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		handleOpenDialogSingleCustomTab: function () {
			if (!this._pDialogSingleCustomTab) {
				this._pDialogSingleCustomTab = Fragment.load({
					id: "dialogSingleCustomTab",
					name: "sap.m.sample.ViewSettingsDialogCustomTabs.DialogSingleCustomTab",
					controller: this
				});
			}
			this._pDialogSingleCustomTab.then(function(oDialogSingleCustomTab) {
				oDialogSingleCustomTab.open();
			});
		},

		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		}
	});
});
