/*global require, describe,it,element,by,browser*/

describe("sap.m.IconTabBarInheritCozy", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	var fnRunAllCases = require('./IconTabBarUtils.js');

	//check tabDensityMode property = Inherit when the page is in Cozy density mode
	it("should scroll to top", function() {
		browser.executeScript("document.getElementById('RBGTabDensityMode').scrollIntoView()");
		element(by.id("RB9-Inherit")).click();
	});
	fnRunAllCases("ICz");
});
