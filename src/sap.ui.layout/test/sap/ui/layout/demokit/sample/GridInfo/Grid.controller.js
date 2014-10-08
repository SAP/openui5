sap.ui.controller("sap.ui.layout.sample.GridInfo.Grid", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/persons.json");
		this.getView().setModel(oModel);
	}
});