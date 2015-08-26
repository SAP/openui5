/*!
 *{copyright}
 */
sap.ui.require([
	"sap/ui/core/Control",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (Control, NumberFormat, FormatException, ParseException, ValidateException, Int64,
		ODataType, TestUtils) {
	/*global QUnit, sinon */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		NUMBER_MIN_SAFE_INTEGER = -9007199254740991,
		NUMBER_MAX_SAFE_INTEGER = 9007199254740991;

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Int64", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new Int64();

		assert.ok(oType instanceof Int64, "is a Int64");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Int64", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "default format options");
		assert.strictEqual(oType.oConstraints, undefined, "default constraints");
		assert.strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	[
		{i: {nullable: true}, o: undefined},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: false}, o: {nullable: false}},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"}
	].forEach(function (oFixture) {
		QUnit.test("setConstraints(" + JSON.stringify(oFixture.i) + ")", function (assert) {
			var oType;

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
				.once().withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.Int64");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType = new Int64({}, oFixture.i);
			assert.deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	QUnit.test("format success", function (assert) {
		var oType = new Int64();

		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
		assert.strictEqual(oType.formatValue("1234", "any"), "1234", "target type any");
		assert.strictEqual(oType.formatValue("1234", "string"), "1,234", "target type string");
		assert.strictEqual(oType.formatValue("-9223372036854775808", "string"),
			"-9,223,372,036,854,775,808", "min Int64, target type string");
		assert.strictEqual(oType.formatValue("12345", "float"), 12345, "target type float");
		assert.strictEqual(oType.formatValue("12345", "int"), 12345, "target type int");
		assert.strictEqual(oType.formatValue(String(NUMBER_MIN_SAFE_INTEGER), "int"),
			NUMBER_MIN_SAFE_INTEGER, "MIN_SAFE_INTEGER to int");
		assert.strictEqual(oType.formatValue(String(NUMBER_MAX_SAFE_INTEGER), "float"),
			NUMBER_MAX_SAFE_INTEGER, "MAX_SAFE_INTEGER to float");
		assert.strictEqual(oType.formatValue("+" + String(NUMBER_MAX_SAFE_INTEGER), "float"),
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
		QUnit.test(oFixture.test, function (assert) {
			TestUtils.withNormalizedMessages(function () {
				var oType = new Int64();

				try {
					oType.formatValue(oFixture.value, oFixture.targetType);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof FormatException);
					assert.strictEqual(e.message, oFixture.errorText);
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oType = new Int64(); // constraints do not matter

		assert.strictEqual(oType.parseValue(null, "foo"), null, "null");
		assert.strictEqual(oType.parseValue("", "string"), null, "");
		assert.strictEqual(oType.parseValue("1,234,567", "string"), "1234567",
			"multiple grouping separators");
		assert.strictEqual(oType.parseValue(" -12345 ", "string"), "-12345", "spaces");
		assert.strictEqual(oType.parseValue("0012345", "string"), "12345", "leading zeroes");
		assert.strictEqual(oType.parseValue("0", "string"), "0", "only 0");
		assert.strictEqual(oType.parseValue(12345, "int"), "12345", "int as source type");
		assert.strictEqual(oType.parseValue(12345.678, "float"), "12345", "float as source type");
		assert.strictEqual(oType.parseValue(-1.2345e5, "float"), "-123450",
			"float in exp. notation");
		assert.strictEqual(oType.parseValue(1.2345e100, "float"), "123450000000000000000000000000"
			+ "00000000000000000000000000000000000000000000000000000000000000000000000",
			"float with more that 99 digits");

		try {
			oType.parseValue(true, "boolean");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Int64 from boolean");
		}
	});

	//*********************************************************************************************
	["foo", "1,234,567.890", "true", "-", "+"].forEach(function (sValue) {
		QUnit.test("parse invalid value from string: " + sValue, function (assert) {
			TestUtils.withNormalizedMessages(function () {
				var oType = new Int64();
				try {
					oType.parseValue(sValue, "string");
					assert.ok(false, "Expected ParseException not thrown");
				} catch (e) {
					assert.ok(e instanceof ParseException);
					assert.strictEqual(e.message, "EnterInt");
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("parse other minus/plus symbols, unbreakable spaces", function (assert) {
		var oType = new Int64({plusSign: ">", minusSign: "<"});

		// special: non-breaking space as grouping separator
		sap.ui.getCore().getConfiguration().setLanguage("sv");

		assert.strictEqual(oType.parseValue(">1 234 567 890 123 456", "string"),
			"1234567890123456", "plus sign, spaces");
		assert.strictEqual(oType.parseValue("<1 234\u00a0567 890\t123 456 789\u00a0012", "string"),
			"-1234567890123456789012", "minus sign, tab, non-breaking spaces");
	});

	//*********************************************************************************************
	QUnit.test("parse large numbers w/ format options", function (assert) {
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

		oType = new Int64();
		assert.strictEqual(oType.parseValue("1 234 567 890 123 456789", "string"),
				"1234567890123456789", "no format options -> full precision");

		oType = new Int64(oFormatOptions);
		assert.strictEqual(oType.parseValue("1 234 567 890 123 456789", "string"),
				"1234567890123456789", "only safe format options -> full precision");

		// random format option should not influence result
		oFormatOptions.foo = "bar";
		oType = new Int64(oFormatOptions);
		assert.strictEqual(oType.parseValue("1 234 567 890 123 456 789", "string"),
			"1234567890123456789", "random format option");

		// check that short style works
		oType = new Int64({style: "short"});
		assert.strictEqual(oType.parseValue("1K", "string"), "1000", 'style: "short"');

		// error handling with short style
		TestUtils.withNormalizedMessages(function () {
			try {
				oType.parseValue("no number", "string");
				assert.ok(false, "no error");
			} catch (e) {
				assert.ok(e instanceof ParseException);
				assert.strictEqual(e.message, "EnterInt");
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("validate success", function (assert) {
		var oType = new Int64();

		["+1", "-1", "+123", "-123", "0", null, "-9223372036854775808", "9223372036854775807",
		 "+9223372036854775807"].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
		assert.expect(0);
	});

	//*********************************************************************************************
	[false, 1.1, "foo", "1.234"].forEach(function (sValue) {
		QUnit.test("validate errors: " + JSON.stringify(sValue), function (assert) {
			TestUtils.withNormalizedMessages(function () {
				var oType = new Int64();
				try {
					oType.validateValue(sValue, "string");
					assert.ok(false, "Expected ValidateException not thrown");
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					assert.strictEqual(e.message, "EnterInt");
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
		QUnit.test("validate: error: range " + oFixture.test, function (assert) {
			TestUtils.withNormalizedMessages(function () {
				var oType = new Int64();
				try {
					oType.validateValue(oFixture.value, "string");
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					assert.strictEqual(e.message, oFixture.message);
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("validate nullable", function (assert) {
		var oType = new Int64();

		oType.validateValue(null);
		this.mock(jQuery.sap.log).expects("warning").never();

		TestUtils.withNormalizedMessages(function () {
			oType = new Int64({}, {nullable: false});
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "EnterInt");
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new Int64();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		assert.strictEqual(oType.formatValue("1234", "string"), "1'234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true, parseAsString: true}
	}, {
		set: {minIntegerDigits: 17, groupingEnabled: false},
		expect: {minIntegerDigits: 17, groupingEnabled: false, parseAsString: true}
	}].forEach(function (oFixture) {
		QUnit.test("formatOptions: " + JSON.stringify(oFixture.set), function (assert) {
			var oSpy,
				oType = new Int64(oFixture.set);

			assert.deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(NumberFormat, "getIntegerInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});
});
