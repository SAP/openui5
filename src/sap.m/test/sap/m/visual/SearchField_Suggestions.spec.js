/*global describe,it,element,by,takeScreenshot,expect,browser*/

describe("sap.m.SearchField_Suggestions", function () {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.SearchField';

	it("Should load test page", function() {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	it("Should open suggestions", function() {
		element(by.id("SF1")).click();
		expect(takeScreenshot()).toLookAs("1_suggestions");
	});

	// TODO: extend those tests with screenshots with result of different buttons pressed ("OK", "X", magnifier)
	// when Visual tests are actually monitored on mobiles
});