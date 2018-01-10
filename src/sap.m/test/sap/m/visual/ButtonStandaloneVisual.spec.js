/*global describe,it,takeScreenshot,expect*/

describe("sap.m.ButtonStandaloneVisual", function() {
	"use strict";

	it("Initial state - Cozy mode, Belize Buttons1", function() {
		expect(takeScreenshot()).toLookAs("initialState_cozy_Belize_buttons1");
	});

});