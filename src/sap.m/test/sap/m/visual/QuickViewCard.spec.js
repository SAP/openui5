/*global describe,it,element,by,takeScreenshot,expect*/

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
});