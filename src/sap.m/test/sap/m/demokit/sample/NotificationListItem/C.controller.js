sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast'
], function (jQuery, Controller, MessageToast) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.NotificationListItem.C", {

		onListItemPress: function (oEvent) {
			MessageToast.show('Item Pressed: ' + oEvent.getSource().getTitle());
		},

		onRejectPress: function () {
			MessageToast.show('Reject Button Pressed');
		},

		onAcceptPress: function () {
			MessageToast.show('Accept Button Pressed');
		},

		onItemClose: function (oEvent) {
			MessageToast.show('Item Closed: ' + oEvent.getSource().getTitle());
		}
	});

	return CController;

});
