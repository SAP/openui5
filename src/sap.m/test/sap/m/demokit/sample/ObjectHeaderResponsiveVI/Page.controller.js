sap.ui.controller("sap.m.sample.ObjectHeaderResponsiveVI.Page", {

	onInit: function() {
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

});
