/*global QUnit */
sap.ui.define(["sap/base/strings/whitespaceReplacer"], function(whitespaceReplacer) {
	"use strict";

	QUnit.module("Whitespace to Unicode");

	QUnit.test("Base Conversion", function(assert) {
		var sText = "Text with 5     whitespaces";

		assert.strictEqual(whitespaceReplacer(sText), "Text with 5 \u00A0 \u00A0 whitespaces", "Default conversion to \\u00A0 (NO-BREAK SPACE) character.");
	});

	QUnit.test("Convert tabs", function(assert) {
		var sText = "Text with 2\t\ttabs";

		assert.strictEqual(whitespaceReplacer(sText), "Text with 2 \u00A0 \u00A0tabs", "Convert explicitly to \\u00A0 (NO-BREAK SPACE) character. Tab is 2 spaces wide.");
	});

	QUnit.test("Mixed conversion", function(assert) {
		var sText = "Text with 5     whitespaces and 2\t\ttabs";

		assert.strictEqual(whitespaceReplacer(sText), "Text with 5 \u00A0 \u00A0 whitespaces and 2 \u00A0 \u00A0tabs", "Should convert properly tabs & spaces.");
	});
});