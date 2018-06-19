/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/array/uniqueSort'], function(uniqueSort) {
	"use strict";

	QUnit.module("uniqueSort");

	QUnit.test("basic test", function(assert) {
		assert.deepEqual(uniqueSort(['a', 'b', 'c']), ['a', 'b', 'c'], "identity");
		assert.deepEqual(uniqueSort(['c', 'b', 'a']), ['a', 'b', 'c'], "resort");
		assert.deepEqual(uniqueSort(['c', 'c', 'b', 'a', 'c', 'b', 'a']), ['a', 'b', 'c'], "removal of duplicates");
		assert.deepEqual(uniqueSort(['a', 'a', 'a', 'a']), ['a'], "reduce to one");
		var a = ['c', 'c', 'b', 'a', 'c', 'b', 'a'];
		assert.deepEqual(uniqueSort(a), a,  "inplace");
		var a = ['a', 'b', 'c'];
		assert.deepEqual(uniqueSort(a), a, "inplace");
	});
});