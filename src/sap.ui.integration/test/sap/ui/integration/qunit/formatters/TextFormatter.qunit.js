/* global QUnit */
sap.ui.define([
	"sap/ui/integration/formatters/TextFormatter"
],
function (
	TextFormatter
) {
	"use strict";

	QUnit.module("TextFormatter");

	QUnit.test("Format text with placeholders", function (assert) {
		var sFormatted = TextFormatter.text("Hello {0}!", ["World"]);
		assert.strictEqual(sFormatted, "Hello World!", "Placeholder is filled");
	});

});
