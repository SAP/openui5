/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.m.NotificationListItem', function() {
	"use strict";

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it('should show compact notifications', function() {
		element(by.id('toggleCompactModeButton')).click();
		expect(takeScreenshot()).toLookAs('1_compact');
		element(by.id('toggleCompactModeButton')).click();
	});

	it('should show overflow toolbar with buttons', function() {
		element(by.id('firstNotification-overflowToolbar-overflowButton')).click();
		expect(takeScreenshot()).toLookAs('2_overflow');
	});

	it('should fire "accept" button pressed event', function () {
		element(by.id('notificationAcceptButton')).click();
		expect(takeScreenshot()).toLookAs('3_accept_clicked');
	});

	it('should show first notification', function () {
		var notification = element(by.id('firstNotification'));
		expect(takeScreenshot(notification)).toLookAs('4_first');
	});

	it('should show second notification', function () {
		var notification = element(by.id('secondNotification'));
		expect(takeScreenshot(notification)).toLookAs('5_second');
	});

	it('should show notification with no action buttons', function () {
		var notification = element(by.id('notificationNoButtons'));
		expect(takeScreenshot(notification)).toLookAs('6_no_buttons');
	});

	it('should show notification with one action button', function () {
		var notification = element(by.id('notificationOnlyOneActionButton'));
		expect(takeScreenshot(notification)).toLookAs('7_one_action');
	});

	it('should show notification with no description', function () {
		var notification = element(by.id('notificationNoDescription'));
		expect(takeScreenshot(notification)).toLookAs('8_no_description');
	});

	it('should show notification with binding', function () {
		var notification = element(by.id('notificationBinding'));
		browser.executeScript('document.getElementById("notificationBinding").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('9_binding');
			element(by.id('notificationBinding-showMoreButton')).click();
			expect(takeScreenshot(notification)).toLookAs('10_binding_show_more');
		});
	});

	it('should show notification with no :show more" button', function () {
		var notification = element(by.id('notificationNoShowMoreButton'));
		browser.executeScript('document.getElementById("notificationNoShowMoreButton").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('11_no_show_more');
		});
	});

	it('should show notification with no truncation', function () {
		var notification = element(by.id('notificationNoTruncation'));
		browser.executeScript('document.getElementById("notificationNoTruncation").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('12_no_truncation');
		});

		browser.executeScript('document.getElementById("notificationNoTruncation-showMoreButton").scrollIntoView()').then(function() {
			element(by.id('notificationNoTruncation-showMoreButton')).click();
		});

		browser.executeScript('document.getElementById("notificationNoTruncation").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('13_no_truncation_show_less');
		});
	});
});
