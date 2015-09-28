(function() {
	'use strict';

	jQuery.sap.require('sap.ui.qunit.qunit-css');
	jQuery.sap.require('sap.ui.qunit.QUnitUtils');
	jQuery.sap.require('sap.ui.thirdparty.qunit');
	jQuery.sap.require('sap.ui.thirdparty.sinon');
	jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
	sinon.config.useFakeTimers = false;

	var classNameIcons = '.sapMNLI-Icons';
	var classNameUnread = '.sapMNLI-UnreadStatus';
	var classNameRead = '.sapMNLI-ReadStatus';
	var classNameHeader = '.sapMNLI-Header';
	var classNameText = '.sapMNLI-Text';
	var classNameDatetime = '.sapMNLI-Datetime';
	var classNameFooter = '.sapMNLI-Footer';
	var classNameCloseButton = '.sapMNLI-CloseButton';
	var RENDER_LOCATION = 'qunit-fixture';

	QUnit.module('API', {
		setup: function() {
			this.NotificationListItem = new sap.m.NotificationListItem();
			this.list = new sap.m.List({
				items: [
					this.NotificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.NotificationListItem.destroy();
		}
	});

	QUnit.test('Initialization', function(assert) {
		// arrange
		this.NotificationListItem.setDescription('Notification List Item Text');
		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.');
		this.NotificationListItem.setDatetime('3 hours');
		this.NotificationListItem.setUnread(true);
		this.NotificationListItem.setPriority(sap.ui.core.Priority.High);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(this.NotificationListItem, 'NotificationListItem should be rendered');

		assert.strictEqual(jQuery(classNameCloseButton).length, 1, 'Close Button should be rendered');
		assert.strictEqual(jQuery(classNameHeader).children('.sapMTitle').length, 1, 'Title should be rendered');
		assert.strictEqual(jQuery(classNameText).length, 1, 'Text should be rendered');
		assert.strictEqual(jQuery(classNameDatetime).length, 1, 'DateTime should be rendered');
		assert.strictEqual(jQuery(classNameUnread).length, 1, 'Unread status should be rendered');
		assert.strictEqual(jQuery(classNameIcons).children('').length, 2, 'Unread status and priority should be rendered');
	});

	QUnit.test('Default values', function(assert) {
		// assert
		assert.strictEqual(this.NotificationListItem.getPriority(), sap.ui.core.Priority.None, 'Priority should be set to "None"');
		assert.strictEqual(this.NotificationListItem.getTitle(), '', 'Title should be empty');
		assert.strictEqual(this.NotificationListItem.getDescription(), '', 'Description should be empty');
		assert.strictEqual(this.NotificationListItem.getShowButtons(), true, 'Notification List Item should be set to show buttons by default');
		assert.strictEqual(this.NotificationListItem.getShowCloseButton(), true, 'Notification List Item should be set to show the close by default');
	});

	QUnit.test('Setting datetime', function(assert) {
		// arrange
		var threeHoursConst = '3 hours';
		var fiveMinsConst = 'Five minutes';
		var halfHourConst = 'Half an hour';

		// act
		this.NotificationListItem.setDatetime(threeHoursConst);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameDatetime).text(), threeHoursConst, 'Datetime should be ' + threeHoursConst);

		// act
		this.NotificationListItem.setDatetime(fiveMinsConst);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameDatetime).text(), fiveMinsConst, 'Datetime should be ' + fiveMinsConst);

		// act
		this.NotificationListItem.setDatetime(halfHourConst);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameDatetime).text(), halfHourConst, 'Datetime should be ' + halfHourConst);
	});

	QUnit.module('Rendering', {
		setup: function() {
			this.NotificationListItem = new sap.m.NotificationListItem();
			this.list = new sap.m.List({
				items: [
					this.NotificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.NotificationListItem.destroy();
		}
	});

	QUnit.test('Render unread status', function(assert) {
		// act
		this.NotificationListItem.setUnread(true);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameUnread).length, 1, 'Unread status should be rendered');

		// act
		this.NotificationListItem.setUnread(false);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameRead).length, 1, 'Read status should be rendered');
	});

	QUnit.test('Render priority', function(assert) {
		// act
		this.NotificationListItem.setPriority(sap.ui.core.Priority.High);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameIcons).children('.sapUiIcon').length, 1, 'High priority should be rendered');

		// act
		this.NotificationListItem.setPriority(sap.ui.core.Priority.None);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameIcons).children('.sapUiIcon').length, 0, 'In priority in set to "None" nothing should be rendered');
	});

	QUnit.test('Render action buttons', function(assert) {
		// arrange
		var that = this;
		this.NotificationListItem.addAggregation('buttons',
			new sap.m.Button({
				text: 'Accept',
				tap: function () {
					new sap.m.MessageToast('Accept button pressed');
				}
			})
		);
		this.NotificationListItem.addAggregation('buttons',
			new sap.m.Button({
				text: 'Cancel',
				tap: function () {
					that.NotificationListItem.close();
				}
			})
		);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(jQuery(classNameFooter).children('button').length, 2, 'Buttons should be rendered');
	});

	QUnit.module('Events', {
		setup: function() {
			this.NotificationListItem = new sap.m.NotificationListItem();
			this.list = new sap.m.List({
				items: [
					this.NotificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		teardown: function() {
			this.NotificationListItem.destroy();
		}
	});

	QUnit.test('Closing the Notification from itself', function(assert) {
		// arrange
		var fnEventSpy = sinon.spy(this.NotificationListItem, 'fireClose');

		// act
		this.NotificationListItem.close();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'Firing the event should call the close function');
		assert.equal(document.getElementById(this.NotificationListItem.getId()), null, 'Notification List Item should be destroyed');
	});

	QUnit.test('Pressing the close button', function(assert) {
		// arrange
		var fnEventSpy = sinon.spy(this.NotificationListItem, 'fireClose');

		// act
		this.NotificationListItem._closeButton.firePress();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'Pressing the close button should fire the  close event');
	});

	QUnit.test('Pressing an action button to close the notification list item', function(assert) {
		// arrange
		var fnCloseSpy = sinon.spy(this.NotificationListItem, 'close');
		var fnFireCloseSpy = sinon.spy(this.NotificationListItem, 'fireClose');

		var that = this;
		this.NotificationListItem.addAggregation('buttons',
			new sap.m.Button('closeButton',{
				text: 'Cancel',
				tap: function () {
					that.NotificationListItem.close();
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

	QUnit.test('Active handling', function(assert) {
		// arrange
		var fnActiveSpy = sinon.spy(this.NotificationListItem, '_activeHandling');

		// act
		this.NotificationListItem.setActive(true);

		// assert
		assert.strictEqual(fnActiveSpy.callCount, 1, '_activeHandling() method should be called when toggle NotificationListItem.active property');
		assert.strictEqual(this.NotificationListItem.$().hasClass('sapMNLIActive'), true, 'Notification list item should have "sapMNLIActive" class');

		// act
		this.NotificationListItem.setActive(false);

		// assert
		assert.strictEqual(fnActiveSpy.callCount, 2, '_activeHandling() method should be called for the second time when toggle NotificationListItem.active property');
		assert.strictEqual(this.NotificationListItem.$().hasClass('sapMNLIActive'), false, 'Notification list item should have "sapMNLIActive" class');
	});
})();
