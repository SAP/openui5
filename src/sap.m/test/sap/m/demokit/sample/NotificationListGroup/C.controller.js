sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/message/MessageType",
	"sap/m/Link",
	"sap/m/MessageStrip",
	"sap/m/MessageToast"
], function (Controller, MessageType, Link, MessageStrip, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.NotificationListGroup.C", {

		onListItemPress: function (oEvent) {
			MessageToast.show("Item Pressed: " + oEvent.getSource().getTitle());
		},

		onItemClose: function (oEvent) {
			var oItem = oEvent.getSource(),
				oList = oItem.getParent();

			oList.removeItem(oItem);
			MessageToast.show("Item Closed: " + oItem.getTitle());
		},

		onRejectPress: function () {
			MessageToast.show("Reject Button Pressed");
		},

		onAcceptPress: function () {
			MessageToast.show("Accept Button Pressed");
		},

		onAcceptErrors: function (oEvent) {
			var oMessageStrip = new MessageStrip({
				type: MessageType.Error,
				showIcon: true,
				showCloseButton: true,
				text: "Error: Something went wrong.",
				link: new Link({
					text: "SAP CE",
					href: "http://www.sap.com/",
					target: "_blank"
				})
			});

			var oNotificationListGroup = oEvent.getSource().getParent().getParent();
			var aNotifications = oNotificationListGroup.getItems();

			aNotifications.forEach(function (oNotification) {
				oNotification.removeAllAggregation("processingMessage");
			});

			var iErrorIndex = Math.floor(Math.random() * 3);
			aNotifications[iErrorIndex].setProcessingMessage(oMessageStrip);
		}

	});
});