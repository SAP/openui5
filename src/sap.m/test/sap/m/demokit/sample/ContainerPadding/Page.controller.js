sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/Fragment',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, Fragment, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.ContainerPadding.Page", {

		dialog: null,

		onInit: function () {
			// set explored app's demo model on this sample
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");
			this.getView().setModel(oModel);
		},

		onDialogOpen: function (oEvent) {
			if (!this.dialog) {
				this.dialog = sap.ui.xmlfragment(
					"sap.m.sample.ContainerPadding.Dialog",
					this // associate controller with the fragment
				);
				this.getView().addDependent(this.dialog);
			}

			// bind product data
			this.dialog.bindElement("/ProductCollection/0");

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.dialog);
			this.dialog.open();
		},

		onDialogCloseButton: function (oEvent) {
			this.dialog.close();
		}
	});


	return PageController;

});