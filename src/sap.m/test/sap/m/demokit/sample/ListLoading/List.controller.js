// require mock server implementation
sap.ui.define(['./MockServer','sap/ui/core/mvc/Controller','sap/ui/model/odata/ODataModel'],
	function(MockServer, Controller, ODataModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.ListLoading.List", {

		refreshDataFromBackend: function(oEvent) {
			// force to refresh data from backend
			this.oProductModel.refresh(true);
		},

		onInit: function(oEvent) {

			// NOTE TO DEVELOPERS: You do not need to reproduce this following section
			// It is just so we can simulate 3000ms delay from the fictional back end, giving
			// us some context to show delayed loading sequences.
			MockServer.start({
				autoRespondAfter : 3000
			});

			// create and set ODATA Model
			this.oProductModel = new ODataModel("/mockserver", true);
			this.getView().setModel(this.oProductModel);
		},

		onExit : function() {
			// stop mock server on exit
			MockServer.stop();
		}
	});


	return ListController;

});
