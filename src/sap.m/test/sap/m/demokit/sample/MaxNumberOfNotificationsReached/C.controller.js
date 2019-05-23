sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/ui/Device'
], function (jQuery, Controller, MessageToast, Device) {
	'use strict';

	var CController = Controller.extend('sap.m.sample.MaxNumberOfNotificationsReached.C', {
		onInit: function () {
			var sWidth;
			Device.system.phone ? sWidth = "100%" : sWidth = "50%";
			this.getView().byId("notificationList").setWidth(sWidth);
			this.getView().byId("notificationList2").setWidth(sWidth);
		},

		onRejectPress: function () {
			MessageToast.show('Reject Button Pressed');
		},

		onAcceptPress: function () {
			MessageToast.show('Accept Button Pressed');
		},

		onLoadMaxNotifications: function (event) {
			/** @type {sap.m.NotificationListGroup} */
			var notificationGroup = event.getSource().getParent().getParent();
			var maxNumberOfNotifications = (sap.ui.Device.system.desktop ? 400 : 100) + 2;

			if (!notificationGroup.getItems().length) {
				for (var index = 0; index < maxNumberOfNotifications; index++) {
					notificationGroup.addItem(this._createItem(notificationGroup, index));
				}
			}
		},

		onLoadMaxNotificationsWithout: function (event) {
			/** @type {sap.m.NotificationListGroup} */
			var notificationGroup = event.getSource().getParent().getParent();
			var maxNumberOfNotifications = sap.ui.Device.system.desktop ? 10 : 5;

			if (!notificationGroup.getItems().length) {
				for (var index = 0; index < maxNumberOfNotifications; index++) {
					notificationGroup.addItem(this._createItem(notificationGroup, index));
				}
			}
		},

		onItemClose: function (event) {
			var notification = event.getSource();
			var notificationGroup = notification.getParent();

			notificationGroup.removeItem(notification);

			MessageToast.show('Item Closed: ' + event.getSource().getTitle());
		},

		_createItem: function(notificationGroup, index) {
			var priorities = Object.keys(sap.ui.core.Priority);
			var times = ['3 days', '5 minutes', '1 hour'];
			var titles = ['New order request', 'Your vacation has been approved', 'New transaction in queue', 'An new request await your action'];
			var notificationPriority = priorities[randomIndex(priorities.length)];

			return new sap.m.NotificationListItem({
				title: titles[randomIndex(titles.length)] + ' ' + index,
				showCloseButton: true,
				datetime: times[randomIndex(times.length)],
				unread: true,
				priority: sap.ui.core.Priority[notificationPriority],
				close: function() {
					this.destroy();
				}
			});

			function randomIndex(max) {
				return Math.floor(Math.random() * max);
			}
		}
	});

	return CController;
});
