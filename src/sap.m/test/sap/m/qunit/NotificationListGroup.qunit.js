(function() {
    'use strict';

    jQuery.sap.require('sap.ui.qunit.qunit-css');
    jQuery.sap.require('sap.ui.qunit.QUnitUtils');
    jQuery.sap.require('sap.ui.thirdparty.qunit');
    jQuery.sap.require('sap.ui.thirdparty.sinon');
    jQuery.sap.require('sap.ui.thirdparty.sinon-qunit');
    sinon.config.useFakeTimers = false;

    jQuery.sap.require("sap.ui.qunit.qunit-coverage");

    var classNameHeader = '.sapMNLG-Header';
    var classNameDatetime = '.sapMNLI-Datetime';
    var classNameFooterToolbar = '.sapMTB';
    var classNameCloseButton = '.sapMNLB-CloseButton';

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
        var id = this.NotificationListGroup.getId();
        this.NotificationListGroup.setTitle('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.');
        this.NotificationListGroup.setDatetime('3 hours');
        for (var index = 0; index < 5; index++) {
            this.NotificationListGroup.addAggregation('items', new sap.m.NotificationListItem({title: index}));
        }

        this.NotificationListGroup.addAggregation('buttons', new sap.m.Button({text : 'Accept', type: sap.m.ButtonType.Accept}));
        this.NotificationListGroup.addAggregation('buttons', new sap.m.Button({text : 'Reject', type: sap.m.ButtonType.Reject}));

        this.NotificationListGroup.getItems()[0].setPriority(sap.ui.core.Priority.High);
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
        this.NotificationListGroup.addItem(
                new sap.m.NotificationListItem({
                    title: 'Single Item Notification',
                    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                    unread: true,
                    visible: true,
                    showCloseButton: false,
                    priority: sap.ui.core.Priority.Medium,
                    buttons: [
                        new sap.m.Button({
                            text: 'Accept',
                            type: sap.m.ButtonType.Accept,
                            tap: function () {
                                sap.m.MessageToast.show('Accept button pressed');
                            }
                        }),
                        new sap.m.Button({
                            text: 'Cancel',
                            type: sap.m.ButtonType.Reject,
                            tap: function () {
                                sap.m.MessageToast.show('Cancel button pressed');
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
        var firstButton = new sap.m.Button({text: 'First Button'});
        var secondButton = new sap.m.Button({text: 'Second Button'});
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
        var firstNotification = new sap.m.NotificationListItem({title: 'First Notification'});
        var secondNotification = new sap.m.NotificationListItem({title: 'Second Notification'});
        var fnEventSpy = sinon.spy(this.NotificationListGroup, 'setCollapsed');

        this.NotificationListGroup.addItem(firstNotification);
        this.NotificationListGroup.addItem(secondNotification);
        sap.ui.getCore().applyChanges();

        // act
        this.NotificationListGroup.getAggregation('_collapseButton').firePress();
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(fnEventSpy.callCount, 1, 'Pressing the button should trigger collapse/expand of the group.');
        assert.strictEqual(this.NotificationListGroup.getCollapsed(), false, 'Pressing the button should expand the collapsed group.');
    });

    QUnit.test('Priority must be set to the highest if there are more than two notifications', function(assert) {
        // arrange
        this.NotificationListGroup.setAutoPriority(true);

        // act
        var firstNotification = new sap.m.NotificationListItem({priority: sap.ui.core.Priority.None});
        var secondNotification = new sap.m.NotificationListItem({priority: sap.ui.core.Priority.Medium});
        var thirdNotification = new sap.m.NotificationListItem({priority: sap.ui.core.Priority.Low});

        this.NotificationListGroup.addItem(firstNotification);
        this.NotificationListGroup.addItem(secondNotification);
        this.NotificationListGroup.addItem(thirdNotification);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(this.NotificationListGroup.getPriority(), sap.ui.core.Priority.Medium, 'The priority should be set to "Medium".');
    });

    QUnit.test('Priority must be set accordingly', function(assert) {
        // arrange
        this.NotificationListGroup.setAutoPriority(true);

        // act
        var firstNotification = new sap.m.NotificationListItem({priority: sap.ui.core.Priority.None});
        var secondNotification = new sap.m.NotificationListItem({priority: sap.ui.core.Priority.Low});

        this.NotificationListGroup.addItem(firstNotification);
        this.NotificationListGroup.addItem(secondNotification);
        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(this.NotificationListGroup.getPriority(), sap.ui.core.Priority.Low, 'The priority should be set to "Low".');

        // act
        firstNotification.setPriority(sap.ui.core.Priority.Low);
        secondNotification.setPriority(sap.ui.core.Priority.Medium);

        // assert
        assert.strictEqual(this.NotificationListGroup.getPriority(), sap.ui.core.Priority.Medium, 'The priority should be set to "Medium".');

        // act
        firstNotification.setPriority(sap.ui.core.Priority.Medium);
        secondNotification.setPriority(sap.ui.core.Priority.High);

        // assert
        assert.strictEqual(this.NotificationListGroup.getPriority(), sap.ui.core.Priority.High, 'The priority should be set to "High".');

        // act
        firstNotification.setPriority(sap.ui.core.Priority.None);
        secondNotification.setPriority(sap.ui.core.Priority.None);

        // assert
        assert.strictEqual(this.NotificationListGroup.getPriority(), sap.ui.core.Priority.None, 'The priority should be set to "None".');
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

    QUnit.test('Render action buttons', function(assert) {
        // arrange
        var that = this;
        var buttonsInFooter = 2;
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: true,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
            })
        );

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
        assert.strictEqual(fnSpy.callCount, 1, 'Changing the title should invalidate the control');
    });

    QUnit.test('Changing the datetime', function(assert) {
        // arrange
        var datetime = '2 hours';
        var fnSpy = sinon.spy(this.NotificationListGroup, 'invalidate');
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: true,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
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
        var firstNotification = new sap.m.NotificationListItem({title: 'First Notification'});
        var secondNotification = new sap.m.NotificationListItem({title: 'Second Notification'});

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

    //================================================================================
    // Notification List Group new features
    //================================================================================

    QUnit.module('Group with 0 items', {
        setup: function() {
            this.NotificationListGroup = new sap.m.NotificationListGroup();

            this.NotificationListGroup.placeAt(RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function() {
            this.NotificationListGroup.destroy();
        }
    });

    QUnit.test('Footer is not rendered', function(assert) {
        // arrange
        var that = this;
        var buttonsInFooter = 0;

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

    QUnit.module('Test Visible property', {
        setup: function() {
            this.NotificationListGroup = new sap.m.NotificationListGroup();

            this.NotificationListGroup.placeAt(RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function() {
            this.NotificationListGroup.destroy();
        }
    });

    QUnit.test('Add invisible item - the same like 0 items', function(assert) {
        // arrange
        var that = this;
        var buttonsInFooter = 0;

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
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: false,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
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
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: true,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
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
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: false,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
            })
        );

        sap.ui.getCore().applyChanges();

        // assert
        assert.strictEqual(jQuery("sapUiHiddenPlaceholder").length, 0, 'Item is hidden');
    });

    QUnit.module('Test buttons enabled state when just 1 item is in the group', {
        setup: function() {
            this.NotificationListGroup = new sap.m.NotificationListGroup();

            this.NotificationListGroup.placeAt(RENDER_LOCATION);
            sap.ui.getCore().applyChanges();
        },
        teardown: function() {
            this.NotificationListGroup.destroy();
        }
    });

    QUnit.test('Add 1 visible item - buttons are disabled', function(assert) {
        // arrange
        var that = this;
        var buttonsInFooter = 0;

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
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: true,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
            })
        );
        sap.ui.getCore().applyChanges();


        // assert
        assert.strictEqual(this.NotificationListGroup.getButtons()[0].getEnabled(), false, 'Buttons are disabled');
    });

    QUnit.test('Add 2+ visible items - buttons are enabled', function(assert) {
        // arrange
        var that = this;
        var buttonsInFooter = 0;

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
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: true,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
            })
        );
        this.NotificationListGroup.addItem(
            new sap.m.NotificationListItem({
                title: 'Single Item Notification2',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque commodo consequat vulputate. Aliquam a mi imperdiet erat lobortis tempor.',
                unread: true,
                visible: true,
                showCloseButton: false,
                priority: sap.ui.core.Priority.Medium
            })
        );
        sap.ui.getCore().applyChanges();


        // assert
        assert.strictEqual(this.NotificationListGroup.getButtons()[0].getEnabled(), true, 'Buttons are enabled');
    });
})();