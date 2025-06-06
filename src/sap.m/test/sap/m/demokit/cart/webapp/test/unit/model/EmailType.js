/* global QUnit*/

sap.ui.define([
	"sap/ui/demo/cart/model/EmailType"
], (EmailType) => {
	"use strict";

	QUnit.module("EmailType - parsing");

	QUnit.test("Should throw an error when the E-Mail address is not valid", (assert) => {
		// Act
		assert.throws(() => {
			new EmailType().validateValue("inf");
		}, "Should throw an error when the E-Mail address is not valid");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid", (assert) => {
		// Act
		assert.throws(() => {
			new EmailType().validateValue("info.bla");
		}, "Should throw an error was thrown when the E-Mail address is not valid");
	});

	QUnit.test("Should accept the value when it is a valid e-mail address", (assert) => {
		// Act
		new EmailType().validateValue("info@sap.com");
		assert.ok(true, "no exception has happened");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: empty field)", (assert) => {
		// Act
		assert.throws(() => {
			new EmailType().validateValue("");
		}, "Should throw an error when the E-Mail address is not valid (edge case: empty field)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: blank)", (assert) => {
		// Act
		assert.throws(() => {
			new EmailType().validateValue(" ");
		}, "Should throw an error when the E-Mail address is not valid (edge case: blank in field)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case:no value property)", (assert) => {
		// Act
		assert.throws(() => {
			new EmailType().validateValue(undefined);
		}, "Should throw an error when the E-Mail address is not valid (edge case:no value property)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: 5 characters)", (assert) => {
		// Act
		assert.throws(() => {
			new EmailType().validateValue("infor");
		}, "Should throw an error when the E-Mail address is not valid (edge case: 5 characters)");
	});

	QUnit.test("Should throw an error when the E-Mail address is not valid (edge case: 6 characters, but no valid format)", (assert) => {
		// Act
		assert.throws(() => {
			new EmailType().validateValue("in@f.o");
		}, "Should throw an error when the E-Mail address is not valid (edge case: 6 characters, but no valid format)");
	});

	QUnit.test("Should accept the value when it is a valid e-mail address", (assert) => {
		// Act
		new EmailType().validateValue("i@f.oo");
		assert.ok(true, "no exception has happened (6 characters value)");
	});
});