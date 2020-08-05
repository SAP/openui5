/*global describe,it,browser,element,by,takeScreenshot,expect*/

describe('sap.m.ObjectMarker', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.ObjectMarker';

	// Rendered properly
	it('should be rendered properly', function () {
		expect(takeScreenshot(element(by.id('page')))).toLookAs('objectMarker_page');
	});

});