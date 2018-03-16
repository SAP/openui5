/*global QUnit,sinon*/

(function () {
	'use strict';

	jQuery.sap.require('sap.ui.qunit.qunit-css');
	jQuery.sap.require('sap.ui.qunit.QUnitUtils');
	jQuery.sap.require('sap.ui.thirdparty.qunit');
	jQuery.sap.require('sap.ui.thirdparty.sinon');
	jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
	sinon.config.useFakeTimers = false;

	if (!(sap.ui.Device.browser.internet_explorer && sap.ui.Device.browser.version <= 8)) {
		jQuery.sap.require('sap.ui.qunit.qunit-coverage');
	}

	var RENDER_LOCATION = 'qunit-fixture';

	//================================================================================
	// Notification List Base API
	//================================================================================

	QUnit.module('API', {
		beforeEach: function() {
			this.NotificationListBase = new sap.m.NotificationListBase();
		},
		afterEach: function() {
			this.NotificationListBase.destroy();
		}
	});

	QUnit.test('Default values', function(assert) {
		// assert
		assert.strictEqual(this.NotificationListBase.getUnread(), false, 'The notification should be unread.');
		assert.strictEqual(this.NotificationListBase.getPriority(), sap.ui.core.Priority.None, 'Priority should be set to none.');
		assert.strictEqual(this.NotificationListBase.getTitle(), '', 'Title should be empty');
		assert.strictEqual(this.NotificationListBase.getDatetime(), '', 'Datetime should be empty.');
		assert.strictEqual(this.NotificationListBase.getShowButtons(), true, 'The notification should show the footer buttons by default.');
		assert.strictEqual(this.NotificationListBase.getShowCloseButton(), true, 'The notification should show the close button by default.');
		assert.strictEqual(this.NotificationListBase.getAuthorName(), '', 'The notification should not have an authors name unless set.');

		assert.strictEqual((this.NotificationListBase.getAggregation('_overflowToolbar') instanceof sap.m.OverflowToolbar),
			true, 'The Notification toolbar should be initialized');
	});

	//================================================================================
	// Notification List Base setters and getters
	//================================================================================

	QUnit.module('Public setters and getters', {
		beforeEach: function() {
			this.NotificationListBase = new sap.m.NotificationListBase();
		},
		afterEach: function() {
			this.NotificationListBase.destroy();
		}
	});

	QUnit.test('Setting the notification\'s title', function(assert) {
		// arrange
		var title = 'Some title to be shown';
		var fnSpy = sinon.spy(this.NotificationListBase, '_getHeaderTitle');

		// act
		var result = this.NotificationListBase.setTitle(title);
		var headerTitle = this.NotificationListBase.getAggregation('_headerTitle');

		// assert
		assert.strictEqual(result, this.NotificationListBase, 'Setter should return a reference to the object.');
		assert.strictEqual(fnSpy.callCount, 1, 'The private method for setting the internal aggregation should be called.');
		assert.strictEqual(this.NotificationListBase.getTitle(), title, 'The title should be set correctly.');
		assert.strictEqual(headerTitle.getText(), title, 'The internal aggregation should be set correctly.');
	});

	QUnit.test('Setting the notification\'s datetime', function(assert) {
		// arrange
		var date = '2 minutes';
		var fnSpy = sinon.spy(this.NotificationListBase, '_getDateTimeText');

		// act
		var result = this.NotificationListBase.setDatetime(date);
		var dateTime = this.NotificationListBase.getAggregation('_dateTime');

		// assert
		assert.strictEqual(result, this.NotificationListBase, 'Setter should return a reference to the object.');
		assert.strictEqual(fnSpy.callCount, 1, 'The private method for setting the internal aggregation should be called.');
		assert.strictEqual(this.NotificationListBase.getDatetime(), date, 'The title should be set correctly.');
		assert.strictEqual(dateTime.getText(), date, 'The internal aggregation should be set correctly.');
	});

	QUnit.test('Setting the notification\'s author name', function(assert) {
		// arrange
		var name = 'John Doe';
		var fnSpy = sinon.spy(this.NotificationListBase, '_getAuthorName');

		// act
		var result = this.NotificationListBase.setAuthorName(name);
		var author = this.NotificationListBase.getAggregation('_authorName');

		// assert
		assert.strictEqual(result, this.NotificationListBase, 'Setter should return a reference to the object.');
		assert.strictEqual(fnSpy.callCount, 1, 'The private method for setting the internal aggregation should be called.');
		assert.strictEqual(this.NotificationListBase.getAuthorName(), name, 'The title should be set correctly.');
		assert.strictEqual(author.getText(), name, 'The internal aggregation should be set correctly.');
	});

	//================================================================================
	// Notification List Base overwritten methods
	//================================================================================

	QUnit.module('Overwritten methods', {
		beforeEach: function() {
			this.NotificationListBase = new sap.m.NotificationListBase();
		},
		afterEach: function() {
			this.NotificationListBase.destroy();
		}
	});

	QUnit.test('Cloning a notification', function(assert) {
		// arrange
		var firstButton = new sap.m.Button({text: 'First Button'});
		var secondButton = new sap.m.Button({text: 'Second Button'});
		var secondNotification;

		// act
		this.NotificationListBase.addAggregation('buttons', firstButton);
		this.NotificationListBase.addAggregation('buttons', secondButton);
		secondNotification = this.NotificationListBase.clone();

		// assert
		assert.strictEqual((secondNotification instanceof sap.m.NotificationListBase), true, 'The notification should be cloned.');
		assert.strictEqual(secondNotification.getAggregation('buttons').length, 2, 'The buttons should be cloned.');

		assert.strictEqual((secondNotification.getAggregation('_overflowToolbar') instanceof sap.m.OverflowToolbar),
			true, 'The overflow bar should be cloned.');

		// cleanup
		secondNotification = null;
	});

	QUnit.test('Closing a notification', function(assert) {
		// arrange
		var parent;
		var list = new sap.m.List();
		var notification = new sap.m.NotificationListItem();
		var fnSpy = sinon.spy(notification, 'fireClose');

		// act
		list.addItem(notification);
		list.placeAt(RENDER_LOCATION);

		parent = notification.getParent();
		notification.close();
		list.invalidate();

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnSpy.callCount, 1, 'firePress() should be called upon closing the notification.');
		assert.ok(parent.getFocusDomRef().contains(document.activeElement), 'Closing notification should set the focus to the parent container.');

		// cleanup
		list.destroy();
		notification.destroy();
	});

	//================================================================================
	// Notification List Base binding and aggregation handling
	//================================================================================

	QUnit.module('Handling aggregations', {
		beforeEach: function() {
			this.NotificationListBase = new sap.m.NotificationListBase();

			var data = {
				buttons: [
					{
						buttonText: 'Accept',
						buttonType: sap.m.ButtonType.Accept
					},
					{
						buttonText: 'Consider',
						buttonType: sap.m.ButtonType.Default
					},
					{
						buttonText: 'Reject',
						buttonType: sap.m.ButtonType.Reject
					}
				],
				title: [
					{
						text: 'text'
					}
				]
			};

			var model = new sap.ui.model.json.JSONModel();
			model.setData(data);

			sap.ui.getCore().setModel(model);

			this.buttonTemplate = new sap.m.Button({
				text : '{buttonText}',
				type : '{buttonType}'
			});
		},
		afterEach: function() {
			this.NotificationListBase.destroy();
		}
	});

	QUnit.test('Check bindAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'bindAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'bindAggregation');

		// act
		this.NotificationListBase.bindAggregation('buttons', { path : '/buttons', template : this.buttonTemplate});

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method bindAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method bindAggregation() of the notification toolbar should be called.');
	});

	QUnit.test('Checking validateAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'validateAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'validateAggregation');
		var button = new sap.m.Button({text: 'Button'});

		// act
		this.NotificationListBase.validateAggregation('buttons', button, true);

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method validateAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method validateAggregation() of the notification toolbar should be called.');
	});

	QUnit.test('Checking getAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'getAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'getAggregation');

		// act
		var buttons = this.NotificationListBase.getAggregation('buttons');

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 2, 'The method getAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method getAggregation() of the notification toolbar should be called.');
		assert.strictEqual(buttons instanceof Array, true, 'The method getAggregation() of the notification should return an array.');
	});

	QUnit.test('Checking indexOfAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'indexOfAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'indexOfAggregation');

		var button = new sap.m.Button();
		var secondButton = new sap.m.Button();

		this.NotificationListBase.addButton(button);
		this.NotificationListBase.addButton(secondButton);

		// act
		var buttonIndex = this.NotificationListBase.indexOfAggregation('buttons', button);

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method indexOfAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method indexOfAggregation() of the notification toolbar should be called.');
		assert.strictEqual(buttonIndex, 0, 'The method indexOfAggregation() should return the correct index for the first button.');
	});

	QUnit.test('Checking insertAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'insertAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'insertAggregation');

		var button = new sap.m.Button();
		var secondButton = new sap.m.Button();

		this.NotificationListBase.addButton(button);
		this.NotificationListBase.insertAggregation('buttons', secondButton, 0);

		// act
		var buttonIndex = this.NotificationListBase.indexOfAggregation('buttons', secondButton);

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method insertAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method insertAggregation() of the notification toolbar should be called.');
		assert.strictEqual(buttonIndex, 0, 'The second button should be at index 0.');
	});

	QUnit.test('Checking addAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'addAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'addAggregation');

		var button = new sap.m.Button();
		var secondButton = new sap.m.Button();

		// act
		this.NotificationListBase.addButton(button);

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method addAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method addAggregation() of the notification toolbar should be called.');

		// act
		this.NotificationListBase.addAggregation('buttons', secondButton);

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 2, 'The method addAggregation() of the notification should be called for the second time.');
		assert.strictEqual(toolbarMethodSpy.callCount, 2, 'The method addAggregation() of the notification toolbar should be called for the second time.');
	});

	QUnit.test('Checking removeAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'removeAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'removeAggregation');

		var button = new sap.m.Button();

		// act
		this.NotificationListBase.addAggregation('buttons', button);
		this.NotificationListBase.removeAggregation('buttons', button);

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method removeAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method removeAggregation() of the notification toolbar should be called.');
		assert.strictEqual(this.NotificationListBase.getButtons().length, 0, 'There shouldn\'t be any buttons in the notification.');
	});

	QUnit.test('Checking removeAllAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'removeAllAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'removeAllAggregation');

		var button = new sap.m.Button();
		var secondButton = new sap.m.Button();

		// act
		this.NotificationListBase.addAggregation('buttons', button);
		this.NotificationListBase.addAggregation('buttons', secondButton);
		this.NotificationListBase.removeAllAggregation('buttons');

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method removeAllAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method removeAllAggregation() of the notification toolbar should be called.');
		assert.strictEqual(this.NotificationListBase.getButtons().length, 0, 'There shouldn\'t be any buttons in the notification.');
	});

	QUnit.test('Checking destroyAggregation method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'destroyAggregation');
		var toolbarMethodSpy = sinon.spy(toolbar, 'destroyAggregation');

		var button = new sap.m.Button();
		var secondButton = new sap.m.Button();

		// act
		this.NotificationListBase.addAggregation('buttons', button);
		this.NotificationListBase.addAggregation('buttons', secondButton);
		this.NotificationListBase.destroyAggregation('buttons');

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method destroyAggregation() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method destroyAggregation() of the notification toolbar should be called.');
		assert.strictEqual(this.NotificationListBase.getButtons().length, 0, 'There shouldn\'t be any buttons in the notification.');
	});

	QUnit.test('Checking getBinding method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'getBinding');
		var toolbarMethodSpy = sinon.spy(toolbar, 'getBindingInfo');

		// act
		this.NotificationListBase.getBinding('buttons');

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method getBinding() of the notification should be called.');
		assert.strictEqual(toolbarMethodSpy.callCount, 1, 'The method getBindingInfo() of the notification toolbar should be called.');
	});

	QUnit.test('Check getBindingInfo method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'getBindingInfo');
		var toolbarMethodSpy = sinon.spy(toolbar, 'getBindingInfo');

		// act
		this.NotificationListBase.bindAggregation('buttons', { path : '/buttons', template : this.buttonTemplate});
		var bidingInfo = this.NotificationListBase.getBindingInfo('buttons');

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method getBindingInfo() of the notification should be called.');
		assert.ok(toolbarMethodSpy.callCount > 0, 'The method getBindingInfo() of the notification toolbar should be called.');
		assert.strictEqual(bidingInfo.template instanceof sap.m.Button, true, 'The template should be correct.');
		assert.strictEqual(bidingInfo.path, '/buttons', 'The method biding info should be correct.');
	});

	QUnit.test('Check getBindingPath method', function(assert) {
		// arrange
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');
		var notificationMethodSpy = sinon.spy(this.NotificationListBase, 'getBindingPath');
		var toolbarMethodSpy = sinon.spy(toolbar, 'getBindingInfo');

		// act
		this.NotificationListBase.bindAggregation('buttons', { path : '/buttons', template : this.buttonTemplate});
		var bindingPath = this.NotificationListBase.getBindingPath('buttons');

		// assert
		assert.strictEqual(notificationMethodSpy.callCount, 1, 'The method getBindingPath() of the notification should be called.');
		assert.ok(toolbarMethodSpy.callCount > 0, 'The method getBindingInfo() of the notification toolbar should be called.');
		assert.strictEqual(bindingPath, '/buttons', 'The method binding info should be correct.');
	});

	//================================================================================
	// Notification List Base private aggregation getters
	//================================================================================

	QUnit.module('Private getters for lazy loading', {
		beforeEach: function() {
			this.NotificationListBase = new sap.m.NotificationListBase();
		},
		afterEach: function() {
			this.NotificationListBase.destroy();
		}
	});

	QUnit.test('Setting the title', function(assert) {
		// arrange
		var functionSpy = sinon.spy(this.NotificationListBase, '_getHeaderTitle');
		var titleValue = 'Test title';

		// act
		this.NotificationListBase.setTitle(titleValue);
		var title = this.NotificationListBase.getAggregation('_headerTitle');

		// assert
		assert.strictEqual(functionSpy.callCount, 1, 'The private method _getHeaderTitle() should be called.');
		assert.strictEqual(title.getText(), titleValue, 'The title should be set correctly.');
	});

	QUnit.test('Setting the datetime', function(assert) {
		// arrange
		var functionSpy = sinon.spy(this.NotificationListBase, '_getDateTimeText');
		var dateTimeValue = '2 months';

		// act
		this.NotificationListBase.setDatetime(dateTimeValue);
		var dateTime = this.NotificationListBase.getAggregation('_dateTime');

		// assert
		assert.strictEqual(functionSpy.callCount, 1, 'The private method _getDateTimeText() should be called.');
		assert.strictEqual(dateTime.getText(), dateTimeValue, 'The title should be set correctly.');
	});

	QUnit.test('Setting the author name', function(assert) {
		// arrange
		var functionSpy = sinon.spy(this.NotificationListBase, '_getAuthorName');
		var authorNameValue = 'John Doe';

		// act
		this.NotificationListBase.setAuthorName(authorNameValue);
		var authorName = this.NotificationListBase.getAggregation('_authorName');

		// assert
		assert.strictEqual(functionSpy.callCount, 1, 'The private method _getAuthorName() should be called.');
		assert.strictEqual(authorName.getText(), authorNameValue, 'The author name should be set correctly.');
	});

	QUnit.test('Setting the author picture with an icon', function(assert) {
		// arrange
		var functionSpy = sinon.spy(this.NotificationListBase, '_getAuthorImage');
		var iconValue = 'sap-icon://group';

		// act
		this.NotificationListBase.setAuthorPicture(iconValue);
		this.NotificationListBase._getAuthorImage();
		var icon = this.NotificationListBase.getAggregation('_authorImage');

		// assert
		assert.strictEqual(functionSpy.callCount, 1, 'The private method _getAuthorImage() should be called.');
		assert.strictEqual(icon instanceof sap.ui.core.Icon, true, 'The author image should be initialized as an icon.');
		assert.strictEqual(icon.getSrc(), iconValue, 'The author image should be set correctly.');
	});

	QUnit.test('Setting the author picture with a wrong src for icon', function(assert) {
		// arrange
		var functionSpy = sinon.spy(this.NotificationListBase, '_getAuthorImage');

		// act
		this.NotificationListBase.setAuthorPicture('');
		this.NotificationListBase._getAuthorImage();
		var authorImage = this.NotificationListBase.getAggregation('_authorImage');

		// assert
		assert.strictEqual(functionSpy.callCount, 1, 'The private method _getAuthorImage() should be called.');
		assert.strictEqual(authorImage instanceof sap.m.Image, true, 'The author image should be initialized as an sap.m.Image.');
		assert.strictEqual(authorImage.getSrc(), '', 'The author image shouldn\'t have a src attribute.');
	});

	QUnit.test('Setting the author picture with an image', function(assert) {
		// arrange
		var functionSpy = sinon.spy(this.NotificationListBase, '_getAuthorImage');
		var imageValue = '../images/headerImg2.jpg';

		// act
		this.NotificationListBase.setAuthorPicture(imageValue);
		this.NotificationListBase._getAuthorImage();
		var image = this.NotificationListBase.getAggregation('_authorImage');

		// assert
		assert.strictEqual(functionSpy.callCount, 1, 'The private method _getAuthorImage() should be called.');
		assert.strictEqual(image instanceof sap.m.Image, true, 'The author image should be initialized as an image.');
		assert.strictEqual(image.getSrc(), imageValue, 'The author image should be set correctly.');
	});

	QUnit.test('Reiniting overflow toolbar to check if lazy loading works ', function(assert) {
		// act
		this.NotificationListBase.setAggregation('_overflowToolbar', null);

		//assert
		assert.strictEqual(this.NotificationListBase.getAggregation('_overflowToolbar'), null, 'Toolbar should be null.');

		//act
		this.NotificationListBase._getToolbar();
		var toolbar = this.NotificationListBase.getAggregation('_overflowToolbar');

		// assert
		assert.strictEqual(toolbar instanceof sap.m.OverflowToolbar, true, 'Toolbar should be reinited.');
	});

})();