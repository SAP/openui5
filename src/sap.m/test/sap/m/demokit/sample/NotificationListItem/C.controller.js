sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/Link',
	'sap/m/MessageStrip',
	'sap/m/MessageToast'
], function (Controller, Link, MessageStrip, MessageToast) {
	'use strict';

	var CController = Controller.extend('sap.m.sample.NotificationListItem.C', {

		onListItemPress: function (oEvent) {
			MessageToast.show('Item Pressed: ' + oEvent.getSource().getTitle());
		},

		onRejectPress: function () {
			MessageToast.show('Reject Button Pressed');
		},

		onAcceptPress: function () {
			MessageToast.show('Accept Button Pressed');
		},

		onErrorPress: function (event) {
			var messageStrip = new MessageStrip({
				type: 'Error',
				showIcon: true,
				showCloseButton: true,
				text: 'Error: Something went wrong.',
				link: new Link({
					text: 'SAP CE',
					href: 'http://www.sap.com/',
					target: '_blank'
				})
			});

			var notification = event.getSource().getParent().getParent();
			notification.setProcessingMessage(messageStrip);

		},

		onItemClose: function (oEvent) {
			var oItem = oEvent.getSource(),
				oList = oItem.getParent();

			oList.removeItem(oItem);

			MessageToast.show('Item Closed: ' + oEvent.getSource().getTitle());
		}
	});

	return CController;

});
