/*global describe,it,browser,element,by,takeScreenshot,expect*/

describe('sap.m.ObjectStatus', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ObjectStatus';

	// Rendered properly
	it('should be rendered properly', function () {
		browser.executeScript(function() { // ensure the page is scrolled to top
			document.getElementById("testPage-cont").scrollTop = 0;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('objectStatus_page');
	});

	it('should be rendered properly2', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 550;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('objectStatus_page2');
	});

	it('should be rendered properly3', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 1050;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('objectStatus_page3');
	});

	it('should be rendered properly4', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 1550;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('objectStatus_page4');
	});

	it('should be rendered properly5', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 2050;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('objectStatus_page5');
	});

	it('should be rendered properly6', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 2550;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('objectStatus_page6');
	});

	it('should render properly the focus', function () {
		browser.executeScript(function() { // scroll page down
			jQuery(document.getElementById("activeStatus")).control(0).focus();
		});
		expect(takeScreenshot(element(by.id('activeStatusListItem')))).toLookAs('objectStatusActive_focus');
	});

});