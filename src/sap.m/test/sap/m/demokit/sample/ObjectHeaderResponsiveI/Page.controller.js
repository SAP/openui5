sap.ui.controller("sap.m.sample.ObjectHeaderResponsiveI.Page", {

	onInit: function() {
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	onPress: function (evt) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert("Link was clicked!");
	},
});