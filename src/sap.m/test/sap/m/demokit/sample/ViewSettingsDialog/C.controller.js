sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, MessageToast, Fragment, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.ViewSettingsDialog.C", {
		_getDialog : function () {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.ViewSettingsDialog.Dialog", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		handleOpenDialog: function () {
			this._getDialog().open();
		},
		handleOpenDialogFilter: function () {
			this._getDialog().open("filter");
		},
		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		}
	});

	return CController;

});
