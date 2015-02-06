sap.ui.controller("sap.m.sample.ListSelection.List", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	handleSelectChange: function (oEvent) {
		var mode = oEvent.getParameter("selectedItem").getKey();
		this.getView().byId("ProductList").setMode(mode);
	}

});
