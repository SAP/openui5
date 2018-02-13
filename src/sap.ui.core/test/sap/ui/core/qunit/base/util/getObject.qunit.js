/*global QUnit */
sap.ui.define(["sap/base/util/getObject"], function(getObject) {
	"use strict";

	QUnit.module("Object getObject");


	QUnit.test("tests for get object with create flag", function(assert) {
		var oEmptyObject = {};

		assert.ok(getObject(oEmptyObject, "my1.pack.age", true), "should be created");
		assert.ok(oEmptyObject.my1.pack.age, "should exist now");


		assert.equal(getObject(oEmptyObject, "my2.pack.age", true), oEmptyObject.my2.pack.age, "should be created");
		assert.ok(oEmptyObject.my2.pack.age, "should exist now");

	});

	QUnit.test("tests for get object without create flag for not existing object", function(assert) {
		var oEmptyObject = {};

		assert.equal(getObject(oEmptyObject, "my3.pack.age", false), undefined, "should be undefined as not created");
		assert.notOk(oEmptyObject.my3, "should not exist as the create flag is specified with false");
	});

	QUnit.test("tests for get object without create flag for existing object", function(assert) {
		var oInnerObject = {iValue: 5};
		var oAlreadyExisting = {myInner: oInnerObject};
		assert.equal(oAlreadyExisting.myInner.iValue, 5, "should already exist and be value 5");

		assert.strictEqual(getObject(oAlreadyExisting, "myInner", false), oInnerObject, "should be the value inner object");
	});
});
