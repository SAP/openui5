/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/hasTag"
], function(
	hasTag
) {
	"use strict";

	QUnit.module("Base functionality", function() {
		QUnit.test("when called with an existent tag as a string", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						tags: ["foo", "bar"]
					},
					"foo"
				),
				true,
				"then tag `foo` is successfully identified"
			);
		});

		QUnit.test("when called with an existent tag as an array", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						tags: ["foo", "bar"]
					},
					["foo"]
				),
				true,
				"then tag `foo` is successfully identified"
			);
		});

		QUnit.test("when called with a non-existent tag as a string", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						tags: ["foo", "bar"]
					},
					"baz"
				),
				false,
				"then tag `baz` is not found"
			);
		});

		QUnit.test("when called with a non-existent tag as an array", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						tags: ["foo", "bar"]
					},
					["baz"]
				),
				false,
				"then tag `baz` is not found"
			);
		});

		QUnit.test("when called with an existent set of tags", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						tags: ["foo", "bar", "baz"]
					},
					["foo", "baz"]
				),
				true,
				"then tags `foo` and `baz` are successfully identified"
			);
		});

		QUnit.test("when called with a set of tags and one of the tags doesn't exist", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						tags: ["foo", "bar", "baz"]
					},
					["foo", "www"]
				),
				false,
				"then `www` is not found"
			);
		});

		QUnit.test("when called with an object without a `tags` property", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						prop1: "value1"
					},
					["foo"]
				),
				false,
				"then `foo` is not found"
			);
		});

		QUnit.test("when called with an object with a `tags` property as a string", function (assert) {
			assert.strictEqual(
				hasTag(
					{
						tags: "foo"
					},
					"foo"
				),
				false,
				"then `foo` is not found"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
