/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define([
	'sap/base/util/includes'
], function (
	includes
) {
	"use strict";

	QUnit.module("sap.base.util.includes", function () {
		QUnit.test("lookup in array", function (assert) {
			assert.strictEqual(includes(['foo'], 'foo'), true, "array with one item includes 'foo'");
			assert.strictEqual(includes(['foo', 'bar'], 'bar'), true, "array with two items includes 'bar'");
			assert.strictEqual(includes(['foo'], 'oo'), false, "array with one item does not include 'oo'");
			assert.strictEqual(includes([], 'foo'), false, "empty array does not include 'foo'");
			assert.strictEqual(includes([], undefined), false, "empty array does not include undefined");
			assert.strictEqual(includes([], null), false, "empty array does not include null");
			assert.strictEqual(includes([NaN], NaN), true, "array with item NaN includes NaN");
			assert.strictEqual(includes([3], 3), true, "array with item 3 includes 3");
			assert.strictEqual(includes([43], 3), false, "array with item 43 does not include 3");
			assert.strictEqual(includes([undefined], undefined), true, "array with item undefined includes undefined");
			assert.strictEqual(includes([null], null), true, "array with item null includes null");
			assert.strictEqual(includes([undefined], null), false, "array with item undefined does not include null");
			assert.strictEqual(includes([null], undefined), false, "array with item null does not include undefined");
		});

		QUnit.test("lookup in array with start index", function (assert) {
			assert.strictEqual(includes(['foo'], 'foo'), true, "array with one item includes 'foo'");
			assert.strictEqual(includes(['foo'], 'foo', 0), true, "array at position 0 with one item includes 'foo'");
			assert.strictEqual(includes(['foo'], 'foo', -1), true, "array at position -1 with one item includes 'foo'");
			assert.strictEqual(includes(['foo'], 'foo', -2), true, "array at position -2 with one item includes 'foo'");
			assert.strictEqual(includes(['foo'], 'foo', 1), false, "array at position 1 with one item includes 'foo'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b'), true, "array with 3 items includes 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', -4), true, "array at position -4 with 3 items includes 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', -3), true, "array at position -3 with 3 items includes 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', -2), true, "array at position -2 with 3 items includes 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', -1), false, "array at position -1 with 3 items does not include 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', 0), true, "array at position 0 with 3 items includes 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', 1), true, "array at position 1 with 3 items includes 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', 2), false, "array at position 2 with 3 items does not include 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', 3), false, "array at position 3 with 3 items does not include 'b'");
			assert.strictEqual(includes(['a', 'b', 'a'], 'b', 4), false, "array at position 4 with 3 items does not include 'b'");
		});

		QUnit.test("lookup in plain object", function (assert) {
			assert.strictEqual(includes({foo: 'bar'}, 'foo'), false);
			assert.strictEqual(includes({foo: 'bar'}, 'bar'), true);
			assert.strictEqual(includes({}, 'foo'), false);
			assert.strictEqual(includes({}, {}), false);
			assert.strictEqual(includes({foo: 'bar'}, null), false);
		});

		QUnit.test("lookup in string", function (assert) {
			assert.strictEqual(includes('foobar', 'o'), true, "string foobar includes o");
			assert.strictEqual(includes('foobar', 'foo'), true, "string foobar includes foo");
		});

		QUnit.test("lookup in string with start index", function (assert) {
			assert.strictEqual(includes('foobar', 'foo'), true, "string foobar includes foo");
			assert.strictEqual(includes('foobar', 'foo', 0), true, "string foobar at position 0 includes foo");
			assert.strictEqual(includes('foobar', 'foo', -1), false, "string foobar at position -1 includes foo");
			assert.strictEqual(includes('foobar', 'foo', -2), false, "string foobar at position -2 includes foo");
			assert.strictEqual(includes('foobar', 'foo', -5), false, "string foobar at position -5 includes foo");
			assert.strictEqual(includes('foobar', 'foo', -6), true, "string foobar at position -6 includes foo");
			assert.strictEqual(includes('foobar', 'foo', -7), true, "string foobar at position -7 includes foo");
			assert.strictEqual(includes('foobar', 'foo', -100), true, "string foobar at position -100 includes foo");
			assert.strictEqual(includes('foobar', 'foo', 1), false, "string foobar at position 1 includes foo");
			assert.strictEqual(includes('foobar', 'foo', 10), false, "string foobar at position 10 includes foo");

			assert.strictEqual(includes('aba', 'b', -5), true, "string aba at position -5 includes character b");
			assert.strictEqual(includes('aba', 'b', -4), true, "string aba at position -4 includes character b");
			assert.strictEqual(includes('aba', 'b', -3), true, "string aba at position -3 includes character b");
			assert.strictEqual(includes('aba', 'b', -2), true, "string aba at position -2 includes character b");
			assert.strictEqual(includes('aba', 'b', -1), false, "string aba at position -1 does not include character b");
			assert.strictEqual(includes('aba', 'b', 0), true, "string aba at position 0 at position 0 contains b");
			assert.strictEqual(includes('aba', 'b', 1), true, "string aba at position 1 includes character b");
			assert.strictEqual(includes('aba', 'b', 2), false, "string aba at position 2 coes not include character b");
			assert.strictEqual(includes('aba', 'b', 3), false, "string aba at position 3 coes not include character b");
			assert.strictEqual(includes('aba', 'b', 4), false, "string aba at position 4 coes not include character b");
			assert.strictEqual(includes('aba', 'b', 5), false, "string aba at position 5 coes not include character b");
		});

		QUnit.test("lookup in other objects", function (assert) {
			assert.strictEqual(includes(undefined, 'bar'), false);
			assert.strictEqual(includes(undefined, undefined), false);
			assert.strictEqual(includes(NaN, NaN), false);
			assert.strictEqual(includes(null, null), false);
		});
	});
});
