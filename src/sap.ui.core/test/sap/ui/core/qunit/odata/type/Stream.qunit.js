/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/Stream"
], function (Log, FormatException, ParseException, ValidateException, ODataType, Stream) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Stream", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oStream = new Stream();

		assert.ok(oStream instanceof ODataType, "is an ODataType");
		assert.strictEqual(oStream.getName(), "sap.ui.model.odata.type.Stream");

		assert.throws(function () {
			return new Stream(false);
		}, new Error("Unsupported arguments"));
	});

	//*********************************************************************************************
	[false, true, undefined].forEach(function (vNullable, i) {
		QUnit.test("with nullable=" + vNullable, function (assert) {
			var oType = new Stream(undefined, {
				nullable : vNullable
			});

			assert.deepEqual(oType.oConstraints, i > 0 ? undefined : {nullable : false});
		});
	});

	//*********************************************************************************************
	QUnit.test("invalid nullable", function (assert) {
		this.oLogMock.expects("warning").withExactArgs("Illegal nullable: foo", null,
			"sap.ui.model.odata.type.Stream");

		return new Stream(undefined, {nullable : "foo"});
	});

	//*********************************************************************************************
	QUnit.test("format", function (assert) {
		var oStream = new Stream();

		assert.strictEqual(oStream.formatValue("foo", "any"), "foo");
		assert.strictEqual(oStream.formatValue("foo", "string"), "foo");

		["boolean", "int", "float"].forEach(function (sTargetType) {
			assert.throws(function () {
				oStream.formatValue(undefined, sTargetType);
			}, new FormatException(
				"Don't know how to format sap.ui.model.odata.type.Stream to " + sTargetType));
		});
	});

	//*********************************************************************************************
	QUnit.test("parse & validate", function (assert) {
		var oStream = new Stream(undefined, undefined, "/foo");

		assert.throws(function () {
			oStream.parseValue("", "string");
		}, new ParseException(
			"Type 'sap.ui.model.odata.type.Stream' does not support parsing"));

		assert.throws(function () {
			oStream.validateValue(null);
		}, new ValidateException(
			"Type 'sap.ui.model.odata.type.Stream' does not support validating"));
	});
});