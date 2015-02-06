sap.ui.controller("sap.m.sample.ObjectHeaderResponsiveV.Page", {

	onInit: function() {
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	onPress: function (evt) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert("Link was clicked!");
	},
});
