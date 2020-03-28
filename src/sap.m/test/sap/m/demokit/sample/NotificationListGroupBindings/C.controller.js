sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageToast',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, MessageToast, JSONModel) {
	"use strict";

	var CController = Controller.extend("sap.m.sample.NotificationListGroupBindings.C", {

		onInit : function (evt) {
			var oData = {
				"NotificationGroups": [
					{
						"title": "Orders waiting for approval",
						"creationDate": "1 hour ago",
						"showEmptyGroup": true,
						"showCloseButton": true,
						"groupItems": [
							{
								"title": "New order (#2525)",
								"description": "Aliquam quis varius ligula. In justo lorem, lacinia ac ex at, vulputate dictum turpis.",
								"priority": sap.ui.core.Priority.High,
								"unread": true,
								"authorName": "Michael Muller",
								"authorPicture": "sap-icon://person-placeholder",
								"authorAvatarColor": "Accent2",
								"itemButtons": [
									{
										"text": 'Accept'
									},
									{
										"text": 'Reject'
									}
								]

							},
							{
								"title": "New order (#2526)",
								"description": "Lacinia ac ex at, vulputate dictum turpis.",
								"priority": sap.ui.core.Priority.Low,
								"authorInitials" : "JS",
								"unread": true,
								"itemButtons": [
									{
										"text": 'Accept'
									},
									{
										"text": 'Reject'
									}
								]

							}
						],
						"groupButtons": [
							{
								"text": 'Accept All'
							}
						]
					},
					{
						"title": "New order (#2527)",
						"creationDate": "1 hour ago",
						"showEmptyGroup": true,
						"showCloseButton": true,
						"groupItems": [
						],
						"groupButtons": [
							{
								"text": 'Accept All'
							},
							{
								"text": 'Reject All'
							}
						]
					}
				]
			};
			var oModel = new JSONModel(oData);
			this.getView().setModel(oModel);
		},

		onGroupClose: function(oEvent) {
			MessageToast.show('Group Closed: ' + oEvent.getSource().getTitle());
		},

		onListItemPress: function (oEvent) {
			MessageToast.show('Item Pressed: ' + oEvent.getSource().getTitle());
		},

		onItemButtonPress: function (oEvent) {
			MessageToast.show('Item Button \'' + oEvent.getSource().getText() + '\' Pressed');
		},

		onGroupButtonPress: function (oEvent) {
			MessageToast.show('Group Button \'' + oEvent.getSource().getText() + '\' Pressed');
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
