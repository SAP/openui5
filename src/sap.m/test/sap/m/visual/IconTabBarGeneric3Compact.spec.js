/*global describe,it,element,by, require,browser*/

describe("sap.m.IconTabBarGeneric3Compact", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	var fnRunAllCases = require('./IconTabBarGeneric3Utils.js');

	//check tabDensityMode property = Compact
	it("should scroll to top", function() {
		browser.executeScript("document.getElementById('densityModeBox').scrollIntoView()");
		element(by.id("densityModeBox")).click();
	});

	fnRunAllCases("Comp");
});
