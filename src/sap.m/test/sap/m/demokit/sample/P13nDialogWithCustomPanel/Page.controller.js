sap.ui.define([
	'jquery.sap.global', 'sap/m/MessageToast', 'sap/ui/core/Fragment', 'sap/ui/core/mvc/Controller'
], function(jQuery, MessageToast, Fragment, Controller) {
	"use strict";

	return Controller.extend("sap.m.sample.P13nDialogWithCustomPanel.Page", {

		onOK: function(oEvent) {
			oEvent.getSource().close();
		},

		onCancel: function(oEvent) {
			oEvent.getSource().close();
		},

		onPersonalizationDialogPress: function() {
			var oPersonalizationDialog = sap.ui.xmlfragment("sap.m.sample.P13nDialogWithCustomPanel.PersonalizationDialog", this);
			this.getView().addDependent(oPersonalizationDialog);
			oPersonalizationDialog.open();
		}
	});
});
