/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/NotificationListBase",
	"sap/m/NotificationListItem",
	"sap/m/NotificationListGroup",
	"sap/m/OverflowToolbar",
	"sap/m/List",
	"sap/ui/core/library",
	"sap/m/library",
	"sap/ui/core/Core",
	'sap/ui/Device',
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/json/JSONModel"
], function(
	qutils,
	NotificationListBase,
	NotificationListItem,
	NotificationListGroup,
	OverflowToolbar,
	List,
	coreLibrary,
	mLibrary,
	Core,
	Device,
	Button,
	KeyCodes,
	JSONModel
) {
	'use strict';


	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;

	var  oResourceBundleM = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	var RENDER_LOCATION = 'qunit-fixture';

	function createNotificatoinListItem() {
		return new NotificationListItem({
			unread : true,

			title: 'Notification List Item Title Title Title',
			priority: Priority.High,
			showCloseButton : true,
			showButtons: true,
			datetime : '3 days',
			authorName : 'John Smith',
			authorPicture : 'sap-icon://group',

			description: 'Notification List Item Description',

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

	function createNotificationListGroup() {
		return new NotificationListGroup({
			unread : true,
			title: 'Notification List Group Title',
			showCloseButton : true,
			showButtons: true,

			buttons: [
				new Button({
					text: 'Accept'
				}),
				new Button({
					text: 'Cancel'
				})
			],

			items: [
				new NotificationListItem({
					title: 'Item 1',
					description: 'Item 1 Description'
				}),
				new NotificationListItem({
					title: 'Item 2',
					description: 'Item 2 Description'
				})
			]
		});
	}

	QUnit.module('Rendering', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new List({
				width: '300px',
				items: [
					this.notificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('initial rendering', function(assert) {

		var $item = this.notificationListItem.$();

		assert.ok(this.notificationListItem.getDomRef(), 'Item is rendered');

		assert.ok($item.hasClass('sapMNLIUnread'), 'unread class is set');
		assert.strictEqual($item.find('.sapMNLITitle .sapMNLITitleText').text(), 'Notification List Item Title Title Title' , 'title is rendered');

		assert.notOk($item.find('.sapMNLIBPriorityHigh span').attr('title') , 'no tooltip is rendered');
		assert.ok($item.find('.sapMNLIBPriorityHigh span'), 'priority High icon is rendered');

		assert.strictEqual($item.find('.sapMNLIItem:last-child button').attr('title'), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CLOSE"), 'close button is rendered');
		assert.ok(this.notificationListItem.$('overflowToolbar'), 'overflow toolbar is rendered');

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterBullet').text(), '·', 'footer separator is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:nth-child(3)').text(), '3 days', 'datetime is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:first-child').text(), 'John Smith', 'author name is rendered');

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_SHOW_MORE"), 'Show More link is rendered');

		assert.strictEqual($item.find('.sapFAvatar').attr('aria-label'), oResourceBundleM.getText("AVATAR_TOOLTIP"), 'author avatar is rendered');

		assert.strictEqual($item.find('.sapMNLIDescription').text(), 'Notification List Item Description', 'description is rendered');
	});

	QUnit.test('footer', function(assert) {

		this.notificationListItem.setDatetime('');
		Core.applyChanges();

		var $item = this.notificationListItem.$();

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:first-child').text(), 'John Smith', 'author name is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterBullet').length, 0, 'footer separator is not rendered');

		this.notificationListItem.setDatetime('3 days');
		this.notificationListItem.setAuthorName('');
		Core.applyChanges();

		$item = this.notificationListItem.$();

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem').eq(1).text(), '3 days', 'datetime is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterBullet').length, 0, 'footer separator is not rendered');
	});

	QUnit.module('Interaction', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new List({
				width: '300px',
				items: [
					this.notificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('show more', function(assert) {

		var $item = this.notificationListItem.$();
		var showMoreButton = $item.find('.sapMNLIFooter .sapMNLIShowMore a').control()[0];
		showMoreButton.firePress();
		Core.applyChanges();

		$item = this.notificationListItem.$();
		assert.notOk($item.find('.sapMNLITitleText').hasClass('sapMNLIItemTextLineClamp'), 'title does not have sapMNLIItemTextLineClamp class');
		assert.notOk($item.find('.sapMNLIDescription').hasClass('sapMNLIItemTextLineClamp'), 'description does not have sapMNLIItemTextLineClamp class');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_SHOW_LESS"), 'text is "Show Less"');

		showMoreButton.firePress();
		Core.applyChanges();

		$item = this.notificationListItem.$();
		assert.ok($item.find('.sapMNLITitleText').hasClass('sapMNLIItemTextLineClamp'), 'title has sapMNLIItemTextLineClamp class');
		assert.ok($item.find('.sapMNLIDescription').hasClass('sapMNLIItemTextLineClamp'), 'description has sapMNLIItemTextLineClamp class');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_SHOW_MORE"), 'text is "Show More"');

		this.list.setWidth('1000px');
		Core.applyChanges();

		$item = this.notificationListItem.$();
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').length, 0, '"Show More" is not rendered');
	});

	QUnit.test('close button', function(assert) {

		var fnSpy = sinon.spy(this.notificationListItem, 'fireClose'),
			$item = this.notificationListItem.$(),
			closeButton = $item.find('.sapMNLIItem:last-child button').control()[0];

		closeButton.firePress();

		assert.strictEqual(fnSpy.callCount, 1, 'fireClose() should be called.');
	});

	QUnit.module('Accessibility', {
		beforeEach: function() {
			this.notificationListItem = createNotificatoinListItem();
			this.list = new List({
				width: '300px',
				items: [
					this.notificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			Core.applyChanges();
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

		var sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[3].innerText;
		var sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD") + " " +  oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CREATED_BY") + " " + this.notificationListItem.getAuthorName() + " " + oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_DATETIME", [this.notificationListItem.getDatetime()]) + " " + oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_PRIORITY", [this.notificationListItem.getPriority()]);
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is the correct one");
		// ACC  text result: "Notification unread. Created By John Smith Due in 3 days. High Priority."

		this.notificationListItem.setPriority("None");
		Core.applyChanges();
		sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[3].innerText;
		sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD") + " " +  oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CREATED_BY") + " " + this.notificationListItem.getAuthorName() + " " + oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_DATETIME", [this.notificationListItem.getDatetime()]);
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is OK the correct one when the priority is \"None\"");
		// ACC  text result: "Notification unread. Created By John Smith Due in 3 days."

		this.notificationListItem.setDatetime("");
		Core.applyChanges();
		sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[3].innerText;
		sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD") + " " +  oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_CREATED_BY") + " " + this.notificationListItem.getAuthorName();
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is OK the correct one when the priority is \"None\" and there is no Datetime");
		// ACC  text result: "Notification unread. Created By John Smith"

		this.notificationListItem.setAuthorName("");
		Core.applyChanges();
		sInvisibleACCTextRendered = this.notificationListItem.getDomRef().getElementsByClassName("sapUiInvisibleText")[3].innerText;
		sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_ITEM_UNREAD");
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is OK the correct one when the priority is \"None\", there is no Datetime and there is no authorName");
		// ACC  text result: "Notification unread."

	});

	QUnit.module('Keyboard navigation', {
		beforeEach: function() {
			this.notificationListGroup = createNotificationListGroup();

			this.notificationListGroup.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationListGroup.destroy();
		}
	});

	QUnit.test('keyboard navigation within a group', function (assert) {
		var item1 = this.notificationListGroup.getItems()[0],
			item2 = this.notificationListGroup.getItems()[1];

		item1.focus();
		assert.strictEqual(item1.getDomRef(), document.activeElement, 'first item is focused');

		item1.onkeydown({
			target: item1.getDomRef(),
			which: KeyCodes.ARROW_DOWN
		});
		assert.strictEqual(item2.getDomRef(), document.activeElement, 'second item is focused');

		item2.onkeydown({
			target: item2.getDomRef(),
			which: KeyCodes.ARROW_UP
		});
		assert.strictEqual(item1.getDomRef(), document.activeElement, 'first item is focused');
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
		var list = new List({
			items: [
				notification,
				notificationCloning
			]
		});

		list.placeAt(RENDER_LOCATION);
		Core.applyChanges();

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

	QUnit.module('Action and close buttons - non mobile', {
		beforeEach: function() {

			this.isPhone = Device.system.phone;
			Device.system.phone = false;

			this.notificationListItem = createNotificatoinListItem();
			this.notificationListItem.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationListItem.destroy();
			Device.system.phone = this.isPhone;
		}
	});

	QUnit.test('action buttons', function(assert) {
		var buttons = this.notificationListItem.getButtons();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');

		this.notificationListItem.removeButton(buttons[1]);
		Core.applyChanges();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');

		this.notificationListItem.addButton(buttons[1]);
		Core.applyChanges();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
	});

	QUnit.test('Close button destruction', function(assert) {

		var notificationListItem = createNotificatoinListItem();
		notificationListItem.placeAt(RENDER_LOCATION);
		var closeButton = notificationListItem._getCloseButton();
		var closeButtonId = closeButton.sId;

		notificationListItem.destroy();
		assert.strictEqual(sap.ui.getCore().byId(closeButtonId), undefined, "close button is destroyed");
	});

	QUnit.module('Action and close buttons - mobile', {
		beforeEach: function() {

			this.isPhone = Device.system.phone;
			Device.system.phone = true;

			this.notificationListItem = createNotificatoinListItem();
			this.notificationListItem.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationListItem.destroy();

			Device.system.phone = this.isPhone;
		}
	});

	QUnit.test('action and close buttons', function(assert) {
		var buttons = this.notificationListItem.getButtons(),
			closeButton = this.notificationListItem._getCloseButton(),
			toolbarSeparator = this.notificationListItem._toolbarSeparator;

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[1].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');

		assert.notOk(buttons[0].hasStyleClass('sapMNLIBHiddenButton'), 'button is visible');
		assert.notOk(buttons[1].hasStyleClass('sapMNLIBHiddenButton'), 'button is visible');

		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'close button overflow priority is ok');
		assert.ok(toolbarSeparator.getVisible(), 'toolbar separator is visible');

		this.notificationListItem.setShowButtons(false);
		Core.applyChanges();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[1].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');

		assert.ok(buttons[0].hasStyleClass('sapMNLIBHiddenButton'), 'button is hidden');
		assert.ok(buttons[1].hasStyleClass('sapMNLIBHiddenButton'), 'button is hidden');

		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'close button overflow priority is ok');
		assert.notOk(toolbarSeparator.getVisible(), 'toolbar separator is not visible');

		this.notificationListItem.setShowButtons(true);
		this.notificationListItem.setShowCloseButton(false);
		Core.applyChanges();


		assert.notOk(closeButton.getVisible(), 'close button is not visible');
		assert.notOk(toolbarSeparator.getVisible(), 'toolbar separator is not visible');

		this.notificationListItem.setShowCloseButton(true);
		this.notificationListItem.removeButton(buttons[0]);
		this.notificationListItem.removeButton(buttons[1]);
		Core.applyChanges();

		assert.ok(closeButton.getVisible(), 'close button is visible');
		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'close button overflow priority is ok');
		assert.notOk(toolbarSeparator.getVisible(), 'toolbar separator is not visible');
	});
});
