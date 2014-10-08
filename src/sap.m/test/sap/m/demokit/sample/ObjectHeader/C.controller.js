sap.ui.controller("sap.m.sample.ObjectHeader.C", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	handleLinkObjectAttributePress : function (oEvent) {
		sap.m.URLHelper.redirect("http://www.sap.com", true);
	}
});
