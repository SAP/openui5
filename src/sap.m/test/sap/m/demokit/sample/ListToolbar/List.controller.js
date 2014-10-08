sap.ui.controller("sap.m.sample.ListToolbar.List", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	handleInfobarPress : function (evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("info toolbar pressed");
	},

	handleButtonPress : function (evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("header toolbar button pressed");
	}
});