/*global describe,it,takeScreenshot,expect*/

describe("sap.m.ToggleButtonStandaloneVisual", function() {
	"use strict";

	it("Initial state - Cozy mode, Belize ToggleButtons", function() {
		expect(takeScreenshot()).toLookAs("initialState_cozy_Belize_ToggleButtons");
	});

});