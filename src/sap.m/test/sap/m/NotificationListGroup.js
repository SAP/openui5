sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/Page",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/NotificationListItem",
	"sap/m/MessageToast",
	"sap/m/NotificationList",
	"sap/ui/core/Element",
	"sap/ui/model/json/JSONModel",
	"sap/m/OverflowToolbar",
	"sap/m/OverflowToolbarLayoutData",
	"sap/m/NotificationListGroup",
	"sap/m/Text"
], function(
	App,
	Button,
	Page,
	mLibrary,
	coreLibrary,
	NotificationListItem,
	MessageToast,
	NotificationList,
	Element,
	JSONModel,
	OverflowToolbar,
	OverflowToolbarLayoutData,
	NotificationListGroup,
	Text
) {
	"use strict";

	//shortcuts
	const AvatarColor = mLibrary.AvatarColor,
		OverflowToolbarPriority = mLibrary.OverflowToolbarPriority,
		Priority = coreLibrary.Priority;

	var listItem = new NotificationListItem('firstNotification', {
		title: 'Notification List Title1',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
		showCloseButton: false,
		authorPicture: 'sap-icon://car-rental',
		authorAvatarColor: AvatarColor.Accent3,
		authorName: 'Bai Marin',
		datetime: '5 minutes',
		priority: Priority.None
	});

	var listItem2 = new NotificationListItem({
		title: 'Notification List Title2',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
		datetime: '2 hours',
		unread: true,
		priority: Priority.Medium,
		buttons: [
			new Button({
				text: 'OK',
				press: function () {
					MessageToast.show('OK button pressed');
				}
			})
		]
	});

	var listItem3 = new NotificationListItem({
		title: 'Notification List Title3',
		authorInitials: 'AB',
		authorAvatarColor: AvatarColor.Accent9,
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
		datetime: '2 hours',
		unread: true,
		priority: Priority.Low
	});


	var listGroup = new NotificationListGroup({
		id: 'notificationGroup',
		title: 'Notification List Item Group 2 rows - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent feugiat, turpis vel',
		// datetime: 'More than 5 minutes', // deprecated
		// authorPicture: 'images/SAPLogo.jpg', // deprecated
		// authorName: 'Lorem Ipsum', // deprecated
		showCloseButton: true,
		buttons: [
			new Button({
				text: 'Accept All',
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			}),
			new Button({
				text: 'Cancel All'
			})
		],
		items: [
			listItem,
			listItem2,
			listItem3
		],
		onCollapse: function (event) {
			var collapseExpandText = (event.oSource.getCollapsed() ? 'Collapse' : 'Expand') + ' event fired';
			MessageToast.show(collapseExpandText);
		}
	});

	// for testing the showing of the buttons for short time before to be hidden in the overflow toolbar after reload of the page
	var overflowToolBarTest = new OverflowToolbar({
		width: "400px",
		content: [
			new Text({
				text: "some long long long long text",
				wrapping: false
			}),
			new Button({
				text: 'Accept All',
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			}).setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow
			})),
			new Button({
				text: 'Cancel All'
			}).setLayoutData(new OverflowToolbarLayoutData({
				priority: OverflowToolbarPriority.AlwaysOverflow
			}))
		]
	});

	var singleItemGroup = new NotificationListGroup({
		id: 'notificationGroup2',
		showItemsCounter: false,
		title: 'Single Notification List Item Group',
		// datetime: 'More than 15 minutes', // deprecated
		// authorPicture: 'images/SAPLogo.jpg', // deprecated
		// authorName: 'Lorem Ipsum', // deprecated
		visible: true,
		collapsed: true,
		items: [
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				datetime: '2 hours',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.High,
				buttons: [
					new Button({
						text: 'Accept',
						press: function () {
							MessageToast.show('Accept button pressed');
						}
					}),
					new Button({
						text: 'Cancel',
						press: function () {
							MessageToast.show('Cancel button pressed');
						}
					})
				]
			}),
			new NotificationListItem({
				title: 'Hidden Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				datetime: '3 hours',
				unread: true,
				visible: false,
				showCloseButton: true,
				priority: Priority.Medium,
				buttons: [
					new Button({
						text: 'OK',
						press: function () {
							MessageToast.show('OK button pressed');
						}
					})
				]
			})
		]
	});

	var noItemsGroup = new NotificationListGroup({
		id: 'notificationGroup3',
		unread: true,
		priority: Priority.Low,
		autoPriority: false,
		title: 'Notification List With 0 Items',
		// datetime: 'More than 25 minutes', // deprecated
		// authorPicture: 'images/SAPLogo.jpg', // deprecated
		// authorName: 'Lorem Ipsum', // deprecated
		showEmptyGroup: true,
		buttons: [
			new Button({
				text: 'Accept All',
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			})
		],
		items: []
	});

	var noItemsNoDetailsGroup = new NotificationListGroup({
		id: 'notificationGroup4',
		unread: true,
		showItemsCounter: false,
		enableCollapseButtonWhenEmpty: true,
		title: 'Notification List With 0 Items and collapsable',
		showEmptyGroup: true,
		buttons: [
			new Button({
				text: 'Accept All',
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			})
		],
		items: []
	});

	var hiddenActionButtonsGroup = new NotificationListGroup({
		id: 'notificationGroup5',
		showItemsCounter: false,
		title: 'Notification List Group with hidden action buttons',
		showEmptyGroup: true,
		showButtons: false,
		buttons: [
			new Button({
				text: 'Accept All',
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			}),
			new Button({
				text: 'Cancel All'
			})
		],
		items: [
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				datetime: '2 hours',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.High,
				buttons: [
					new Button({
						text: 'Accept',
						press: function () {
							MessageToast.show('Accept button pressed');
						}
					}),
					new Button({
						text: 'Cancel',
						press: function () {
							MessageToast.show('Cancel button pressed');
						}
					})
				]
			})
		]
	});

	var busyGroup = new NotificationListGroup({
		id: 'notificationGroup6',
		showItemsCounter: false,
		autoPriority: false,
		priority: Priority.High,
		// busy: true,
		title: 'Busy Notification List Group + no auto priority',
		showEmptyGroup: true,
		buttons: [
			new Button({
				text: 'Accept All',
				press: function () {
					MessageToast.show('Accept all button pressed');
				}
			}),
			new Button({
				text: 'Cancel All'
			})
		],
		items: [
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				datetime: '2 hours',
				unread: true,
				visible: true,
				authorAvatarColor: AvatarColor.Accent8,
				authorInitials: "CD",
				showCloseButton: false,
				priority: Priority.Medium,
				buttons: [
					new Button({
						text: 'Accept',
						press: function () {
							MessageToast.show('Accept button pressed');
						}
					}),
					new Button({
						text: 'Cancel',
						press: function () {
							MessageToast.show('Cancel button pressed');
						}
					})
				]
			}),
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				datetime: '2 hours',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.Low,
				buttons: [
					new Button({
						text: 'Accept',
						press: function () {
							MessageToast.show('Accept button pressed');
						}
					}),
					new Button({
						text: 'Cancel',
						press: function () {
							MessageToast.show('Cancel button pressed');
						}
					})
				]
			})
		]
	});

	var list = new NotificationList({
		showUnread: true,
		items: [
			listGroup,
			singleItemGroup,
			noItemsGroup,
			noItemsNoDetailsGroup,
			hiddenActionButtonsGroup,
			busyGroup
		]
	});

	var compactSizeButton = new Button('toggleCompactModeButton', {
		text: 'Toggle Compact mode',
		press: function () {
			Element.getElementById("myApp").toggleStyleClass('sapUiSizeCompact');
		}
	});

	var page = new Page("page", {
		title: "NotificationGroup Test Page",
		content: [overflowToolBarTest, compactSizeButton, list]
	});

	var oApp = new App("myApp", {
		initialPage: "page"
	});
	oApp.addPage(page).placeAt("content");
});