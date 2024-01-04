/*global describe,it,browser,element,by,takeScreenshot,expect*/

describe('sap.m.ObjectStatusInvertedVisual', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ObjectStatus';

	// Rendered properly
	it('should be rendered properly', function () {
		browser.executeScript(function() { // ensure the page is scrolled to top
			document.getElementById("testPage-cont").scrollTop = 0;
		});
		expect(takeScreenshot(element(by.id('testPage')))).toLookAs('objectStatus_page');
	});

});