/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.NotificationListItem', function() {
	"use strict";

	it('should load test page', function () {
		var notificationList = element(by.id('listId'));
		expect(takeScreenshot(notificationList)).toLookAs('initial');
	});

	it('should test compact mode', function () {
		var notification = element(by.id('firstNotification'));
		element(by.id('toggleCompactModeButton')).click();
		expect(takeScreenshot(notification)).toLookAs('compact-mode');
		element(by.id('toggleCompactModeButton')).click();
	});

	it('should fire "accept" button pressed event', function () {
		var notification = element(by.id('secondNotification'));
		element(by.id('notificationAcceptButton')).click();
		expect(takeScreenshot(notification)).toLookAs('accept-clicked');
	});

	it('should expand the notification', function() {
		var notification = element(by.id('firstNotification'));
		element(by.id('firstNotification-expandCollapseButton')).click();
		expect(takeScreenshot(notification)).toLookAs('show-more-clicked');
	});

	it('should collapse the notification', function() {
		var notification = element(by.id('firstNotification'));
		element(by.id('firstNotification-expandCollapseButton')).click();
		expect(takeScreenshot(notification)).toLookAs('show-less-clicked');
	});

	it('should show compact notifications', function() {
		var compactNotificationListItems = element(by.id('listId'));
		element(by.id('toggleCompactModeButton')).click();
		expect(takeScreenshot(compactNotificationListItems)).toLookAs('compact-list-items');
	});
});