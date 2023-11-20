/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/SimpleType",
	"sap/ui/model/odata/type/ODataType"
], function (Log, SimpleType, ODataType) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.ODataType", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new ODataType();

		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.ok(oType instanceof SimpleType, "is a SimpleType");
		assert.strictEqual(oType.getName(), undefined, "no type name is set");
		assert.strictEqual(oType.sName, undefined, "no sName");

		assert.strictEqual(oType.hasOwnProperty("oFormatOptions"), false, "no format options");
		assert.strictEqual(oType.hasOwnProperty("oConstraints"), false, "no constraints");

		assert.ok(ODataType.prototype.setConstraints !==
			SimpleType.prototype.setConstraints, "type overwrites setConstraints");
		oType.setConstraints({foo : "bar"});
		assert.strictEqual(oType.oConstraints, undefined, "no constraints");

		assert.ok(ODataType.prototype.setFormatOptions !==
			SimpleType.prototype.setFormatOptions, "type overwrites setFormatOptions");
		oType.setFormatOptions({foo : "bar"});
		assert.strictEqual(oType.oFormatOptions, undefined, "no format options");
	});

	//*********************************************************************************************
	QUnit.test("getPlaceholderText", function (assert) {
		var oType = new ODataType();

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), undefined);

		oType.getFormat = function () {};
		var oTypeMock = this.mock(oType);
		oTypeMock.expects("getFormat").withExactArgs().returns({/*format has no getPlaceholderText*/});

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), undefined);

		var oFormat = {getPlaceholderText: function () {}};
		oTypeMock.expects("getFormat").withExactArgs().twice().returns(oFormat);
		this.mock(oFormat).expects("getPlaceholderText").withExactArgs().returns("~placeholder");

		// code under test
		assert.strictEqual(oType.getPlaceholderText(), "~placeholder");
	});

	//*********************************************************************************************
[undefined, NaN, 0, Infinity, "foo"].forEach(function (vInput) {
	QUnit.test("getEmptyValue: returns undefined for " + vInput, function (assert) {
		// code under test
		assert.strictEqual(new ODataType().getEmptyValue(vInput), undefined);
	});
});

	//*********************************************************************************************
[
	{parseEmptyValueToZero : false, nullable : true, result : null},
	{parseEmptyValueToZero : false, nullable : false, result : null},
	{parseEmptyValueToZero : true, nullable : true, result : null},
	{parseEmptyValueToZero : true, nullable : false, result : "0"}
].forEach(function (oFixture) {
	var sTitle = "getEmptyValue: with format option parseEmptyValueToZero: " + oFixture.parseEmptyValueToZero
			+ " and nullable constraints: " + oFixture.nullable;

	QUnit.test(sTitle, function (assert) {
		var oType = new ODataType();

		oType.oFormatOptions = {parseEmptyValueToZero : oFixture.parseEmptyValueToZero};
		oType.oConstraints = {nullable : oFixture.nullable};

		// code under test
		assert.strictEqual(oType.getEmptyValue(""), oFixture.result);
		assert.strictEqual(oType.getEmptyValue(null), oFixture.result);
	});
});

	//*********************************************************************************************
	QUnit.test("getEmptyValue: return numeric value", function (assert) {
		var oType = new ODataType();

		oType.oFormatOptions = {parseEmptyValueToZero : true};
		oType.oConstraints = {nullable : false};

		// code under test
		assert.strictEqual(oType.getEmptyValue("", true), 0);
		assert.strictEqual(oType.getEmptyValue(null, true), 0);
	});

	//*********************************************************************************************
	QUnit.test("getEmptyValue: without format options", function (assert) {
		var oType = new ODataType();

		// code under test
		assert.strictEqual(oType.getEmptyValue("", true), null);
		assert.strictEqual(oType.getEmptyValue(null, true), null);
	});

	//*****************************************************************************************
[undefined, {"~constraint" : 2}].forEach(function (oConstraints) {
	QUnit.test("checkParseEmptyValueToZero logs warning", function (assert) {
		var oODataType = {
				oConstraints : oConstraints, // nullable is only in the constraints if it's value is false
				oFormatOptions : {parseEmptyValueToZero : true},
				getName : function () {}
			};

		this.mock(oODataType).expects("getName").withExactArgs().returns("~sModuleName");
		this.oLogMock.expects("warning").withExactArgs("The parseEmptyValueToZero format option is ignored as"
			+ " the nullable constraint is not false.", null, "~sModuleName");

		// coder under test
		ODataType.prototype.checkParseEmptyValueToZero.call(oODataType);
	});
});

	//*****************************************************************************************
[{
	oConstraints : {"~constraint" : 2},
	oFormatOptions : undefined
}, {
	oConstraints : {"~constraint" : 2},
	oFormatOptions : {"~formatOption" : "foo"}
}, {
	oConstraints : {nullable : false},
	oFormatOptions : {parseEmptyValueToZero : true}
}].forEach(function (oFixture, i) {
	QUnit.test("checkParseEmptyValueToZero does not log warning " + i, function (assert) {
		var oODataType = {
				oConstraints : oFixture.oConstraints,
				oFormatOptions : oFixture.oFormatOptions,
				getName : function () {}
			};

		this.mock(oODataType).expects("getName").never();
		this.oLogMock.expects("warning").never();

		// coder under test
		ODataType.prototype.checkParseEmptyValueToZero.call(oODataType);
	});
});
});