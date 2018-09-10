/*global describe,it,element,by,takeScreenshot,expect,protractor*/

describe("sap.m.Title", function() {
	"use strict";
	// initial loading

	it("should load test page", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	// wrappingType (hyphenation)
	it("should visualize hyphenation", function () {
		var t1 = element(by.id('title0'));
		element(by.id('setting8')).sendKeys('310px');
		element(by.id('setting12')).click();

		// delete "Normal" and type "Hyphenated"
		for (var index = 0; index < 6; index++) {
			element(by.id('setting13')).sendKeys(protractor.Key.BACK_SPACE);
		}
		element(by.id('setting13')).sendKeys('Hyphenated');
		element(by.id('setting13')).sendKeys(protractor.Key.ENTER);

		expect(takeScreenshot(t1)).toLookAs("1_hyphenation");
	});

	// todo: add tests for all other cases (BI 882)
});