/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsPatternMatch"
], function (
	IsPatternMatch
) {
	"use strict";

	QUnit.module("Base functionality", function () {
		QUnit.test("When the value matches the pattern", function (assert) {
			assert.ok(
				IsPatternMatch.validate(
					"test",
					{
						pattern: "test"
					}
				)
			);
		});

		QUnit.test("When the value doesn't match the pattern", function (assert) {
			assert.notOk(
				IsPatternMatch.validate(
					"TEST",
					{
						pattern: "test"
					}
				)
			);
		});

		QUnit.test("When exact matches are not required and the value contains a matching string", function (assert) {
			assert.ok(
				IsPatternMatch.validate(
					"validtest",
					{
						pattern: "test",
						exactMatch: false
					}
				)
			);
		});

		QUnit.test("When exact matches are not required and the value contains a matching string", function (assert) {
			assert.notOk(
				IsPatternMatch.validate(
					"notvalid",
					{
						pattern: "test",
						exactMatch: false
					}
				)
			);
		});

		QUnit.test("When a modifier is provided", function (assert) {
			assert.ok(
				IsPatternMatch.validate(
					"TEST",
					{
						pattern: "test",
						modifiers: "i"
					}
				)
			);
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
