(function() {
    'use strict';

    jQuery.sap.require('sap.ui.qunit.qunit-css');
    jQuery.sap.require('sap.ui.qunit.QUnitUtils');
    jQuery.sap.require('sap.ui.thirdparty.qunit');
    jQuery.sap.require('sap.ui.thirdparty.sinon');
    jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
    sinon.config.useFakeTimers = false;

    var classNameIcons = '.sapMNLG-Icons';
    var classNameUnread = '.sapMNLG-UnreadStatus';
    var classNameRead = '.sapMNLG-ReadStatus';
    var classNameHeader = '.sapMNLG-Header';
    var classNameDatetime = '.sapMNLG-Datetime';
    var classNameFooter = '.sapMNLG-Footer';
    var classNameCloseButton = '.sapMNLG-CloseButton';

    var RENDER_LOCATION = 'qunit-fixture';

    //================================================================================
    // Notification List Group API
    //================================================================================
    QUnit.module('API', {
        setup: function() {
            this.NotificationListGroup = new sap.m.NotificationListGroup();

            this.NotificationListGroup.placeAt(RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function() {
            this.NotificationListGroup.destroy();
        }
    });

    QUnit.test('Initialization', function(assert) {
        // arrange
        this.NotificationListGroup.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.');
        this.NotificationListGroup.setDatetime('3 hours');
        for (var i = 0; i < 5; i++) {
            this.NotificationListGroup.addAggregation('items', new sap.m.NotificationListItem({title: i}));
        }

        this.NotificationListGroup.addAggregation('buttons', new sap.m.Button({text : 'Accept', type: sap.m.ButtonType.Accept}));
        this.NotificationListGroup.addAggregation('buttons', new sap.m.Button({text : 'Reject', type: sap.m.ButtonType.Reject}));

        this.NotificationListGroup.getItems()[0].setPriority(sap.ui.core.Priority.High);
        this.NotificationListGroup.getItems()[0].setUnread(true);
        sap.ui.getCore().applyChanges();

        // assert
        assert.ok(this.NotificationListGroup, 'NotificationListItem should be rendered');

        assert.strictEqual(jQuery(classNameCloseButton).length, 1, 'Group Close Button should be rendered');
        assert.strictEqual(jQuery(classNameHeader).length, 1, 'Title should be rendered');
        assert.strictEqual(jQuery(classNameDatetime).length, 1, 'DateTime should be rendered');
        assert.strictEqual(jQuery(classNameIcons).children('').length, 2, 'Unread status and priority should be rendered');
        assert.strictEqual(jQuery(classNameUnread).length, 1, 'Unread status should be rendered');
        assert.strictEqual(jQuery(classNameIcons).children('').length, 2, 'Unread status and priority should be rendered');

        sap.ui.getCore().applyChanges();

    });

    QUnit.test('Default values', function(assert) {
        // arrange
        var notification = new sap.m.NotificationListItem({
            priority: sap.ui.core.Priority.Medium,
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
        assert.strictEqual(this.NotificationListGroup.getPriority(), sap.ui.core.Priority.Medium, 'The group should have high priority.');
        assert.strictEqual(this.NotificationListGroup.getUnread(), true, 'The group should be unread.');

        // act
        this.NotificationListGroup.setAutoPriority(false);
        this.NotificationListGroup.setPriority(sap.ui.core.Priority.None);

        // assert
        assert.strictEqual(this.NotificationListGroup.getPriority(), sap.ui.core.Priority.None, 'The group should have high priority.');
    });

    QUnit.test('Setting datetime', function(assert) {
        // arrange
        var threeHoursConst = '3 hours';
        var fiveMinsConst = 'Five minutes';

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

    //================================================================================
    // Notification List Group rendering methods
    //================================================================================

    QUnit.module('Rendering', {
        setup: function() {
            this.NotificationListGroup = new sap.m.NotificationListGroup();

            this.NotificationListGroup.placeAt(RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function() {
            this.NotificationListGroup.destroy();
        }
    });

    QUnit.test('Control has basic class for the keyboard navigation', function(assert) {
        // assert
        assert.strictEqual(this.NotificationListGroup.$().hasClass('sapMLIB'), true, 'The notification list has has the base class of ListItemBase');
    });

    QUnit.test('Render unread status', function(assert) {
        // act
        this.NotificationListGroup.setUnread(true);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(jQuery(classNameUnread).length, 1, 'Unread status should be rendered');

        // act
        this.NotificationListGroup.setUnread(false);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(jQuery(classNameRead).length, 1, 'Read status should be rendered');
    });

    QUnit.test('Render priority', function(assert) {
        // act
        this.NotificationListGroup.setPriority(sap.ui.core.Priority.High);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(jQuery(classNameIcons).children('.sapUiIcon').length, 1, 'High priority should be rendered');

        // act
        this.NotificationListGroup.setPriority(sap.ui.core.Priority.None);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(jQuery(classNameIcons).children('.sapUiIcon').length, 0, 'In priority in set to "None" nothing should be rendered');
    });

    QUnit.test('Render action buttons', function(assert) {
        // arrange
        var that = this;
        this.NotificationListGroup.addAggregation('buttons',
            new sap.m.Button({
                text: 'Accept',
                tap: function () {
                    new sap.m.MessageToast('Accept button pressed');
                }
            })
        );
        this.NotificationListGroup.addAggregation('buttons',
            new sap.m.Button({
                text: 'Cancel',
                tap: function () {
                    that.NotificationListGroup.close();
                }
            })
        );
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(jQuery(classNameFooter).children('button').length, 2, 'Buttons should be rendered');
    });

    QUnit.test('Changing the title', function(assert) {
        // arrange
        var title = 'Notification list group title';
        var fnSpy = sinon.spy(this.NotificationListGroup, 'invalidate');

        // act
        this.NotificationListGroup.setTitle(title);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(fnSpy.callCount, 0, 'Changing the title should not invalidate the control');
        assert.strictEqual(this.NotificationListGroup.getDomRef('title').textContent, title, 'The description in the title aggregation should be set to ' + title);
    });

    QUnit.test('Changing the datetime', function(assert) {
        // arrange
        var datetime = '2 hours';
        var fnSpy = sinon.spy(this.NotificationListGroup, 'invalidate');

        // act
        this.NotificationListGroup.setDatetime(datetime);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(fnSpy.callCount, 0, 'Changing the datetime should not invalidate the control');
        assert.strictEqual(jQuery(classNameDatetime).text(), datetime, 'The datetime in the title aggregation should be set to ' + datetime);
    });

    //================================================================================
    // Notification List Item events
    //================================================================================

    QUnit.module('Events', {
        setup: function() {
            this.NotificationListGroup = new sap.m.NotificationListGroup();

            this.NotificationListGroup.placeAt(RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function() {
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
        assert.equal(this.NotificationListGroup.getDomRef(), null, 'Notification List Group should be destroyed');
    });

    QUnit.test('Pressing the close button', function(assert) {
        // arrange
        var fnEventSpy = sinon.spy(this.NotificationListGroup, 'fireClose');

        // act
        this.NotificationListGroup._closeButton.firePress();

        // assert
        assert.strictEqual(fnEventSpy.callCount, 1, 'Pressing the close button should fire the  close event');
    });

    QUnit.test('Pressing an action button to close the notification list group', function(assert) {
        // arrange
        var fnCloseSpy = sinon.spy(this.NotificationListGroup, 'close');
        var fnFireCloseSpy = sinon.spy(this.NotificationListGroup, 'fireClose');

        var that = this;
        this.NotificationListGroup.addAggregation('buttons',
            new sap.m.Button('closeButton',{
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
})();