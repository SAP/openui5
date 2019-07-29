/*global QUnit,sinon*/

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/NotificationListGroup",
	"sap/m/NotificationListItem",
	"sap/m/Button",
	"sap/m/library",
	"sap/ui/core/library",
	"sap/m/MessageToast",
	"sap/ui/Device",
	"jquery.sap.keycodes",
	"jquery.sap.global"
], function(
	qutils,
	NotificationListGroup,
	NotificationListItem,
	Button,
	mobileLibrary,
	coreLibrary,
	MessageToast,
	Device,
	jQuery
) {
	'use strict';


	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;



	var classNameHeader = '.sapMNLG-Header';
	var classNameDatetime = '.sapMNLI-Datetime';
	var classNameFooterToolbar = '.sapMTB';

	var RENDER_LOCATION = 'qunit-fixture';

	//================================================================================
	// Notification List Group API
	//================================================================================

	QUnit.module('API', {
		beforeEach: function() {
			this.NotificationListGroup = new NotificationListGroup();

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Initialization', function(assert) {
		// arrange
		this.NotificationListGroup.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.');
		this.NotificationListGroup.setDatetime('3 hours');
		for (var index = 0; index < 5; index++) {
			this.NotificationListGroup.addAggregation('items', new NotificationListItem({title: index}));
		}

		this.NotificationListGroup.addAggregation('buttons', new Button({text : 'Accept', type: ButtonType.Accept}));
		this.NotificationListGroup.addAggregation('buttons', new Button({text : 'Reject', type: ButtonType.Reject}));

		this.NotificationListGroup.getItems()[0].setPriority(Priority.High);
		this.NotificationListGroup.getItems()[0].setUnread(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(this.NotificationListGroup, 'NotificationListItem should be rendered');

		assert.strictEqual(this.NotificationListGroup.getDomRef('closeButton').hidden, false, 'Group Close Button should be rendered');
		assert.strictEqual(this.NotificationListGroup.getDomRef('title').hidden, false, 'Title should be rendered');

		assert.strictEqual(this.NotificationListGroup.getDomRef('datetime').innerHTML, '3 hours', 'DateTime should be rendered');

		sap.ui.getCore().applyChanges();

	});

	QUnit.test('Default values', function(assert) {
		// arrange
		var notification = new NotificationListItem({
			priority: Priority.Medium,
			unread: true
		});

		this.NotificationListGroup.addItem(notification);

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.NotificationListGroup.getTitle(), '', 'Title should be empty');
		assert.strictEqual(this.NotificationListGroup.getDatetime(), '', 'The datetime property should be empty.');
		assert.strictEqual(this.NotificationListGroup.getShowButtons(), true, 'Notification group should be set to show buttons by default');
		assert.strictEqual(this.NotificationListGroup.getShowCloseButton(), true, 'Notification List Item should be set to show the close by default');
		assert.strictEqual(this.NotificationListGroup.getAutoPriority(), true, 'The auto calculations should be turned on by default.');
		assert.strictEqual(this.NotificationListGroup.getCollapsed(), false, 'The notification group should be expanded by default.');
		assert.strictEqual(this.NotificationListGroup.getPriority(), Priority.Medium, 'The group should have high priority.');
		assert.strictEqual(this.NotificationListGroup.getUnread(), true, 'The group should be unread.');
		assert.strictEqual(this.NotificationListGroup.getShowEmptyGroup(), false, 'Empty groups should not be shown.');

		// act
		this.NotificationListGroup.setAutoPriority(false);
		this.NotificationListGroup.setPriority(Priority.None);

		// assert
		assert.strictEqual(this.NotificationListGroup.getPriority(), Priority.None, 'The group should have high priority.');
	});

	QUnit.test('Setting datetime', function(assert) {
		// arrange
		var threeHoursConst = '3 hours';
		var fiveMinsConst = 'Five minutes';
		this.NotificationListGroup.addItem(
				new NotificationListItem({
					title: 'Single Item Notification',
					description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
					unread: true,
					visible: true,
					showCloseButton: false,
					priority: Priority.Medium,
					buttons: [
						new Button({
							text: 'Accept',
							type: ButtonType.Accept,
							tap: function () {
								MessageToast.show('Accept button pressed');
							}
						}),
						new Button({
							text: 'Cancel',
							type: ButtonType.Reject,
							tap: function () {
								MessageToast.show('Cancel button pressed');
							}
						})
					]
				})
		);

		// act
		this.NotificationListGroup.setDatetime(threeHoursConst);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameDatetime).text(), threeHoursConst, 'Datetime should be ' + threeHoursConst);

		// act
		this.NotificationListGroup.setDatetime(fiveMinsConst);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameDatetime).text(), fiveMinsConst, 'Datetime should be ' + fiveMinsConst);
	});

	QUnit.test('Setting title', function(assert) {
		// arrange
		var title = 'Notification list item title';
		// act
		this.NotificationListGroup.setTitle(title);

		// assert
		assert.strictEqual(this.NotificationListGroup.getTitle(), title, 'The title should be set to ' + title);
		assert.strictEqual(this.NotificationListGroup._getHeaderTitle().getText(), title, 'The description in the title aggregation should be set to ' + title);

		// arrange
		var newTitle = 'New Notification list item title';
		// act
		this.NotificationListGroup.setTitle(newTitle);

		// assert
		assert.strictEqual(this.NotificationListGroup.getTitle(), newTitle, 'The title should be set to ' + newTitle);
		assert.strictEqual(this.NotificationListGroup._getHeaderTitle().getText(), newTitle, 'The title should be set to ' + newTitle);
	});

	QUnit.test('Cloning a NotificationListGroup', function(assert) {
		// arrange
		var firstButton = new Button({text: 'First Button'});
		var secondButton = new Button({text: 'Second Button'});
		var secondGroup;

		// act
		this.NotificationListGroup.addAggregation('buttons', firstButton);
		this.NotificationListGroup.addAggregation('buttons', secondButton);

		secondGroup = this.NotificationListGroup.clone();

		// assert
		assert.ok(
			secondGroup.getAggregation('_overflowToolbar'),
			'The cloned notification shoould have the hidden aggregations as well');
	});

	QUnit.test('Pressing the collapse button should expand a collapsed group', function(assert) {
		// arrange
		this.NotificationListGroup.setCollapsed(true);
		var firstNotification = new NotificationListItem({title: 'First Notification'});
		var secondNotification = new NotificationListItem({title: 'Second Notification'});
		var fnEventSpy = sinon.spy(this.NotificationListGroup, 'setCollapsed');
		var fnCollapseEventSpy = sinon.spy(this.NotificationListGroup, 'fireOnCollapse');

		this.NotificationListGroup.addItem(firstNotification);
		this.NotificationListGroup.addItem(secondNotification);
		sap.ui.getCore().applyChanges();

		// act
		this.NotificationListGroup.getAggregation('_collapseButton').firePress();
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'Pressing the button should trigger collapse/expand of the group.');
		assert.strictEqual(this.NotificationListGroup.getCollapsed(), false, 'Pressing the button should expand the collapsed group.');
		assert.strictEqual(fnCollapseEventSpy.callCount, 1, 'onCollapse should be called');
	});

	QUnit.test('Priority must be set to the highest if there are more than two notifications', function(assert) {
		// arrange
		this.NotificationListGroup.setAutoPriority(true);

		// act
		var firstNotification = new NotificationListItem({priority: Priority.None});
		var secondNotification = new NotificationListItem({priority: Priority.Medium});
		var thirdNotification = new NotificationListItem({priority: Priority.Low});

		this.NotificationListGroup.addItem(firstNotification);
		this.NotificationListGroup.addItem(secondNotification);
		this.NotificationListGroup.addItem(thirdNotification);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.NotificationListGroup.getPriority(), Priority.Medium, 'The priority should be set to "Medium".');
	});

	QUnit.test('Priority must be set accordingly', function(assert) {
		// arrange
		this.NotificationListGroup.setAutoPriority(true);

		// act
		var firstNotification = new NotificationListItem({priority: Priority.None});
		var secondNotification = new NotificationListItem({priority: Priority.Low});

		this.NotificationListGroup.addItem(firstNotification);
		this.NotificationListGroup.addItem(secondNotification);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.NotificationListGroup.getPriority(), Priority.Low, 'The priority should be set to "Low".');

		// act
		firstNotification.setPriority(Priority.Low);
		secondNotification.setPriority(Priority.Medium);

		// assert
		assert.strictEqual(this.NotificationListGroup.getPriority(), Priority.Medium, 'The priority should be set to "Medium".');

		// act
		firstNotification.setPriority(Priority.Medium);
		secondNotification.setPriority(Priority.High);

		// assert
		assert.strictEqual(this.NotificationListGroup.getPriority(), Priority.High, 'The priority should be set to "High".');

		// act
		firstNotification.setPriority(Priority.None);
		secondNotification.setPriority(Priority.None);

		// assert
		assert.strictEqual(this.NotificationListGroup.getPriority(), Priority.None, 'The priority should be set to "None".');
	});

	QUnit.test('Expand button in group without notifications', function(assert) {
		// arrange
		var expandCollapseButton = this.NotificationListGroup.getAggregation('_collapseButton');

		// assert
		assert.strictEqual(expandCollapseButton.getEnabled(), false, 'Should be disabled');

		// act
		this.NotificationListGroup.setEnableCollapseButtonWhenEmpty(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(expandCollapseButton.getEnabled(), true, 'Should be enabled when "enableCollapseButtonWhenEmpty" is set to "true"');
	});

	QUnit.test('Reach max number of notifications', function(assert) {
		//arrange
		var maxNumberOfNotifications = (Device.system.desktop ? 400 : 100) + 1;
		var expectedNumberOfNotifications = maxNumberOfNotifications - 1;

		//act
		for (var index = 0; index < maxNumberOfNotifications; index++) {
			this.NotificationListGroup.addItem(new NotificationListItem());
		}

		//Should trigger rerender to update the _maxNumberReached property in onAfterRendering method.
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.NotificationListGroup._maxNumberOfNotifications, expectedNumberOfNotifications, 'Max number of notifications should be displayed.');
		assert.strictEqual(this.NotificationListGroup._maxNumberReached,  true, 'Max number of shown notifications should be reached.');
	});

	QUnit.test('Remove notification after reaching max number of notifications', function(assert) {
		//arrange
		var maxNumberOfNotifications = (Device.system.desktop ? 400 : 100);
		var lastNotification = new NotificationListItem();

		//act
		for (var index = 0; index < maxNumberOfNotifications; index++) {
			this.NotificationListGroup.addItem(new NotificationListItem());
		}

		this.NotificationListGroup.addItem(lastNotification);
		this.NotificationListGroup.removeItem(lastNotification);

		//assert
		assert.strictEqual(this.NotificationListGroup._maxNumberReached,  false, 'Max number of shown notifications should not be reached.');
	});

	//================================================================================
	// Notification List Group rendering methods
	//================================================================================

	QUnit.module('Rendering', {
		beforeEach: function() {
			this.NotificationListGroup = new NotificationListGroup();

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Max number of notifications message displayed', function(assert) {
		//arrange
		var maxNumberOfNotifications = (Device.system.desktop ? 400 : 100) + 1;

		//act
		for (var index = 0; index < maxNumberOfNotifications; index++) {
			this.NotificationListGroup.addItem(new NotificationListItem());
		}

		//Should trigger rerender on the NotificationListGroup to display the Max Number of Notifications reached message.
		sap.ui.getCore().applyChanges();

		//assert
		assert.strictEqual(this.NotificationListGroup.$().find('.sapMNLG-MaxNotifications').length, 1, 'Max number of notifications message should be displayed.');
	});

	QUnit.test('Max number of notifications message not displayed', function(assert) {
		//arrange
		var maxNumberOfNotifications = Device.system.desktop ? 400 : 100;
		var lastNotification = new NotificationListItem();

		//act
		for (var index = 0; index < maxNumberOfNotifications; index++) {
			this.NotificationListGroup.addItem(new NotificationListItem());
		}

		this.NotificationListGroup.addItem(lastNotification);
		this.NotificationListGroup.removeItem(lastNotification);

		//assert
		assert.strictEqual(this.NotificationListGroup.$().find('.sapMNLG-MaxNotifications').length, 0, 'Max number of notifications message should not be displayed.');
	});


	QUnit.test('Control has basic class for the keyboard navigation', function(assert) {
		// assert
		assert.strictEqual(this.NotificationListGroup.$().hasClass('sapMLIB'), true, 'The notification list has has the base class of ListItemBase');
	});

	QUnit.test('Render action buttons', function(assert) {
		// arrange
		var that = this;
		var buttonsInFooter = 2;
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);

		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		sap.ui.getCore().applyChanges();


		// assert
		assert.strictEqual(jQuery(classNameFooterToolbar).children('button').length, buttonsInFooter, 'Buttons should be rendered');
	});

	QUnit.test('Changing the title', function(assert) {
		// arrange
		var title = 'Notification list group title';
		var fnSpy = sinon.spy(this.NotificationListGroup, 'invalidate');

		// act
		this.NotificationListGroup.setTitle(title);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(fnSpy.calledOn, 'Changing the title should invalidate the control');
	});

	QUnit.test('Changing the datetime', function(assert) {
		// arrange
		var datetime = '2 hours';
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);

		// act
		this.NotificationListGroup.setDatetime(datetime);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameDatetime).text(), datetime, 'The datetime in the title aggregation should be set to ' + datetime);
	});

	QUnit.test('Collapsing and expanding the group', function(assert) {
		// arrange
		var groupBody;
		var firstNotification = new NotificationListItem({title: 'First Notification'});
		var secondNotification = new NotificationListItem({title: 'Second Notification'});

		this.NotificationListGroup.addItem(firstNotification);
		this.NotificationListGroup.addItem(secondNotification);

		// act
		this.NotificationListGroup.setCollapsed(true);
		sap.ui.getCore().applyChanges();
		groupBody = this.NotificationListGroup.getDomRef().querySelector('.sapMNLG-Body');

		// assert
		assert.strictEqual(groupBody.offsetHeight, 0, 'When collapsed the body must be hidden.');

		// act
		this.NotificationListGroup.setCollapsed(false);
		sap.ui.getCore().applyChanges();
		groupBody = this.NotificationListGroup.getDomRef().querySelector('.sapMNLG-Body');

		// assert
		assert.notEqual(groupBody.offsetHeight, 0, 'When expanded the body must be shown.');
	});

	//================================================================================
	// Notification List Group events
	//================================================================================

	QUnit.module('Events', {
		beforeEach: function() {
			this.NotificationListGroup = new NotificationListGroup();

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Closing the Notification Group from itself', function(assert) {
		// arrange
		var fnEventSpy = sinon.spy(this.NotificationListGroup, 'fireClose');

		// act
		this.NotificationListGroup.close();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'Firing the event should call the close function');
	});

	QUnit.test('Pressing the close button', function(assert) {
		// arrange
		var fnEventSpy = sinon.spy(this.NotificationListGroup, 'fireClose');

		// act
		this.NotificationListGroup.getAggregation('_closeButton').firePress();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'Pressing the close button should fire the  close event');
	});

	QUnit.test('Pressing an action button to close the notification list group', function(assert) {
		// arrange
		var fnCloseSpy = sinon.spy(this.NotificationListGroup, 'close');
		var fnFireCloseSpy = sinon.spy(this.NotificationListGroup, 'fireClose');

		var that = this;
		this.NotificationListGroup.addAggregation('buttons',
			new Button('closeButton',{
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		sap.ui.getCore().applyChanges();

		// act
		sap.ui.getCore().byId('closeButton').fireTap();

		// assert
		assert.strictEqual(fnCloseSpy.callCount, 1, 'close() should be triggered');
		assert.strictEqual(fnFireCloseSpy.callCount, 1, 'fireClose() should be triggered');
	});

	//================================================================================
	// Notification List Group new features
	//================================================================================

	QUnit.module('Group with 0 items', {
		beforeEach: function() {
			this.NotificationListGroup = new NotificationListGroup();

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Footer is not rendered', function(assert) {
		// arrange
		var that = this;
		var buttonsInFooter = 0;

		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		sap.ui.getCore().applyChanges();


		// assert
		assert.strictEqual(jQuery(classNameFooterToolbar).children('button').length, buttonsInFooter, 'Buttons should not be rendered as there are no any items');
	});

	QUnit.test('Header is not rendered', function(assert) {
		// arrange
		var title = 'Notification list group title';

		// act
		this.NotificationListGroup.setTitle(title);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameHeader).length, 0, 'Title (header) is not rendered as items are 0');
	});

	QUnit.test('showEmptyGroup property test', function(assert) {
		// arrange
		var title = 'Notification list group title';


		// act
		this.NotificationListGroup.setTitle(title);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					this.NotificationListGroup.close();
				}.bind(this)
			})
		);
		this.NotificationListGroup.setShowEmptyGroup(true);

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameHeader).length, 1, 'Title (header) is rendered as the property value is true');
		assert.strictEqual(jQuery(classNameFooterToolbar).children('button').length, 2, 'Footer (buttons) is rendered as the property value is true');
	});

	QUnit.module('Test Visible property', {
		beforeEach: function() {
			this.NotificationListGroup = new NotificationListGroup();

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Add invisible item - the same like 0 items', function(assert) {
		// arrange
		var that = this;
		var buttonsInFooter = 0;

		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: false,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);
		sap.ui.getCore().applyChanges();


		// assert
		assert.strictEqual(jQuery(classNameFooterToolbar).children('button').length, buttonsInFooter, 'Buttons should not be rendered as there is only 1 hidden item');
	});

	QUnit.test('Test Group visible property', function(assert) {
		// arrange
		var that = this;

		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);
		// despite of the number of visible items, group is hidden when its property is false
		this.NotificationListGroup.setVisible(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery("sapUiHiddenPlaceholder").length, 0, 'Group is hidden');
	});

	QUnit.test('Test Item visible property', function(assert) {
		// arrange
		var that = this;

		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: false,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery("sapUiHiddenPlaceholder").length, 0, 'Item is hidden');
	});

	QUnit.module('Test buttons enabled state when just 1 item is in the group', {
		beforeEach: function() {
			this.NotificationListGroup = new NotificationListGroup();

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Add 1 visible item - buttons are enabled always', function(assert) {
		// arrange
		var that = this;

		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);
		sap.ui.getCore().applyChanges();


		// assert
		assert.strictEqual(this.NotificationListGroup.getButtons()[0].getEnabled(), true, 'Buttons are enabled always');
	});

	QUnit.test('Add 2+ visible items - buttons are enabled', function(assert) {
		// arrange
		var that = this;

		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListGroup.addAggregation('buttons',
			new Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListGroup.close();
				}
			})
		);
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);
		this.NotificationListGroup.addItem(
			new NotificationListItem({
				title: 'Single Item Notification2',
				description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
				unread: true,
				visible: true,
				showCloseButton: false,
				priority: Priority.Medium
			})
		);
		sap.ui.getCore().applyChanges();


		// assert
		assert.strictEqual(this.NotificationListGroup.getButtons()[0].getEnabled(), true, 'Buttons are enabled');
	});

	//================================================================================
	// Notification List Group ARIA support
	//================================================================================

	QUnit.module('ARIA support', {
		beforeEach: function () {
			this.NotificationListGroup = new NotificationListGroup();

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Checking the labelledby ids are set correctly', function (assert) {
		// arrange
		var domRef = this.NotificationListGroup.getDomRef();
		var labelledby = domRef.getAttribute('aria-labelledby');
		var labelledByIds = this.NotificationListGroup._getHeaderTitle().getId() + ' ' +
			this.NotificationListGroup.getAggregation('_ariaDetailsText').getId();

		// assert
		assert.strictEqual(labelledby, labelledByIds, 'The labbeledby attribute should point to the title and the detailed invisible text, describing the control');
	});

	QUnit.test('Checking the labelledby info text is set correctly', function (assert) {
		// arrange
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var createdByText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_CREATED_BY') + ' ' + 'John Doe';
		var infoText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY', ['5 minutes', Priority.Medium]);
		var unreadText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_UNREAD');
		var ariaText = createdByText + ' ' + infoText + ' ' + unreadText;

		// act
		this.NotificationListGroup.setTitle('Some title');
		this.NotificationListGroup.setAutoPriority(false);
		this.NotificationListGroup.setPriority(Priority.Medium);
		this.NotificationListGroup.setDatetime('5 minutes');
		this.NotificationListGroup.setAuthorName('John Doe');
		this.NotificationListGroup.setUnread(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.NotificationListGroup.getAggregation('_ariaDetailsText').getText(), ariaText,
			'The info text should be set correctly with unread status, author, due date and priority');
	});

	QUnit.test('Checking the labelledby info text is set correctly without author name', function (assert) {
		// arrange
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var infoText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY', ['5 minutes', Priority.Medium]);
		var unreadText = resourceBundle.getText('NOTIFICATION_LIST_GROUP_UNREAD');
		var ariaText = infoText + ' ' + unreadText;

		// act
		this.NotificationListGroup.setTitle('Some title');
		this.NotificationListGroup.setAutoPriority(false);
		this.NotificationListGroup.setPriority(Priority.Medium);
		this.NotificationListGroup.setDatetime('5 minutes');
		this.NotificationListGroup.setUnread(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.NotificationListGroup.getAggregation('_ariaDetailsText').getText(), ariaText,
			'The info text should be set correctly with unread status, due date and priority');
	});

	QUnit.test('Focusing a notification inside the notification group', function (assert) {
		// arrange
		var firstNotification = new NotificationListItem();
		var secondNotification = new NotificationListItem();
		var thirdNotification = new NotificationListItem();

		this.NotificationListGroup.addItem(firstNotification);
		this.NotificationListGroup.addItem(secondNotification);
		this.NotificationListGroup.addItem(thirdNotification);

		// act
		sap.ui.getCore().applyChanges();
		this.NotificationListGroup._notificationFocusHandler({srcControl: secondNotification});

		var ariaPosinset = secondNotification.getDomRef().getAttribute('aria-posinset') * 1;
		var ariaSetsize = secondNotification.getDomRef().getAttribute('aria-setsize') * 1;

		// assert
		assert.strictEqual(ariaPosinset, 2, 'Should update aria-posinset to its index in the group');
		assert.strictEqual(ariaSetsize, 3, 'Should update aria-setsize to the group\'s lenght');

		// act
		this.NotificationListGroup._notificationFocusHandler({srcControl: firstNotification});

		ariaPosinset = firstNotification.getDomRef().getAttribute('aria-posinset') * 1;
		ariaSetsize = firstNotification.getDomRef().getAttribute('aria-setsize') * 1;

		// assert
		assert.strictEqual(ariaPosinset, 1, 'Should update aria-posinset to the newly focused notifications in the group');
		assert.strictEqual(ariaSetsize, 3, 'Should update aria-setsize to the group\'s lenght');
	});

	QUnit.test('Focusing a notification inside the notification group with hidden items', function (assert) {
		// arrange
		var firstNotification = new NotificationListItem();
		var secondNotification = new NotificationListItem({visible: false});
		var thirdNotification = new NotificationListItem();

		this.NotificationListGroup.addItem(firstNotification);
		this.NotificationListGroup.addItem(secondNotification);
		this.NotificationListGroup.addItem(thirdNotification);

		// act
		sap.ui.getCore().applyChanges();
		this.NotificationListGroup._notificationFocusHandler({srcControl: firstNotification});

		var ariaPosinset = firstNotification.getDomRef().getAttribute('aria-posinset');
		var ariaSetsize = firstNotification.getDomRef().getAttribute('aria-setsize');

		// assert
		assert.strictEqual(ariaPosinset, "1", 'Should update aria-posinset to its index in the group');
		assert.strictEqual(ariaSetsize, "2", 'Should update aria-setsize to the group\'s count of visible items only');

		// act
		this.NotificationListGroup._notificationFocusHandler({srcControl: thirdNotification});

		ariaPosinset = thirdNotification.getDomRef().getAttribute('aria-posinset');
		ariaSetsize = thirdNotification.getDomRef().getAttribute('aria-setsize');

		// assert
		assert.strictEqual(ariaPosinset, "2", 'Should update aria-posinset to the newly focused notifications in the group');
		assert.strictEqual(ariaSetsize, "2", 'Should update aria-setsize to the group\'s count of visible items only');
	});

	QUnit.test("Checking the aria-hidden of the list group", function (assert) {
		// arrange
		this.NotificationListGroup.addItem(new NotificationListItem());
		sap.ui.getCore().applyChanges();
		var vAriaHidden = this.NotificationListGroup.$().find("ul.sapMNLG-Body").attr("aria-hidden");

		// assert
		assert.notOk(vAriaHidden, "The body should NOT have 'aria-hidden' set to 'true'");
	});

	QUnit.test("Checking the role of the list group", function (assert) {
		// assert
		assert.strictEqual(this.NotificationListGroup.$().attr("role"), "option", "The role of the NotificationListGroup should be set to 'option'.");
	});

	//================================================================================
	// Notification List Group ARIA support
	//================================================================================

	QUnit.module('Keyboard handling', {
		beforeEach: function () {
			this.NotificationListGroup = new NotificationListGroup({
				items: [
					new NotificationListItem(),
					new NotificationListItem(),
					new NotificationListItem()
				]
			});

			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Pressing the down key, when first item is accessed', function (assert) {
		// arrange
		var firstNotification = this.NotificationListGroup.getItems()[0];
		var secondNotification = this.NotificationListGroup.getItems()[1];

		// act
		firstNotification.$().focus();
		sap.ui.test.qunit.triggerKeydown(firstNotification.$(), jQuery.sap.KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(document.activeElement.id, secondNotification.getId(), 'Should focus the second item');
	});


	QUnit.test('Pressing the up key, when first item is accessed', function (assert) {
		// arrange
		var firstNotification = this.NotificationListGroup.getItems()[0];

		// act
		firstNotification.$().focus();
		sap.ui.test.qunit.triggerKeydown(firstNotification.$(), jQuery.sap.KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(document.activeElement.id, firstNotification.getId(), 'Should not move the focus');
	});

	QUnit.test('Pressing the up key, when last item is accessed', function (assert) {
		// arrange
		var thirdNotification = this.NotificationListGroup.getItems()[2];
		var secondNotification = this.NotificationListGroup.getItems()[1];

		// act
		thirdNotification.$().focus();
		sap.ui.test.qunit.triggerKeydown(thirdNotification.$(), jQuery.sap.KeyCodes.ARROW_UP);

		// assert
		assert.strictEqual(document.activeElement.id, secondNotification.getId(), 'Should focus the second item');
	});

	QUnit.test('Pressing the down key, when last item is accessed', function (assert) {
		// arrange
		var thirdNotification = this.NotificationListGroup.getItems()[2];

		// act
		thirdNotification.$().focus();
		sap.ui.test.qunit.triggerKeydown(thirdNotification.$(), jQuery.sap.KeyCodes.ARROW_DOWN);

		// assert
		assert.strictEqual(document.activeElement.id, thirdNotification.getId(), 'Should not move the focus');
	});


	QUnit.test('Pressing the left key, when last item is accessed', function (assert) {
		// arrange
		var thirdNotification = this.NotificationListGroup.getItems()[2];

		// act
		thirdNotification.$().focus();
		sap.ui.test.qunit.triggerKeydown(thirdNotification.$(), jQuery.sap.KeyCodes.ARROW_LEFT);

		// assert
		assert.strictEqual(document.activeElement.id, thirdNotification.getId(), 'Should not move the focus');
	});

	QUnit.module('Setter', {
		beforeEach: function () {

			var oListItem = new sap.m.NotificationListItem({
				title:"test"
			});

			this.NotificationListGroup = new NotificationListGroup({
				title: "Test",
				items: [
					oListItem
				]
			});


			this.NotificationListGroup.setAuthorPicture("sap-icon://add");
			this.NotificationListGroup.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.NotificationListGroup.destroy();
		}
	});

	QUnit.test('Author picture', function (assert) {

		// act
		this.NotificationListGroup.setAuthorPicture("sap-icon://email");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.NotificationListGroup._getAuthorImage().getSrc(), this.NotificationListGroup.getAuthorPicture(), 'Picture should be updated');
	});
});
