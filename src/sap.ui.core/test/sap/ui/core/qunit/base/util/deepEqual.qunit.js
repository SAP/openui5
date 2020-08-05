/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/deepEqual'], function(deepEqual) {
	"use strict";

	QUnit.module("sap.base.util.deepEqual");

	QUnit.test("basic test", function(assert) {
		assert.equal(deepEqual(0, 0), true, "number");
		assert.equal(deepEqual(0, 1), false, "number");
		assert.equal(deepEqual(true, true), true, "boolean");
		assert.equal(deepEqual(true, false), false, "boolean");
		assert.equal(deepEqual("test", "test"), true, "string");
		assert.equal(deepEqual("foo", "bar"), false, "string");
		assert.equal(deepEqual([1, 2], [1, 2]), true, "array");
		assert.equal(deepEqual([1, 2], [1, 2, 3]), false, "array");
		assert.equal(deepEqual({a:1, b:2}, {a:1, b:2}), true, "object");
		assert.equal(deepEqual({a:1, b:2}, {b:1, c:2}), false, "object");
		assert.equal(deepEqual(null, null), true, "null");
		assert.equal(deepEqual(null, 0), false, "null");
		assert.equal(deepEqual(undefined, undefined), true, "undefined");
		assert.equal(deepEqual(undefined, null), false, "undefined");
		assert.equal(deepEqual(new Date(234), new Date(234)), true, "Date");
		assert.equal(deepEqual(new Date(234), new Date(2345)), false, "Date");
	});

	QUnit.test("contains test", function(assert) {
		assert.equal(deepEqual([1, 2], [1, 2], true), true, "equal array");
		assert.equal(deepEqual([1, NaN, 3], [1, NaN, 3], true), true, "equal array with NaN");
		assert.equal(deepEqual([1, 2], [2, 1], true), false, "different array");
		assert.equal(deepEqual([1, 2], [1, 2, 3], true), true, "contained array");
		assert.equal(deepEqual([NaN, 2], [NaN, 2, 3], true), true, "contained array with NaN");
		assert.equal(deepEqual([1, 2, 3, 4], [1, 2, 3], true), false, "not contained array");
		assert.equal(deepEqual({a:1, b:2}, {a:1, b:2}, true), true, "equal object");
		assert.equal(deepEqual({a:NaN, b:2}, {a:NaN, b:2}, true), true, "equal object with NaN");
		assert.equal(deepEqual({a:1, b:2}, {a:2, b:1}, true), false, "different object values");
		assert.equal(deepEqual({a:1, b:2}, {a:1, c:2}, true), false, "different property names");
		assert.equal(deepEqual({a:1, b:2}, {a:1, b:2, c:3}, true), true, "contained object");
		assert.equal(deepEqual({a:1, b:NaN}, {a:1, b:NaN, c:3}, true), true, "contained object with NaN");
		assert.equal(deepEqual({a:1, b:2, c:3, d:4}, {a:1, b:2, c:3}, true), false, "not contained object");
	});

	QUnit.test("boolean test", function(assert) {
		assert.equal(deepEqual(true, true), true, "true, true");
		assert.equal(deepEqual(true, false), false, "true, false");
		assert.equal(deepEqual(false, true), false, "false, true");
		assert.equal(deepEqual(false, false), true, "false, false");
		assert.equal(deepEqual(false, 0), false, "false, 0");
		assert.equal(deepEqual(false, null), false, "false, null");
		assert.equal(deepEqual(false, "false"), false, "false, \"false\"");
		assert.equal(deepEqual(false, []), false, "false, []");
	});

	QUnit.test("number test", function(assert) {
		assert.equal(deepEqual(0, 0), true, "0, 0");
		assert.equal(deepEqual(1, 0), false, "1, 0");
		assert.equal(deepEqual(0, -1), false, "0, -1");
		assert.equal(deepEqual(0xff, 255), true, "0xff, 255");
		assert.equal(deepEqual(23, "23"), false, "23, \"23\"");
		assert.equal(deepEqual(false, 0), false, "false, 0");
		assert.equal(deepEqual(0, null), false, "0, null");
		assert.equal(deepEqual(1, []), false, "1, []");
		assert.equal(deepEqual(NaN, NaN), true, "NaN is equal to itself");
		assert.equal(deepEqual(Infinity, Infinity), true, "Infinity is equal to itself");
		assert.equal(deepEqual(-Infinity, -Infinity), true, "Negative Infinity is equal to itself");
		assert.equal(deepEqual(-Infinity, Infinity), false, "Negative Infinity is not equal to positive Infinity");
		assert.equal(deepEqual(Number.MAX_VALUE * 2, Number.MAX_VALUE * 3), true, "value larger than MAX_VALUE is Infinity therefore it evaluates to the same Infinity");
		assert.equal(deepEqual(0 / 0, 0 / 0), true, "Division by zero are the same");
		assert.equal(deepEqual(0 / 10e-1000, 0 / 10e-1000), true, "0 divided by very small number evaluates to the same NaN");
		assert.equal(deepEqual(1 / 10e-1000, 1 / 10e-1000), true, "1 divided by very small number evaluates to the same Infinity");
		assert.equal(deepEqual(Number('NaN'), Number('NaN')), true, "NaN casted is equal to itself");
		assert.equal(deepEqual(Math.PI, Math.PI), true, "PI is equal to itself");
		assert.equal(deepEqual(0xff, 0xff), true, "Hexadecimal number is equal to itself");
	});

	QUnit.test("string test", function(assert) {
		assert.equal(deepEqual("test", "test"), true, "\"test\", \"test\"");
		assert.equal(deepEqual("foo", "bar"), false, "\"foo\", \"bar\"");
		assert.equal(deepEqual("NaN", NaN), false, "\"NaN\", NaN");
		assert.equal(deepEqual("test", ""), false, "\"test\", \"\"");
		assert.equal(deepEqual("", ""), true, "\"\", \"\"");
		assert.equal(deepEqual("", null), false, "\"\", null");
		assert.equal(deepEqual("0", 0), false, "\"0\", 0");
		assert.equal(deepEqual("{}", {}), false, "\"{}\", {}");
	});

	QUnit.test("array", function(assert) {
		assert.equal(deepEqual([1, 2], [1, 2]), true, "[1, 2], [1, 2]");
		assert.equal(deepEqual([1, 2], [2, 1]), false, "[1, 2], [2, 1]");
		assert.equal(deepEqual([1, 2], [3, 4]), false, "[1, 2], [3, 4]");
		assert.equal(deepEqual([1, 2], [1, 2, 3]), false, "[1, 2], [1, 2, 3]");
		assert.equal(deepEqual([1, 2], []), false, "[1, 2], []");
		assert.equal(deepEqual([], []), true, "[], []");
		assert.equal(deepEqual([1, 2], {1:1, 2:2, length:2}), false, "[1, 2], {1:1, 2:2, length:2}");
		assert.equal(deepEqual([undefined], [undefined]), true, "[undefined], [undefined]");


		assert.equal(deepEqual([1, 2], [1, 2, 3], true), true, "[1, 2], [1, 2, 3], true");
		assert.equal(deepEqual([1, 2, 3], [1, 2], true), false, "[1, 2, 3], [1, 2], true");
	});

	QUnit.test("object", function(assert) {
		assert.equal(deepEqual({a:1, b:2}, {a:1, b:2}), true, "{a:1, b:2}, {a:1, b:2}");
		assert.equal(deepEqual({a:1, b:2}, {b:2, a:1}), true, "{a:1, b:2}, {b:2, a:1}");
		assert.equal(deepEqual({a:1, b:NaN}, {b:NaN, a:1}), true, "{a:1, b:NaN}, {b:NaN, a:1}");
		assert.equal(deepEqual({a:1, b:2}, {b:1, a:2}), false, "{a:1, b:2}, {b:1, a:2}");
		assert.equal(deepEqual({a:1, b:2}, {b:1, a:NaN}), false, "{a:1, b:2}, {b:1, a:NaN}");
		assert.equal(deepEqual({a:1, b:2}, {a:1, b:2, c:3}), false, "{a:1, b:2}, {a:1, b:2, c:3}");
		assert.equal(deepEqual({a:1, b:2}, {a:1}), false, "{a:1, b:2}, {a:1}");
		assert.equal(deepEqual({a:1, b:2}, {}), false, "{a:1, b:2}, {}");
		assert.equal(deepEqual({}, {}), true, "{}, {}");
		assert.equal(deepEqual({1:1}, [1]), false, "{1:1}, [1]");
		assert.equal(deepEqual({}, null), false, "{}, null");
		assert.equal(deepEqual({a: undefined}, {a: undefined}), true, "{a: undefined}, {a: undefined}");

		assert.equal(deepEqual({a:1, b:2}, {a:1, b:2, c:3}, true), true, "{a:1, b:2}, {a:1, b:2, c:3}, true");
		assert.equal(deepEqual({a:1, b:2, c:3}, {a:1, b:2}, true), false, "{a:1, b:2, c:3}, {a:1, b:2}, true");
	});

	QUnit.test("recursion", function(assert) {
		var a, b;
		a = []; b = [];
		a[0] = a; b[0] = b;
		assert.equal(deepEqual(a, b), false, "recursive array");
		a = {}; b = {};
		a.a = a; b.a = b;
		assert.equal(deepEqual(a, b), false, "recursive object");
		a = [[[[[[[[[[[0]]]]]]]]]]];
		b = [[[[[[[[[[[0]]]]]]]]]]];
		assert.equal(deepEqual(a, b), false, "deep array");
		assert.equal(deepEqual(a, b, 100), true, "deep array");
		a = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		b = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		assert.equal(deepEqual(a, b), false, "deep object");
		assert.equal(deepEqual(a, b, 100), true, "deep object");
	});

	QUnit.test("nodes", function(assert) {
		var a, b;
		a = b = document.createElement('test');
		assert.equal(deepEqual(a, b), true, "dom nodes are equal");
		b = document.createElement('test2');
		assert.equal(deepEqual(a, b), false, "dom nodes are not equal");
		a = document.createElement('same');
		b = document.createElement('same');
		assert.equal(deepEqual(a, b), true, "dom nodes are equal");
	});

});