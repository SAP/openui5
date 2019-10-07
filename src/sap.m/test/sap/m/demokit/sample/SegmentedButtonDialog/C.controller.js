sap.ui.define([
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(Fragment, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.SegmentedButtonDialog.C", {

		onOpenDialog: function () {
			if (!this._oDialog) {
				Fragment.load({
					id: "dialogFrag",
					name: "sap.m.sample.SegmentedButtonDialog.Dialog",
					controller: this
				}).then(function(oDialog){
					this._oDialog = oDialog;
					this.getView().addDependent(this._oDialog);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._oDialog.open();
			}
		},

		onCloseDialog: function () {
			this._oDialog.close();
		}
	});

});
