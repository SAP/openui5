/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/each'], function(each) {
	"use strict";

	// custom assertion
	QUnit.assert.equalSets = function(a1,a2,message) {
		this.ok(a1 === a2 || (!!a1 && !!a2), "array either both must be null or both not null");
		if ( a1 && a2 ) {
			a1 = a1.slice().sort();
			a2 = a2.slice().sort();
			this.deepEqual(a1,a2, message);
		}
	};

	QUnit.module("sap.base.util.each");

	function testEach(assert, obj) {

		var	keys = [],
			values = [],
			result;

		function callback(i,v) {
			assert.ok(v == null || this == v, "context in the callback should be equal to the current item"); // simple equal, not strict equal due to object wrapping!
			keys.push(i);
			values.push(v);
		}

		result = each(obj, callback);

		assert.equal(result, obj, "return value should be the same as the given obj");

		return { keys : keys, values : values };

	}

	QUnit.test("dense array", function(assert) {
		var obj = ["a", "b", "c"];
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, [0,1,2], "keys should be the numeric indices");
		assert.deepEqual(result.values, ["a", "b", "c"], "values should match the array content");
	});

	QUnit.test("sparse array", function(assert) {
		var obj = [];
		obj.push("a");
		obj[5] = "c";
		obj[3] = "b";
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, [0, 1, 2, 3, 4, 5], "for sparse arrays, the keys should match the array length");
		assert.deepEqual(result.values, ["a", undefined, undefined, "b", undefined, "c"], "for sparse arrays, missing entries should be undefined");

	});

	QUnit.test("object with identifier properties", function(assert) {
		var obj = {a:"a", b:"b", c:"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["a","b","c"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values");
	});

	QUnit.test("object with out of order identifier properties", function(assert) {
		var obj = {z:"a", c:"b", m:"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["z","c","m"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values, order should match the order of creation");
	});

	QUnit.test("object with string literal properties", function(assert) {
		var obj = {"a a":"a", "b b":"b", "c c":"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["a a","b b","c c"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values");
	});

	QUnit.test("object with ordered num properties but w/o length", function(assert) {
		var obj = {1:"a", 2:"b", 3:"c"};
		var result = testEach(assert, obj);
		assert.deepEqual(result.keys, ["1","2","3"], "for objects, the keys should be the property names");
		assert.deepEqual(result.values, ["a", "b", "c"], "for objects, the iterated values should match the property values");
	});

	QUnit.test("object with out of order num properties and w/o length", function(assert) {
		var obj = {};
		obj[0] = "a";
		obj[5] = "c";
		obj[3] = "b";
		var result = testEach(assert, obj);
		assert.equalSets(result.keys, ["0", "5", "3"], "for objects, the keys should match the property names");
		assert.equalSets(result.values, ["a", "c", "b"], "for objects, the values should match the property values");
	});

	QUnit.test("object with num properties and with matching length", function(assert) {
		var obj = { length:3, 2:"c", 1:"b", 0:"a" };
		var result = testEach(assert, obj);
		assert.equalSets(result.keys, ["length", "2", "1", "0" ], "for objects, the keys should match the property names");
		assert.equalSets(result.values, [3, "c", "b", "a"], "for objects, the order of values should match the order of entries");
	});

	QUnit.test("object with num properties and with non-matching length", function(assert) {
		var obj = { length:5, 2:"c", 1:"b", 0:"a" };
		var result = testEach(assert, obj);
		assert.equalSets(result.keys, ["length", "2", "1", "0" ], "for objects, the keys should match the property names");
		assert.equalSets(result.values, [5, "c", "b", "a"], "for objects, the order of values should match the order of entries");
	});

});