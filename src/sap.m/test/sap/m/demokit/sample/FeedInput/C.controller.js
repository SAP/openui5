sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.FeedInput.C", {

		onPost: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			MessageToast.show("Posted new feed entry: " + sValue);
		}
	});

	return CController;

});
