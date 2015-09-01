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
], function (FormatException, ParseException, ValidateException, ODataType, TypeString,
		TestUtils) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.String");

	QUnit.test("basics", function (assert) {
		var oType = new TypeString();

		assert.ok(oType instanceof TypeString, "is a String");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.String", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "no format options");
		assert.strictEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("w/ constraints", function (assert) {
		var oType = new TypeString({}, {
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
			var oType = new TypeString();

			this.mock(jQuery.sap.log).expects("warning")
				.withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.String");

			oType = new TypeString({}, {maxLength: oFixture.maxLength});
			assert.strictEqual(oType.oConstraints, undefined);
		});
	});

	//*********************************************************************************************
	QUnit.test("format", function (assert) {
		var oType = new TypeString({}, {maxLength: 5});

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
		var oType = new TypeString(); // constraints do not matter

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
		var oType = new TypeString({}, {maxLength: 3});

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
			var oType = new TypeString({}, {nullable: false});

			assert.deepEqual(oType.oConstraints, {nullable: false}, "nullable: false");
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterText");
			}

			oType = new TypeString({}, {nullable: false, maxLength: 3});
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterTextMaxLength 3");
			}

			oType = new TypeString({}, {nullable: true});
			oType.validateValue(null); // does not throw
			assert.strictEqual(oType.oConstraints, undefined, "nullable: true");

			this.mock(jQuery.sap.log).expects("warning").once()
				.withExactArgs("Illegal nullable: ", null, "sap.ui.model.odata.type.String");

			oType = new TypeString(null, {nullable: ""});
			assert.strictEqual(oType.oConstraints, undefined, "illegal nullable -> default");
		});
	});

	//*********************************************************************************************
	QUnit.test("setConstraints w/ strings", function (assert) {
		var oType = new TypeString();

		this.mock(jQuery.sap.log).expects("warning").never();

		oType = new TypeString({}, {nullable: "true", maxLength: "10"});
		assert.deepEqual(oType.oConstraints, {maxLength: 10});

		oType = new TypeString({}, {nullable: "false"});
		assert.deepEqual(oType.oConstraints, {nullable: false});
	});
});
