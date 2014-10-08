sap.ui.controller("sap.m.sample.DisplayListItem.List", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/supplier.json");
		this.getView().setModel(oModel);
	}
});