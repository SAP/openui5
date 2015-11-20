sap.ui.controller("sap.m.sample.P13nDialogWithCustomPanel.Page", {

	oPersonalizationDialog: null,

	onInit: function() {
		// set explored app's demo model on this sample
		this.getView().setModel(new sap.ui.model.json.JSONModel("test-resources/sap/m/demokit/sample/P13nDialogWithCustomPanel/products.json"));
		this.getView().setModel(new sap.ui.model.resource.ResourceModel({
			bundleName: "sap.m.sample.P13nDialogWithCustomPanel.i18n.i18n"
		}), "i18n");
	},

	handleClose: function(oEvent) {
		oPersonalizationDialog.close();
	},

	handleReset: function(oEvent) {
		sap.m.MessageToast.show("Reset button has been clicked", {
			width: "auto"
		});
	},

	openDialog: function() {
		// associate controller with the fragment
		oPersonalizationDialog = sap.ui.xmlfragment("sap.m.sample.P13nDialogWithCustomPanel.PersonalizationDialog", this);
		this.getView().addDependent(oPersonalizationDialog);

		// toggle compact style
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), oPersonalizationDialog);
		oPersonalizationDialog.open();
	},

	onPersonalizationDialogPress: function(oEvent) {
		this.openDialog();
	},

	onAddColumnsItem: function(oEvent) {
		sap.m.MessageToast.show("Event 'addColumnsItem' fired in order to move the selected column item", {
			width: "auto"
		});
	}

});
