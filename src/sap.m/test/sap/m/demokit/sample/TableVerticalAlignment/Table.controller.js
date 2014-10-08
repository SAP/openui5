jQuery.sap.require("sap.m.sample.TableVerticalAlignment.Formatter");

sap.ui.controller("sap.m.sample.TableVerticalAlignment.Table", {

	onInit: function () {

		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	}
});