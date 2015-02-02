// require mock server implementation
jQuery.sap.require("sap.m.sample.ListDeletion.MockServer");

sap.ui.controller("sap.m.sample.ListDeletion.List", {

	onInit: function(oEvent) {

		// NOTE TO DEVELOPERS: You do not need to reproduce this following section
		// It is just so we can simulate 1000ms delay from the fictional OData service
		sap.m.sample.ListDeletion.MockServer.start();

		// create and set ODATA Model
		this.oProductModel = new sap.ui.model.odata.ODataModel("/mockserver", true);
		this.getView().setModel(this.oProductModel);
	},

	onExit : function() {
		// NOTE TO DEVELOPERS: You do not need to reproduce this following section
		// It stops the fictional OData service generated onInit
		sap.m.sample.ListDeletion.MockServer.stop();

		// destroy the model and clear the model data
		this.oProductModel.destroy();
	},

	handleDelete: function(oEvent) {
		var oList = oEvent.getSource(),
			oItem = oEvent.getParameter("listItem"),
			sPath = oItem.getBindingContext().getPath();

		// after deletion put the focus back to the list
		oList.attachEventOnce("updateFinished", oList.focus, oList);

		// send a delete request to the odata service
		this.oProductModel.remove(sPath);
	},
});
