sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.DialogSearch.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onOpenDialog: function (oEvent) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("sap.m.sample.DialogSearch.Dialog", this);
				this.getView().addDependent(this._oDialog);
			}

			this._oDialog.bindElement("/ProductCollection/0");
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