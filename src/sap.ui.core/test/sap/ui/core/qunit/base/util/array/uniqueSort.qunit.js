/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/array/uniqueSort'], function(uniqueSort) {
	"use strict";

	QUnit.module("uniqueSort");

	QUnit.test("basic string test", function(assert) {
		assert.deepEqual(uniqueSort(['a', 'b', 'c']), ['a', 'b', 'c'], "identity");
		assert.deepEqual(uniqueSort(['c', 'b', 'a']), ['a', 'b', 'c'], "resort");
		assert.deepEqual(uniqueSort(['c', 'c', 'b', 'a', 'c', 'b', 'a']), ['a', 'b', 'c'], "removal of duplicates");
		assert.deepEqual(uniqueSort(['a', 'a', 'a', 'a']), ['a'], "reduce to one");

		assert.deepEqual(uniqueSort(['a', 'c', 'b', 'a', 'c', 'b', 'a']), ['a', 'b', 'c'],  "mixed");
		assert.deepEqual(uniqueSort(['a', 'c', 'a', 'b']), ['a', 'b', 'c'], "mixed");

		var aInplace1 = ['c', 'c', 'b', 'a', 'c', 'b', 'a'];
		assert.deepEqual(uniqueSort(aInplace1), aInplace1,  "modify input array");
		var aInplace2 = ['a', 'b', 'c'];
		assert.deepEqual(uniqueSort(aInplace2), aInplace2, "modify input array");
	});

	QUnit.test("basic object test", function(assert) {
		var a = {name: "a"};
		var b = {name: "b"};
		var c = {name: "c"};

		assert.deepEqual(uniqueSort([a, b, c]), [a, b, c], "identity");
		assert.deepEqual(uniqueSort([c, b, a]), [c, b, a], "resort");
		assert.deepEqual(uniqueSort([c, c, b, a, c, b, a]), [c, b, a], "removal of duplicates");
		assert.deepEqual(uniqueSort([a, a, a, a]), [a], "reduce to one");

		// same reference
		var aInplace1 = [c, c, b, a, c, b, a];
		var aSortedInPlace1 = uniqueSort(aInplace1);
		assert.strictEqual(aSortedInPlace1, aInplace1,  "inplace1");
		var aInplace2 = [a, b, c];
		var aSortedInPlace2 = uniqueSort(aInplace2);
		assert.strictEqual(aSortedInPlace2, aInplace2, "inplace2");
	});
});