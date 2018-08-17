/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.ui.unified.CurrencyVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.ui.unified.Currency';

	// verify currency is rendered properly
	it("should load the page", function() {
		expect(takeScreenshot(element(by.id("content")))).toLookAs("initial_load");
	});
});
