sap.ui.controller("sap.m.sample.Dialog.C", {

	stdDialog: null,
	msgDialog: null,

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	openDialog: function (sType) {
		if (!this[sType]) {
			this[sType] = sap.ui.xmlfragment(
				"sap.m.sample.Dialog." + sType + "Dialog",
				this // associate controller with the fragment
			);
			this.getView().addDependent(this[sType]);
		}

		this[sType].bindElement("/ProductCollection/0");
		// toggle compact style
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this[sType]);
		this[sType].open();
	},

	onStdDialogPress: function (oEvent) {
		this.openDialog('Std');
	},

	onMsgDialogPress: function (oEvent) {
		this.openDialog('Msg');
	},

	onDialogCloseButton: function (oEvent) {
		var sType = oEvent.getSource().data("dialogType");
		this[sType].close();
	}
});
