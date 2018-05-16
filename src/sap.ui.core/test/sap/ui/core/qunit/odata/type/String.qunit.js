/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/String",
	"sap/ui/test/TestUtils"
], function (jQuery, FormatException, ParseException, ValidateException, ODataType, StringType,
		TestUtils) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0, no-warning-comments: 0 */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.String", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	QUnit.test("basics", function (assert) {
		var oType = new StringType();

		assert.ok(oType instanceof StringType, "is a String");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.String", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "no format options");
		assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
		assert.strictEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
		function (assert) {
			var oType = new StringType(null, null);

			assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
			assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("w/ constraints", function (assert) {
		var oType = new StringType({}, {
			contains : "a",
			endsWith : "foo",
			endsWithIgnoreCase : "bar",
			equals : "baz",
			maxLength : 12,
			minLength : 2,
			search : "s2403r5j",
			startsWith : "me",
			startsWithIgnoreCase : "you"
		});

		assert.deepEqual(oType.oConstraints, {maxLength : 12});
	});

	//*********************************************************************************************
	[
		{maxLength : "foo", warning : "Illegal maxLength: foo"},
		{maxLength : -1, warning : "Illegal maxLength: -1"},
		{maxLength : 0, warning : "Illegal maxLength: 0"}
	].forEach(function (oFixture, i) {
		QUnit.test("constraints error #" + i, function (assert) {
			var oType;

			this.oLogMock.expects("warning")
				.withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.String");

			oType = new StringType({}, {maxLength : oFixture.maxLength});
			assert.strictEqual(oType.oConstraints, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("format", function (assert) {
		var oType = new StringType({}, {maxLength : 5});

		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "any"), null, "null");
		assert.strictEqual(oType.formatValue(null, "string"), "", "null");
		assert.strictEqual(oType.formatValue(null, "sap.ui.core.CSSSize"), "", "null");
		assert.strictEqual(oType.formatValue("foo", "any"), "foo", "target type any");
		assert.strictEqual(oType.formatValue("true", "boolean"), true, "target type boolean");
		assert.strictEqual(oType.formatValue("3.1415", "float"), 3.1415, "target type float");
		assert.strictEqual(oType.formatValue("42", "int"), 42, "target type int");
		assert.strictEqual(oType.formatValue("foobar", "string"), "foobar", "target type string");
		try {
			oType.formatValue("baz", "object");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message, "Don't know how to format String to object");
		}
	});
	//TODO formatValue calls sap.ui.model.type.String#formatValue although it does not
	//  inherit from this object: we rely on String#formatValue not to access "this"!

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oType = new StringType(); // constraints do not matter

		assert.strictEqual(oType.parseValue(null, "string"), null, "null");
		assert.strictEqual(oType.parseValue("", "string"), null,
			"empty string is converted to null");
		assert.strictEqual(oType.parseValue(undefined, "string"), undefined, "undefined");
		assert.strictEqual(oType.parseValue(true, "boolean"), "true", "source type boolean");
		assert.strictEqual(oType.parseValue(3.1415, "float"), "3.1415", "source type float");
		assert.strictEqual(oType.parseValue(42, "int"), "42", "source type int");
		assert.strictEqual(oType.parseValue("foobar", "string"), "foobar", "source type string");
		try {
			oType.parseValue("baz", "object");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message, "Don't know how to parse String from object");
		}
	});

	//*********************************************************************************************
	QUnit.test("validate", function (assert) {
		var oType = new StringType({}, {maxLength : 3});

		["", "A", "AB", "ABC"].forEach(function (sValue) {
			oType.validateValue(sValue);
		});

		TestUtils.withNormalizedMessages(function () {
			try {
				oType.validateValue("ABCD");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterTextMaxLength 3");
			}
		});

		try {
			oType.validateValue(42);
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ValidateException);
			assert.strictEqual(e.message, "Illegal sap.ui.model.odata.type.String value: 42");
		}
	});

	//*********************************************************************************************
	QUnit.test("validate without length", function (assert) {
		var oType = new StringType({}, {});

		oType.validateValue("ABC");
	});

	//*********************************************************************************************
	QUnit.test("nullable", function (assert) {
		var that = this;

		TestUtils.withNormalizedMessages(function () {
			var oType = new StringType({}, {nullable : false});

			assert.deepEqual(oType.oConstraints, {nullable : false}, "nullable: false");
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterText");
			}

			oType = new StringType({}, {nullable : false, maxLength : 3});
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterTextMaxLength 3");
			}

			oType = new StringType({}, {nullable : true});
			oType.validateValue(null); // does not throw
			assert.strictEqual(oType.oConstraints, undefined, "nullable: true");

			that.oLogMock.expects("warning")
				.withExactArgs("Illegal nullable: ", null, "sap.ui.model.odata.type.String");

			oType = new StringType(null, {nullable : ""});
			assert.strictEqual(oType.oConstraints, undefined, "illegal nullable -> default");
		});
	});

	//*********************************************************************************************
	QUnit.test("setConstraints w/ strings", function (assert) {
		var oType;

		oType = new StringType({}, {nullable : "true", maxLength : "10"});
		assert.deepEqual(oType.oConstraints, {maxLength : 10});

		oType = new StringType({}, {nullable : "false"});
		assert.deepEqual(oType.oConstraints, {nullable : false});
	});

	//*********************************************************************************************
	QUnit.test("isDigitSequence: constructor", function (assert) {
		var oType,
			that = this;

		// check valid values for isDigitSequence constraint
		[true, "true", false, "false"].forEach(function (vIsDigitSequence, i) {
			// without maxLength
			oType = new StringType({}, {isDigitSequence : vIsDigitSequence});
			assert.deepEqual(oType.oConstraints, i < 2 ? {isDigitSequence : true} : undefined,
				"constructor test #" + i);

			// with maxLength
			oType = new StringType({}, {isDigitSequence : vIsDigitSequence, maxLength : 7});
			assert.deepEqual(oType.oConstraints, i < 2 ? {isDigitSequence : true, maxLength : 7}
				: {maxLength : 7}, "constructor test with maxLength #" + i);
		});
		// check invalid values for isDigitSequence constraint
		["foo", 1, 0, null].forEach(function (vIsDigitSequence) {
			that.oLogMock.expects("warning").withExactArgs("Illegal isDigitSequence: "
				+ vIsDigitSequence, null, "sap.ui.model.odata.type.String");
			oType = new StringType({}, {isDigitSequence : vIsDigitSequence});
			assert.deepEqual(oType.oConstraints, undefined, "Ignore: " + vIsDigitSequence);
		});
	});

	//*********************************************************************************************
	QUnit.test("isDigitSequence: format", function (assert) {
		var oType = new StringType({}, {isDigitSequence : true, maxLength : 7}),
			oTypeNoDigit = new StringType({}, {isDigitSequence : false, maxLength : 7}),
			oTypeNoLength = new StringType({}, {isDigitSequence : true}),
			sValue = "0012345";

		// isDigitSequence: false --> leading zeros are not truncated
		assert.strictEqual(oTypeNoDigit.formatValue(sValue, "string"), sValue, "as string");
		assert.strictEqual(oTypeNoDigit.formatValue(sValue, "int"), 12345, "as int");

		// isDigitSequence: true --> for valid digit sequences leading zeros are truncated except
		// the last digit
		[
			{ v : sValue, r : "12345" }, { v : "0103040", r : "103040" },
			{ v : "0000000", r : "0" }, { v : "A003400", r : "A003400" },
			{ v : "00A3400", r : "00A3400" }, { v : "", r : "" },
			{ v : "7654321", r : "7654321" }, { v : null, r : "" }, { v : undefined, r : null }
		].forEach(function (oFixture) {
			assert.strictEqual(oType.formatValue(oFixture.v, "string"), oFixture.r,
				oFixture.v + " as string");
			assert.strictEqual(oTypeNoLength.formatValue(oFixture.v, "string"), oFixture.r,
				oFixture.v + " as string");
		});
		assert.strictEqual(oType.formatValue(sValue, "any"), "12345", "as any");
		assert.throws(function () {
			oType.formatValue("0", "boolean");
		}, new FormatException("0 is not a valid boolean value"));
		assert.strictEqual(oType.formatValue(sValue, "float"), 12345.0, "as float");
		assert.strictEqual(oType.formatValue(sValue, "int"), 12345, "as int");
	});

	//*********************************************************************************************
	QUnit.test("isDigitSequence: parse", function (assert) {
		var sParsedValue,
			oType = new StringType({}, {isDigitSequence : true, maxLength : 7}),
			sValue = "1234";
		// parse
		assert.strictEqual(oType.parseValue(null, "string"), null, "null");
		assert.strictEqual(oType.parseValue(undefined, "string"), undefined, "undefined");
		assert.strictEqual(oType.parseValue("", "string"), null, "empty string");
		assert.strictEqual(oType.parseValue("42", "string"), "0000042", "parse as string");
		assert.strictEqual(oType.parseValue("1234567", "string"), "1234567", "parse 1234567");
		assert.strictEqual(oType.parseValue(42, "int"), "0000042", "parse as int");
		// remove leading zeros even if length is bigger than expected
		assert.strictEqual(oType.parseValue("012345678", "string"), "12345678", "parse 012345678");

		// do not adjust invalid or too long values
		["A42", "34.2", "12345678"].forEach(function (oValue) {
			assert.strictEqual(oType.parseValue(oValue, "string"), oValue, "parse " + oValue);
		});

		// different lengths
		[6, 10, 83, 84, 85, 1000].forEach(function (iLength) {
			oType = new StringType({}, {isDigitSequence : true, maxLength : iLength});
			sParsedValue = oType.parseValue(sValue, "string");
			assert.strictEqual(sParsedValue.length, iLength, "Length ok: " + iLength);
			assert.strictEqual(sParsedValue.indexOf(sValue), iLength - sValue.length);
		});

		// no maxLength
		oType = new StringType({}, {isDigitSequence : true});
		assert.strictEqual(oType.parseValue("00123", "string"), "123", "remove leading zeros");
		assert.strictEqual(oType.parseValue("00000", "string"), "0", "keep last 0");
		assert.strictEqual(oType.parseValue("12345", "string"), "12345", "parse no leading zeros");
	});

	//*********************************************************************************************
	QUnit.test("isDigitSequence: validate", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new StringType({}, {isDigitSequence : true, maxLength : 7});

			// success
			oType.validateValue("0012345");
			oType.validateValue("324"); // shorter values are OK

			// errors
			["", "0123.45", "0003ABC"].forEach(function (vValue) {
				assert.throws(function () {
					oType.validateValue(vValue);
				}, new ValidateException("EnterDigitsOnly"), "Invalid value: " + vValue);
			});
			assert.throws(function () {
				oType.validateValue("12345678");
			}, new ValidateException("EnterMaximumOfDigits 7"), "Invalid value: 12345678");

			// no maxLength
			oType = new StringType({}, {isDigitSequence : true});
			// success
			oType.validateValue("4711");
			oType.validateValue("0");
			oType.validateValue("002345");
		});
	});
});
