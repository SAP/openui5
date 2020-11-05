sap.ui.define([
		'sap/ui/core/syncStyleClass',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(syncStyleClass, Fragment, Controller, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.DialogSearch.C", {

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/products.json"));
			this.getView().setModel(oModel);
		},

		onOpenDialog: function (oEvent) {
			var oView = this.getView();
			if (!this._pDialog) {
				this._pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.m.sample.DialogSearch.Dialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			}

			this._pDialog.then(function (oDialog) {
				oDialog.bindElement("/ProductCollection/0");
				// toggle compact style
				syncStyleClass("sapUiSizeCompact", oView, oDialog);
				oDialog.open();
			});
		},

		onCloseDialog: function (oEvent) {
			this._pDialog.then(function (oDialog) {
				oDialog.close();
			});
		}
	});

	return CController;

});