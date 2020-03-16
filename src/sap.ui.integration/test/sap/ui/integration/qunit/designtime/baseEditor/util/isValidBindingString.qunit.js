/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString"
], function (
	isValidBindingString
) {
	"use strict";

	QUnit.module("Given plain strings are allowed", function () {
		QUnit.test("When a plain string is provided", function (assert) {
			assert.ok(isValidBindingString("Foo"));
		});

		QUnit.test("When an empty string is provided", function (assert) {
			assert.ok(isValidBindingString(""));
		});

		QUnit.test("When an invalid binding string is provided", function (assert) {
			assert.notOk(isValidBindingString("{Foo"));
		});
	});

	QUnit.module("Given plain strings are forbidden", function () {
		QUnit.test("When a plain string is provided", function (assert) {
			assert.notOk(isValidBindingString("Foo", false));
		});

		QUnit.test("When an empty string is provided", function (assert) {
			assert.notOk(isValidBindingString("", false));
		});

		QUnit.test("When a valid placeholder is provided", function (assert) {
			assert.ok(isValidBindingString("{{foo}}", false));
		});

		QUnit.test("When placeholders are wrapped inside a plain string", function (assert) {
			assert.ok(isValidBindingString("Test {{foo}} {= format.percent({{bar}})}.", false));
		});

		QUnit.test("When multiple placeholders are provided", function (assert) {
			assert.ok(isValidBindingString("{{Foo}} {{Bar}}", false));
		});

		QUnit.test("When a placeholder inside an expression binding is provided", function (assert) {
			assert.ok(isValidBindingString("{= format.percent({{foo}})}", false));
		});

		QUnit.test("When an invalid placeholder inside an expression binding is provided", function (assert) {
			assert.notOk(isValidBindingString("{= format.percent({{{brokenPlaceholder}})}", false));
		});

		QUnit.test("When a binding string is provided", function (assert) {
			assert.ok(isValidBindingString("{Foo}", false));
		});

		QUnit.test("When a placeholder is nested inside a binding", function (assert) {
			assert.ok(isValidBindingString("{{{Foo}}}", false));
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
