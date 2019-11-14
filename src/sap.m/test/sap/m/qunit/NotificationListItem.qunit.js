/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/NotificationListBase",
	"sap/m/NotificationListItem",
	"sap/m/NotificationListGroup",
	"sap/m/OverflowToolbar",
	"sap/m/List",
	"sap/ui/core/library",
	"sap/ui/core/Core",
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
	Core,
	Button,
	KeyCodes,
	JSONModel
) {
	'use strict';


	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	var RENDER_LOCATION = 'qunit-fixture';

	function createNotificatoinListItem() {
		return new NotificationListItem({
			unread : true,

			title: 'Notification List Item Title',
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
		assert.strictEqual($item.find('.sapMNLITitle .sapMNLITitleText').text(), 'Notification List Item Title', 'title is rendered');

		assert.strictEqual($item.find('.sapMNLIBPriorityHigh span').attr('title'), 'Error', 'priority is rendered');

		assert.strictEqual($item.find('.sapMNLIItem:last-child button').attr('title'), 'Close', 'close button is rendered');
		assert.ok(this.notificationListItem.$('overflowToolbar'), 'overflow toolbar is rendered');

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterBullet').text(), '·', 'footer separator is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:nth-child(3)').text(), '3 days', 'datetime is rendered');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIFooterItem:first-child').text(), 'John Smith', 'author name is rendered');

		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), 'Show More', 'Show More link is rendered');

		assert.strictEqual($item.find('.sapFAvatar').attr('aria-label'), 'Avatar', 'author avatar is rendered');

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
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), 'Show Less', 'text is "Show Less"');

		showMoreButton.firePress();
		Core.applyChanges();

		$item = this.notificationListItem.$();
		assert.ok($item.find('.sapMNLITitleText').hasClass('sapMNLIItemTextLineClamp'), 'title has sapMNLIItemTextLineClamp class');
		assert.ok($item.find('.sapMNLIDescription').hasClass('sapMNLIItemTextLineClamp'), 'description has sapMNLIItemTextLineClamp class');
		assert.strictEqual($item.find('.sapMNLIFooter .sapMNLIShowMore a').text(), 'Show More', 'text is "Show More"');

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
		assert.equal(this.notificationListItem.$().attr('aria-label'), 'Notification List Item Title Notification List Item Description Notification unread. Created By John Smith Due in 3 days, High Priority.', "accessibility text is correct");
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
		notificationListItem.addAggregation('buttons', firstButton);
		notificationListItem.addAggregation('buttons', secondButton);
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
				template: template,
				templateShareable:true
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
			]});

		// act
		var notificationCloning = notification.clone();
		var list = new List({
			items: [
				notification,
				notificationCloning
			]});

		list.setModel(model);
		list.bindObject("/");

		// assert
		assert.strictEqual(notificationCloning.getButtons().length, 2,"The clone should have the binned aggregation");
		assert.strictEqual(notification.getButtons().length, 2,"The original notification should have the binned aggregation");

		// cleanup
		list.destroy();
		notificationCloning.destroy();
		notification.destroy();
	});
});