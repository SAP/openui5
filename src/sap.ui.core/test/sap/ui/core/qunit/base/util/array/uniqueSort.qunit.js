/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/array/uniqueSort', 'sap/ui/Device'], function(uniqueSort, Device) {
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
		var assertSameElements = Device.browser.msie || Device.browser.edge ?
			function(actual, expected, message) {
				// IE and the old edge do not guarantee a stable sort order
				// therefore only check for duplicate removals
				assert.strictEqual(actual.length, expected.length, message + " (actual and expected array have same length)");
				expected.forEach(function(elem, idx) {
					assert.ok(actual.indexOf(elem) >= 0, message + " (actual array contains expected element at position " + idx + ")");
				});
			} : assert.deepEqual.bind(assert);

		var a = {name: "a"};
		var b = {name: "b"};
		var c = {name: "c"};

		assertSameElements(uniqueSort([a, b, c]), [a, b, c], "identity");
		assertSameElements(uniqueSort([c, b, a]), [c, b, a], "resort");
		assertSameElements(uniqueSort([c, c, b, a, c, b, a]), [c, b, a], "removal of duplicates");
		assertSameElements(uniqueSort([a, a, a, a]), [a], "reduce to one");

		// same reference
		var aInplace1 = [c, c, b, a, c, b, a];
		var aSortedInPlace1 = uniqueSort(aInplace1);
		assert.strictEqual(aSortedInPlace1, aInplace1,  "inplace1");
		var aInplace2 = [a, b, c];
		var aSortedInPlace2 = uniqueSort(aInplace2);
		assert.strictEqual(aSortedInPlace2, aInplace2, "inplace2");
	});
});