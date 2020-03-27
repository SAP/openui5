sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/NotificationListItem',
	'sap/m/MessageToast',
	'sap/ui/core/library',
	'sap/ui/Device'
], function (Controller, NotificationListItem, MessageToast, coreLibrary, Device) {
	'use strict';

	var Priority = coreLibrary.Priority;

	var CController = Controller.extend('sap.m.sample.MaxNumberOfNotificationsReached.C', {

		onLoadNotifications: function (event) {
			/** @type {sap.m.NotificationListGroup} */
			var notificationGroup = event.getSource().getParent().getParent();
			var maxNumberOfNotifications = (Device.system.desktop ? 400 : 100) + 2;

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
			var priorities = Object.keys(Priority);
			var times = ['3 days', '5 minutes', '1 hour'];
			var titles = ['New order request', 'Your vacation has been approved', 'New transaction in queue', 'An new request await your action'];
			var notificationPriority = priorities[randomIndex(priorities.length)];

			return new NotificationListItem({
				title: titles[randomIndex(titles.length)] + ' ' + index,
				showCloseButton: true,
				datetime: times[randomIndex(times.length)],
				unread: true,
				priority: Priority[notificationPriority],
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
