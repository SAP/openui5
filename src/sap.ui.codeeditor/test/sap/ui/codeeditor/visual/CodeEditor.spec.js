/* global describe, it, takeScreenshot, expect */

describe("sap.ui.codeeditor.CodeEditor", function() {
	"use strict";

	it("should see the code editor", function () {
		expect(takeScreenshot()).toLookAs("0_initial");
	});

});