(function() {
	'use strict';

	jQuery.sap.require('sap.ui.qunit.qunit-css');
	jQuery.sap.require('sap.ui.qunit.QUnitUtils');
	jQuery.sap.require('sap.ui.thirdparty.qunit');
	jQuery.sap.require('sap.ui.thirdparty.sinon');
	jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
	sinon.config.useFakeTimers = false;

	var classNameUnread = '.sapMNLI-Unread';
	var classNameHeader = '.sapMNLI-Header';
	var classNameDetails = '.sapMNLI-Details';
	var classNameAuthorPicture = '.sapMNLI-AuthorPicture';
	var classNameText = '.sapMNLI-Text';
	var classNameDatetime = '.sapMNLI-Datetime';
	var classNameFooter = '.sapMNLI-Footer';
	var classNameCloseButton = '.sapMNLI-CloseButton';
	var RENDER_LOCATION = 'qunit-fixture';

	//================================================================================
	// Notification List Item API
	//================================================================================
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
		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.', true);
		this.NotificationListItem.setDatetime('3 hours');
		this.NotificationListItem.setUnread(true);
		this.NotificationListItem.setPriority(sap.ui.core.Priority.High);
		sap.ui.getCore().applyChanges();

		// assert
		assert.ok(this.NotificationListItem, 'NotificationListItem should be rendered');

		assert.strictEqual(jQuery(classNameCloseButton).length, 1, 'Close Button should be rendered');
		assert.strictEqual(jQuery(classNameHeader).children('.sapMText').length, 1, 'Title should be rendered');
		assert.strictEqual(jQuery(classNameText).length, 2, 'Text and author placeholders should be rendered');
		assert.strictEqual(jQuery(classNameDatetime).length, 1, 'DateTime should be rendered');
		assert.strictEqual(jQuery(classNameUnread).length, 1, 'Unread status should be rendered');
	});

	QUnit.test('Default values', function(assert) {
		// assert
		assert.strictEqual(this.NotificationListItem.getPriority(), sap.ui.core.Priority.None, 'Priority should be set to "None"');
		assert.strictEqual(this.NotificationListItem.getTitle(), '', 'Title should be empty');
		assert.strictEqual(this.NotificationListItem.getDescription(), '', 'Description should be empty');
		assert.strictEqual(this.NotificationListItem.getShowButtons(), true, 'Notification List Item should be set to show buttons by default');
		assert.strictEqual(this.NotificationListItem.getShowCloseButton(), true, 'Notification List Item should be set to show the close by default');
		assert.strictEqual(this.NotificationListItem.getAuthorName(), '', 'Notification List Item shouldn\'t have an author set by default.');
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

	QUnit.test('Setting title', function(assert) {
	    // arrange
		var title = 'Notification list item title';
		var newTitle = 'New Notification list item title';

	    // act
		this.NotificationListItem.setTitle(title);

	    // assert
	    assert.strictEqual(this.NotificationListItem.getTitle(), title, 'The title should be set to ' + title);
		assert.strictEqual(this.NotificationListItem._getHeaderTitle().getText(), title, 'The description in the title aggregation should be set to ' + title);

		// act
		this.NotificationListItem.setTitle(newTitle);

		// assert
		assert.strictEqual(this.NotificationListItem.getTitle(), newTitle, 'The title should be set to ' + newTitle);
		assert.strictEqual(this.NotificationListItem._getHeaderTitle().getText(), newTitle, 'The title should be set to ' + newTitle);
	});

	QUnit.test('Setting description', function(assert) {
		// arrange
		var description = 'Notification list item description';
		var newDescription = 'New Notification list item description';

		// act
		this.NotificationListItem.setDescription(description);

		// assert
		assert.strictEqual(this.NotificationListItem.getDescription(), description, 'The description should be set to ' + description);

		// act
		this.NotificationListItem.setDescription(newDescription);

		// assert
		assert.strictEqual(this.NotificationListItem.getDescription(), newDescription, 'The title should be set to ' + description);
	});

	QUnit.test('Setting datetime', function(assert) {
		// arrange
		var dateTime = 'Two hours';
		var newDateTime = '15 minutes';
		var fnEventSpy = sinon.spy(this.NotificationListItem, '_updateAriaAdditionalInfo');

		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var readUnreadText = this.NotificationListItem.getUnread() ?
			resourceBundle.getText('NOTIFICATION_LIST_ITEM_UNREAD') : resourceBundle.getText('NOTIFICATION_LIST_ITEM_READ');
		var dueAndPriorityString = readUnreadText + ' ' + resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
			[dateTime, this.NotificationListItem.getPriority()]);

		// act
		this.NotificationListItem.setDatetime(dateTime);

		// assert
		assert.strictEqual(this.NotificationListItem.getDatetime(), dateTime, 'The datetime should be set to ' + dateTime);
		assert.strictEqual(fnEventSpy.callCount, 1, 'The datetime should have updated the invisible text');
		assert.strictEqual(this.NotificationListItem._ariaDetailsText.getText(), dueAndPriorityString, 'The datetime should be set for the ARIA support');

		// act
		this.NotificationListItem.setDatetime(newDateTime);
		dueAndPriorityString = readUnreadText + ' ' + resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
				[newDateTime, this.NotificationListItem.getPriority()]);

		// assert
		assert.strictEqual(this.NotificationListItem.getDatetime(), newDateTime, 'The datetime should be set to ' + dateTime);
		assert.strictEqual(fnEventSpy.callCount, 2, 'The datetime should have updated the invisible text');
		assert.strictEqual(this.NotificationListItem._ariaDetailsText.getText(), dueAndPriorityString, 'The datetime should be set for the ARIA support');
	});

	QUnit.test('Setting priority', function(assert) {
		// arrange
		var priority = sap.ui.core.Priority.High;
		var newPriority = sap.ui.core.Priority.Medium;

		var fnEventSpy = sinon.spy(this.NotificationListItem, '_updateAriaAdditionalInfo');

		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var readUnreadText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_READ');
		var dueAndPriorityString;

		// act
		this.NotificationListItem.setPriority(priority);
		dueAndPriorityString = readUnreadText + ' ' + resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
				[this.NotificationListItem.getDatetime(), priority]);

		// assert
		assert.strictEqual(this.NotificationListItem.getPriority(), priority, 'The priority should be set to ' + priority);
		assert.strictEqual(fnEventSpy.callCount, 1, 'The priority should have updated the invisible text');
		assert.strictEqual(this.NotificationListItem._ariaDetailsText.getText(), dueAndPriorityString, 'The priority should be set for the ARIA support');

		// act
		this.NotificationListItem.setPriority(newPriority);
		dueAndPriorityString = readUnreadText + ' ' + resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
				[this.NotificationListItem.getDatetime(), newPriority]);

		// assert
		assert.strictEqual(this.NotificationListItem.getPriority(), newPriority, 'The priority should be set to ' + newPriority);
		assert.strictEqual(fnEventSpy.callCount, 2, 'The priority should have updated the invisible text');
		assert.strictEqual(this.NotificationListItem._ariaDetailsText.getText(), dueAndPriorityString, 'The priority should be set for the ARIA support');
	});

	QUnit.test('Adding and removing a button', function(assert) {
	    // arrange
		var button = new sap.m.Button({text: 'First Button'});

	    // act
		this.NotificationListItem.addButton(button);

	    // assert
	    assert.strictEqual(this.NotificationListItem.getButtons().length, 1, 'Notification List Item should have one button.');
	    assert.strictEqual(this.NotificationListItem.getButtons()[0], button, 'Notification List Item should the correct button set as aggregation.');

		// act
		this.NotificationListItem.removeButton(button);

		// assert
		assert.strictEqual(this.NotificationListItem.getButtons().length, 0, 'Notification List Item should have no buttons.');
	});

	QUnit.test('Setting several buttons', function(assert) {
		// arrange
		var firstButton = new sap.m.Button({text: 'First Button'});
		var secondButton = new sap.m.Button({text: 'Second Button'});

		// act
		this.NotificationListItem.addButton(firstButton);
		this.NotificationListItem.addButton(secondButton);

		// assert
		assert.strictEqual(this.NotificationListItem.getButtons().length, 2, 'Notification List Item should contain all the buttons set.');

		// act
		this.NotificationListItem.removeButton(firstButton);

		// assert
		assert.strictEqual(this.NotificationListItem.getButtons().length, 1, 'Notification List Item should have no buttons.');
		assert.strictEqual(this.NotificationListItem.getButtons()[0], secondButton, 'Notification List Item should the correct button set as aggregation.');

		// act
		this.NotificationListItem.removeButton(secondButton);

		// assert
		assert.strictEqual(this.NotificationListItem.getButtons().length, 0, 'Notification List Item should have no buttons.');
	});

	QUnit.test('Adding and removing a button aggregation', function(assert) {
	    // arrange
		var firstButton = new sap.m.Button({text: 'First Button'});
		var secondButton = new sap.m.Button({text: 'Second Button'});

	    // act
		this.NotificationListItem.addAggregation('buttons', firstButton);
		this.NotificationListItem.addAggregation('buttons', secondButton);

	    // assert
	    assert.strictEqual(this.NotificationListItem.getButtons().length, 2, 'The buttons should be added to the NotificationListItem');
	    assert.strictEqual(this.NotificationListItem.getAggregation('buttons').length, 2, 'The buttons should be added to the NotificationListItem');
	});

	QUnit.test('Cloning a NotificationListItem', function(assert) {
		// arrange
		var firstButton = new sap.m.Button({text: 'First Button'});
		var secondButton = new sap.m.Button({text: 'Second Button'});
		var secondNotification;

		// act
		this.NotificationListItem.addAggregation('buttons', firstButton);
		this.NotificationListItem.addAggregation('buttons', secondButton);

		secondNotification = this.NotificationListItem.clone();

		// assert
		assert.ok(
				secondNotification.getAggregation('_overflowToolbar'),
				'The cloned notification shoould have the hidden aggregations as well');
	});

	//================================================================================
	// Notification List Item rendering methods
	//================================================================================

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

	QUnit.test('Control has basic class for the keyboard navigation', function(assert) {
		// assert
		assert.strictEqual(this.NotificationListItem.$().hasClass('sapMLIB'), true, 'The notification list has has the base class of ListItemBase');
	});

	QUnit.test('Render unread status', function(assert) {
		// arrange
		this.NotificationListItem.setTitle('Notification Title');
		var title;

		// act
		this.NotificationListItem.setUnread(true);
		sap.ui.getCore().applyChanges();
		title = this.NotificationListItem.getDomRef('title');

		// assert
		assert.strictEqual(title.classList.contains('sapMNLI-Unread'), true, 'Unread status should set the corresponding classes.');

		// act
		this.NotificationListItem.setUnread(false);
		sap.ui.getCore().applyChanges();
		title = this.NotificationListItem.getDomRef('title');

		// assert
		assert.strictEqual(title.classList.contains('sapMNLI-Unread'), false, 'Unread status should set the corresponding classes.');
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
		assert.strictEqual(jQuery(classNameFooter).find('.sapMTB').length, 1, 'Footer toolbar should be rendered');
		assert.strictEqual(jQuery(classNameFooter).find('.sapMTB > button').length, 2, 'Buttons should be rendered');
	});

	QUnit.test('Changing the title', function(assert) {
		// arrange
		var title = 'Notification list item title';
		var fnSpy = sinon.spy(this.NotificationListItem, 'invalidate');

		// act
		this.NotificationListItem.setTitle(title);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnSpy.callCount, 0, 'Changing the title should not invalidate the control');
		assert.strictEqual(this.NotificationListItem.getDomRef('title').textContent, title, 'The description in the title aggregation should be set to ' + title);
	});

	QUnit.test('Changing the description', function(assert) {
		// arrange
		var description = 'Notification list item description';
		var fnSpy = sinon.spy(this.NotificationListItem, 'invalidate');

		// act
		this.NotificationListItem.setDescription(description);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnSpy.callCount, 0, 'Changing the description should not invalidate the control');
		assert.strictEqual(this.NotificationListItem.getDomRef('body').textContent, description, 'The description aggregation should be set to ' + description);
	});

	QUnit.test('Changing the datetime', function(assert) {
		// arrange
		var datetime = '2 hours';
		var fnSpy = sinon.spy(this.NotificationListItem, 'invalidate');

		// act
		this.NotificationListItem.setDatetime(datetime);
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnSpy.callCount, 0, 'Changing the datetime should not invalidate the control');
		assert.strictEqual(jQuery(classNameDatetime).text(), datetime, 'The datetime in the title aggregation should be set to ' + datetime);
	});

	QUnit.test('Setting the author\'s name', function(assert) {
		// arrange
		var details;
		var name = 'John Doe';
		this.NotificationListItem.setAuthorName(name);
		this.NotificationListItem.invalidate();
		sap.ui.getCore().applyChanges();

		// act
		details = jQuery(classNameDetails).children('.sapMNLI-Text.sapMText');

		// assert
		assert.strictEqual(details.text(), name, 'Author\'s name should be rendered');
	});

	QUnit.test('Setting the author\'s picture', function(assert) {
		// act
		this.NotificationListItem.setAuthorPicture("test-resources/sap/m/images/headerImg2.jpg");
		this.NotificationListItem.invalidate();
		sap.ui.getCore().applyChanges();

		var picture = jQuery(classNameAuthorPicture);

		// assert
		assert.strictEqual(picture.length, 1, 'Author\'s picture should be rendered');
	});

	QUnit.test('Check if the priority classes are added', function(assert) {
	    // arrange
		var priorityDiv;

	    // act
		this.NotificationListItem.setPriority(sap.ui.core.Priority.None);
		this.NotificationListItem.invalidate();
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLI-Priority');

	    // assert
	    assert.strictEqual(priorityDiv.hasClass('sapMNLI-None'), true, 'Priority should be set to "None"');

		// act
		this.NotificationListItem.setPriority(sap.ui.core.Priority.Low);
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLI-Priority');

		// assert
		assert.strictEqual(priorityDiv.hasClass('sapMNLI-Low'), true, 'Priority should be set to "Low"');

		// act
		this.NotificationListItem.setPriority(sap.ui.core.Priority.Medium);
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLI-Priority');

		// assert
		assert.strictEqual(priorityDiv.hasClass('sapMNLI-Medium'), true, 'Priority should be set to "Medium"');

		// act
		this.NotificationListItem.setPriority(sap.ui.core.Priority.High);
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLI-Priority');

		// assert
		assert.strictEqual(priorityDiv.hasClass('sapMNLI-High'), true, 'Priority should be set to "High"');

	});

	//================================================================================
	// Notification List Item events
	//================================================================================

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

	//================================================================================
	// Notification List Item ARIA support
	//================================================================================

	QUnit.module('ARIA support', {
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

	QUnit.test('ListItem role should be set', function(assert) {
	    // arrange
		var notificationDomRef = this.NotificationListItem.getDomRef();
		var role = notificationDomRef.getAttribute('role');

	    // assert
	    assert.strictEqual(role, 'listitem', 'The control should have "listitem" role');
	});

	QUnit.test('Checking the labelledby attribute', function(assert) {
	    // arrange
		var notificationDomRef = this.NotificationListItem.getDomRef();
		var labelledby = notificationDomRef.getAttribute('aria-labelledby');

	    // assert
	    assert.strictEqual(labelledby, this.NotificationListItem._getHeaderTitle().getId(), 'The labbeledby attribute should point to the title of the control');
	});

	QUnit.test('Checking the describedby attribute', function(assert) {
		// arrange
		var notificationDomRef = this.NotificationListItem.getDomRef();
		var describedby = notificationDomRef.getAttribute('aria-describedby');
		var describedByString = this.NotificationListItem._getDescriptionText().getId() + ' ' +
			this.NotificationListItem._ariaDetailsText.getId();

		// assert
		assert.strictEqual(describedby, describedByString, 'The describedby attribute should point to the description and hidden text of the control');
	});
})();
