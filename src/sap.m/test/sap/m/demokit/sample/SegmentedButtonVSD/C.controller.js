sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageToast',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, MessageToast, Fragment, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.SegmentedButtonVSD.C", {

		onExit : function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleOpenDialog: function (oEvent) {
			if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.SegmentedButtonVSD.Dialog", this);
			}
			this._oDialog.setModel(this.getView().getModel());
			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		handleConfirm: function (oEvent) {
			if (oEvent.getParameters().filterString) {
				MessageToast.show(oEvent.getParameters().filterString);
			}
		}
	});


	return CController;

});
