sap.ui.controller("sap.m.sample.Tokenizer.Page", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		oModel.setSizeLimit(4);
		this.getView().setModel(oModel);
	}
});
