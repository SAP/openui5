/* global QUnit */
sap.ui.define(["sap/base/util/getter"], function(getter) {
	"use strict";

	QUnit.module("Object getter");


	QUnit.test("getter function", function(assert) {

		var fnGetter = getter("test");
		assert.equal(typeof fnGetter, "function", "should be a function");
		assert.equal(fnGetter(), "test", "should be a return value");

		var oRef = {test: "test"};
		var fnObjectGetter = getter(oRef);
		assert.strictEqual(fnObjectGetter(), oRef, "should be the same reference");

	});
});
