sap.ui.define([
	"jquery.sap.global",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function(jQuery, MessageToast, DateFormat, Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.Feed.Page", {

		onInit: function() {
			// set mock model
			var sPath = sap.ui.require.toUrl("sap/m/sample/Feed") + "/feed.json";
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		},

		onPost: function(oEvent) {
			var oFormat = DateFormat.getDateTimeInstance({ style: "medium" });
			var oDate = new Date();
			var sDate = oFormat.format(oDate);
			// create new entry
			var sValue = oEvent.getParameter("value");
			var oEntry = {
				Author: "Alexandrina Victoria",
				AuthorPicUrl: "http://upload.wikimedia.org/wikipedia/commons/a/aa/Dronning_victoria.jpg",
				Type: "Reply",
				Date: "" + sDate,
				Text: sValue
			};

			// update model
			var oModel = this.getView().getModel();
			var aEntries = oModel.getData().EntryCollection;
			aEntries.unshift(oEntry);
			oModel.setData({
				EntryCollection: aEntries
			});
		},

		onSenderPress: function(oEvent) {
			MessageToast.show("Clicked on Link: " + oEvent.getSource().getSender());
		},

		onIconPress: function(oEvent) {
			MessageToast.show("Clicked on Image: " + oEvent.getSource().getSender());
		}
	});
});