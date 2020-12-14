/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/SimpleType",
	"sap/ui/model/Type"
], function (Log, SimpleType, Type) {
	/*global QUnit*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.SimpleType", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new SimpleType();

		assert.ok(oType instanceof Type, "is a Type");
		assert.ok(oType instanceof SimpleType, "is a SimpleType");
		assert.strictEqual(oType.getName(), "SimpleType", "type name");
		assert.deepEqual(oType.oFormatOptions, {}, "default format options");
		assert.deepEqual(oType.oConstraints, {}, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("c'tor sets constraints and format options", function (assert) {
		var oConstraints = "~oConstraints",
			oFormatOptions = "~oFormatOptions",
			oType;

		// code under test
		oType = new SimpleType(oFormatOptions, oConstraints);

		assert.strictEqual(oType.oConstraints, oConstraints);
		assert.strictEqual(oType.oFormatOptions, oFormatOptions);

		// code under test
		oType = new SimpleType(null, null);

		assert.deepEqual(oType.oConstraints, {});
		assert.deepEqual(oType.oFormatOptions, {});
	});

	//*********************************************************************************************
	QUnit.test("getConstraints: with and w/o constraints", function (assert) {
		var oConstraintsResult,
			oQux = {qux : "quux"},
			oType = new SimpleType(undefined, {foo : "bar", baz : oQux});

		// code under test
		oConstraintsResult = oType.getConstraints();

		assert.deepEqual(oConstraintsResult, {foo : "bar", baz : oQux});
		assert.notStrictEqual(oConstraintsResult, oType.oConstraints);
		assert.notStrictEqual(oConstraintsResult.baz, oQux);

		// code under test
		assert.deepEqual(new SimpleType().getConstraints(), {});
	});

	//*********************************************************************************************
	QUnit.test("getFormatOptions: with and w/o format options", function (assert) {
		var oFormatOptionsResult,
			oQux = {qux : "quux"},
			oType = new SimpleType({foo : "bar", baz : oQux});

		// code under test
		oFormatOptionsResult = oType.getFormatOptions();

		assert.deepEqual(oFormatOptionsResult, {foo : "bar", baz : oQux});
		assert.notStrictEqual(oFormatOptionsResult, oType.oFormatOptions);
		assert.notStrictEqual(oFormatOptionsResult.baz, oQux);

		// code under test
		assert.deepEqual(new SimpleType().getFormatOptions(), {});
	});
});