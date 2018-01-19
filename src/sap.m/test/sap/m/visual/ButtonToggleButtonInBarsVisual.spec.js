/*global describe,it,takeScreenshot,browser,expect*/

describe("sap.m.ButtonToggleButtonInBarsVisual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Button';

	it("Initial state - Cozy mode, Belize Buttons in Bars", function() {
		expect(takeScreenshot()).toLookAs("initialState_cozy_Belize_Buttons_in_bars");
	});

});