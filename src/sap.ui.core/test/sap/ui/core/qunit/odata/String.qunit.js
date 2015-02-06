/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.model.odata.type.String");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.String");

	test("basics", function () {
		var oType = new sap.ui.model.odata.type.String();

		ok(oType instanceof sap.ui.model.odata.type.String, "is a String");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.String", "type name");
		strictEqual(oType.oFormatOptions, undefined, "no format options");
		strictEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	test("w/ constraints", function () {
		var oType = new sap.ui.model.odata.type.String({}, {
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

		deepEqual(oType.oConstraints, {maxLength: 12});
	});

	//*********************************************************************************************
	jQuery.each([
		{maxLength: "foo", warning: "Illegal maxLength: foo"},
		{maxLength: -1, warning: "Illegal maxLength: -1"},
		{maxLength: 0, warning: "Illegal maxLength: 0"}
	], function (i, oFixture) {
		test("constraints error #" + i, function () {
			var oType = new sap.ui.model.odata.type.String();

			this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.String");

			oType = new sap.ui.model.odata.type.String({}, {maxLength: oFixture.maxLength});
			strictEqual(oType.oConstraints, undefined);
		});
	});

	//*********************************************************************************************
	test("format", function () {
		var oType = new sap.ui.model.odata.type.String({}, {maxLength: 5});

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("foo", "any"), "foo", "target type any");
		strictEqual(oType.formatValue("true", "boolean"), true, "target type boolean");
		strictEqual(oType.formatValue("3.1415", "float"), 3.1415, "target type float");
		strictEqual(oType.formatValue("42", "int"), 42, "target type int");
		strictEqual(oType.formatValue("foobar", "string"), "foobar", "target type string");
		try {
			oType.formatValue("baz", "foo");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message, "Don't know how to format String to foo");
		}
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.String(); // constraints do not matter

		strictEqual(oType.parseValue(null, "string"), null, "null");
		strictEqual(oType.parseValue("", "string"), null, "empty string is converted to null");
		strictEqual(oType.parseValue(undefined, "string"), undefined, "undefined");
		strictEqual(oType.parseValue(true, "boolean"), "true", "source type boolean");
		strictEqual(oType.parseValue(3.1415, "float"), "3.1415", "source type float");
		strictEqual(oType.parseValue(42, "int"), "42", "source type int");
		strictEqual(oType.parseValue("foobar", "string"), "foobar", "source type string");
		try {
			oType.parseValue("baz", "foo");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message, "Don't know how to parse String from foo");
		}
	});

	//*********************************************************************************************
	test("validate", function () {
		var oType = new sap.ui.model.odata.type.String({}, {maxLength: 3});

		jQuery.each(["", "A", "AB", "ABC"],
			function (i, sValue) {
				oType.validateValue(sValue);
			}
		);

		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			try {
				oType.validateValue("ABCD");
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "EnterTextMaxLength 3");
			}
		});

		try {
			oType.validateValue(42);
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message, "Illegal sap.ui.model.odata.type.String value: 42");
		}
	});

	//*********************************************************************************************
	test("nullable", function () {
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			var oType = new sap.ui.model.odata.type.String({}, {nullable: false});

			deepEqual(oType.oConstraints, {nullable: false}, "nullable: false");
			try {
				oType.validateValue(null);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "EnterText");
			}

			oType = new sap.ui.model.odata.type.String({}, {nullable: false, maxLength: 3});
			try {
				oType.validateValue(null);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "EnterTextMaxLength 3");
			}

			oType = new sap.ui.model.odata.type.String({}, {nullable: true});
			oType.validateValue(null); // does not throw
			strictEqual(oType.oConstraints, undefined, "nullable: true");

			this.mock(jQuery.sap.log).expects("warning").once()
				.withExactArgs("Illegal nullable: ", null, "sap.ui.model.odata.type.String");

			oType = new sap.ui.model.odata.type.String(null, {nullable: ""});
			strictEqual(oType.oConstraints, undefined, "illegal nullable -> default");
		});
	});

	//*********************************************************************************************
	test("setConstraints w/ strings", function () {
		var oType = new sap.ui.model.odata.type.String();

		this.mock(jQuery.sap.log).expects("warning").never();

		oType = new sap.ui.model.odata.type.String({}, {nullable: "true", maxLength: "10"});
		deepEqual(oType.oConstraints, {maxLength: 10});

		oType = new sap.ui.model.odata.type.String({}, {nullable: "false"});
		deepEqual(oType.oConstraints, {nullable: false});
	});
} ());
