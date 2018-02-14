/*global QUnit */
sap.ui.define(["sap/base/util/isWindow"], function(isWindow) {
	"use strict";

	QUnit.module("Object isWindow");

	QUnit.test("tests for window object", function(assert) {
		assert.notOk(isWindow({}), "not a window");
		assert.notOk(isWindow(), "not a window");
		assert.notOk(isWindow(null), "not a window");
		assert.notOk(isWindow(0), "not a window");
		assert.notOk(isWindow(1), "not a window");
		assert.notOk(isWindow(undefined), "not a window");

		assert.ok(typeof window === 'undefined' || isWindow(window), "is a window");
	});
});
