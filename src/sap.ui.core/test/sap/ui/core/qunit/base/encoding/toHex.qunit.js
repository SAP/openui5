/*global QUnit */
sap.ui.define(["sap/base/encoding/toHex"], function(toHex) {
	"use strict";

	QUnit.module("Transform to hex");
	// Hex context
	QUnit.test("transform to hex", function(assert){
		assert.equal(toHex("§$%&/(SDFGH2134"), "§$%&/(SDFGH2134", "not escaped characters");
	});

});
