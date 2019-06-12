/*global QUnit */
sap.ui.define(["sap/base/util/extend"], function(extend) {
	"use strict";

	QUnit.module("sap/base/util/extend");

	QUnit.test("tests for shallow extend object", function(assert) {
		var oOrig1 = {m: "c"};
		var oNested = {f: "dh"};
		var oOrig3 = {x: oNested};
		var oBaseObject = {};


		//shallow clone
		var oMerged = extend(oBaseObject, oOrig1, oOrig3);
		oNested.f = "mod";
		oMerged.a = 5;
		assert.ok(oMerged, "should be there");
		assert.equal(oMerged.m, "c", "oOrig1 property should exist");
		assert.equal(oMerged.a, 5, "newly created property a should exist");
		assert.strictEqual(oMerged.x, oNested, "Nested object should be the same");
		assert.equal(oMerged.x.f, "mod", "Nested object value was changed via reference");


		assert.notOk(oOrig1.a, "should not exist");
	});

	QUnit.test("empty-object target", function(assert) {
		var oMerged = extend();
		assert.equal(typeof oMerged, "object", "object should exist");
	});

	QUnit.test("undefined/null properties", function(assert) {
		var oMyObject = {
			prop1: "test",
			prop2: [0,1,2],
			prop3: 2,
			prop4: null,
			prop5: undefined,
			prop6: {
				prop61:"test",
				prop62:[0,2,3],
				prop63: undefined,
				prop64: null,
				prop65: 2
			}
		};
		var oClone = extend({}, oMyObject);
		assert.equal(oClone.prop4, null, "null property cloned");
		assert.equal(Object.keys(oClone).length, 5, "undefined property not cloned");
		assert.equal(Object.keys(oClone.prop6).length, 5, "undefined property cloned (shallow copy)");
		assert.equal(oClone.prop6.prop63, undefined, "undefined property cloned");
		assert.equal(oClone.prop6.prop64, null, "null property cloned");
	});

	QUnit.test("target with array insert plain object", function(assert) {

		var oOrig3 = {nested: [{}]};
		var oBaseObject = {nested: [{}]};

		var oMerged = extend(oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(oMerged.nested, "nested should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(typeof oMerged.nested[0], "object", "object should exist");

	});

	QUnit.test("target with array insert", function(assert) {

		var oOrig3 = {x: {nested: [1, "test"]}};
		var oBaseObject = {};

		var oMerged = extend(oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(oMerged.x, "x should be there");
		assert.ok(oMerged.x.nested, "nested should be there");
		assert.ok(Array.isArray(oMerged.x.nested), "nested object should be an array");
		assert.equal(oMerged.x.nested[0], 1, "nested array value should be 1");
		assert.equal(oMerged.x.nested[1], "test", "nested array value should be test");

	});

	QUnit.test("target with array merge", function(assert) {

		var oOrig3 = {nested: [1, "test1"]};
		var oBaseObject = {nested: [2, "test2"]};

		var oMerged = extend(oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(oMerged.nested.length, 2, "nested array should contain 2 values");
		assert.equal(oMerged.nested[0], 1, "nested array value should be overwritten");

	});

	QUnit.test("target with array in array merge", function(assert) {

		var oOrig3 = {nested: [1, "test", ["inner"]]};
		var oBaseObject = {};

		var oMerged = extend(oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(oMerged.nested, "nested should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(oMerged.nested[0], 1, "nested array value should be 1");
		assert.equal(oMerged.nested[2][0], "inner", "inner nested array value should inner test");
	});

	QUnit.test("merge Object.prototype pollution", function(assert) {

		var src = JSON.parse('{"__proto__": {"x":42}}');
		var oBaseObject = {};

		extend(oBaseObject, src);

		assert.ok(!("x" in {}), "Object.prototype not polluted");
	});

	QUnit.test("merge object with prototype", function(assert) {
		var oBaseObject = {};
		var oObjectWithProto = Object.create({ foo: Object.create({ bar: true }) });

		extend(oBaseObject, oObjectWithProto);

		assert.deepEqual(oBaseObject, { foo: { bar: true } }, "Properties from prototype is also cloned");
	});
});
