sap.ui.controller("sap.m.sample.P13nDialog.Page", {

	onInit : function() {
		// set explored app's demo model on this sample
		this.getView().setModel(
				new sap.ui.model.json.JSONModel("test-resources/sap/m/demokit/sample/P13nDialog/products.json"));
	},

	handleClose : function(oEvent) {
		sap.m.MessageToast.show("Close button has been clicked", {
			width : "auto"
		});
	},

	handleReset : function(oEvent) {
		sap.m.MessageToast.show("Reset button has been clicked", {
			width : "auto"
		});
	}
});