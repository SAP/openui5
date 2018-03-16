/*!
 * ${copyright}
 */
/*global QUnit */
sap.ui.define(['sap/base/util/unique'], function(unique) {
	"use strict";

	QUnit.module("unique");

	QUnit.test("basic test", function(assert) {
		assert.deepEqual(unique(['a', 'b', 'c']), ['a', 'b', 'c'], "identity");
		assert.deepEqual(unique(['c', 'b', 'a']), ['a', 'b', 'c'], "resort");
		assert.deepEqual(unique(['c', 'c', 'b', 'a', 'c', 'b', 'a']), ['a', 'b', 'c'], "removal of duplicates");
		assert.deepEqual(unique(['a', 'a', 'a', 'a']), ['a'], "reduce to one");
		var a = ['c', 'c', 'b', 'a', 'c', 'b', 'a'];
		assert.deepEqual(unique(a), a,  "inplace");
		var a = ['a', 'b', 'c'];
		assert.deepEqual(unique(a), a, "inplace");
	});
});