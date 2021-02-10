sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment"
], function (Controller, Fragment) {
	"use strict";

	return Controller.extend("sap.f.sample.IllustratedMessageInDialog.controller.Main", {
		handleOpenDialog : function () {

			// create value help dialog
			if (!this._oDialog) {
				Fragment.load({
					name: "sap.f.sample.IllustratedMessageInDialog.view.fragments.Dialog",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;

					this.getView().addDependent(this._oDialog);

					this._oDialog.open();
				}.bind(this));
			} else {
				this._oDialog.open();
			}
		},
		onDialogClose : function () {
			this._oDialog.close();
		}
	});
});