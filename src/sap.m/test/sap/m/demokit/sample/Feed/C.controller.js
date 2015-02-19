jQuery.sap.require("sap.ui.core.format.DateFormat");

sap.ui.controller("sap.m.sample.Feed.C", {

	onInit: function () {
		// set mock model
		var sPath = jQuery.sap.getModulePath("sap.m.sample.Feed", "/feed.json")
		var oModel = new sap.ui.model.json.JSONModel(sPath);
		this.getView().setModel(oModel);
	},

	onPost: function (oEvent) {
		var oFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({style: "medium"});
		var oDate = new Date();
		var sDate = oFormat.format(oDate);
		// create new entry
		var sValue = oEvent.getParameter("value");
		var oEntry = {
			Author : "Alexandrina Victoria",
			AuthorPicUrl : "http://upload.wikimedia.org/wikipedia/commons/a/aa/Dronning_victoria.jpg",
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
		sap.m.MessageToast.show("Clicked on Link: " + oEvent.getSource().getSender());
},

	onIconPress: function (oEvent) {
		sap.m.MessageToast.show("Clicked on Image: " + oEvent.getSource().getSender());
}
});
