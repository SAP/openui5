/*global describe,it,browser,element,by,takeScreenshot,expect*/

describe('sap.m.ObjectMarker', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ObjectMarker';

	// Rendered properly
	it('should be rendered properly', function () {
		browser.executeScript(function() { // ensure the page is scrolled to top
			document.getElementById("page-cont").scrollTop = 0;
		});
		expect(takeScreenshot(element(by.id('page')))).toLookAs('objectMarker_page');
	});

	it('should be rendered properly2', function () {
		browser.executeScript(function() { // ensure the page is scrolled to top
			document.getElementById("page-cont").scrollTop = 550;
		});
		expect(takeScreenshot(element(by.id('page')))).toLookAs('objectMarker_page2');
	});

});