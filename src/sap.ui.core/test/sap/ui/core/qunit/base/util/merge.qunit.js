/*global QUnit */
sap.ui.define(["sap/base/util/merge"], function(merge) {
	"use strict";

	QUnit.module("sap/base/util/merge");

	QUnit.test("tests for deep extend object", function(assert) {
		var oOrig1 = {m: "c"};
		var oNested = {f: "dh"};
		var oOrig3 = {x: oNested};
		var oBaseObject = {};


		//deep clone
		var oMerged = merge(oBaseObject, oOrig1, oOrig3);
		oNested.f = "mod";
		oMerged.a = 5;
		assert.ok(oMerged, "should be there");
		assert.equal(oMerged.m, "c", "oOrig1 property should exist");
		assert.equal(oMerged.a, 5, "newly created property a should exist");
		assert.notEqual(oMerged.x, oNested, "Nested object should not be the same as it was cloned");
		assert.equal(oMerged.x.f, "dh", "Nested object value is independent from further modifications");


		assert.notOk(oOrig1.a, "should not exist");
	});

	QUnit.test("empty-object target", function(assert) {
		var oMerged = merge();
		assert.equal(typeof oMerged, "object", "object should exist");
	});

	QUnit.test("string target", function(assert) {
		var oMerged = merge("foo", { a: 1 });
		assert.deepEqual(oMerged, { a: 1 }, "target should default to object");
	});

	QUnit.test("null source", function(assert) {
		var oMerged = merge({}, null, { a: 1 });
		assert.deepEqual(oMerged, { a: 1 }, "null as source should be ignored");
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
		var oClone = merge({}, oMyObject);
		assert.equal(Object.keys(oClone).length, 6, "undefined property cloned");
		assert.equal(oMyObject.prop4, oClone.prop4, "property cloned successfully");
		assert.equal(oMyObject.prop5, oClone.prop5, "property cloned successfully");
		assert.equal(oMyObject.prop6.prop63, oClone.prop6.prop63, "property cloned successfully");
		assert.equal(oMyObject.prop6.prop64, oClone.prop6.prop64, "property cloned successfully");
	});

	QUnit.test("target with array insert plain object", function(assert) {

		var oOrig3 = {nested: [{}]};
		var oBaseObject = {nested: [{}]};

		var oMerged = merge(oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(oMerged.nested, "nested should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(typeof oMerged.nested[0], "object", "object should exist");

	});

	QUnit.test("target with array insert", function(assert) {

		var oOrig3 = {x: {nested: [1, "test"]}};
		var oBaseObject = {};

		var oMerged = merge(oBaseObject, oOrig3);
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

		var oMerged = merge(oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(oMerged.nested.length, 2, "nested array should contain 2 values");
		assert.equal(oMerged.nested[0], 1, "nested array value should be overwritten");

	});

	QUnit.test("target with array in array merge", function(assert) {

		var oOrig3 = {nested: [1, "test", ["inner"]]};
		var oBaseObject = {};

		var oMerged = merge(oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(oMerged.nested, "nested should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(oMerged.nested[0], 1, "nested array value should be 1");
		assert.equal(oMerged.nested[2][0], "inner", "inner nested array value should inner test");
	});

	QUnit.test("merge Object.prototype pollution", function(assert) {

		var src = JSON.parse('{"__proto__": {"x":42}}');
		var oBaseObject = {};

		merge(oBaseObject, src);

		assert.ok(!("x" in {}), "Object.prototype not polluted");
	});

	QUnit.test("merge object with prototype", function(assert) {
		var oBaseObject = {};
		var oObjectWithProto = Object.create({ foo: Object.create({ bar: true }) });

		merge(oBaseObject, oObjectWithProto);

		assert.deepEqual(oBaseObject, { foo: { bar: true } }, "Properties from prototype is also cloned");
	});
});
