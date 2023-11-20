/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe('sap.m.NotificationListGroup', function () {
	"use strict";

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it('should show compact notifications', function() {
		element(by.id('toggleCompactModeButton')).click();
		expect(takeScreenshot()).toLookAs('1_compact');
		element(by.id('toggleCompactModeButton')).click();
	});

	it('should show overflow', function() {
		element(by.id('notificationGroup-overflowToolbar-overflowButton')).click();
		expect(takeScreenshot()).toLookAs('2_overflow');
		element(by.id('notificationGroup-overflowToolbar-overflowButton')).click();
	});

	it('should show first notification group', function () {
		var notification = element(by.id('notificationGroup'));
		expect(takeScreenshot(notification)).toLookAs('3_first');
	});

	it('should show first notification group - collapsed', function () {
		var notification = element(by.id('notificationGroup'));
		element(by.id('notificationGroup-collapseButton')).click();
		expect(takeScreenshot(notification)).toLookAs('4_first_collapsed');
	});

	it('should show single notification group', function () {
		var notification = element(by.id('notificationGroup2'));
		browser.executeScript('document.getElementById("notificationGroup2").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('5_single');
			element(by.id('notificationGroup2-collapseButton')).click();
			expect(takeScreenshot(notification)).toLookAs('6_single_expanded');
		});
	});

	it('should show notification group with 0 items', function () {
		var notification = element(by.id('notificationGroup3'));
		browser.executeScript('document.getElementById("notificationGroup3").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('7_zero_items');
		});
	});

	it('should show notification group with 0 items and collapsable', function () {
		var notification = element(by.id('notificationGroup4'));
		browser.executeScript('document.getElementById("notificationGroup4").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('8_zero_items_collapsable');
			element(by.id('notificationGroup4-collapseButton')).click();
			expect(takeScreenshot(notification)).toLookAs('9_zero_items_collapsable_collapsed');
		});
	});

	it('should show notification group with hidden action buttons', function () {
		var notification = element(by.id('notificationGroup5'));
		browser.executeScript('document.getElementById("notificationGroup5").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('10_no_actions');
			element(by.id('notificationGroup5-collapseButton')).click();
			expect(takeScreenshot(notification)).toLookAs('11_no_actions_collapsed');
		});
	});

	it('should show notification group with hidden action buttons', function () {
		var notification = element(by.id('notificationGroup6'));
		browser.executeScript('document.getElementById("notificationGroup6").scrollIntoView()').then(function() {
			expect(takeScreenshot(notification)).toLookAs('12_no_auto_priority');
			element(by.id('notificationGroup6-collapseButton')).click();
			expect(takeScreenshot(notification)).toLookAs('13_no_auto_priority_collapsed');
		});
	});
});