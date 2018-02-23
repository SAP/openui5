/* global QUnit*/

sap.ui.require([
	"sap/ui/demo/cart/model/emailType"
],
function (emailType) {
	"use strict";
	QUnit.module("emailType - parsing");
	QUnit.test("Should throw an error when the E-Mail address is not valid", function (assert) {
		// Act
		assert.throws(function () {
			new emailType().validateValue("inf");
		}, "Should throw an error when the E-Mail address is not valid");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid", function (assert) {
		// Act
		assert.throws(function () {
			new emailType().validateValue("info.bla");
		}, "Should throw an error was thrown when the E-Mail address is not valid");
	});

	QUnit.test("Should accept the value when it is a valid e-mail address", function (assert) {
		// Act
		new emailType().validateValue("info@sap.com");
		assert.ok(true, "no exception has happened");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: empty field)", function (assert) {
		// Act
		assert.throws(function () {
			new emailType().validateValue("");
		}, "Should throw an error when the E-Mail address is not valid (edge case: empty field)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: blank)", function (assert) {
		// Act
		assert.throws(function () {
			new emailType().validateValue(" ");
		}, "Should throw an error when the E-Mail address is not valid (edge case: blank in field)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case:no value property)", function (assert) {
		// Act
		assert.throws(function () {
			new emailType().validateValue(undefined);
		}, "Should throw an error when the E-Mail address is not valid (edge case:no value property)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: 5 characters)", function (assert) {
		// Act
		assert.throws(function () {
			new emailType().validateValue("infor");
		}, "Should throw an error when the E-Mail address is not valid (edge case: 5 characters)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: 6 characters, but no valid format)", function (assert) {
		// Act
		assert.throws(function () {
			new emailType().validateValue("in@f.o");
		}, "Should throw an error when the E-Mail address is not valid (edge case: 6 characters, but no valid format)");
	});

	QUnit.test("Should accept the value when it is a valid e-mail address", function (assert) {
		// Act
		new emailType().validateValue("i@f.oo");
		assert.ok(true, "no exception has happened (6 characters value)");
	});
});
