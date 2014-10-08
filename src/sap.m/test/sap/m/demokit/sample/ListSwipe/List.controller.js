sap.ui.controller("sap.m.sample.ListSwipe.List", {

	onInit : function (evt) {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/products.json");
		this.getView().setModel(oModel);
	},

	handleReject: function (evt) {
		var oList = evt.getSource().getParent();
		oList.removeAggregation("items", oList.getSwipedItem());
		oList.swipeOut();
	}

});