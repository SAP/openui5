/*!
 *{copyright}
 */
(function () {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		NUMBER_MIN_SAFE_INTEGER = -9007199254740991,
		NUMBER_MAX_SAFE_INTEGER = 9007199254740991;


	jQuery.sap.require("sap.ui.model.odata.type.Int64");
	jQuery.sap.require("sap.ui.core.Control");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Int64", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Int64();

		ok(oType instanceof sap.ui.model.odata.type.Int64, "is a Int64");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Int64", "type name");
		strictEqual(oType.oFormatOptions, undefined, "default format options");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	[
		{i: {nullable: true}, o: undefined},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: false}, o: {nullable: false}},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"}
	].forEach(function (oFixture) {
		test("setConstraints(" + JSON.stringify(oFixture.i) + ")", sinon.test(function () {
			var oType;

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.Int64");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType= new sap.ui.model.odata.type.Int64({}, oFixture.i);
			deepEqual(oType.oConstraints, oFixture.o);
		}));
	});

	//*********************************************************************************************
	test("format success", function () {
		var oType = new sap.ui.model.odata.type.Int64();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("1234", "any"), "1234", "target type any");
		strictEqual(oType.formatValue("1234", "string"), "1,234", "target type string");
		strictEqual(oType.formatValue("-9223372036854775808", "string"),
			"-9,223,372,036,854,775,808", "min Int64, target type string");
		strictEqual(oType.formatValue("12345", "float"), 12345, "target type float");
		strictEqual(oType.formatValue("12345", "int"), 12345, "target type int");
		strictEqual(oType.formatValue(String(NUMBER_MIN_SAFE_INTEGER), "int"),
			NUMBER_MIN_SAFE_INTEGER, "MIN_SAFE_INTEGER to int");
		strictEqual(oType.formatValue(String(NUMBER_MAX_SAFE_INTEGER), "float"),
			NUMBER_MAX_SAFE_INTEGER, "MAX_SAFE_INTEGER to float");
		strictEqual(oType.formatValue("+" + String(NUMBER_MAX_SAFE_INTEGER), "float"),
			NUMBER_MAX_SAFE_INTEGER, "MAX_SAFE_INTEGER to float");
	});

	//*********************************************************************************************
	[
		{test:"format to boolean", value:"12.34", targetType: "boolean",
			errorText:"Don't know how to format sap.ui.model.odata.type.Int64 to boolean"},
		{test:"format to int with overflow error", value: "9007199254740992",
			targetType: "int",
			errorText:"EnterIntMax 9,007,199,254,740,991"},
		{test:"format to int with overflow error", value: "-9007199254740992",
			targetType: "int",
			errorText:"EnterIntMin -9,007,199,254,740,991"}
	].forEach(function (oFixture) {
		test(oFixture.test, function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Int64();

				try {
					oType.formatValue(oFixture.value, oFixture.targetType);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.FormatException);
					strictEqual(e.message, oFixture.errorText);
				}
			});
		});
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Int64(); // constraints do not matter

		strictEqual(oType.parseValue(null, "foo"), null, "null");
		strictEqual(oType.parseValue("", "string"), null, "");
		strictEqual(oType.parseValue("1,234,567", "string"), "1234567",
			"multiple grouping separators");
		strictEqual(oType.parseValue(" -12345 ", "string"), "-12345", "spaces");
		strictEqual(oType.parseValue("0012345", "string"), "12345", "leading zeroes");
		strictEqual(oType.parseValue("0", "string"), "0", "only 0");
		strictEqual(oType.parseValue(12345, "int"), "12345", "int as source type");
		strictEqual(oType.parseValue(12345.678, "float"), "12345", "float as source type");
		strictEqual(oType.parseValue(-1.2345e5, "float"), "-123450", "float in exp. notation");
		strictEqual(oType.parseValue(1.2345e100, "float"), "12345000000000000000000000000000000000"
			+ "000000000000000000000000000000000000000000000000000000000000000",
			"float with more that 99 digits");

		try {
			oType.parseValue(true, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Int64 from boolean");
		}
	});

	//*********************************************************************************************
	["foo", "1,234,567.890", "true", "-", "+"].forEach(function (sValue) {
		test("parse invalid value from string: " + sValue, function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Int64();
				try {
					oType.parseValue(sValue, "string");
					ok(false, "Expected ParseException not thrown");
				}
				catch (e) {
					ok(e instanceof sap.ui.model.ParseException)
					strictEqual(e.message, "EnterInt");
				}
			});
		});
	});

	//*********************************************************************************************
	test("parse other minus/plus symbols, unbreakable spaces", sinon.test(function () {
		var oType = new sap.ui.model.odata.type.Int64({plusSign: ">", minusSign: "<"});

		// special: non-breaking space as grouping separator
		sap.ui.getCore().getConfiguration().setLanguage("sv");

		strictEqual(oType.parseValue(">1 234 567 890 123 456", "string"),
			"1234567890123456", "plus sign, spaces");
		strictEqual(oType.parseValue("<1 234\u00a0567 890\t123 456 789\u00a0012", "string"),
			"-1234567890123456789012", "minus sign, tab, non-breaking spaces");
	}));

	//*********************************************************************************************
	test("parse large numbers w/ format options", function () {
		var oFormatOptions = {
				plusSign: '+',
				minusSign: '-',
				minFractionDigits: 5,
				maxFractionDigits: 10,
				minIntegerDigits: 5,
				maxIntegerDigits: 10,
				decimals: 10,
				groupingEnabled: false,
				groupingSeparator: "'",
				decimalSeparator: '.'
			}, oType;

		oType = new sap.ui.model.odata.type.Int64();
		strictEqual(oType.parseValue("1 234 567 890 123 456789", "string"),
				"1234567890123456789", "no format options -> full precision");

		oType = new sap.ui.model.odata.type.Int64(oFormatOptions);
		strictEqual(oType.parseValue("1 234 567 890 123 456789", "string"),
				"1234567890123456789", "only safe format options -> full precision");

		// random format option should not influence result
		oFormatOptions.foo = "bar";
		oType = new sap.ui.model.odata.type.Int64(oFormatOptions);
		strictEqual(oType.parseValue("1 234 567 890 123 456 789", "string"),
			"1234567890123456789", "random format option");

		// check that short style works
		oType = new sap.ui.model.odata.type.Int64({style: "short"});
		strictEqual(oType.parseValue("1K", "string"), "1000", 'style: "short"');

		// error handling with short style
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue("no number", "string");
				ok(false, "no error");
			} catch (e) {
				ok(e instanceof sap.ui.model.ParseException);
				strictEqual(e.message, "EnterInt");
			}
		});
	});

	//*********************************************************************************************
	test("validate success", function () {
		var oType = new sap.ui.model.odata.type.Int64();

		["+1", "-1", "+123", "-123", "0", null, "-9223372036854775808", "9223372036854775807",
		 "+9223372036854775807"].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
		expect(0);
	});

	//*********************************************************************************************
	[false, 1.1, "foo", "1.234"].forEach(function (sValue) {
		test("validate errors: " + JSON.stringify(sValue), function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Int64();
				try {
					oType.validateValue(sValue, "string");
					ok(false, "Expected ValidateException not thrown");
				}
				catch (e) {
					ok(e instanceof sap.ui.model.ValidateException);
					strictEqual(e.message, "EnterInt");
				}
			});
		});
	});

	//*********************************************************************************************
	[
		{ test: "exceeds min by length", value: "-92233720368547758090",
			message: "EnterIntMin -9,223,372,036,854,775,808"},
		{ test: "exceeds max by length", value: "92233720368547758080" ,
			message: "EnterIntMax 9,223,372,036,854,775,807"},
		{ test: "exceeds min by 1", value: "-9223372036854775809" ,
			message: "EnterIntMin -9,223,372,036,854,775,808"},
		{ test: "exceeds max by 1", value: "9223372036854775808",
			message: "EnterIntMax 9,223,372,036,854,775,807"}
	].forEach(function (oFixture) {
		test("validate: error: range " + oFixture.test, function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Int64();
				try {
					oType.validateValue(oFixture.value, "string");
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ValidateException);
					strictEqual(e.message, oFixture.message);
				}
			});
		});
	});

	//*********************************************************************************************
	test("validate nullable", function () {
		var oType = new sap.ui.model.odata.type.Int64();

		oType.validateValue(null);
		this.mock(jQuery.sap.log).expects("warning").never();

		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			oType = new sap.ui.model.odata.type.Int64({}, {nullable: false});
			try {
				oType.validateValue(null);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException)
				equal(e.message, "EnterInt");
			}
		});
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Int64();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(oType.formatValue("1234", "string"), "1'234", "adjusted to changed language");
	});

	//*********************************************************************************************
	[{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true, parseAsString: true}
	}, {
		set: {minIntegerDigits: 17, groupingEnabled: false},
		expect: {minIntegerDigits: 17, groupingEnabled: false, parseAsString: true}
	}].forEach(function (oFixture) {
		test("formatOptions: " + JSON.stringify(oFixture.set), function () {
			var oSpy,
				oType = new sap.ui.model.odata.type.Int64(oFixture.set);

			deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(sap.ui.core.format.NumberFormat, "getIntegerInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});

} ());
