/*global describe,it,element,by,takeScreenshot,expect,browser,protractor*/

describe('sap.m.QuickViewCard', function() {
	"use strict";

	// initial loading
	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('0_initial');
	});

	var qvcPanel = element(by.id('quickViewCardPanel'));

	// go to page 2
	it('should go to page 2', function () {
		element(by.id('__link9')).click();
		expect(takeScreenshot(qvcPanel)).toLookAs('1_page_2');
	});

	// back to page 1
	it('should go back to page 1', function () {
		element(by.id('BackBtn')).click();
		expect(takeScreenshot(qvcPanel)).toLookAs('2_page_1');
	});

	// without scroll bars
	it('should visualize QuickView card without scroll bars', function () {
		element(by.id('HideBtn')).click();
		expect(takeScreenshot(qvcPanel)).toLookAs('3_without_scroll_bars');
	});

	// full height
	it('should visualize QuickView card with full height', function () {
		element(by.id('ShowBtn')).click();
		element(by.id('FullHeightBtn')).click();
		expect(takeScreenshot(qvcPanel)).toLookAs('4_full_height');
	});

	it('should visualize QuickViewCard with link as title on ONE line - focused', function () {
		var qv4 = element(by.id("quickViewCardPanel4"));
		browser.executeScript('document.getElementById("quickViewCardPanel4").scrollIntoView()').then(function() {
			element(by.id("vizTestsHelperButton1")).sendKeys(protractor.Key.TAB); // focus the link
			expect(takeScreenshot(qv4)).toLookAs("5_link_as_title_one_line_focused");
		});
	});

	it('should visualize QuickViewCard with link as title on TWO lines - focused', function () {
		var qv5 = element(by.id("quickViewCardPanel5"));
		browser.executeScript('document.getElementById("quickViewCardPanel5").scrollIntoView()').then(function() {
			element(by.id("vizTestsHelperButton2")).sendKeys(protractor.Key.TAB); // focus the link
			expect(takeScreenshot(qv5)).toLookAs("6_link_as_title_two_lines_focused");
		});
	});
});