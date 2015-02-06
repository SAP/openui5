sap.ui.controller("sap.m.sample.Title.V", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	handleButtonPress : function (evt) {
		sap.m.MessageToast.show("header toolbar button pressed");
	}
});
