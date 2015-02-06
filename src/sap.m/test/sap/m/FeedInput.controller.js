sap.ui.controller("sap.m.test.FeedInput", {

	onInit: function () {
	},

	onPostFeedItem: function (oEvent) {
		var sValue = oEvent.getParameter("value");
		sap.m.MessageToast.show("posted new entry: " + sValue);
	}
});
