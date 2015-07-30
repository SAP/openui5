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
	jQuery.sap.require("sap.ui.model.odata.type.Single");
	jQuery.sap.require("sap.ui.test.TestUtils");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Single", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Single();

		ok(oType instanceof sap.ui.model.odata.type.Single, "is a Single");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Single", "type name");
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
						"sap.ui.model.odata.type.Single");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			var oType = new sap.ui.model.odata.type.Single({}, oFixture.i);
			deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	test("format: English", function () {
		var oType = new sap.ui.model.odata.type.Single();

		// number to string
		strictEqual(oType.formatValue(0, "string"), "0", "0");
		strictEqual(oType.formatValue(9999999, "string"), "9,999,999", "99999999");
		strictEqual(oType.formatValue(-9999999, "string"), "-9,999,999", "-99999999");
		strictEqual(oType.formatValue(0.0000001, "string"), "0.0000001", "0.0000001");
		strictEqual(oType.formatValue(Math.fround(1.6), "string"), "1.6", "1.6");
		strictEqual(oType.formatValue(1.2345678, "string"), "1.234568",
			"1.2345678 toPrecision(7)");
		strictEqual(oType.formatValue(1234567.8, "string"), "1,234,568",
			"1234567.8 toPrecision(7)");

		// source type string
		strictEqual(oType.formatValue("1.5", "any"), "1.5", "target type any");
		strictEqual(oType.formatValue("9999999", "string"), "9,999,999", "99999999 as String");
		strictEqual(oType.formatValue("1.25", "float"), 1.25, "target type float");
		strictEqual(oType.formatValue("12.34", "int"), 12, "target type int");

		// other target types
		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue(1.5, "any"), 1.5, "target type any");
		strictEqual(oType.formatValue(1.25, "float"), 1.25, "target type float");
		strictEqual(oType.formatValue(12.34, "int"), 12, "target type int");

		try {
			oType.formatValue(12.34, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Single to boolean");
		}
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Single();

		strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");

		strictEqual(oType.parseValue(" 1,000.234", "string"), Math.fround(1000.234),
			"type string ' 1,000.234'");
		strictEqual(oType.parseValue(" -12,345.6", "string"), Math.fround(-12345.6),
			"type string ' -12,345.6'");
		strictEqual(oType.parseValue("0.12345678", "string"), Math.fround(0.12345678),
			"type string, round to precision");

		strictEqual(oType.parseValue(1234, "int"), 1234, "type int");
		strictEqual(oType.parseValue(1234.56, "float"), Math.fround(1234.56), "type float");

		try {
			oType.parseValue(true, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Single from boolean");
		}
	});

	//*********************************************************************************************
	test("values rounded", function () {
		var oType = new sap.ui.model.odata.type.Single();
		strictEqual(oType.formatValue(oType.parseValue("0.12345678", "string"), "string"),
			"0.1234568");
	});


	//*********************************************************************************************
	test("parse: user error", function () {
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			var oType = new sap.ui.model.odata.type.Single();

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
	test("validate success", function () {
		var oType = new sap.ui.model.odata.type.Single();

		[null, 0, -0, -100000, -9999999.00].forEach(function (sValue) {
			oType.validateValue(sValue);
			ok(true, sValue);
		});
	});

	//*********************************************************************************************
	[false, null, {}, "foo"].forEach(function (sValue) {
		test("validate errors: " + JSON.stringify(sValue), function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Single({}, {nullable: false});

				try {
					oType.validateValue(sValue);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ValidateException);
					// TODO "Enter a number"? We gave lots of numbers!
					strictEqual(e.message, "EnterNumber");
				}
			});
		});
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Single();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		strictEqual(oType.formatValue(1234, "string"), "1,234",
			"before language change");
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(oType.formatValue(1234, "string"), "1'234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true}
	}, {
		set: {decimals: 3, groupingEnabled: false},
		expect: {decimals: 3, groupingEnabled: false}
	}, {
		set: {maxFractionDigits: 3},
		expect: {groupingEnabled: true, maxFractionDigits: 3}
	}].forEach(function (oFixture) {
		test("formatOptions: " + JSON.stringify(oFixture.set), function () {
			var oSpy,
				oType = new sap.ui.model.odata.type.Single(oFixture.set);

			deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(sap.ui.core.format.NumberFormat, "getFloatInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});

} ());
