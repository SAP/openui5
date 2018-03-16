/*global QUnit */
sap.ui.define(["sap/base/util/extend"], function(extend) {
	"use strict";

	QUnit.module("object extension");

	QUnit.test("tests for deep extend object", function(assert) {
		var oOrig1 = {m: "c"};
		var oNested = {f: "dh"};
		var oOrig3 = {x: oNested};
		var oBaseObject = {};


		//deep clone
		var oMerged = extend(true, oBaseObject, oOrig1, oOrig3);
		oNested.f = "mod";
		oMerged.a = 5;
		assert.ok(oMerged, "should be there");
		assert.equal(oMerged.m, "c", "oOrig1 property should exist");
		assert.equal(oMerged.a, 5, "newly created property a should exist");
		assert.notEqual(oMerged.x, oNested, "Nested object should not be the same as it was cloned");
		assert.equal(oMerged.x.f, "dh", "Nested object value is independent from further modifications");


		assert.notOk(oOrig1.a, "should not exist");
	});


	QUnit.test("weak extend object", function(assert) {
		var nested = {g: "gg"};
		var oOrig1 = {my: nested};
		var oBaseObject = {};

		//weak clone
		var oMerged = extend(false, oBaseObject, oOrig1);
		nested.g = "mod";
		oMerged.a = 5;
		assert.ok(oMerged, "should be there");
		assert.equal(oMerged.my.g, "mod", "property was modified and since " +
			"it is a weak reference the merged object contains it");
		assert.equal(oMerged.a, 5, "newly created property a should exist");

		assert.notOk(oOrig1.a, "should not exist");

	});

	QUnit.test("non-object target", function(assert) {

		var oMerged = extend(5);
		assert.equal(typeof oMerged, "object", "object should exist");

	});

	QUnit.test("empty-object target", function(assert) {

		var oMerged = extend(true);
		assert.equal(typeof oMerged, "object", "object should exist");

	});

	QUnit.test("target with array insert plain object", function(assert) {

		var oOrig3 = {nested: [{}]};
		var oBaseObject = {nested: [{}]};

		var oMerged = extend(true, oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(oMerged.nested, "nested should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(typeof oMerged.nested[0], "object", "object should exist");

	});

	QUnit.test("target with array insert", function(assert) {

		var oOrig3 = {x: {nested: [1, "test"]}};
		var oBaseObject = {};

		var oMerged = extend(true, oBaseObject, oOrig3);
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

		var oMerged = extend(true, oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(oMerged.nested.length, 2, "nested array should contain 2 values");
		assert.equal(oMerged.nested[0], 1, "nested array value should be overwritten");

	});

	QUnit.test("target with array in array merge", function(assert) {

		var oOrig3 = {nested: [1, "test", ["inner"]]};
		var oBaseObject = {};

		var oMerged = extend(true, oBaseObject, oOrig3);
		assert.ok(oMerged, "should be there");
		assert.ok(oMerged.nested, "nested should be there");
		assert.ok(Array.isArray(oMerged.nested), "nested object should be an array");
		assert.equal(oMerged.nested[0], 1, "nested array value should be 1");
		assert.equal(oMerged.nested[2][0], "inner", "inner nested array value should inner test");
	});


	QUnit.test("endless loop with recursion(-1)", function(assert) {

		var oOrig1 = {m: "c"};
		oOrig1.loop = oOrig1;
		var oBaseObject = {};


		var oMerged = extend(oBaseObject, oOrig1);
		assert.equal(typeof oMerged, "object", "5 property should exist");
		assert.ok(oMerged.loop, "property should exist");
		assert.equal(typeof oMerged.loop, "object", "property should be an object");

	});

	QUnit.test("endless loop with merged contains base object", function(assert) {

		var oOrig1 = {m: "c"};
		var oBaseObject = {};
		oOrig1.loop = oBaseObject;


		var oMerged = extend(oBaseObject, oOrig1);
		assert.equal(typeof oMerged, "object", "same base object");
		assert.notOk(oMerged.loop, "property loop should not exist");
	});


	QUnit.test("endless loop cross references", function(assert) {

		var oOrig1 = {mx: "c"};
		var oOrig2 = {mc: "c"};
		oOrig1.o2 = oOrig2;
		oOrig2.o1 = oOrig1;
		var oBaseObject = {};


		var oMerged = extend(oBaseObject, oOrig1, oOrig2);
		assert.equal(typeof oMerged, "object", "object should exist");
		assert.ok(oMerged.o1, "property should exist");
		assert.equal(typeof oMerged.o1, "object", "cross reference property should exist");

		assert.ok(oMerged.o2, "property should exist");
		assert.equal(typeof oMerged.o2, "object", "cross reference property should exist");

	});
});
