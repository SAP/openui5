jQuery.sap.require("sap.m.sample.ObjectListItem.Formatter");

sap.ui.controller("sap.m.sample.ObjectListItem.List", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	onListItemPress: function (evt) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Pressed : " + evt.getSource().getTitle());
	}
});