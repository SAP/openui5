sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Priority",
	"sap/m/NotificationListItem",
	"sap/m/MessageToast"
], function (Controller, Priority, NotificationListItem, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.NotificationListGroupLazyLoading.C", {

		onRejectPress: function () {
			MessageToast.show("Reject Button Pressed");
		},

		onAcceptPress: function () {
			MessageToast.show("Accept Button Pressed");
		},

		onGetItemsCount: function (oEvent) {
			var oNotificationListGroup = oEvent.getSource().getParent().getParent();
			MessageToast.show("Number of items in group: " + oNotificationListGroup.getItems().length);
		},

		onItemClose: function (oEvent) {
			var oNotificationListItem = oEvent.getSource();
			var oNotificationListGroup = oNotificationListItem.getParent();

			oNotificationListGroup.removeItem(oNotificationListItem);
			MessageToast.show("Item Closed: " + oNotificationListItem);
		},

		onToggleCollapse: function (oEvent) {
			if (!oEvent.getParameter("collapsed")) {
				var oNotificationListGroup = oEvent.getSource();
				var aNotifications = oNotificationListGroup.getItems();

				if (aNotifications.length === 0) {
					this._addItemsToGroup(oNotificationListGroup);
				}
			}
		},

		_addItemsToGroup: function (oNotificationListGroup) {
			var aPriorities = Object.keys(Priority);
			var aTimes = ["3 days", "5 minutes", "1 hour"];
			var aTitles = ["New order request", "Your vacation has been approved", "New transaction in queue", "An new request await your action"];

			function randomIndex(iMax) {
				return Math.floor(Math.random() * iMax);
			}

			for (var i = 0; i < 3; i++) {
				var sNotificationPriority = aPriorities[randomIndex(aPriorities.length)];

				oNotificationListGroup.addItem(new NotificationListItem({
					title: aTitles[randomIndex(aTitles.length)],
					showCloseButton: true,
					datetime: aTimes[randomIndex(aTimes.length)],
					unread: true,
					priority: Priority[sNotificationPriority]
				}));
			}
		}

	});
});