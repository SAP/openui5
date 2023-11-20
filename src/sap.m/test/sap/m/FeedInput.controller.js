sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller"
], function (MessageToast, Controller) {
	"use strict";

	return Controller.extend("sap.m.test.FeedInput", {

		onInit: function () {
		},

		onPostFeedItem: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			MessageToast.show("posted new entry: " + sValue);
		}
	});

});
