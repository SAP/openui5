/*global describe,it,takeScreenshot,browser,expect*/

describe("sap.m.Button_Standalone_Visual", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.Button';

	it("Initial state - Cozy mode, Belize Buttons1", function() {
		expect(takeScreenshot()).toLookAs("initialState_cozy_Belize_buttons1");
	});

});