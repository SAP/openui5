/*global require,describe,browser*/

describe("sap.m.IconTabBarCozy", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.IconTabBar';

	var fnRunAllCases = require('./IconTabBarUtils.js');

	//check tabDensityMode property = Cozy
	fnRunAllCases("Cz");
});
