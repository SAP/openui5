/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/NotificationListItem",
	"sap/m/NotificationListGroup",
	"sap/m/OverflowToolbar",
	"sap/m/NotificationList",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/core/Element",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	QUnitUtils,
	NotificationListItem,
	NotificationListGroup,
	OverflowToolbar,
	NotificationList,
	Library,
	coreLibrary,
	mLibrary,
	Element,
	Button,
	KeyCodes,
	JSONModel,
	nextUIUpdate
) {
	'use strict';


	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;

	var  oResourceBundleM = Library.getResourceBundleFor("sap.m");

	var RENDER_LOCATION = 'qunit-fixture';

	function createNotificatoinListItem() {
		return new NotificationListItem({
			unread : true,
			title: 'Notification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title Title',
			priority: Priority.High,
			showCloseButton : true,
			showButtons: true,
			datetime : '3 days',
			authorName : 'John Smith',
			authorPicture : 'sap-icon://group',
			description: 'Notification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item Description',
			buttons: [
				new Button({
					text: 'Accept'
				}),
				new Button({
					text: 'Cancel'
				})
			]
		});
	}

	function createNotificationList() {
		return new NotificationList({
			width: "610px",
			items: [
				new NotificationListItem({
					unread : true,
					title: 'Notification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title Title',
					priority: Priority.High,
					showCloseButton : true,
					showButtons: true,
					datetime : '3 days',
					authorName : 'John Smith',
					authorPicture : 'sap-icon://group',
					description: 'Notification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item Description',
					buttons: [
						new Button({
							text: 'Accept'
						})
					]
				}),
				new NotificationListItem({
					unread : true,
					title: 'Notification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title Title',
					priority: Priority.High,
					showCloseButton : true,
					showButtons: true,
					datetime : '3 days',
					authorName : 'John Smith',
					authorPicture : 'sap-icon://group',
					description: 'Notification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item Description',
					buttons: [
						new Button({
							text: 'Accept'
						}),
						new Button({
							text: 'Cancel'
						})
					]
				}),
				new NotificationListItem({
					unread : true,
					title: 'Notification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title Title',
					priority: Priority.High,
					showCloseButton : true,
					showButtons: true,
					datetime : '3 days',
					authorName : 'John Smith',
					authorPicture : 'sap-icon://group',
					description: 'Notification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item Description',
					buttons: [
						new Button({
							text: 'Accept'
						}),
						new Button({
							text: 'Cancel'
						})
					]
				}),
				new NotificationListItem({
					unread : true,
					title: 'Title',
					showCloseButton : true,
					showButtons: false,
					datetime : '3 days',
					authorName : 'John Smith',
					authorPicture : 'sap-icon://group',
					description: 'Descr',
					buttons: [
						new Button({
							text: 'Accept'
						}),
						new Button({
							text: 'Cancel'
						})
					]
				}),
				new NotificationListItem({
					unread : true,
					title: 'Title',
					showCloseButton : false,
					showButtons: true,
					datetime : '3 days',
					authorName : 'John Smith',
					authorPicture : 'sap-icon://group',
					description: 'Descr',
					buttons: [
						new Button({
							text: 'Accept'
						}),
						new Button({
							text: 'Cancel'
						})
					]
				}),
				new NotificationListItem({
					unread : true,
					title: 'Title',
					showCloseButton : false,
					showButtons: false,
					datetime : '3 days',
					authorName : 'John Smith',
					authorPicture : 'sap-icon://group',
					description: 'Descr',
					buttons: [
						new Button({
							text: 'Accept'
						}),
						new Button({
							text: 'Cancel'
						})
					]
				})
			]
		});
	}

	QUnit.module('Rendering', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new NotificationList({
				width: '610px',
				items: [
					this.notificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('initial rendering', function(assert) {
		var $item = this.notificationListItem.$();

		assert.ok(this.notificationListItem.getDomRef(), 'Item is rendered');

		assert.ok($item.hasClass('sapMNLIUnread'), 'unread class is set');
		assert.strictEqual($item.find('.sapMNLITitle .sapMNLITitleText').text(), this.notificationListItem.getTitle(), 'title is rendered');

		assert.notOk($item.find('.sapMNLIBPriorityHigh span').attr('title') , 'no tooltip is rendered');
		assert.ok($item.find('.sapMNLIBPriorityHigh span'), 'priority High icon is rendered');

		assert.strictEqual($item.find('.sapMNLIItem:last-child button').attr('title'), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CLOSE"), 'close button is rendered');
		assert.ok(this.notificationListItem.$('overflowToolbar'), 'overflow toolbar is rendered');

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterBullet').text(), '·', 'footer separator is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:nth-child(3)').text(), '3 days', 'datetime is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:first-child').text(), 'John Smith', 'author name is rendered');

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_SHOW_MORE"), 'Show More link is rendered');

		assert.strictEqual($item.find('.sapFAvatar').length > 0, true, 'author avatar is rendered');

		assert.strictEqual($item.find('.sapMNLIDescription').text(), this.notificationListItem.getDescription(), 'description is rendered');

		assert.strictEqual($item.attr('role'), 'listitem', 'acc role is correct');
	});

	QUnit.test('footer', function(assert) {

		this.notificationListItem.setDatetime('');
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var $item = this.notificationListItem.$();

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:first-child').text(), 'John Smith', 'author name is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterBullet').length, 0, 'footer separator is not rendered');

		this.notificationListItem.setDatetime('3 days');
		this.notificationListItem.setAuthorName('');
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		$item = this.notificationListItem.$();

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem').eq(1).text(), '3 days', 'datetime is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterBullet').length, 0, 'footer separator is not rendered');
	});

	QUnit.module('Rendering - S size', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new NotificationList({
				width: '500px',
				items: [
					this.notificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('avatar rendering', function(assert) {
		var $item = this.notificationListItem.$();
		assert.strictEqual(window.getComputedStyle($item.find('.sapMNLIImage')[0])['display'], 'none', 'author avatar is not displayed');
	});

	QUnit.module('Interaction', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new NotificationList({
				width: '610px',
				items: [
					this.notificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('show more', function(assert) {
		var $item = this.notificationListItem.$();
		var showMoreButton = Element.closestTo($item.find('.sapMNLIFooter .sapMNLIShowMore a')[0]);
		showMoreButton.firePress();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		$item = this.notificationListItem.$();
		assert.notOk($item.find('.sapMNLITitleText').hasClass('sapMNLIItemTextLineClamp'), 'title does not have sapMNLIItemTextLineClamp class');
		assert.notOk($item.find('.sapMNLIDescription').hasClass('sapMNLIItemTextLineClamp'), 'description does not have sapMNLIItemTextLineClamp class');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_SHOW_LESS"), 'text is "Show Less"');

		showMoreButton.firePress();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		$item = this.notificationListItem.$();
		assert.ok($item.find('.sapMNLITitleText').hasClass('sapMNLIItemTextLineClamp'), 'title has sapMNLIItemTextLineClamp class');
		assert.ok($item.find('.sapMNLIDescription').hasClass('sapMNLIItemTextLineClamp'), 'description has sapMNLIItemTextLineClamp class');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_SHOW_MORE"), 'text is "Show More"');

		this.list.setWidth('1000px');
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		$item = this.notificationListItem.$();
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').length, 0, '"Show More" is not rendered');
	});

	QUnit.test('close button', function(assert) {
		var fnSpy = sinon.spy(this.notificationListItem, 'fireClose'),
			$item = this.notificationListItem.$(),
			closeButton = Element.closestTo($item.find('.sapMNLIItem:last-child button')[0]);

		closeButton.firePress();

		assert.strictEqual(fnSpy.callCount, 1, 'fireClose() should be called.');
	});

	QUnit.module('Accessibility', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new NotificationList({
				width: '610px',
				items: [
					this.notificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('ARIA - Accessibility Text', function (assert) {
		var ariallabledBy = this.notificationListItem.$().attr('aria-labelledby');

		assert.ok(ariallabledBy.indexOf('-title') > 0, "title is labeled to notification item");
		assert.ok(ariallabledBy.indexOf('-descr') > 0, "description is labeled to notification item");
		assert.ok(ariallabledBy.indexOf('-invisibleFooterText') > 0, "invisible text is labeled to notification ite,");

		var sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[2].innerText;
		var sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD") + " " +  oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CREATED_BY") + " " + this.notificationListItem.getAuthorName() + " " + oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_DATETIME", [this.notificationListItem.getDatetime()]) + " " + oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_PRIORITY", [this.notificationListItem.getPriority()]);
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is the correct one");
		// ACC  text result: "Notification unread. Created By John Smith Due in 3 days. High Priority."

		this.notificationListItem.setPriority("None");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[2].innerText;
		sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD") + " " +  oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CREATED_BY") + " " + this.notificationListItem.getAuthorName() + " " + oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_DATETIME", [this.notificationListItem.getDatetime()]);
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is OK the correct one when the priority is \"None\"");
		// ACC  text result: "Notification unread. Created By John Smith Due in 3 days."

		this.notificationListItem.setDatetime("");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[2].innerText;
		sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD") + " " +  oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CREATED_BY") + " " + this.notificationListItem.getAuthorName();
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is OK the correct one when the priority is \"None\" and there is no Datetime");
		// ACC  text result: "Notification unread. Created By John Smith"

		this.notificationListItem.setAuthorName("");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[2].innerText;
		sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD");
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is OK the correct one when the priority is \"None\", there is no Datetime and there is no authorName");
		// ACC  text result: "Notification unread."

	});

	QUnit.module('Keyboard navigation', {
		beforeEach: function() {
			this.notificationList = createNotificationList();

			this.notificationList.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.notificationList.destroy();
		}
	});

	QUnit.test('items navigation', function (assert) {
		var item1 = this.notificationList.getItems()[0],
			item2 = this.notificationList.getItems()[1];

		item1.focus();
		assert.strictEqual(item1.getDomRef(), document.activeElement, 'first item is focused');

		item1.onkeydown({
			target: item1.getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(item2.getDomRef(), document.activeElement, 'second item is focused');

		item2.onkeydown({
			target: item2.getDomRef(),
			which: KeyCodes.ARROW_UP,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(item1.getDomRef(), document.activeElement, 'first item is focused');
	});

	QUnit.test('F2 navigation', function(assert) {
		var item = this.notificationList.getItems()[0];

		item.focus();
		assert.strictEqual(item.getDomRef(), document.activeElement, 'first item is focused');

		QUnitUtils.triggerEvent("keydown", document.activeElement, {code: "F2"});

		assert.strictEqual(item._getOverflowToolbar().getContent()[0].getDomRef(), document.activeElement, 'button is focused');

		QUnitUtils.triggerEvent("keydown", document.activeElement, {code: "F2"});

		assert.strictEqual(item.getDomRef(), document.activeElement, 'first item is focused');
	});

	QUnit.test('navigation between the same elements on different rows - "show more"', function (assert) {
		var items = this.notificationList.getItems();

		items[0].focus();
		items[0]._getShowMoreButton().focus();

		items[0].onkeydown({
			target: items[0]._getShowMoreButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[1]._getShowMoreButton().getDomRef(), document.activeElement, 'second "show more" is focused');

		items[1].onkeydown({
			target: items[1]._getShowMoreButton().getDomRef(),
			which: KeyCodes.ARROW_UP,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[0]._getShowMoreButton().getDomRef(), document.activeElement, 'first "show more" is focused');

		items[2].focus();
		items[2]._getShowMoreButton().focus();

		items[2].onkeydown({
			target: items[2]._getShowMoreButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[3].getDomRef(), document.activeElement, '4th row is focused');
	});

	QUnit.test('navigation between the same elements on different rows - "actions" and "close" buttons', function (assert) {
		var items = this.notificationList.getItems();

		items[0].focus();
		items[0]._getCloseButton().focus();

		items[0].onkeydown({
			target: items[0]._getCloseButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[1]._getCloseButton().getDomRef(), document.activeElement, 'second "close" button is focused');

		items[1].onkeydown({
			target: items[1]._getCloseButton().getDomRef(),
			which: KeyCodes.ARROW_UP,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[0]._getCloseButton().getDomRef(), document.activeElement, 'first "close" button is focused');

		items[4].focus();
		items[4]._getOverflowToolbar()._getOverflowButton().focus();

		items[4].onkeydown({
			target: items[4]._getOverflowToolbar()._getOverflowButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[5].getDomRef(), document.activeElement, '6th row is focused');

		items[0].focus();
		items[0].getButtons()[0].focus();

		items[0].onkeydown({
			target: items[0].getButtons()[0].getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[1]._getOverflowToolbar()._getOverflowButton().getDomRef(), document.activeElement, 'toolbar button is focused');


		items[2].focus();
		items[2]._getOverflowToolbar()._getOverflowButton().focus();

		items[2].onkeydown({
			target: items[2]._getOverflowToolbar()._getOverflowButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(items[3]._getCloseButton().getDomRef(), document.activeElement, 'close button is focused');

		items[3].onkeydown({
			target: items[3]._getCloseButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});

		assert.strictEqual(items[4]._getOverflowToolbar()._getOverflowButton().getDomRef(), document.activeElement, 'toolbar button is focused');
	});

	QUnit.module('Cloning');

	QUnit.test('cloning without bindings', function(assert) {
		var notificationListItem = new NotificationListItem();

		// arrange
		var firstButton = new Button({text: 'First Button'});
		var secondButton = new Button({text: 'Second Button'});
		var secondNotification;

		// act
		notificationListItem.addButton(firstButton);
		notificationListItem.addButton(secondButton);
		secondNotification = notificationListItem.clone();

		// assert
		assert.strictEqual((secondNotification instanceof NotificationListItem), true, 'The notification should be cloned.');
		assert.strictEqual(secondNotification.getButtons().length, 2, 'The buttons should be cloned.');

		assert.strictEqual((secondNotification.getAggregation('_overflowToolbar') instanceof OverflowToolbar),
			true, 'The overflow bar should be cloned.');

		secondNotification.destroy();
		notificationListItem.destroy();
	});

	QUnit.test('cloning with bindings', function(assert) {
		// arrange
		var template = new Button({
			text: "{text}",
			type: "{type}"
		});

		var notification = new NotificationListItem({
			buttons: {
				path: "actions",
				templateShareable: true,
				template: template
			}
		});

		var model = new JSONModel({
			actions: [
				{
					text: "accept",
					type: "Accept",
					nature: "POSITIVE"
				}, {
					text: "reject",
					type: "Reject",
					nature: "POSITIVE"
				}
			]
		});

		notification.setModel(model);
		notification.bindObject("/");

		// act
		var notificationCloning = notification.clone();
		var list = new NotificationList({
			items: [
				notification,
				notificationCloning
			]
		});

		list.placeAt(RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(notificationCloning.getButtons().length, 2, "The clone should have the binned aggregation");
		assert.strictEqual(notification.getButtons().length, 2, "The original notification should have the binned aggregation");

		assert.ok(notificationCloning._getOverflowToolbar().getDomRef(), "Overflow toolbar has DOM reference");
		assert.ok(notification._getOverflowToolbar().getDomRef(), "Overflow toolbar has DOM ref reference");

		// cleanup
		list.destroy();
		notificationCloning.destroy();
		notification.destroy();
	});

	QUnit.test('cloning with bindings - on S size. When"showCloseButton" is false the separator and the "close" button should not be visible', function(assert) {
		// arrange
		var model = new JSONModel({
			actions: [
				{
					text: "accept",
					type: "Accept"
				}
			]
		});

		var list = new NotificationList({
			width: "500px"
		});

		list.setModel(model);
		list.bindObject("/");

		list.bindAggregation("items", {
			path : "actions",
			templateShareable: true,
			template : new NotificationListItem("notList", {
				showCloseButton: false,
				title: "Title",
				description: "Some description",
				buttons: [
					new Button({
						text: "{text}",
						type: "{type}"
					})
				]
			})
		});

		// act
		list.placeAt(RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.strictEqual(list.getItems()[0]._getOverflowToolbar().getContent()[0].getVisible(), true, "The button is visible on mobile");
		assert.strictEqual(list.getItems()[0]._getOverflowToolbar().getContent()[1].getVisible(), false, "The separator is not visible on mobile");
		assert.strictEqual(list.getItems()[0]._getOverflowToolbar().getContent()[2].getVisible(), false, "The close button is not visible on mobile");

		// cleanup
		list.destroy();
	});

	QUnit.module('Action and close buttons - M Size', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new NotificationList({
				width: '610px',
				items: [
					this.notificationListItem
				]
			});
			this.list.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('action buttons', function(assert) {
		var buttons = this.notificationListItem.getButtons();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');

		this.notificationListItem.removeButton(buttons[1]);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');

		this.notificationListItem.addButton(buttons[1]);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
	});

	QUnit.test('Close button destruction', function(assert) {
		var notificationListItem = createNotificatoinListItem();
		notificationListItem.placeAt(RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var closeButton = notificationListItem._getCloseButton();
		var closeButtonId = closeButton.sId;

		notificationListItem.destroy();
		assert.strictEqual(Element.getElementById(closeButtonId), undefined, "close button is destroyed");
	});

	QUnit.module('Action and close buttons - S Size', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new NotificationList({
				width: '500px',
				items: [
					this.notificationListItem
				]
			});
			this.list.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('action and close buttons', function(assert) {
		var buttons = this.notificationListItem.getButtons(),
			closeButton = this.notificationListItem._getCloseButton(),
			toolbarSeparator = this.notificationListItem._getToolbarSeparator();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[1].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');

		assert.notOk(buttons[0].hasStyleClass('sapMNLIBHiddenButton'), 'button is visible');
		assert.notOk(buttons[1].hasStyleClass('sapMNLIBHiddenButton'), 'button is visible');

		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'close button overflow priority is ok');
		assert.ok(toolbarSeparator.getVisible(), 'toolbar separator is visible');

		this.notificationListItem.setShowButtons(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[1].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');

		assert.ok(buttons[0].hasStyleClass('sapMNLIBHiddenButton'), 'button is hidden');
		assert.ok(buttons[1].hasStyleClass('sapMNLIBHiddenButton'), 'button is hidden');

		closeButton = this.notificationListItem._getCloseButton();
		toolbarSeparator = this.notificationListItem._getToolbarSeparator();

		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'close button overflow priority is ok');
		assert.notOk(toolbarSeparator.getVisible(), 'toolbar separator is not visible');

		this.notificationListItem.setShowButtons(true);
		this.notificationListItem.setShowCloseButton(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		closeButton = this.notificationListItem._getCloseButton();
		toolbarSeparator = this.notificationListItem._getToolbarSeparator();

		assert.notOk(closeButton.getVisible(), 'close button is not visible');
		assert.notOk(toolbarSeparator.getVisible(), 'toolbar separator is not visible');

		this.notificationListItem.setShowCloseButton(true);
		this.notificationListItem.removeButton(buttons[0]);
		this.notificationListItem.removeButton(buttons[1]);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		closeButton = this.notificationListItem._getCloseButton();
		toolbarSeparator = this.notificationListItem._getToolbarSeparator();

		assert.ok(closeButton.getVisible(), 'close button is visible');
		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'close button overflow priority is ok');
		assert.notOk(toolbarSeparator.getVisible(), 'toolbar separator is not visible');
	});

	QUnit.test("Close button should still be visible after details are expanded", function (assert) {
		// arrange
		var nli = new NotificationListItem({
			title: 'Notification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title TitleNotification List Item Title Title Title',
			description: 'Notification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item DescriptionNotification List Item Description'
		});
		this.list.addItem(nli);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var showMoreButton = Element.closestTo(nli.getDomRef("showMoreButton"));
		var closeButton = Element.closestTo(nli.getDomRef("closeButtonX"));

		// act
		showMoreButton.firePress();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// assert
		assert.ok(closeButton.$().is(":visible"), "Close button should be visible after details are expanded");
	});

	QUnit.module('Show More button', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new NotificationList({
				width: '100px',
				items: [
					this.notificationListItem
				]
			});
			this.list.placeAt(RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test("Clicking on 'Show More' button doesn't rerender the item", function (assert) {
		var fnSpy = sinon.spy(this.notificationListItem, 'invalidate');

		this.notificationListItem._getShowMoreButton().firePress();

		assert.ok(fnSpy.notCalled, 'invalidate is not called.');

		fnSpy.restore();
	});
});
