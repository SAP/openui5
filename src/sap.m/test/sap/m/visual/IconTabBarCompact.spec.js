/*global require, describe,it,element,by,browser*/

describe("sap.m.IconTabBarCompact", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	var fnRunAllCases = require('./IconTabBarUtils.js');

	//check tabDensityMode property = Compact
	it("should scroll to top", function() {
		browser.executeScript("document.getElementById('RBGTabDensityMode').scrollIntoView()");
		element(by.id("RB8-Compact")).click();
	});
	fnRunAllCases("Cp");
});
