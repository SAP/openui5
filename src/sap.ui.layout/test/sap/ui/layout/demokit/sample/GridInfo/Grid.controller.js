sap.ui.controller("sap.ui.layout.sample.GridInfo.Grid", {

	onInit: function () {
		// set mock model
		var sPath = jQuery.sap.getModulePath("sap.ui.layout.sample.GridInfo", "/persons.json")
		var oModel = new sap.ui.model.json.JSONModel(sPath);
		this.getView().setModel(oModel);
	}
});
