/*global require, describe,it,element,by,browser*/

describe("sap.m.IconTabBarInheritCompact", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	var fnRunAllCases = require('./IconTabBarUtils.js');

	// check tabDensityMode property = Inherit when the page is in Compact density mode
	it("should scroll to top", function() {
		browser.executeScript("document.getElementById('RBGTabDensityMode').scrollIntoView()");
		element(by.id("RB9-Inherit")).click();
		element(by.id("densityModeBox")).click();
	});

	fnRunAllCases("ICp");
});
