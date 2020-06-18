sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Priority",
	"sap/ui/Device",
	"sap/m/NotificationListItem",
	"sap/m/MessageToast"
], function (Controller, Priority, Device, NotificationListItem, MessageToast) {
	"use strict";

	return Controller.extend("sap.m.sample.MaxNumberOfNotificationsReached.C", {

		onItemClose: function (oEvent) {
			var oNotification = oEvent.getSource();
			var oNotificationListGroup = oNotification.getParent();

			oNotificationListGroup.removeItem(oNotification);
			MessageToast.show("Item Closed: " + oNotification.getTitle());
		},

		onLoadNotificationsPress: function (oEvent) {
			var oNotificationListGroup = oEvent.getSource().getParent().getParent();
			var iMaxNotifications = Device.system.desktop ? 400 : 100;

			if (!oNotificationListGroup.getItems().length) {
				for (var i = 1; i <= iMaxNotifications; i++) {
					oNotificationListGroup.addItem(this._createNotification(i));
				}
			}
		},

		_createNotification: function (iIndex) {
			function randomIndex(iMax) {
				return Math.floor(Math.random() * iMax);
			}

			var aPriorities = Object.keys(Priority);
			var aTimes = ["3 days", "5 minutes", "1 hour"];
			var aTitles = ["New order request", "Your vacation has been approved", "New transaction in queue", "An new request await your action"];
			var sPriority = aPriorities[randomIndex(aPriorities.length)];

			return new NotificationListItem({
				title: aTitles[randomIndex(aTitles.length)] + " " + iIndex,
				showCloseButton: true,
				datetime: aTimes[randomIndex(aTimes.length)],
				unread: true,
				priority: Priority[sPriority],
				close: function() {
					this.destroy();
				}
			});
		}

	});
});