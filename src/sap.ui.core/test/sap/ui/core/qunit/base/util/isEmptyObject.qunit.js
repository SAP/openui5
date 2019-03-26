/*global QUnit */
sap.ui.define(["sap/base/util/isEmptyObject"], function(isEmptyObject) {
	"use strict";

	QUnit.module("Object isEmptyObject");

	QUnit.test("plain object happy path", function(assert) {
		assert.ok(isEmptyObject(), "no argument given");
		assert.ok(isEmptyObject({}), "{} is a valid empty object");
		assert.ok(isEmptyObject(null), "null is a valid empty object");
		assert.ok(isEmptyObject(false), "false is a valid empty object");
		assert.ok(isEmptyObject(true), "true is a valid empty object");
		assert.ok(isEmptyObject(Number), "Number is a valid empty object");
		assert.ok(isEmptyObject(3), "3 is a valid empty object");
		assert.ok(isEmptyObject(Infinity), "Infinity is a valid empty object");
		assert.ok(isEmptyObject([]), "[] is a valid empty object");
		assert.ok(isEmptyObject(Object.create(null)), "Object.create(null) is a valid empty object");
		assert.ok(isEmptyObject(Object.create({})), "Object.create({}) is a valid empty object");
	});

	QUnit.test("plain object sad path", function(assert) {
		assert.notOk(isEmptyObject(["a"]), "[\"a\"] is not an empty object");
		assert.notOk(isEmptyObject({test: 123}), "{test: 123} is not an empty object");
		assert.notOk(isEmptyObject(Object.create({test: 123})), "Object.create({test: 123}) is not an empty object");
	});
});
