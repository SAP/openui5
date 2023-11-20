/*global QUnit */
sap.ui.define(["sap/base/strings/toHex"], function(toHex) {
	"use strict";

	QUnit.module("Transform to hex");
	// Hex context
	QUnit.test("transform to hex", function(assert){
		assert.equal(toHex("§$%&/(SDFGH2134"), "§$%&/(SDFGH2134", "not escaped characters");
		assert.equal(toHex(34, 2), "22", "number without padding");
		assert.equal(toHex(16, 2), "10", "number without padding");
		assert.equal(toHex(1, 2), "01", "padded zeros");
		assert.equal(toHex(10, 2), "0a", "padded zeros");
	});

});
