/*global QUnit */
sap.ui.define([
	'sap/ui/base/OwnStatics'
], function(OwnStatics) {
	"use strict";

	QUnit.module("OwnStatics");

	QUnit.test("should store and retrieve statics per class", function(assert) {
		class A {}
		const oStaticData = { foo: "bar" };

		OwnStatics.set(A, oStaticData);
		const oResult = OwnStatics.get(A);

		assert.deepEqual(oResult, oStaticData, "Correct static data was retrieved.");
	});

	QUnit.test("should freeze the static object", function(assert) {
		class B {}
		const oStaticData = { key: "value" };

		OwnStatics.set(B, oStaticData);

		assert.throws(function() {
			oStaticData.key = "newValue";
		}, /Cannot assign to read only property/, "The static object is frozen and cannot be modified.");
	});

	QUnit.test("should throw error when setting statics twice for same class", function(assert) {
		class C {}
		const oFirst = { one: 1 };
		const oSecond = { two: 2 };

		OwnStatics.set(C, oFirst);

		assert.throws(function() {
			OwnStatics.set(C, oSecond);
		}, /can only be defined once/, "Throws when attempting to set statics twice.");
	});

	QUnit.test("should return undefined if statics were not set", function(assert) {
		class D {}

		const oResult = OwnStatics.get(D);
		assert.strictEqual(oResult, undefined, "Returns undefined if no statics are set.");
	});
});
