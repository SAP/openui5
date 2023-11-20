sap.ui.define([
		'sap/ui/core/syncStyleClass',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(syncStyleClass, Fragment, Controller) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ContainerPadding.Page", {

		dialog: null,

		onDialogOpen: function (oEvent) {
			var oView = this.getView();
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.ContainerPadding.Dialog",
					controller: this
				}).then(function(oDialog){
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pDialog.then(function(oDialog){
				// toggle compact style
				syncStyleClass("sapUiSizeCompact", oView, oDialog);
				oDialog.open();
			});
		},

		onDialogCloseButton: function (oEvent) {
			this._pDialog.then(function(oDialog){
				oDialog.close();
			});
		}
	});

	return PageController;

});