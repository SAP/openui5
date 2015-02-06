/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	jQuery.sap.require("sap.ui.model.odata.type.Decimal");
	jQuery.sap.require("sap.ui.core.Control");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Decimal", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		ok(oType instanceof sap.ui.model.odata.type.Decimal, "is a Decimal");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		ok(!(oType instanceof sap.ui.model.type.Float), "is not a Float");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Decimal", "type name");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	test("w/ float format options", function () {
		var oType = new sap.ui.model.odata.type.Decimal({
				minIntegerDigits: 5,
				maxIntegerDigits: 5,
				minFractionDigits: 5,
				maxFractionDigits: 5,
				pattern: "",
				groupingEnabled: false,
				groupingSeparator: "'",
				decimalSeparator: ",",
				plusSign: '+',
				minusSign: '-',
				showMeasure: true,
				style: 'short',
				roundingMode: 'floor'
			});

		strictEqual(oType.oFormatOptions, undefined, "float format options are ignored");
	});

	//*********************************************************************************************
	jQuery.each([
		{i: {precision: 8, scale: 3}, o: {precision: 8, scale: 3}},
		{i: {nullable: false, scale: 3}, o: {nullable: false, scale: 3}},
		{i: {nullable: "foo"}, o: undefined,
			warning: "Illegal nullable: foo"},
		{i: {precision: 8, scale: "foo"}, o: {precision: 8},
			warning: "Illegal scale: foo"},
		{i: {precision: 8, scale: -1}, o: {precision: 8},
			warning: "Illegal scale: -1"},
		{i: {precision: "foo", scale: 3}, o: {scale: 3},
			warning: "Illegal precision: foo"},
		{i: {precision: -1, scale: 3}, o: {scale: 3},
			warning: "Illegal precision: -1"},
		{i: {precision: 0, scale: 3}, o: {scale: 3},
			warning: "Illegal precision: 0"},
		{i: {precision: 2, scale: 3}, o: {precision: 2, scale: Infinity},
			warning: "Illegal scale: must be less than precision (precision=2, scale=3)"}
    ], function (i, oFixture) {
		test("setConstraints(" + JSON.stringify(oFixture.i) + ")", function () {
			var oType = new sap.ui.model.odata.type.Decimal();

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.Decimal");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType= new sap.ui.model.odata.type.Decimal({}, oFixture.i);
			deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	test("format", function () {
		var oType = new sap.ui.model.odata.type.Decimal({}, {
				precision: 8,
				scale: 3
			});

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("1234", "any"), "1234", "target type any");
		strictEqual(oType.formatValue("1234", "float"), 1234, "target type float");
		strictEqual(oType.formatValue("1234.1", "int"), 1234, "target type int");
		strictEqual(oType.formatValue("1234", "string"), "1,234.000", "target type string");
		strictEqual(oType.formatValue("1234.1234", "string"), "1,234.123", "rounding");
		strictEqual(oType.formatValue("123456", "string"), "123,456.000", "surpassing precision");
		try {
			oType.formatValue(12.34, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Decimal to boolean");
		}
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Decimal(); // constraints do not matter

		strictEqual(oType.parseValue("1,234,567.89", "string"), "1234567.89",
			"multiple grouping separators");
		strictEqual(oType.parseValue(" -12345 ", "string"), "-12345", "spaces");
		strictEqual(oType.parseValue(".1234", "string"), "0.1234", "no integer digits");
		strictEqual(oType.parseValue("-1234.", "string"), "-1234", "decimal point w/o decimals");
		throws(function () {
			oType.parseValue("1 234.567.890", "string");
		}, "multiple decimal points");

		strictEqual(oType.parseValue(1234, "int"), "1234", "type int");
		strictEqual(oType.parseValue(1234.567, "float"), "1234.567", "type float");
		strictEqual(oType.parseValue(1.2345e100, "float"), "12345000000000000000000000000000000000"
			+ "000000000000000000000000000000000000000000000000000000000000000",
			"float with more that 99 digits");
		strictEqual(oType.parseValue(-1.2345e-5, "float"), "-0.000012345", "small float");

		strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");

		try {
			oType.parseValue(true, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Decimal from boolean");
		}
	});

	//*********************************************************************************************
	test("large numbers, modified Swedish", function () {
		var fnLocaleData = sap.ui.core.LocaleData.getInstance,
			oType,
			oValue = "-1",
			oExpected = "<1";

		// special: non-breaking space as grouping separator
		// We did not find any locale using different characters for plus or minus sign, so we
		// modify the LocaleData here.
		// TODO simply use formatOptions once they are supported
		this.stub(sap.ui.core.LocaleData, "getInstance", function () {
			var oLocaleData = fnLocaleData.apply(this, arguments);
			oLocaleData.mData["symbols-latn-plusSign"] = ">";
			oLocaleData.mData["symbols-latn-minusSign"] = "<";
			return oLocaleData;
		});

		sap.ui.getCore().getConfiguration().setLanguage("sv");
		oType = new sap.ui.model.odata.type.Decimal({}, {scale: "variable"});

		strictEqual(oType.formatValue("1234567890123456.789012", "string"),
			"1\u00a0234\u00a0567\u00a0890\u00a0123\u00a0456,789012",
			"format w/ decimals");
		strictEqual(oType.formatValue("-1234567890123456789012", "string"),
			"<1\u00a0234\u00a0567\u00a0890\u00a0123\u00a0456\u00a0789\u00a0012",
			"format w/ minus");
		while (oValue.length < 102) {
			oValue += "000";
			oExpected += "\u00a0000";
		}
		strictEqual(oType.formatValue(oValue, "string"), oExpected, "format >99 integer digits");

		strictEqual(oType.parseValue(">1 234 567 890 123 456,789012", "string"),
			"1234567890123456.789012", "plus sign, spaces");
		strictEqual(oType.parseValue("<1 234\u00a0567 890\t123 456 789\u00a0012", "string"),
			"-1234567890123456789012", "minus sign, tab, non-breaking spaces");
		strictEqual(oType.parseValue(" 1 234\u00a0567 890,123456789012", "string"),
			"1234567890.123456789012", "many decimals");
	});

	//*********************************************************************************************
	jQuery.each([
		{constraints: {scale: 1}, error: "EnterNumberScale 1"},
		{constraints: {precision: 10, scale: 3}, error: "EnterNumberPrecisionScale 10 3"},
		{constraints: {precision: 1, scale: "variable"}, error: "EnterNumberPrecision 1"},
		{constraints: {scale: "variable"}, error: "EnterNumber"}
	], function (i, oFixture) {
		test("parse: user error: " + JSON.stringify(oFixture.constraints), function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Decimal({}, oFixture.constraints);

				try {
					oType.parseValue("foo", "string");
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ParseException);
					strictEqual(e.message, oFixture.error);
				}
			});
		});
	});

	//*********************************************************************************************
	jQuery.each([false, 1, "foo", "1.1", "1234", "1.234E-32"], function (i, sValue) {
		test("validate errors: " + JSON.stringify(sValue), function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Decimal({}, {precision: 3});

				try {
					oType.validateValue(sValue);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ValidateException);
					strictEqual(e.message, "EnterNumberPrecisionScale 3 0");
				}
			});
		});
	});

	//*********************************************************************************************
	test("validate success", 0, function () {
		var oType = new sap.ui.model.odata.type.Decimal({}, {precision: 6, scale: 3});

		jQuery.each(["+1.1", "+123.123", "-123.1", "+123.1", "1.123", "-1.123", "123.1", "1",
		            "-123"],
			function (i, sValue) {
				oType.validateValue(sValue);
			}
		);
	});

	//*********************************************************************************************
	test("integer + fraction", function () {
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			var oType = new sap.ui.model.odata.type.Decimal({}, {precision: 6, scale: 3}),
				sValue = "-1234.567";

			try {
				oType.validateValue(sValue);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "EnterNumberPrecisionScale 6 3");
			}
		});
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Decimal();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(oType.formatValue("1234", "string"), "1'234", "adjusted to changed language");
	});

	//*********************************************************************************************
	test('scale="variable"', function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		this.mock(jQuery.sap.log).expects("warning").never();

		oType= new sap.ui.model.odata.type.Decimal({}, {precision: 3, scale: "variable"});
		jQuery.each(["123", "12.3", "-1.23"],
			function (i, sValue) {
				strictEqual(oType.formatValue(sValue, "string"), sValue);
				oType.validateValue(sValue);
			}
		);

		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			jQuery.each(["1234", "123.4", "1.234"], function (i, sValue) {
				try {
					oType.validateValue(sValue);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ValidateException);
					strictEqual(e.message, "EnterNumberPrecision 3");
				}
			});
		});
	});

	//*********************************************************************************************
	test("validate: nullable", function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		// nullable=true
		oType.validateValue(null);

		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			oType= new sap.ui.model.odata.type.Decimal({}, {nullable: false, scale: "variable"});
			try {
				oType.validateValue(null);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "EnterNumber");
			}
		});
	});

	//*********************************************************************************************
	test("setConstraints w/ strings", function () {
		var oType = new sap.ui.model.odata.type.Decimal();

		this.mock(jQuery.sap.log).expects("warning").never();

		oType= new sap.ui.model.odata.type.Decimal({},
			{nullable: "false", precision: "10", scale: "3"});
		deepEqual(oType.oConstraints, {nullable: false, precision: 10, scale: 3});

		oType= new sap.ui.model.odata.type.Decimal({}, {nullable: "true"});
		strictEqual(oType.oConstraints, undefined);
	});
} ());
