/*global describe,it,takeScreenshot,expect*/

describe("sap.m.ButtonToggleButtonInBarsVisual", function() {
	"use strict";

	it("Initial state - Cozy mode, Belize Buttons in Bars", function() {
		expect(takeScreenshot()).toLookAs("initialState_cozy_Belize_Buttons_in_bars");
	});

});