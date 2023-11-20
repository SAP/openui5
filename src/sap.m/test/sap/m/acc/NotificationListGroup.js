sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/NotificationList",
	"sap/m/NotificationListGroup",
	"sap/m/NotificationListItem",
	"sap/m/Page",
	"sap/ui/core/library"
], function(
	App,
	Button,
	mobileLibrary,
	MessageToast,
	NotificationList,
	NotificationListGroup,
	NotificationListItem,
	Page,
	coreLibrary
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	var listItem = new NotificationListItem('firstNotification', {
		title: 'Notification List Title1',
		description: "Have you tried Wheaties? They're whole wheat with all of the bran. Won't you try Wheaties? For wheat is the best food of man. They're crispy and crunchy the whole year through, The kiddies never tire of them and neither will you. So just try Wheaties, the best breakfast food in the land!",
		showCloseButton: false,
		authorPicture: 'sap-icon://car-rental',
		authorName: 'Bai Marin',
		datetime: '5 minutes',
		priority: Priority.None
	});

	var listItem2 = new NotificationListItem({
		title: 'Notification List Title2',
		description: "What walks down stairs, alone or in pairs, and makes a slinkity sound? A spring, a spring, a marvelous thing, everyone knows it's Slinky.",
		datetime: '2 hours',
		unread: true,
		priority: Priority.Medium,
		buttons: [
			new Button({
				text: 'Accept',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept button pressed');
				}
			}),
			new Button({
				text: 'Cancel',
				type: ButtonType.Reject,
				press: function () {
					listItem2.close();
				}
			})
		]
	});

	var listItem3 = new NotificationListItem({
		title: 'Notification List Title3',
		description: " Searching for a way to tap into the hidden strengths that all humans have... then an accidental overdose of gamma radiation alters his body chemistry.",
		datetime: '2 hours',
		unread: true,
		priority: Priority.Low,
		buttons: [
			new Button({
				text: 'Accept',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept button pressed');
				}
			}),
			new Button({
				text: 'Cancel',
				type: ButtonType.Reject,
				press: function () {
					listItem2.close();
				}
			})
		]
	});


	var listGroup = new NotificationListGroup({
		id: 'notificationGroup',
		title: 'Notification List Item Group',
		// datetime: 'More than 5 minutes', // deprecated
		// authorPicture: 'images/SAPLogo.jpg', // deprecated
		// authorName: 'Lorem Ipsum', // deprecated
		buttons: [
			new Button({
				text: 'Accept All',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			}),
			new Button({
				text: 'Cancel All',
				type: ButtonType.Reject
			})
		],
		items: [
			listItem,
			listItem2,
			listItem3
		],
		onCollapse: function (event) {
			var collapseExpandText = (event.getSource().getCollapsed() ? 'Collapse' : 'Expand') + ' event fired';
			MessageToast.show(collapseExpandText);
		}
	});

	var singleItemGroup = new NotificationListGroup({
		id: 'notificationGroup2',
		title: 'Single Notification List Item Group',
		// datetime: 'More than 15 minutes', // deprecated
		// authorPicture: 'images/SAPLogo.jpg', // deprecated
		// authorName: 'Lorem Ipsum', // deprecated
		visible: true,
		buttons: [
			new Button({
				text: 'Accept All',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			}),
			new Button({
				text: 'Cancel All',
				type: ButtonType.Reject
			})
		],
		items: [
			new NotificationListItem({
				title: 'Single Item Notification',
				description: "In the criminal justice system, the people are represented by two separate yet equally important groups. The police who investigate crime and the district attorneys who prosecute the offenders. These are their stories.",
				datetime: '2 hours',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.High,
				buttons: [
					new Button({
						text: 'Accept',
						type: ButtonType.Accept,
						press: function () {
							MessageToast.show('Accept button pressed');
						}
					}),
					new Button({
						text: 'Cancel',
						type: ButtonType.Reject,
						press: function () {
							MessageToast.show('Cancel button pressed');
						}
					})
				]
			}),
			new NotificationListItem({
				title: 'Hidden Item Notification',
				description: "Man lives in the sunlit world of what he believes to be reality. But, there is, unseen by most, an underworld, a place that is just as real, but not as brightly lit... a darkside. ",
				datetime: '3 hours',
				unread: true,
				visible: false,
				showCloseButton: true,
				priority: Priority.Medium,
				buttons: [
					new Button({
						text: 'Accept',
						type: ButtonType.Accept,
						press: function () {
							MessageToast.show('Accept button pressed');
						}
					}),
					new Button({
						text: 'Cancel',
						type: ButtonType.Reject,
						press: function () {
							MessageToast.show('Cancel button pressed');
						}
					})
				]
			})
		]
	});

	var noItemsGroup = new NotificationListGroup({
		id: 'notificationGroup3',
		title: 'Notification List With 0 Items',
		// datetime: 'More than 25 minutes', // deprecated
		// authorPicture: 'images/SAPLogo.jpg', // deprecated
		// authorName: 'Lorem Ipsum', // deprecated
		showEmptyGroup: true,
		buttons: [
			new Button({
				text: 'Accept All',
				type: ButtonType.Accept,
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			}),
			new Button({
				text: 'Cancel All',
				type: ButtonType.Reject
			})
		],
		items: [
		]
	});

	var list = new NotificationList({
		items: [
			listGroup,
			singleItemGroup,
			noItemsGroup
		]
	});


	var page = new Page("page", {
		title: "NotificationGroup Accessibility Test Page",
		content: [list]
	});

	var oApp = new App("myApp", { initialPage: "page" });
	oApp.addPage(page).placeAt("content");
});
