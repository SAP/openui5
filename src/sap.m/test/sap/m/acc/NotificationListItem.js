sap.ui.define([
	"sap/m/NotificationListItem",
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/NotificationList",
	"sap/m/Page",
	"sap/m/App"
], function(NotificationListItem, coreLibrary, Button, mobileLibrary, MessageToast, JSONModel, NotificationList, Page, App) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	var listItem = new NotificationListItem('firstNotification', {
		title : 'Notification List Title Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent feugiat, turpis vel',
		description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent feugiat, turpis vel ' +
				'scelerisque pharetra, tellus odio vehicula dolor, nec elementum lectus turpis at nunc. ' +
				'Mauris non elementum orci, ut sollicitudin ligula. Vestibulum in ligula imperdiet, posuere tortor id, dictum nunc.',
		showCloseButton : true,
		datetime : '1 hour',
		unread : true,
		authorName : 'Jean Doe',
		authorPicture : '../images/Woman_04.png',
		priority: Priority.None
	});

	var listItem2 = new NotificationListItem('secondNotification', {
		title: 'Notification List Title',
		description : 'Aliquam quis varius ligula. In justo lorem, lacinia ac ex at, vulputate dictum turpis.',
		showCloseButton : false,
		datetime : '3 days',
		priority : Priority.Low,
		authorName : 'Office Notification',
		authorPicture : 'sap-icon://group',
		buttons: [
			new Button('notificationAcceptButton', {
				id: 'button1',
				text: 'Accept',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept button pressed');
				}
			}),
			new Button('notificationCancelButton', {
				id: 'button2',
				text: 'Cancel',
				type: ButtonType.Reject,
				press: function () {
					listItem2.close();
				}
			})
		]
	});

	var listItem3 = new NotificationListItem({
		title: 'Notification List Title',
		description : 'Aliquam quis varius ligula. In justo lorem, lacinia ac ex at, vulputate dictum turpis.',
		showCloseButton : true,
		datetime : '3 days',
		unread : true,
		priority : Priority.Medium,
		buttons: [
			new Button({
				id: 'button3',
				text: 'Accept',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept button pressed');
				}
			}),
			new Button({
				id: 'button4',
				text: 'Cancel',
				type: ButtonType.Reject,
				press: function () {
					listItem2.close();
				}
			})
		]
	});

	var listItem4 = new NotificationListItem({
		title: 'Notification List Title',
		description : 'Aliquam quis varius ligula. In justo lorem, lacinia ac ex at, vulputate dictum turpis.',
		showCloseButton : true,
		datetime : '3 days',
		unread : true,
		priority : Priority.High,
		authorName : 'John Smith',
		authorPicture : '../images/headerImg2.jpg',
		buttons: [
			new Button({
				id: 'button5',
				text: 'Accept',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept button pressed');
				}
			}),
			new Button({
				id: 'button6',
				text: 'Cancel',
				type: ButtonType.Reject,
				press: function () {
					listItem2.close();
				}
			})
		]
	});

	var oData = {
		showClose : true,
		buttons : [
			{
				buttonText : "Accept",
				buttonType : ButtonType.Accept
			},
			{
				buttonText : "Consider",
				buttonType : ButtonType.Default
			},
			{
				buttonText : "Reject",
				buttonType : ButtonType.Reject
			}
		]
	};

	var oModel = new JSONModel();
	oModel.setData(oData);

	sap.ui.getCore().setModel(oModel);

	var oButtonTemplate = new Button({
		text : "{buttonText}",
		type : "{buttonType}"
	});

	var listItem5 = new NotificationListItem({
		id : "lastNotification",
		title : 'Item with binding',
		description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent feugiat, turpis vel ' +
		'scelerisque pharetra, tellus odio vehicula dolor, nec elementum lectus turpis at nunc. ' +
		'Mauris non elementum orci, ut sollicitudin ligula. Vestibulum in ligula imperdiet, posuere tortor id, dictum nunc.',
		showCloseButton : "{showClose}",
		unread : true,
		authorPicture : '../images/Woman_04.png',
		priority: Priority.None,
		buttons: {
			path : "/buttons",
			template : oButtonTemplate
		}
	});

	var list = new NotificationList("listId", {
		items: [
			listItem,
			listItem2,
			listItem3,
			listItem4,
			listItem5
		]
	});

	var page = new Page("page", {
		title: "NotificationItem Accessibility Test Page",
		content: [list]
	});

	var oApp = new App("myApp", { initialPage: "page" });
	oApp.addPage(page).placeAt("content");
});
