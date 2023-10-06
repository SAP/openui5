/*global QUnit, sinon */

sap.ui.define([
	"sap/m/ScrollContainer",
	"sap/m/NotificationList",
	"sap/m/NotificationListGroup",
	"sap/m/NotificationListItem",
	"sap/m/Button",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/m/library"
], function(
	ScrollContainer,
	NotificationList,
	NotificationListGroup,
	NotificationListItem,
	Button,
	KeyCodes,
	Core,
	Element,
	coreLibrary,
	mLibrary
) {
	'use strict';

	var RENDER_LOCATION = 'qunit-fixture';
	var Priority = coreLibrary.Priority;

	// shortcut for sap.m.OverflowToolbarPriority
	var OverflowToolbarPriority = mLibrary.OverflowToolbarPriority;

	var  oResourceBundleM = Core.getLibraryResourceBundle("sap.m");

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
					description: 'Item 1 Description',
					buttons: [new Button({ text: "Button" }), new Button({ text: "Button" }), new Button({ text: "Button" })]
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
		assert.strictEqual($item.find('.sapMNLGroupTitle').text(), 'Notification List Group Title (2)', 'title is rendered');
		assert.strictEqual($item.find('.sapMNLGroupCollapseButton button').attr('title'), oResourceBundleM.getText("NOTIFICATION_LIST_GROUP_COLLAPSE"), 'collapse button is rendered');
		assert.strictEqual($item.find('.sapMNLIItem.sapMNLICloseBtn button').attr('title'), oResourceBundleM.getText("NOTIFICATION_LIST_GROUP_CLOSE"), 'close button is rendered');
		assert.ok(this.notificationListGroup.$('overflowToolbar'), 'overflow toolbar is rendered');

		assert.strictEqual($item.find('.sapMNLGroupChildren li').length, 2, 'group has 2 items');

		assert.strictEqual($item.attr('role'), 'listitem', 'acc role is correct');
		assert.strictEqual($item.find("ul").attr('role'), 'list', 'acc group role is correct');
	});

	QUnit.test('priority', function(assert) {
		this.notificationListGroup.setPriority(Priority.High);
		Core.applyChanges();

		var $item = this.notificationListGroup.$();
		assert.ok($item.find('.sapMNLIBPriorityHigh span'), 'priority High is rendered');

		this.notificationListGroup.setPriority(Priority.Medium);
		Core.applyChanges();

		$item = this.notificationListGroup.$();
		assert.ok($item.find('.sapMNLIBPriorityMedium span'), 'priority Medium is rendered');

		this.notificationListGroup.setPriority(Priority.Low);
		Core.applyChanges();

		$item = this.notificationListGroup.$();
		assert.ok($item.find('.sapMNLIBPriorityLow span'), 'priority Low is rendered');
	});

	QUnit.test('auto priority', function(assert) {
		this.notificationListGroup.setAutoPriority(true);
		Core.applyChanges();

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
			collapseButton = Element.closestTo($item.find('.sapMNLGroupCollapseButton button')[0]);

		collapseButton.firePress();
		Core.applyChanges();

		assert.strictEqual(fnSpy.callCount, 1, 'onCollapse should be called.');
		assert.strictEqual(collapseButton.getTooltip(), oResourceBundleM.getText("NOTIFICATION_LIST_GROUP_EXPAND"), 'collapse button tooltip is correct');

		$item = this.notificationListGroup.$();
		assert.ok($item.hasClass('sapMNLGroupCollapsed'), 'sapMNLGroupCollapsed class is set');

		collapseButton.firePress();
		Core.applyChanges();

		assert.strictEqual(fnSpy.callCount, 2, 'onCollapse should be called.');
		assert.strictEqual(collapseButton.getTooltip(), oResourceBundleM.getText("NOTIFICATION_LIST_GROUP_COLLAPSE"), 'collapse button tooltip is correct');

		$item = this.notificationListGroup.$();
		assert.notOk($item.hasClass('sapMNLGroupCollapsed'), 'sapMNLGroupCollapsed class is not set');
	});

	QUnit.test("collapse button retains focus when pressed after a child notification item's overflow menu closes", function (assert) {
		var done = assert.async(),
			$NLG = this.notificationListGroup.$(),
			oNLGCollapseButton = Element.closestTo($NLG.find('.sapMNLGroupCollapseButton button')[0]),
			oNLIOverflowToolbar = this.notificationListGroup.getItems()[0]._getOverflowToolbar(),
			oNLIOverflowToolbarButton = oNLIOverflowToolbar._getOverflowButton();

		// arrange
		oNLIOverflowToolbarButton.$().tap();
		Core.applyChanges();
		assert.strictEqual(oNLIOverflowToolbar._getPopover().isOpen(), true, "Notification's OverflowToolbar's Popover is open");

		// act
		oNLGCollapseButton.$().tap();
		Core.applyChanges();

		setTimeout(function () {
			assert.ok($NLG.hasClass('sapMNLGroupCollapsed'), 'sapMNLGroupCollapsed class is set');
			assert.strictEqual(document.activeElement.id, oNLGCollapseButton.getId(), "collapse button is focused after being pressed");
			done();
		}, 200);
	});

	QUnit.test('close button', function(assert) {

		var fnSpy = sinon.spy(this.notificationListGroup, 'fireClose'),
			$item = this.notificationListGroup.$(),
			closeButton = Element.closestTo($item.find('.sapMNLIItem.sapMNLICloseBtn button')[0]);

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
		var ariallabledBy = this.notificationListGroup.$().attr('aria-labelledby');
		assert.ok(ariallabledBy.indexOf('-groupTitle') > 0, "title is labeled to notification group");
		assert.ok(ariallabledBy.indexOf('-invisibleGroupTitleText') > 0, "invisibleText is labeled to notification group");

		var sInvisibleACCTextRendered = this.notificationListGroup.getDomRef().getElementsByClassName("sapUiInvisibleText")[3].innerText;
		var sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_GROUP_UNREAD") + " "  + oResourceBundleM.getText("LIST_ITEM_COUNTER", [this.notificationListGroup._getVisibleItemsCount()]);
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is the correct one");
		// ACC  text result: "Notification group unread. Counter 2"

		this.notificationListGroup.setPriority("High");
		Core.applyChanges();
		sInvisibleACCTextRendered = this.notificationListGroup.getDomRef().getElementsByClassName("sapUiInvisibleText")[3].innerText;
		sInvisibleACCText = oResourceBundleM.getText("NOTIFICATION_LIST_GROUP_UNREAD") + " "  + oResourceBundleM.getText("NOTIFICATION_LIST_GROUP_PRIORITY", [this.notificationListGroup.getPriority()]) + " " + oResourceBundleM.getText("LIST_ITEM_COUNTER", [this.notificationListGroup._getVisibleItemsCount()]);
		assert.strictEqual(sInvisibleACCTextRendered, sInvisibleACCText, "ACC text is the correct one when we set priority");
		// ACC  text result: "Notification group unread. High Priority. Counter 2"
	});

	QUnit.module('Action and close buttons - M size', {
		beforeEach: function() {
			this.notificationListGroup = createNotificationListGroup();
			this.notificationListGroup.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationListGroup.destroy();
		}
	});

	QUnit.test('action buttons', function(assert) {
		var $notificationListGroup = this.notificationListGroup.$();
		var buttons = this.notificationListGroup.getButtons();

		assert.notEqual($notificationListGroup.find('.sapMNLIItem.sapMNLIActions')[0].style.display, 'none', "overflow toolbar is visible");
		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');

		this.notificationListGroup.setCollapsed(true);
		Core.applyChanges();

		assert.ok($notificationListGroup.find('.sapMNLIItem.sapMNLIActions')[0].classList.contains("sapMNLIActionsHidden"), "overflow toolbar is hideen");
	});

	QUnit.test('Close button destruction', function(assert) {
		var notificationListGroup = createNotificationListGroup();
		notificationListGroup.placeAt(RENDER_LOCATION);
		Core.applyChanges();
		var closeButton = notificationListGroup._getCloseButton();
		var closeButtonId = closeButton.sId;

		notificationListGroup.destroy();
		assert.strictEqual(Core.byId(closeButtonId), undefined, "close button is destroyed");
	});

	QUnit.module('Action and close buttons - S Size', {
		beforeEach: function() {
			this.notificationListGroup = createNotificationListGroup();
			this.scrollContainer = new ScrollContainer({
				width: "500px",
				vertical: false,
				content: this.notificationListGroup
			});

			this.scrollContainer.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.scrollContainer.destroy();
		}
	});

	QUnit.test('action and close buttons', function(assert) {
		var buttons = this.notificationListGroup.getButtons(),
			closeButton = this.notificationListGroup._getCloseButton(),
			toolbarSeparator = this.notificationListGroup._getToolbarSeparator();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[1].getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'button overflow priority is ok');

		assert.notOk(buttons[0].hasStyleClass('sapMNLIBHiddenButton'), 'button is visible');
		assert.notOk(buttons[1].hasStyleClass('sapMNLIBHiddenButton'), 'button is visible');

		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.AlwaysOverflow, 'close button overflow priority is ok');
		assert.ok(toolbarSeparator.getVisible(), 'toolbar separator is visible');

		this.notificationListGroup.setCollapsed(true);
		Core.applyChanges();

		assert.strictEqual(buttons[0].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');
		assert.strictEqual(buttons[1].getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'button overflow priority is ok');

		assert.ok(buttons[0].hasStyleClass('sapMNLIBHiddenButton'), 'button is hidden');
		assert.ok(buttons[1].hasStyleClass('sapMNLIBHiddenButton'), 'button is hidden');

		closeButton = this.notificationListGroup._getCloseButton();
		toolbarSeparator = this.notificationListGroup._getToolbarSeparator();

		assert.strictEqual(closeButton.getLayoutData().getPriority(), OverflowToolbarPriority.NeverOverflow, 'close button overflow priority is ok');
		assert.notOk(toolbarSeparator.getVisible(), 'toolbar separator is not visible');
	});

	QUnit.module('Keyboard Navigation', {
		beforeEach: function() {
			this.notificationList = new NotificationList({
				items: [
					new NotificationListGroup({
						title: 'Notification List Group Title',
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
					}),
					new NotificationListGroup({
						collapsed: true,
						title: 'Notification List Group Title',
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
					}),
					new NotificationListGroup({
						title: 'Notification List Group Title',
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
					}),
					new NotificationListGroup({
						title: 'Notification List Group Title',
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
					})
				]
			});

			this.notificationList.placeAt(RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function() {
			this.notificationList.destroy();
		}
	});

	QUnit.test('items navigation', function(assert) {
		var groupItems = this.notificationList.getItems();

		groupItems[0].focus();
		assert.strictEqual(groupItems[0].getDomRef(), document.activeElement, 'first item is focused');

		groupItems[0].onkeydown({
			target: groupItems[0].getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(groupItems[0].getItems()[0].getDomRef(), document.activeElement, 'second item is focused');

		groupItems[0].getItems()[0].onkeydown({
			target: groupItems[0].getItems()[0].getDomRef(),
			which: KeyCodes.ARROW_UP,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(groupItems[0].getDomRef(), document.activeElement, 'first item is focused');
	});

	QUnit.test('navigation between "collapse" buttons', function(assert) {
		var groupItems = this.notificationList.getItems();

		groupItems[1].focus();
		groupItems[1]._getCollapseButton().focus();

		groupItems[1].onkeydown({
			target: groupItems[1]._getCollapseButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(groupItems[2]._getCollapseButton().getDomRef(), document.activeElement, '"collapse" button is focused');

		groupItems[2].onkeydown({
			target: groupItems[2]._getCollapseButton().getDomRef(),
			which: KeyCodes.ARROW_DOWN,
			stopPropagation: function () {
			},
			preventDefault: function () {
			}
		});
		assert.strictEqual(groupItems[2].getItems()[0].getDomRef(), document.activeElement, 'inner navigation item is focused');
	});
});
