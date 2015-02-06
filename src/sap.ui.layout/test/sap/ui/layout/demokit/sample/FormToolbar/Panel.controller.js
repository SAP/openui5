sap.ui.controller("sap.ui.layout.sample.FormToolbar.Panel", {

	onInit: function (oEvent) {

		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/supplier.json"));
		this.getView().setModel(oModel);

		this.getView().bindElement("/SupplierCollection/0");
	}
});
