// require mock server implementation
sap.ui.define(['./MockServer','sap/ui/core/mvc/Controller','sap/ui/model/odata/ODataModel'],
	function(MockServer, Controller, ODataModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListDeletion.List", {

		onInit: function() {

			// NOTE TO DEVELOPERS: You do not need to reproduce this following section
			// It is just so we can simulate 1000ms delay from the fictional OData service
			MockServer.start();

			// create and set ODATA Model
			this.oProductModel = new ODataModel("/mockserver", true);
			this.getView().setModel(this.oProductModel);
		},

		onExit : function() {
			// NOTE TO DEVELOPERS: You do not need to reproduce this following section
			// It stops the fictional OData service generated onInit
			MockServer.stop();

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
		}
	});


	return ListController;

});
