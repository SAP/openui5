sap.ui.controller("sap.m.sample.FeedListItem.List", {

	onInit: function () {
		// set mock model
		var sPath = jQuery.sap.getModulePath("sap.m.sample.FeedListItem", "/feed.json")
		var oModel = new sap.ui.model.json.JSONModel(sPath);
		this.getView().setModel(oModel);
	},

	onPress: function (oEvent) {
		sap.m.MessageToast.show("Clicked on " + oEvent.getSource().getSender());
	}
});
