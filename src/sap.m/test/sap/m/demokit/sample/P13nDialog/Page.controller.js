sap.ui.define([
	'jquery.sap.global', 'sap/m/MessageToast', 'sap/ui/core/Fragment', 'sap/ui/core/mvc/Controller', 'sap/ui/model/json/JSONModel'
], function(jQuery, MessageToast, Fragment, Controller, JSONModel) {
	"use strict";

	var PageController = Controller.extend("sap.m.sample.P13nDialog.Page", {

		oPersonalizationDialog: null,

		onInit: function() {
			// set explored app's demo model on this sample
			this.getView().setModel(new JSONModel("test-resources/sap/m/demokit/sample/P13nDialog/products.json"));
		},

		handleClose: function(oEvent) {
			this.oPersonalizationDialog.close();
		},

		handleReset: function(oEvent) {
			MessageToast.show("Reset button has been clicked", {
				width: "auto"
			});
		},

		openDialog: function() {
			// associate controller with the fragment
			this.oPersonalizationDialog = sap.ui.xmlfragment("sap.m.sample.P13nDialog.PersonalizationDialog", this);
			this.getView().addDependent(this.oPersonalizationDialog);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oPersonalizationDialog);
			this.oPersonalizationDialog.open();
		},

		onPersonalizationDialogPress: function(oEvent) {
			this.openDialog();
		},

		onAddColumnsItem: function(oEvent) {
			MessageToast.show("Event 'addColumnsItem' fired in order to move the selected column item", {
				width: "auto"
			});
		},

		onChangeColumnsItem: function(oEvent) {
			MessageToast.show("Event 'changeColumnsItem' fired in order to move the selected column item", {
				width: "auto"
			});
		}

	});

	return PageController;

});
