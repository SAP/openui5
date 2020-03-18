/* global QUnit */

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/unset"
], function(
	unset
) {
	"use strict";

	QUnit.module("Base functionality", function() {
		QUnit.test("When a path is unset", function(assert) {
			var oOriginalObject = {
				foo: 1,
				bar: 2,
				baz: 3
			};
			var oCleanedObject = unset(oOriginalObject, ["foo"]);
			assert.deepEqual(
				oCleanedObject,
				{
					bar: 2,
					baz: 3
				},
				"Then the property is removed"
			);
			assert.strictEqual(
				oOriginalObject,
				oCleanedObject,
				"Then the original object is mutated"
			);
		});

		QUnit.test("When the last remaining property is unset", function(assert) {
			var oOriginalObject = {
				foo: 1
			};
			var oCleanedObject = unset(oOriginalObject, ["foo"]);
			assert.deepEqual(
				oCleanedObject,
				{},
				"Then an empty object remains"
			);
		});

		QUnit.test("When no key for the provided path exists", function(assert) {
			var oOriginalObject = {
				foo: 1
			};
			var oCleanedObject = unset(oOriginalObject, ["bar"]);
			assert.deepEqual(
				oCleanedObject,
				{
					foo: 1
				},
				"Then the object is not modified"
			);
		});

		QUnit.test("When no item for the provided index exists", function(assert) {
			var oOriginalObject = [];
			var oCleanedObject = unset(oOriginalObject, ["0"]);
			assert.deepEqual(
				oCleanedObject,
				[],
				"Then the array is not modified"
			);
		});

		QUnit.test("When an array item index is unset", function(assert) {
			var aOriginalArray = ["foo", "bar", "baz"];
			var aCleanedArray = unset(aOriginalArray, ["1"]);
			assert.deepEqual(
				aCleanedArray,
				["foo", "baz"],
				"Then the item is removed"
			);
		});

		QUnit.test("When the last array item is unset", function(assert) {
			var aOriginalArray = ["foo"];
			var aCleanedArray = unset(aOriginalArray, ["0"]);
			assert.deepEqual(
				aCleanedArray,
				[],
				"Then an empty array remains"
			);
		});

		QUnit.test("When a path in a nested object is unset", function(assert) {
			var oOriginalObject = {
				foo: [{
					bar: {
						baz: true
					}
				}],
				foo2: true
			};
			var oCleanedObject = unset(oOriginalObject, ["foo", "0", "bar", "baz"]);
			assert.deepEqual(
				oCleanedObject,
				{
					foo2: true
				},
				"Then empty parents are removed"
			);
		});

		QUnit.test("When a path in a nested object is unset and a max depth is specified", function(assert) {
			var oOriginalObject = {
				foo: [{
					bar: {
						baz: true
					}
				}],
				foo2: true
			};
			var oCleanedObject = unset(oOriginalObject, ["foo", "0", "bar", "baz"], 2);
			assert.deepEqual(
				oCleanedObject,
				{
					foo: [],
					foo2: true
				},
				"Then empty parents are removed until the max depth is reached"
			);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
