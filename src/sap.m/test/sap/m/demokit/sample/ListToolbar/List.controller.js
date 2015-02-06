sap.ui.controller("sap.m.sample.ListToolbar.List", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	handleInfobarPress : function (evt) {
		sap.m.MessageToast.show("info toolbar pressed");
	},

	handleButtonPress : function (evt) {
		sap.m.MessageToast.show("header toolbar button pressed");
	}
});
