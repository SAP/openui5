/*global QUnit */
sap.ui.define(["sap/base/util/isPlainObject"], function(isPlainObject) {
	"use strict";

	QUnit.module("Object isPlainObject");

	QUnit.test("plain object", function(assert) {
		assert.notOk(isPlainObject(), "no argument given");
		assert.notOk(isPlainObject(isPlainObject), "no argument given");
		assert.notOk(isPlainObject(0), "0 is a plain object");
		assert.notOk(isPlainObject(1), "1 is a plain object");
		assert.notOk(isPlainObject(undefined), "undefined not a plain object");
		assert.notOk(isPlainObject(new Date()), "Date not a plain object");
		assert.notOk(isPlainObject(NaN), "NaN not a plain object");
		assert.notOk(isPlainObject(Object.create(Number.prototype)), "created Object not a plain object");


		assert.notOk(isPlainObject("hm"), "created Object not a plain object");
		assert.notOk(isPlainObject([]), "created Object not a plain object");

		//evaluate branch where x.constructor.prototype is null
		var x = new function() {
		}();
		x.constructor.prototype = null;

		assert.notOk(isPlainObject(x), "created Object is not a plain object and " +
			"its constructor does not have a prototype");


		assert.notOk(isPlainObject(Object), "created Object not a plain object");
		var emptyFunction = function() {
		};
		assert.notOk(isPlainObject(emptyFunction), "created Object not a plain object");


		assert.ok(isPlainObject(Object.create(null)), "created primitive Object is a plain object");
		assert.ok(isPlainObject({}), "is a plain object");
		assert.ok(isPlainObject({x: 47}), "is a plain object");

		assert.notOk(isPlainObject(null), "null is not a plain object");
	});
});
