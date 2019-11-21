sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast'
], function (jQuery, Controller, MessageToast) {
	'use strict';

	var CController = Controller.extend('sap.m.sample.NotificationListGroupLazyLoading.C', {

		onRejectPress: function () {
			MessageToast.show('Reject Button Pressed');
		},

		onAcceptPress: function () {
			MessageToast.show('Accept Button Pressed');
		},

		onGetItemsCount: function (event) {
			var notificationGroup = event.getSource().getParent().getParent();
			MessageToast.show('Number of items in group: ' + notificationGroup.getItems().length);
		},

		onItemClose: function (event) {
			var notification = event.getSource();
			var notificationGroup = notification.getParent();

			notificationGroup.removeItem(notification);

			MessageToast.show('Item Closed: ' + event.getSource().getTitle());
		},

		loadNotifications: function (event) {
			// on expand
			if (!event.getParameters().collapsed) {
				/** @type {sap.m.NotificationListGroup} */
				var notificationGroup = event.getSource();
				/** @type [sap.m.NotificationListItem] */
				var notifications = notificationGroup.getItems();

				if (notifications.length === 0) {
					this._addItemsToGroup(notificationGroup);
				}
			}
		},

		_addItemsToGroup: function(notificationGroup) {
			var priorities = Object.keys(sap.ui.core.Priority);
			var times = ['3 days', '5 minutes', '1 hour'];
			var titles = ['New order request', 'Your vacation has been approved', 'New transaction in queue', 'An new request await your action'];
			var notificationPriority;

			for (var index = 0; index < 3; index += 1) {
				notificationPriority = priorities[randomIndex(priorities.length)];

				notificationGroup.addItem(new sap.m.NotificationListItem({
					title: titles[randomIndex(titles.length)],
					showCloseButton: true,
					datetime: times[randomIndex(times.length)],
					unread: true,
					priority: sap.ui.core.Priority[notificationPriority]
				}));
			}

			function randomIndex(max) {
				return Math.floor(Math.random() * max);
			}

		}
	});

	return CController;
});
