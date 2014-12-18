sap.ui.controller("sap.m.sample.ObjectHeaderResponsiveVI.Page", {

	onInit: function() {
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

});