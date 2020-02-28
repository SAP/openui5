/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString"
],
function (
	isValidBindingString
) {
	"use strict";

	QUnit.module("Base functionality", function () {
		QUnit.test("When a plain string is provided", function (assert) {
			assert.ok(isValidBindingString("Foo"));
		});

		QUnit.test("When a plain string is provided and plain strings are forbidden", function (assert) {
			assert.notOk(isValidBindingString("Foo", false));
		});

		QUnit.test("When an empty string is provided", function (assert) {
			assert.ok(isValidBindingString(""));
		});

		QUnit.test("When an empty string is provided and plain strings are forbidden", function (assert) {
			assert.notOk(isValidBindingString("", false));
		});

		QUnit.test("When a binding string is provided", function (assert) {
			assert.ok(isValidBindingString("{Foo}"));
		});

		QUnit.test("When an invalid binding string is provided", function (assert) {
			assert.notOk(isValidBindingString("{Foo"));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
