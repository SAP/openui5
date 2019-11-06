/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/NotificationListBase",
	"sap/m/NotificationListGroup",
	"sap/m/NotificationListItem",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function(
	qutils,
	NotificationListBase,
	NotificationListGroup,
	NotificationListItem,
	Button,
	Core,
	coreLibrary
) {
	'use strict';

	var RENDER_LOCATION = 'qunit-fixture';
	var Priority = coreLibrary.Priority;

	function createNotificationListGroup() {
		return new NotificationListGroup({
			unread : true,
			autoPriority: false,
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
			this.notificationListGroup = createNotificationListGroup();

			this.notificationListGroup.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationListGroup.destroy();
		}
	});

	QUnit.test('initial rendering', function(assert) {

		var $item = this.notificationListGroup.$();

		assert.ok(this.notificationListGroup.getDomRef(), 'Group is rendered');

		assert.ok($item.hasClass('sapMNLGroupUnread'), 'unread class is set');
		assert.strictEqual($item.find('.sapMNLGroupTitle').text(), 'Notification List Group Title', 'title is rendered');

		assert.strictEqual($item.find('.sapMNLGroupCollapseButton button').attr('title'), 'Collapse Group', 'collapse button is rendered');

		assert.strictEqual($item.find('.sapMNLIItem:last-child button').attr('title'), 'Close', 'close button is rendered');
		assert.ok(this.notificationListGroup.$('overflowToolbar'), 'overflow toolbar is rendered');

		assert.strictEqual($item.find('.sapMNLGroupChildren li').length, 2, 'group has 2 items');
	});

	QUnit.test('priority', function(assert) {
		this.notificationListGroup.setPriority(Priority.High);
		sap.ui.getCore().applyChanges();

		var $item = this.notificationListGroup.$();
		assert.strictEqual($item.find('.sapMNLIBPriorityHigh span').attr('title'), 'Error', 'priority is rendered');
	});

	QUnit.test('priority', function(assert) {
		this.notificationListGroup.setAutoPriority(true);
		sap.ui.getCore().applyChanges();

		var $item = this.notificationListGroup.$();
		assert.strictEqual($item.find('.sapMNLIBPriority').length, 0, 'priority is not rendered');
	});

	QUnit.module('Interaction', {
		beforeEach: function() {
			this.notificationListGroup = createNotificationListGroup();

			this.notificationListGroup.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationListGroup.destroy();
		}
	});

	QUnit.test('collapse/expand', function(assert) {

		var fnSpy = sinon.spy(this.notificationListGroup, 'fireOnCollapse'),
			$item = this.notificationListGroup.$(),
			collapseButton = $item.find('.sapMNLGroupCollapseButton button').control()[0];

		collapseButton.firePress();

		assert.strictEqual(fnSpy.callCount, 1, 'onCollapse should be called.');
		assert.strictEqual(collapseButton.getTooltip(), 'Expand Group', 'collapse button tooltip is correct');

		$item = this.notificationListGroup.$();
		assert.ok($item.hasClass('sapMNLGroupCollapsed'), 'sapMNLGroupCollapsed class is set');

		collapseButton.firePress();

		assert.strictEqual(fnSpy.callCount, 2, 'onCollapse should be called.');
		assert.strictEqual(collapseButton.getTooltip(), 'Collapse Group', 'collapse button tooltip is correct');

		$item = this.notificationListGroup.$();
		assert.notOk($item.hasClass('sapMNLGroupCollapsed'), 'sapMNLGroupCollapsed class is not set');
	});

	QUnit.test('close button', function(assert) {

		var fnSpy = sinon.spy(this.notificationListGroup, 'fireClose'),
			$item = this.notificationListGroup.$(),
			closeButton = $item.find('.sapMNLIItem:last-child button').control()[0];

		closeButton.firePress();

		assert.strictEqual(fnSpy.callCount, 1, 'fireClose() should be called.');
	});

	QUnit.module('Accessibility', {
		beforeEach: function() {
			this.notificationListGroup = createNotificationListGroup();

			this.notificationListGroup.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationListGroup.destroy();
		}
	});

	QUnit.test('ARIA - Accessibility Text', function (assert) {
		var invisibleText = NotificationListBase._getInvisibleText();
		assert.notOk(invisibleText.getText(), "accessibility text is initially empty");

		this.notificationListGroup.onfocusin({
			target: this.notificationListGroup.getDomRef()
		});

		assert.equal(invisibleText.getText(), 'Notification List Group Title', "accessibility text is correct");
	});
});
