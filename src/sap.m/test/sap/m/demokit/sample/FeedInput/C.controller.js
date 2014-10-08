sap.ui.controller("sap.m.sample.FeedInput.C", {

	onPost: function (oEvent) {
		var sValue = oEvent.getParameter("value");
		jQuery.sap.require("sap.m.MessageToast");
		sap.m.MessageToast.show("Posted new feed entry: " + sValue);
	}
});
