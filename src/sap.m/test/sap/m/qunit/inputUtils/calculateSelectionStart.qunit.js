/*global QUnit */
sap.ui.define([
	"sap/m/library",
	"sap/m/inputUtils/calculateSelectionStart",
	"sap/ui/Device"
], function (
	mobileLibrary,
	calculateSelectionStart,
	Device
) {
	"use strict";

	QUnit.test("calculateSelectionStart", function (assert) {
		// Act
		calculateSelectionStart();

		// Assert
		assert.ok(true, "Should not throw an error, when no parameters are passed");
		assert.strictEqual(calculateSelectionStart({}), 0, "Should return the first position, when no item and typed text.");
		assert.strictEqual(calculateSelectionStart({start: 4, end: 4}, "Test"), 0, "Should return the first position, when no typed text.");
		assert.strictEqual(calculateSelectionStart({start: 4, end: 4}, "Test", "T"), 0, "Should return the first position, when no previous selection is made.");
		assert.strictEqual(calculateSelectionStart({start: 4, end: 4}, "Test", "T", true), 4, "Should return the value length as an end position.");
		assert.strictEqual(calculateSelectionStart({start: 2, end: 4}, "Test", "Te"), 2, "Should return the position after the typed characters.");
		assert.strictEqual(calculateSelectionStart({start: 2, end: 4}, "Test", "Te", true), 2, "Should return the position after the typed characters.");
		assert.strictEqual(calculateSelectionStart({start: 1, end: 1}, "", "P"), 0, "Should return the first position, when no item is found.");
		assert.strictEqual(calculateSelectionStart({start: 1, end: 1}, "Gosho", "P"), 0, "Should return the first position, when no item is found.");
		assert.strictEqual(calculateSelectionStart({start: 1, end: 1}, "", "P", true), 0, "Should return the first position, when no item is found.");
	});
});
