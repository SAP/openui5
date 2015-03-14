sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller'
	], function(jQuery, Fragment, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.SegmentedButtonDialog.C", {

		onOpenDialog: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.SegmentedButtonDialog.Dialog", this);
				this.getView().addDependent(this._oDialog);
			}

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
			this._oDialog.open();
		},

		onCloseDialog: function (oEvent) {
			this._oDialog.close();
		}
	});


	return CController;

});
