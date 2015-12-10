/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/String",
	"sap/ui/test/TestUtils"
], function (FormatException, ParseException, ValidateException, ODataType, StringType,
		TestUtils) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.String");

	QUnit.test("basics", function (assert) {
		var oType = new StringType();

		assert.ok(oType instanceof StringType, "is a String");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.String", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "no format options");
		assert.strictEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("w/ constraints", function (assert) {
		var oType = new StringType({}, {
			contains: "a",
			endsWith: "foo",
			endsWithIgnoreCase: "bar",
			equals: "baz",
			maxLength: 12,
			minLength: 2,
			search: "s2403r5j",
			startsWith: "me",
			startsWithIgnoreCase: "you"
		});

		assert.deepEqual(oType.oConstraints, {maxLength: 12});
	});

	//*********************************************************************************************
	[
		{maxLength: "foo", warning: "Illegal maxLength: foo"},
		{maxLength: -1, warning: "Illegal maxLength: -1"},
		{maxLength: 0, warning: "Illegal maxLength: 0"}
	].forEach(function (oFixture, i) {
		QUnit.test("constraints error #" + i, function (assert) {
			var oType = new StringType();

			this.mock(jQuery.sap.log).expects("warning")
				.withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.String");

			oType = new StringType({}, {maxLength: oFixture.maxLength});
			assert.strictEqual(oType.oConstraints, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("format", function (assert) {
		var oType = new StringType({}, {maxLength: 5});

		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
		assert.strictEqual(oType.formatValue("foo", "any"), "foo", "target type any");
		assert.strictEqual(oType.formatValue("true", "boolean"), true, "target type boolean");
		assert.strictEqual(oType.formatValue("3.1415", "float"), 3.1415, "target type float");
		assert.strictEqual(oType.formatValue("42", "int"), 42, "target type int");
		assert.strictEqual(oType.formatValue("foobar", "string"), "foobar", "target type string");
		try {
			oType.formatValue("baz", "foo");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message, "Don't know how to format String to foo");
		}
	});

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
			oType.parseValue("baz", "foo");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message, "Don't know how to parse String from foo");
		}
	});

	//*********************************************************************************************
	QUnit.test("validate", function (assert) {
		var oType = new StringType({}, {maxLength: 3});

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
	QUnit.test("nullable", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new StringType({}, {nullable: false});

			assert.deepEqual(oType.oConstraints, {nullable: false}, "nullable: false");
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterText");
			}

			oType = new StringType({}, {nullable: false, maxLength: 3});
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterTextMaxLength 3");
			}

			oType = new StringType({}, {nullable: true});
			oType.validateValue(null); // does not throw
			assert.strictEqual(oType.oConstraints, undefined, "nullable: true");

			this.mock(jQuery.sap.log).expects("warning").once()
				.withExactArgs("Illegal nullable: ", null, "sap.ui.model.odata.type.String");

			oType = new StringType(null, {nullable: ""});
			assert.strictEqual(oType.oConstraints, undefined, "illegal nullable -> default");
		});
	});

	//*********************************************************************************************
	QUnit.test("setConstraints w/ strings", function (assert) {
		var oType = new StringType();

		this.mock(jQuery.sap.log).expects("warning").never();

		oType = new StringType({}, {nullable: "true", maxLength: "10"});
		assert.deepEqual(oType.oConstraints, {maxLength: 10});

		oType = new StringType({}, {nullable: "false"});
		assert.deepEqual(oType.oConstraints, {nullable: false});
	});

	//*********************************************************************************************
	QUnit.test("isDigitSequence", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType,
				sValue = "0012345";

			// check valid values for isDigitSequence constraint
			oType = new StringType({}, {isDigitSequence : true, maxLength : 7});
			assert.deepEqual(oType.oConstraints, {isDigitSequence : true, maxLength : 7},
				"isDigitSequence: true");
			oType = new StringType({}, {isDigitSequence : "true", maxLength : 7});
			assert.deepEqual(oType.oConstraints, {isDigitSequence : true, maxLength : 7},
				"isDigitSequence: true");
			oType = new StringType({}, {isDigitSequence : false});
			assert.deepEqual(oType.oConstraints, undefined, "isDigitSequence: false");
			oType = new StringType({}, {isDigitSequence : "false"});
			assert.deepEqual(oType.oConstraints, undefined, "isDigitSequence: false");

			// format
			oType = new StringType({}, {isDigitSequence : "false", maxLength : 7});
			assert.strictEqual(oType.formatValue(sValue, "string"), sValue, "as string");
			assert.strictEqual(oType.formatValue(sValue, "int"), 12345, "as int");

			oType = new StringType({}, {isDigitSequence : "true", maxLength : 7});
			[
				{ v : sValue, r : "12345" }, { v : "0103040", r : "103040" },
				{ v : "0000000", r : "0" }, { v : "A003400", r : "A003400" },
				{ v : "00A3400", r : "00A3400" }, { v : "", r : "" }
			].forEach(function (oFixture) {
				assert.strictEqual(oType.formatValue(oFixture.v, "string"),
					oFixture.r, oFixture.v + " as string");
			});
			assert.strictEqual(oType.formatValue(sValue, "int"), 12345, "as int");
			assert.strictEqual(oType.formatValue(sValue, "float"), 12345.0, "as float");

			// parse
			assert.strictEqual(oType.parseValue(42, "int"), "0000042", "parse 42 as int");
			assert.strictEqual(oType.parseValue("42", "string"), "0000042",
				"parse \"42\" as string");
			// do not adjust invalid values
			assert.strictEqual(oType.parseValue("A42", "string"), "A42", "parse \"A42\" as string");
			assert.strictEqual(oType.parseValue("34.2", "string"), "34.2",
				"parse \"34.2\" as string");

			// validate
			oType.validateValue(sValue);
			["", "0123.45", "0003ABC", "0324", "12345678"].forEach(function (vValue) {
				// too short digit values do not happen if parse is called before but nevertheless
				// should throw a validation error.
				assert.throws(function () {
					oType.validateValue(vValue);
				}, new ValidateException("EnterDigitsOnly 7"));
			});
		});
	});
	//*********************************************************************************************
	[
		{isDigitSequence : "foo", maxLength : 7, warning : "Illegal isDigitSequence: foo"},
		{isDigitSequence : 1, maxLength : 7, warning : "Illegal isDigitSequence: 1"},
		{isDigitSequence : 0, maxLength : 7, warning : "Illegal isDigitSequence: 0"},
		{isDigitSequence : true, warning : "isDigitSequence requires maxLength"}
	].forEach(function (oFixture, i) {
		QUnit.test("isDigitSequence - errors #" + i, function (assert) {
			var oType;

			this.mock(jQuery.sap.log).expects("warning")
				.withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.String");

			oType = new StringType({}, {isDigitSequence : oFixture.isDigitSequence,
				maxLength : oFixture.maxLength});
			assert.deepEqual(oType.oConstraints,
				oFixture.maxLength ? {maxLength: oFixture.maxLength} : undefined);
		});
	});
});
