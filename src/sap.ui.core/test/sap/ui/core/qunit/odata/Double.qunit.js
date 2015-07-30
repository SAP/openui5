/*!
 *{copyright}
 */
(function () {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	jQuery.sap.require("sap.ui.core.Control");
	jQuery.sap.require("sap.ui.core.LocaleData");
	jQuery.sap.require("sap.ui.model.odata.type.Double");
	jQuery.sap.require("sap.ui.test.TestUtils");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Double", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Double();

		ok(oType instanceof sap.ui.model.odata.type.Double, "is a Double");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Double", "type name");
		strictEqual(oType.oFormatOptions, undefined, "default format options");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	[
		{i: {}, o: undefined},
		{i: {nullable: true}, o: undefined},
		{i: {nullable: false}, o: {nullable: false}},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"},
	].forEach(function (oFixture) {
		test("constraints: " + JSON.stringify(oFixture.i) + ")", function () {
			var oType;

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
					.once().withExactArgs(oFixture.warning, null,
						"sap.ui.model.odata.type.Double");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			var oType = new sap.ui.model.odata.type.Double({}, oFixture.i);
			deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	test("format: English", function () {
		var oType = new sap.ui.model.odata.type.Double();

		// number to string
		strictEqual(oType.formatValue(0, "string"), "0", "0");
		strictEqual(oType.formatValue(9999999, "string"), "9,999,999", "99999999");
		strictEqual(oType.formatValue(-9999999, "string"), "-9,999,999", "-99999999");
		strictEqual(oType.formatValue(9.99999999999999e+14, "string"), "999,999,999,999,999",
			"9.99999999999999e+14");
		strictEqual(oType.formatValue(1e+15, "string"), "1\u00a0E+15", "1e+15");
		strictEqual(oType.formatValue(-9.99999999999999e+14, "string"), "-999,999,999,999,999",
			"-9.99999999999999e+14");
		strictEqual(oType.formatValue(-1e+15, "string"), "-1\u00a0E+15", "-1e+15");
		strictEqual(oType.formatValue(1e-4, "string"), "0.0001", "1e-4");
		strictEqual(oType.formatValue(9.99999999999999e-5, "string"),
			"9.99999999999999\u00a0E-5", "9.99999999999999e-5");

		// source type string
		strictEqual(oType.formatValue("123,4", "any"), "123,4", "target type any");
		strictEqual(oType.formatValue("9999999", "string"), "9,999,999", "99999999");
		strictEqual(oType.formatValue("1234.567", "float"), 1234.567, "target type float");
		strictEqual(oType.formatValue("1234.1", "int"), 1234, "target type int");

		// TODO "NaN", "Infinity", "-Infinity"

		// other target types
		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue(123.4, "any"), 123.4, "target type any");
		strictEqual(oType.formatValue(1234.567, "float"), 1234.567, "target type float");
		strictEqual(oType.formatValue(1234.1, "int"), 1234, "target type int");

		try {
			oType.formatValue(12.34, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Double to boolean");
		}
	});

	//*********************************************************************************************
	test("format: modified Swedish", function () {
		var oType = new sap.ui.model.odata.type.Double({plusSign: ">", minusSign: "<"});

		// Swedish is interesting because it uses a different decimal separator, non-breaking
		// space as grouping separator and _not_ the 'E' for the exponential format.
		// TODO The 'e' is not replaced because NumberFormat doesn't care either (esp. in parse).
		sap.ui.getCore().getConfiguration().setLanguage("sv");

		strictEqual(oType.formatValue("-1.234e+3", "string"), "<1\u00a0234", "check modification");
		strictEqual(oType.formatValue("-1.234e+15", "string"), "<1,234\u00a0E>15",
			"check replacement");
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Double();

		strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");

		strictEqual(oType.parseValue("1.234", "string"), 1.234, "type string");
		strictEqual(oType.parseValue("-12345", "string"), -12345, "type string");
		strictEqual(oType.parseValue("12.345E-3", "string"), 0.012345, "type string w/ exp");
		strictEqual(oType.parseValue("12.345 E-3", "string"), 0.012345,
			"type string w/ exp and space");
		strictEqual(oType.parseValue("12.345\u00a0E-3", "string"), 0.012345,
			"type string w/ exp and non-breaking space");
		strictEqual(oType.parseValue(1234, "int"), 1234, "type int");
		strictEqual(oType.parseValue(1234.567, "float"), 1234.567, "type float");

		try {
			oType.parseValue(true, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Double from boolean");
		}
	});

	//*********************************************************************************************
	test("parse: user error", function () {
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			var oType = new sap.ui.model.odata.type.Double();

			try {
				oType.parseValue("foo", "string");
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ParseException);
				strictEqual(e.message, "EnterNumber");
			}
		});
	});

	//*********************************************************************************************
	[false, null, {}, "foo"].forEach(function (sValue) {
		test("validate errors: " + JSON.stringify(sValue), function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Double({}, {nullable: false});

				try {
					oType.validateValue(sValue);
					ok(false, "no error thrown");
				} catch (e) {
					ok(e instanceof sap.ui.model.ValidateException);
					strictEqual(e.message, "EnterNumber");
				}
			});
		});
	});

	//*********************************************************************************************
	test("validate success", function () {
		var oType = new sap.ui.model.odata.type.Double();

		// TODO "NaN", "Infinity", "-Infinity"
		[null, 1.1, 1.234E+235].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
		expect(0);
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Double();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		strictEqual(oType.formatValue("1.234e3", "string"), "1,234",
			"before language change");
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(oType.formatValue("1.234e3", "string"), "1'234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true}
	}, {
		set: {decimals: 7, groupingEnabled: false},
		expect: {decimals: 7, groupingEnabled: false}
	}].forEach(function (oFixture) {
		test("formatOptions: " + JSON.stringify(oFixture.set), function () {
			var oSpy,
				oType = new sap.ui.model.odata.type.Double(oFixture.set);

			deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(sap.ui.core.format.NumberFormat, "getFloatInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});
} ());
