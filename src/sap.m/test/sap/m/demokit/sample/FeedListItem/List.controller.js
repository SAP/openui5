sap.ui.define([
	'jquery.sap.global',
	'sap/m/MessageToast',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(jQuery, MessageToast, Controller, JSONModel) {
	"use strict";

	var ListController = Controller.extend("sap.m.sample.FeedListItem.List", {

		onInit: function() {
			// set mock model
			var sPath = sap.ui.require.toUrl("sap/m/sample/FeedListItem") + "/feed.json";
			var oModel = new JSONModel(sPath);
			this.getView().setModel(oModel);
		},

		onPress: function(oEvent) {
			MessageToast.show("Pressed on " + oEvent.getSource().getSender());
		},

		onActionPressed: function(oEvent) {
			var sAction = oEvent.getSource().getKey();

			if (sAction === "delete") {
				this.removeItem(oEvent.getParameter("item"));
				MessageToast.show("Item deleted");
			} else {
				MessageToast.show("Action \"" + sAction + "\" pressed.");
			}
		},

		removeItem: function(oFeedListItem) {
			var sFeedListItemBindingPath = oFeedListItem.getBindingContext().getPath();
			var sFeedListItemIndex = sFeedListItemBindingPath.split("/").pop();
			var aFeedCollection = this.getView().getModel().getProperty("/EntryCollection");

			aFeedCollection.splice(sFeedListItemIndex, 1);
			this.getView().getModel().setProperty("/EntryCollection", aFeedCollection);
		}
	});

	return ListController;
});