sap.ui.controller("sap.ui.layout.sample.FixFlexMinFlexSize.C", {

	onInit: function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	}
});
