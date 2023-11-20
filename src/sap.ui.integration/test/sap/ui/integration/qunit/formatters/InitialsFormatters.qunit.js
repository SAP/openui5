/* global QUnit */
sap.ui.define([
		"sap/ui/integration/formatters/InitialsFormatter"
	],
	function (
		InitialsFormatter
	) {
		"use strict";

		QUnit.module("InitialsFormatter");

		QUnit.test("Format name to initials", function (assert) {
			var sFormatted = InitialsFormatter.initials("John Doe");
			assert.strictEqual(sFormatted, "JD", "Initials are correct");
		});

		QUnit.test("Format name to initials with length of 3 characters", function (assert) {
			var sFormatted = InitialsFormatter.initials("John Doe Doe Miller", 3);
			assert.strictEqual(sFormatted, "JDD", "Initials are correct");
		});

		QUnit.test("Format name to initials using default value", function (assert) {
			var sFormatted = InitialsFormatter.initials("John Doe Doe Miller");
			assert.strictEqual(sFormatted, "JM", "Initials are correct");
		});
	});
