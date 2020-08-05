/*global describe,it,browser,element,by,takeScreenshot,expect*/

describe('sap.m.ObjectListItem', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ObjectListItem';

	// Rendered properly
	it('should be rendered properly', function () {
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('ObjectListItem_page');
	});

	it('should be rendered properly2', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 550;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('ObjectListItem_page2');
	});

	it('should be rendered properly3', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 1050;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('ObjectListItem_page3');
	});

	it('should be rendered properly4', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 1550;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('ObjectListItem_page4');
	});

	it('should be rendered properly5', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 2050;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('ObjectListItem_page5');
	});

	it('should be rendered properly6', function () {
		browser.executeScript(function() { // scroll page down
			document.getElementById("testPage-cont").scrollTop = 2650;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('ObjectListItem_page6');
	});
});