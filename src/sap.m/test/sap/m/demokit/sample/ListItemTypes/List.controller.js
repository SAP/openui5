sap.ui.controller("sap.m.sample.ListItemTypes.List", {

	onInit : function(evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	handleSelectChange : function(oEvent) {
		var type = oEvent.getParameter("selectedItem").getKey();
		this.getView().byId("ProductList").getItems().forEach(function(item) {
			item.setType(type);
		});
	},

	handlePress : function(oEvent) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("'press' event fired!");
	},

	handleDetailPress : function(oEvent) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("'detailPress' event fired!");
	}

});