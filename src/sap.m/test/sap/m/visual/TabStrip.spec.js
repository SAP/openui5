/*global describe,it,element,by,takeScreenshot,expect*/

describe('sap.m.TabStrip', function() {
	"use strict";

	it('should load test page', function () {
		expect(takeScreenshot()).toLookAs('initial');
	});

	// Rendered properly
	it('should be rendered properly', function () {
		expect(takeScreenshot(element(by.id('TabStripFirst')))).toLookAs('tabstrip_initial');
	});
});