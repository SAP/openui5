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
	QUnit.test("setContraints", function (assert) {
		var oConstraints = "~oConstraints",
			oType = new SimpleType({}, oConstraints);

		assert.strictEqual(oType.oConstraints, oConstraints);
	});

	//*********************************************************************************************
	QUnit.test("getConstraints: with constraints", function (assert) {
		var oConstraintsResult,
			oQux = {qux : "quux"},
			oType = new SimpleType();

		oType.oConstraints = {foo : "bar", baz : oQux};

		// code under test
		oConstraintsResult = oType.getConstraints();

		assert.deepEqual(oConstraintsResult, {foo : "bar", baz : oQux});
		assert.notStrictEqual(oConstraintsResult, oType.oConstraints);
		assert.notStrictEqual(oConstraintsResult.baz, oQux);
	});

	//*********************************************************************************************
	QUnit.test("getConstraints: without constraints", function (assert) {
		// code under test
		assert.deepEqual(new SimpleType().getConstraints(), {});
	});
});