sap.ui.controller("sap.m.sample.LinkSubtle.Link", {

	handleLinkPress: function (evt) {
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.alert("Link was clicked!");
	},

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	}

});