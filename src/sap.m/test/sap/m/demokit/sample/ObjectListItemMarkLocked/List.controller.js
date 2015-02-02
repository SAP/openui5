jQuery.sap.require("sap.m.sample.ObjectListItemMarkLocked.Formatter");

sap.ui.controller("sap.m.sample.ObjectListItemMarkLocked.List", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel(jQuery.sap.getModulePath("sap.ui.demo.mock", "/products.json"));
		this.getView().setModel(oModel);
	},

	onListItemPress: function (evt) {
		sap.m.MessageToast.show("Pressed : " + evt.getSource().getTitle());
	}
});
