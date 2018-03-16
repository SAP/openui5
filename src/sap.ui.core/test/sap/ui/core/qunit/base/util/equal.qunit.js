/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/equal'], function(equal) {
	"use strict";

	QUnit.module("sap.base.util.equal");

	QUnit.test("basic test", function(assert) {
		assert.equal(equal(0, 0), true, "number");
		assert.equal(equal(0, 1), false, "number");
		assert.equal(equal(true, true), true, "boolean");
		assert.equal(equal(true, false), false, "boolean");
		assert.equal(equal("test", "test"), true, "string");
		assert.equal(equal("foo", "bar"), false, "string");
		assert.equal(equal([1, 2], [1, 2]), true, "array");
		assert.equal(equal([1, 2], [1, 2, 3]), false, "array");
		assert.equal(equal({a:1, b:2}, {a:1, b:2}), true, "object");
		assert.equal(equal({a:1, b:2}, {b:1, c:2}), false, "object");
		assert.equal(equal(null, null), true, "null");
		assert.equal(equal(null, 0), false, "null");
		assert.equal(equal(undefined, undefined), true, "undefined");
		assert.equal(equal(undefined, null), false, "undefined");
		assert.equal(equal(new Date(234), new Date(234)), true, "Date");
		assert.equal(equal(new Date(234), new Date(2345)), false, "Date");
	});

	QUnit.test("contains test", function(assert) {
		assert.equal(equal([1, 2], [1, 2], true), true, "equal array");
		assert.equal(equal([1, 2], [2, 1], true), false, "different array");
		assert.equal(equal([1, 2], [1, 2, 3], true), true, "contained array");
		assert.equal(equal([1, 2, 3, 4], [1, 2, 3], true), false, "not contained array");
		assert.equal(equal({a:1, b:2}, {a:1, b:2}, true), true, "equal object");
		assert.equal(equal({a:1, b:2}, {a:2, b:1}, true), false, "different object values");
		assert.equal(equal({a:1, b:2}, {a:1, c:2}, true), false, "different property names");
		assert.equal(equal({a:1, b:2}, {a:1, b:2, c:3}, true), true, "contained object");
		assert.equal(equal({a:1, b:2, c:3, d:4}, {a:1, b:2, c:3}, true), false, "not contained object");
	});

	QUnit.test("boolean test", function(assert) {
		assert.equal(equal(true, true), true, "true, true");
		assert.equal(equal(true, false), false, "true, false");
		assert.equal(equal(false, true), false, "false, true");
		assert.equal(equal(false, false), true, "false, false");
		assert.equal(equal(false, 0), false, "false, 0");
		assert.equal(equal(false, null), false, "false, null");
		assert.equal(equal(false, "false"), false, "false, \"false\"");
		assert.equal(equal(false, []), false, "false, []");
	});

	QUnit.test("number test", function(assert) {
		assert.equal(equal(0, 0), true, "0, 0");
		assert.equal(equal(1, 0), false, "1, 0");
		assert.equal(equal(0, -1), false, "0, -1");
		assert.equal(equal(0xff, 255), true, "0xff, 255");
		assert.equal(equal(23, "23"), false, "23, \"23\"");
		assert.equal(equal(false, 0), false, "false, 0");
		assert.equal(equal(0, null), false, "0, null");
		assert.equal(equal(1, []), false, "1, []");
	});

	QUnit.test("string test", function(assert) {
		assert.equal(equal("test", "test"), true, "\"test\", \"test\"");
		assert.equal(equal("foo", "bar"), false, "\"foo\", \"bar\"");
		assert.equal(equal("test", ""), false, "\"test\", \"\"");
		assert.equal(equal("", ""), true, "\"\", \"\"");
		assert.equal(equal("", null), false, "\"\", null");
		assert.equal(equal("0", 0), false, "\"0\", 0");
		assert.equal(equal("{}", {}), false, "\"{}\", {}");
	});

	QUnit.test("array", function(assert) {
		assert.equal(equal([1, 2], [1, 2]), true, "[1, 2], [1, 2]");
		assert.equal(equal([1, 2], [2, 1]), false, "[1, 2], [2, 1]");
		assert.equal(equal([1, 2], [3, 4]), false, "[1, 2], [3, 4]");
		assert.equal(equal([1, 2], [1, 2, 3]), false, "[1, 2], [1, 2, 3]");
		assert.equal(equal([1, 2], []), false, "[1, 2], []");
		assert.equal(equal([], []), true, "[], []");
		assert.equal(equal([1, 2], {1:1, 2:2, length:2}), false, "[1, 2], {1:1, 2:2, length:2}");
		assert.equal(equal([undefined], [undefined]), true, "[undefined], [undefined]");


		assert.equal(equal([1, 2], [1, 2, 3], true), true, "[1, 2], [1, 2, 3], true");
		assert.equal(equal([1, 2, 3], [1, 2], true), false, "[1, 2, 3], [1, 2], true");
	});

	QUnit.test("object", function(assert) {
		assert.equal(equal({a:1, b:2}, {a:1, b:2}), true, "{a:1, b:2}, {a:1, b:2}");
		assert.equal(equal({a:1, b:2}, {b:2, a:1}), true, "{a:1, b:2}, {b:2, a:1}");
		assert.equal(equal({a:1, b:2}, {b:1, a:2}), false, "{a:1, b:2}, {b:1, a:2}");
		assert.equal(equal({a:1, b:2}, {a:1, b:2, c:3}), false, "{a:1, b:2}, {a:1, b:2, c:3}");
		assert.equal(equal({a:1, b:2}, {a:1}), false, "{a:1, b:2}, {a:1}");
		assert.equal(equal({a:1, b:2}, {}), false, "{a:1, b:2}, {}");
		assert.equal(equal({}, {}), true, "{}, {}");
		assert.equal(equal({1:1}, [1]), false, "{1:1}, [1]");
		assert.equal(equal({}, null), false, "{}, null");
		assert.equal(equal({a: undefined}, {a: undefined}), true, "{a: undefined}, {a: undefined}");

		assert.equal(equal({a:1, b:2}, {a:1, b:2, c:3}, true), true, "{a:1, b:2}, {a:1, b:2, c:3}, true");
		assert.equal(equal({a:1, b:2, c:3}, {a:1, b:2}, true), false, "{a:1, b:2, c:3}, {a:1, b:2}, true");
	});

	QUnit.test("recursion", function(assert) {
		var a, b;
		a = []; b = [];
		a[0] = a; b[0] = b;
		assert.equal(equal(a, b), false, "recursive array");
		a = {}; b = {};
		a.a = a; b.a = b;
		assert.equal(equal(a, b), false, "recursive object");
		a = [[[[[[[[[[[0]]]]]]]]]]];
		b = [[[[[[[[[[[0]]]]]]]]]]];
		assert.equal(equal(a, b), false, "deep array");
		assert.equal(equal(a, b, 100), true, "deep array");
		a = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		b = {a:{a:{a:{a:{a:{a:{a:{a:{a:{a:{a:0}}}}}}}}}}};
		assert.equal(equal(a, b), false, "deep object");
		assert.equal(equal(a, b, 100), true, "deep object");
	});

	QUnit.test("nodes", function(assert) {
		var a, b;
		a = b = document.createElement('test');
		assert.equal(equal(a, b), true, "dom nodes are equal");
		b = document.createElement('test2');
		assert.equal(equal(a, b), false, "dom nodes are not equal");
		a = document.createElement('same');
		b = document.createElement('same');
		assert.equal(equal(a, b), true, "dom nodes are equal");
	});

});