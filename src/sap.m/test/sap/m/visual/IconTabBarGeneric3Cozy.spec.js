/*global describe,it,require,takeScreenshot,expect,browser*/

describe("sap.m.IconTabBarGeneric3Cozy", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	var fnRunAllCases = require('./IconTabBarGeneric3Utils.js');

	// initial loading
	it("should load test page", function(){
		expect(takeScreenshot()).toLookAs("0_initial");
	});

	//check tabDensityMode property = Cozy
	fnRunAllCases("Coz");
});
