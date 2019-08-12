/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/NotificationListItem",
	"sap/m/List",
	"sap/ui/core/library",
	"sap/m/Button",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/thirdparty/jqueryui/jquery-effects-core" // load this to test notifications in context of jquery-ui
], function(
	qutils,
	NotificationListItem,
	List,
	coreLibrary,
	Button,
	MessageToast,
	JSONModel,
	Filter
) {
	'use strict';


	// shortcut for sap.ui.core.Priority
	var Priority = coreLibrary.Priority;



	var classNameUnread = '.sapMNLI-Unread';
	var classNameHeader = '.sapMNLI-Header';
	var classNameDetails = '.sapMNLI-Details';
	var classNameAuthorPicture = '.sapMNLB-AuthorPicture';
	var classNameText = '.sapMNLI-Text';
	var classNameDatetime = '.sapMNLI-Datetime';
	var classNameFooter = '.sapMNLI-Footer';
	var classNameCloseButton = '.sapMNLB-CloseButton';
	var RENDER_LOCATION = 'qunit-fixture';

	//================================================================================
	// Notification List Item API
	//================================================================================
	QUnit.module('API', {
		beforeEach: function() {
			this.NotificationListItem = new NotificationListItem();
			this.list = new List({
				items: [
					this.NotificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListItem.destroy();
			this.list.destroy();
		}
	});

	QUnit.test('Initialization', function(assert) {
		// arrange
		this.NotificationListItem.setDescription('Notification List Item Text');
		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.', true);
		this.NotificationListItem.setDatetime('3 hours');
		this.NotificationListItem.setUnread(true);
		this.NotificationListItem.setPriority(Priority.High);
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
		assert.strictEqual(this.NotificationListItem.getPriority(), Priority.None, 'Priority should be set to "None"');
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
		var priority = Priority.High;
		var newPriority = Priority.Medium;

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
		var button = new Button({text: 'First Button'});

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
		var firstButton = new Button({text: 'First Button'});
		var secondButton = new Button({text: 'Second Button'});

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
		var firstButton = new Button({text: 'First Button'});
		var secondButton = new Button({text: 'Second Button'});

		// act
		this.NotificationListItem.addAggregation('buttons', firstButton);
		this.NotificationListItem.addAggregation('buttons', secondButton);

		// assert
		assert.strictEqual(this.NotificationListItem.getButtons().length, 2, 'The buttons should be added to the NotificationListItem');
		assert.strictEqual(this.NotificationListItem.getAggregation('buttons').length, 2, 'The buttons should be added to the NotificationListItem');
	});

	QUnit.test('Cloning a NotificationListItem', function(assert) {
		// arrange
		var firstButton = new Button({text: 'First Button'});
		var secondButton = new Button({text: 'Second Button'});
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
		beforeEach: function() {
			this.NotificationListItem = new NotificationListItem();
			this.list = new List({
				items: [
					this.NotificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.NotificationListItem.destroy();
			this.list.destroy();
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
			new Button({
				text: 'Accept',
				tap: function () {
					MessageToast.show('Accept button pressed');
				}
			})
		);
		this.NotificationListItem.addAggregation('buttons',
			new Button({
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
		assert.strictEqual(fnSpy.callCount, 1, 'Changing the title should invalidate the control');
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
		assert.strictEqual(fnSpy.callCount, 1, 'Changing the description should invalidate the control');
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
		assert.strictEqual(fnSpy.callCount, 1, 'Changing the datetime should invalidate the control when there is no datetime');
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
		this.NotificationListItem.setPriority(Priority.None);
		this.NotificationListItem.invalidate();
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLB-Priority');

		// assert
		assert.strictEqual(priorityDiv.hasClass('sapMNLB-None'), true, 'Priority should be set to "None"');

		// act
		this.NotificationListItem.setPriority(Priority.Low);
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLB-Priority');

		// assert
		assert.strictEqual(priorityDiv.hasClass('sapMNLB-Low'), true, 'Priority should be set to "Low"');

		// act
		this.NotificationListItem.setPriority(Priority.Medium);
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLB-Priority');

		// assert
		assert.strictEqual(priorityDiv.hasClass('sapMNLB-Medium'), true, 'Priority should be set to "Medium"');

		// act
		this.NotificationListItem.setPriority(Priority.High);
		sap.ui.getCore().applyChanges();
		priorityDiv = this.NotificationListItem.$().find('.sapMNLB-Priority');

		// assert
		assert.strictEqual(priorityDiv.hasClass('sapMNLB-High'), true, 'Priority should be set to "High"');

	});

	QUnit.test('Check if text is truncated', function(assert) {
		// arrange
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var expandText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_MORE');

		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id lorem at ' +
			'magna laoreet lobortis quis id tortor. Cras in tellus a nibh cursus porttitor et vel purus. Nulla neque ' +
			'lacus, eleifend sed quam eget, facilisis luctus nulla. Vestibulum ut mollis sem, ac sollicitudin massa. ' +
			'Mauris vehicula posuere tortor ac vulputate.');

		this.NotificationListItem.setDescription('Donec felis sem, tincidunt vitae gravida eget, egestas sit amet dolor. ' +
			'Duis mauris erat, eleifend sit amet dapibus vel, cursus quis ante. Pellentesque erat dui, aliquet id ' +
			'fringilla eget, aliquam at odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. ' +
			'Donec tincidunt semper mattis. Nunc id convallis ex. Sed bibendum volutpat urna, vitae eleifend nisi ' +
			'maximus id. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. ' +
			'Nunc suscipit nulla ligula, ut faucibus ex pellentesque vel. Suspendisse id aliquet mauris. ');

		this.NotificationListItem.setAuthorPicture('sap-icon://group');

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(this.NotificationListItem.getDomRef('expandCollapseButton').hidden, false, 'The "Show More" button should appear');
		assert.strictEqual(this.NotificationListItem.getDomRef('expandCollapseButton').textContent, expandText,
			'The button text should state "' + expandText + '" when truncated.');
		assert.strictEqual(this.NotificationListItem.getTruncate(), true, 'Notification should be truncated.');

		// act
		this.NotificationListItem.setTruncate(false);
		sap.ui.getCore().applyChanges();

		// arrange
		var headerClassList = this.NotificationListItem.getDomRef().querySelector('.sapMNLI-Header').classList;
		var textClassList = this.NotificationListItem.getDomRef().querySelector('.sapMNLI-TextWrapper').classList;

		// assert
		assert.strictEqual(headerClassList.contains('sapMNLI-TitleWrapper--is-expanded'), true, 'Notification title shouldn\'t be truncated.');
		assert.strictEqual(textClassList.contains('sapMNLI-TextWrapper--is-expanded'), true, 'Notification text shouldn\'t be truncated.');
	});

	QUnit.test('Check if "Show more" button is shown when title is truncated a little', function(assert) {
		// arrange
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m'),
			expandText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_MORE');

		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id lorem at ' +
			'magna laoreet lobortis quis id tortor. Cras in tellus a nibh cursus porttitor et vel purus. ');
		this.list.setWidth('800px');

		// act
		sap.ui.getCore().applyChanges();
		this.NotificationListItem._resizeNotification(); // Manually triggering resizing

		// assert
		var expandCollapseButton = this.NotificationListItem.getDomRef('expandCollapseButton');
		assert.strictEqual(expandCollapseButton.classList.contains('sapMNLI-CollapseButtonHide'), false, 'The button expand/collapse is visible.');
		assert.strictEqual(expandCollapseButton.textContent, expandText, 'The button text is "' + expandText + '".');
	});

	QUnit.test('Collapsing and expanding a notification', function(assert) {
		// arrange
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var expandText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_MORE');
		var collapseText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_SHOW_LESS');

		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id lorem at ' +
			'magna laoreet lobortis quis id tortor. Cras in tellus a nibh cursus porttitor et vel purus. Nulla neque ' +
			'lacus, eleifend sed quam eget, facilisis luctus nulla. Vestibulum ut mollis sem, ac sollicitudin massa. ' +
			'Mauris vehicula posuere tortor ac vulputate.');

		this.NotificationListItem.setDescription('Donec felis sem, tincidunt vitae gravida eget, egestas sit amet dolor. ' +
			'Duis mauris erat, eleifend sit amet dapibus vel, cursus quis ante. Pellentesque erat dui, aliquet id ' +
			'fringilla eget, aliquam at odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. ' +
			'Donec tincidunt semper mattis. Nunc id convallis ex. Sed bibendum volutpat urna, vitae eleifend nisi ' +
			'maximus id. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. ' +
			'Nunc suscipit nulla ligula, ut faucibus ex pellentesque vel. Suspendisse id aliquet mauris. ');

		this.NotificationListItem.setAuthorPicture('sap-icon://group');

		sap.ui.getCore().applyChanges();

		// arrange
		//The _deregisterResize() method is initialized here because it is also called in onBeforeRendering
		var fnEventSpy = sinon.spy(this.NotificationListItem, '_deregisterResize');

		// assert
		assert.strictEqual(this.NotificationListItem.getDomRef('expandCollapseButton').hidden, false, 'The "Show More" button should appear');
		assert.strictEqual(this.NotificationListItem.getDomRef('expandCollapseButton').textContent, expandText,
			'The button text should state "' + expandText + '" when truncated.');
		assert.strictEqual(this.NotificationListItem.getTruncate(), true, 'Notification should be truncated.');

		// act
		this.NotificationListItem.getAggregation('_collapseButton').firePress();
		sap.ui.getCore().applyChanges();
		this.clock.tick(500);

		// assert
		assert.strictEqual(this.NotificationListItem.getTruncate(), false, 'Notification shouldn\'t be truncated after pressing "Show More" button.');
		assert.strictEqual(fnEventSpy.callCount, 1, 'Pressing the "Show More" button should call the _deregisterResize() method.');
		assert.strictEqual(this.NotificationListItem.getDomRef('expandCollapseButton').textContent, collapseText,
			'The "' + expandText + '" button text should be changed to "' + collapseText + '".');
	});

	QUnit.test('When resizing _registerResize() should be called', function(assert) {
		// arrange
		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id lorem at ' +
			'magna laoreet lobortis quis id tortor. Cras in tellus a nibh cursus porttitor et vel purus. Nulla neque ' +
			'lacus, eleifend sed quam eget, facilisis luctus nulla. Vestibulum ut mollis sem, ac sollicitudin massa. ' +
			'Mauris vehicula posuere tortor ac vulputate.');

		this.NotificationListItem.setDescription('Donec felis sem, tincidunt vitae gravida eget, egestas sit amet dolor. ' +
			'Duis mauris erat, eleifend sit amet dapibus vel, cursus quis ante. Pellentesque erat dui, aliquet id ' +
			'fringilla eget, aliquam at odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. ' +
			'Donec tincidunt semper mattis. Nunc id convallis ex. Sed bibendum volutpat urna, vitae eleifend nisi ' +
			'maximus id. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. ' +
			'Nunc suscipit nulla ligula, ut faucibus ex pellentesque vel. Suspendisse id aliquet mauris. ');

		this.NotificationListItem.setAuthorPicture('sap-icon://group');

		sap.ui.getCore().applyChanges();

		var fnEventSpy = sinon.spy(this.NotificationListItem, '_registerResize');
		this.NotificationListItem._deregisterResize();

		// arrange
		this.list.setWidth('50%');
		sap.ui.getCore().applyChanges();

		var headerClassList = this.NotificationListItem.getDomRef().querySelector('.sapMNLI-Header').classList;
		var textClassList = this.NotificationListItem.getDomRef().querySelector('.sapMNLI-TextWrapper').classList;

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'The _registerResize() method should be called.');
		assert.strictEqual(headerClassList.contains('sapMNLI-TitleWrapper--is-expanded'), false, 'The title should be truncated.');
		assert.strictEqual(textClassList.contains('sapMNLI-TextWrapper--is-expanded'), false, 'The text should be truncated.');
	});

	QUnit.test('If the hideShowMoreButton is set to true no button the "Show More" button should be hidden', function(assert) {
		// arrange
		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id lorem at ' +
			'magna laoreet lobortis quis id tortor. Cras in tellus a nibh cursus porttitor et vel purus. Nulla neque ' +
			'lacus, eleifend sed quam eget, facilisis luctus nulla. Vestibulum ut mollis sem, ac sollicitudin massa. ' +
			'Mauris vehicula posuere tortor ac vulputate.');

		this.NotificationListItem.setDescription('Donec felis sem, tincidunt vitae gravida eget, egestas sit amet dolor. ' +
			'Duis mauris erat, eleifend sit amet dapibus vel, cursus quis ante. Pellentesque erat dui, aliquet id ' +
			'fringilla eget, aliquam at odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. ' +
			'Donec tincidunt semper mattis. Nunc id convallis ex. Sed bibendum volutpat urna, vitae eleifend nisi ' +
			'maximus id. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. ' +
			'Nunc suscipit nulla ligula, ut faucibus ex pellentesque vel. Suspendisse id aliquet mauris. ');

		this.NotificationListItem.setAuthorPicture('sap-icon://group');

		sap.ui.getCore().applyChanges();

		var fnEventSpy = sinon.spy(this.NotificationListItem, '_showHideTruncateButton');
		this.NotificationListItem._deregisterResize();

		// arrange
		this.list.setWidth('50%');
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'The _showHideTruncateButton() method should be called.');
		assert.strictEqual(this.NotificationListItem.$('expandCollapseButton').hasClass('sapMNLI-CollapseButtonHide'), false, 'The hideShowMoreButton is not hidden');

		// arrange
		this.NotificationListItem.setHideShowMoreButton(true);

		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 2, 'The _showHideTruncateButton() method should be called again.');
		assert.strictEqual(this.NotificationListItem.$('expandCollapseButton').hasClass('sapMNLI-CollapseButtonHide'), true, 'The hideShowMoreButton is hidden');
	});

	QUnit.test('Notifications truncate and hideShowMoreButton properties test', function(assert) {

		//arrange
		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id lorem at ' +
			'magna laoreet lobortis quis id tortor. Cras in tellus a nibh cursus porttitor et vel purus. Nulla neque ' +
			'lacus, eleifend sed quam eget, facilisis luctus nulla. Vestibulum ut mollis sem, ac sollicitudin massa. ' +
			'Mauris vehicula posuere tortor ac vulputate.');

		this.NotificationListItem.setDescription('Donec felis sem, tincidunt vitae gravida eget, egestas sit amet dolor. ' +
			'Duis mauris erat, eleifend sit amet dapibus vel, cursus quis ante. Pellentesque erat dui, aliquet id ' +
			'fringilla eget, aliquam at odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. ' +
			'Donec tincidunt semper mattis. Nunc id convallis ex. Sed bibendum volutpat urna, vitae eleifend nisi ' +
			'maximus id. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. ' +
			'Nunc suscipit nulla ligula, ut faucibus ex pellentesque vel. Suspendisse id aliquet mauris. ');

		sap.ui.getCore().applyChanges();

		//act
		this.NotificationListItem.setTruncate(false);

		//assert - no truncate and button
		assert.strictEqual(this.NotificationListItem.getTruncate(), false, 'The truncate property is set to false');
		assert.strictEqual(this.NotificationListItem.getHideShowMoreButton(), false, 'The hideShowMoreButton property is false by default');

		//act
		this.NotificationListItem.setHideShowMoreButton(true);
		//assert - no truncate but with button - which is implossible
		assert.strictEqual(this.NotificationListItem.getTruncate(), false, 'The truncate property is set to false');
		assert.strictEqual(this.NotificationListItem.getHideShowMoreButton(), true, 'The hideShowMoreButton property is set to true');

		//act
		this.NotificationListItem.setTruncate(true);
		this.NotificationListItem.setHideShowMoreButton(true);

		//assert - with truncate and button
		assert.strictEqual(this.NotificationListItem.getTruncate(), true, 'The truncate property is set to true');
		assert.strictEqual(this.NotificationListItem.getHideShowMoreButton(), true, 'The hideShowMoreButton property is set to true');

		//act
		this.NotificationListItem.setHideShowMoreButton(false);

		//assert - with truncate but no button - default
		assert.strictEqual(this.NotificationListItem.getTruncate(), true, 'The truncate property is set to true');
		assert.strictEqual(this.NotificationListItem.getHideShowMoreButton(), false, 'The hideShowMoreButton property is false by default');
	});

	QUnit.test('Notifications on L size (bigger than 640px) should position footer differently', function(assert) {
		// arrange
		var lSizeClass = 'sapMNLI-LSize';

		// act
		this.list.setWidth('658px'); // 8px over the threshold go for margins
		sap.ui.getCore().applyChanges();
		this.NotificationListItem._resizeNotification(); // Manually triggering resizing

		// assert
		assert.strictEqual(this.NotificationListItem.getDomRef().classList.contains(lSizeClass), true, 'NotificationListItem should have class "sapMNLI-LSize"');

		// act
		this.list.setWidth('340px');
		sap.ui.getCore().applyChanges();
		this.NotificationListItem._resizeNotification();

		// assert
		assert.strictEqual(this.NotificationListItem.getDomRef().classList.contains(lSizeClass), false, 'NotificationListItem should no longer have class "sapMNLI-LSize"');
	});

	QUnit.test('Test if _registerResize is called', function(assert) {
		// arrange
		this.NotificationListItem.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi id lorem at ' +
		'magna laoreet lobortis quis id tortor. Cras in tellus a nibh cursus porttitor et vel purus. Nulla neque ' +
		'lacus, eleifend sed quam eget, facilisis luctus nulla. Vestibulum ut mollis sem, ac sollicitudin massa. ' +
		'Mauris vehicula posuere tortor ac vulputate.');

		this.NotificationListItem.setDescription('Donec felis sem, tincidunt vitae gravida eget, egestas sit amet dolor. ' +
		'Duis mauris erat, eleifend sit amet dapibus vel, cursus quis ante. Pellentesque erat dui, aliquet id ' +
		'fringilla eget, aliquam at odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. ' +
		'Donec tincidunt semper mattis. Nunc id convallis ex. Sed bibendum volutpat urna, vitae eleifend nisi ' +
		'maximus id. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. ' +
		'Nunc suscipit nulla ligula, ut faucibus ex pellentesque vel. Suspendisse id aliquet mauris. ');

		this.NotificationListItem.setAuthorPicture('sap-icon://group');

		sap.ui.getCore().applyChanges();

		var fnEventSpy = sinon.spy(this.NotificationListItem, '_registerResize');

		// arrange
		this.list.setWidth('50%');
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'The _registerResize() method should be called on resize.');
	});

	//================================================================================
	// Notification List Item events
	//================================================================================

	QUnit.module('Events', {
		beforeEach: function() {
			this.NotificationListItem = new NotificationListItem();
			this.list = new List({
				items: [
					this.NotificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
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
		this.NotificationListItem.getAggregation('_closeButton').firePress();

		// assert
		assert.strictEqual(fnEventSpy.callCount, 1, 'Pressing the close button should fire the  close event');
	});

	QUnit.test('Pressing an action button to close the notification list item', function(assert) {
		// arrange
		var fnCloseSpy = sinon.spy(this.NotificationListItem, 'close');
		var fnFireCloseSpy = sinon.spy(this.NotificationListItem, 'fireClose');

		var that = this;
		this.NotificationListItem.addAggregation('buttons',
			new Button('closeButton',{
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
	// Notification List Item Data Binding
	//================================================================================

	QUnit.module('Data Binding', {
		beforeEach: function() {
			var model = new JSONModel();
			var oItemTemplate = new NotificationListItem({
				close : function(oEvent) {
					var item = oEvent.getSource();
					model.setProperty(item.getBindingContext().getPath() + "/displayed", false);
					sap.ui.getCore().byId("list").getBinding("items").filter([
						new Filter("displayed", "EQ", true)
					]);
				}
			});
			model.setData([
				{lastName: "Dente", name: "Al", displayed: true, linkText: "www.sap.com", href: "http://www.sap.com", rating: 4},
				{lastName: "Friese", name: "Andy", displayed: true, linkText: "www.spiegel.de", href: "http://www.spiegel.de", rating: 2},
				{lastName: "Mann", name: "Anita", displayed: true, linkText: "www.kicker.de", href: "http://www.kicker.de", rating: 3}
			]);

			this.list = new List("list", {
				headerText : "Items",
				items : {
					path : "/",
					template: oItemTemplate
				}
			}).setModel(model);

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.list.destroy();
		}
	});

	QUnit.test('Closing the Notification from itself', function(assert) {
		// arrange
		var item = this.list.getItems()[2];

		// act
		item.close();

		// assert
		assert.strictEqual(this.list.getItems().length, 2, 'The list should have only 2 list items');
	});

	//================================================================================
	// Notification List Item ARIA support
	//================================================================================

	QUnit.module('ARIA support', {
		beforeEach: function() {
			this.NotificationListItem = new NotificationListItem();
			this.list = new List({
				items: [
					this.NotificationListItem
				]
			});

			this.list.placeAt(RENDER_LOCATION);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
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
		var descibedByControls = this.NotificationListItem._getHeaderTitle().getId() + ' ' +
			this.NotificationListItem._getDescriptionText().getId() + ' ' + this.NotificationListItem._ariaDetailsText.getId();
		var labelledby = notificationDomRef.getAttribute('aria-labelledby');

		// assert
		assert.strictEqual(labelledby, descibedByControls, 'The labbeledby attribute should point to the detailed invisible text, describing the control');
	});

	QUnit.test('Checking the labelledby info text is set correctly', function(assert) {
		// arrange
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var unreadText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_UNREAD');
		var createdBy = resourceBundle.getText('NOTIFICATION_LIST_ITEM_CREATED_BY') + ' ' + 'John Smith';
		var dueAndPriorityString = resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
			['5 minutes', Priority.High]);
		var infoText = unreadText + ' ' + createdBy + ' ' + dueAndPriorityString;

		this.NotificationListItem.setUnread(true);
		this.NotificationListItem.setPriority(Priority.High);
		this.NotificationListItem.setAuthorName('John Smith');
		this.NotificationListItem.setDatetime('5 minutes');

		// assert
		assert.strictEqual(this.NotificationListItem._ariaDetailsText.getText(), infoText,
			'The info text should be set correctly with unread status, author, due date and priority');
	});

	QUnit.test('Checking the labelledby info text is set correctly without author name', function(assert) {
		// arrange
		var resourceBundle = sap.ui.getCore().getLibraryResourceBundle('sap.m');
		var unreadText = resourceBundle.getText('NOTIFICATION_LIST_ITEM_UNREAD');
		var dueAndPriorityString = resourceBundle.getText('NOTIFICATION_LIST_ITEM_DATETIME_PRIORITY',
			['5 minutes', Priority.High]);
		var infoText = unreadText + ' ' + dueAndPriorityString;

		this.NotificationListItem.setUnread(true);
		this.NotificationListItem.setPriority(Priority.High);
		this.NotificationListItem.setDatetime('5 minutes');

		// assert
		assert.strictEqual(this.NotificationListItem._ariaDetailsText.getText(), infoText,
			'The info text should be set correctly with unread status, author, due date and priority');
	});
});