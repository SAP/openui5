jQuery.sap.require("sap.m.MessageToast");
jQuery.sap.require("sap.ui.core.format.DateFormat");

sap.ui.controller("sap.m.sample.Feed.C", {

	onInit: function () {
		// set explored app's demo model on this sample
		var oModel = new sap.ui.model.json.JSONModel("test-resources/sap/ui/demokit/explored/feed.json");
		this.getView().setModel(oModel);
	},

	onPost: function (oEvent) {
		var oFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({style: "medium"});
		var oDate = new Date();
		var sDate = oFormat.format(oDate);
		// create new entry
		var sValue = oEvent.getParameter("value");
		var oEntry = {
			Author : "Sara O'Connors",
			AuthorPicUrl : "test-resources/sap/ui/demokit/explored/img/Woman_10.png",
			Type : "Reply",
			Date : "" + sDate,
			Text : sValue
		};

		// update model
		var oModel = this.getView().getModel();
		var aEntries = oModel.getData().EntryCollection;
		aEntries.unshift(oEntry);
		oModel.setData({
			EntryCollection : aEntries
		});
	},
	
	onSenderPress: function (oEvent) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Clicked on Link: " + oEvent.getSource().getSender());
},

	onIconPress: function (oEvent) {
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Clicked on Image: " + oEvent.getSource().getSender());
}
});