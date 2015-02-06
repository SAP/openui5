// require mock server implementation
jQuery.sap.require("sap.m.sample.ListLoading.MockServer");

sap.ui.controller("sap.m.sample.ListLoading.List", {

	refreshDataFromBackend: function(oEvent) {
		// force to refresh data from backend
		this.oProductModel.refresh(true);
	},

	onInit: function(oEvent) {

		// NOTE TO DEVELOPERS: You do not need to reproduce this following section
		// It is just so we can simulate 3000ms delay from the fictional back end, giving
		// us some context to show delayed loading sequences.
		sap.m.sample.ListLoading.MockServer.start({
			autoRespondAfter : 3000
		});

		// create and set ODATA Model
		this.oProductModel = new sap.ui.model.odata.ODataModel("/mockserver", true);
		this.getView().setModel(this.oProductModel);
	},

	onExit : function() {
		// stop mock server on exit
		sap.m.sample.ListLoading.MockServer.stop();
	}
});
