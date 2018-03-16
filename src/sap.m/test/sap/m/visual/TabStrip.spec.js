/*global describe,it,browser,element,by,takeScreenshot,expect*/

describe('sap.m.TabStrip', function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.TabContainer';

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('initial');
	});

	// Rendered properly
	it('should be rendered properly', function () {
		expect(takeScreenshot(element(by.id('TabStripFirst')))).toLookAs('tabstrip_initial');
	});
});