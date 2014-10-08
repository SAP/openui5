sap.ui.controller("sap.m.sample.FeedListItem.List", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/feed.json");
		this.getView().setModel(oModel);
		
	},
	
	onPress: function (oEvent) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Clicked on " + oEvent.getSource().getSender());
}
});
