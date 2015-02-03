/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		NUMBER_MIN_SAFE_INTEGER = -9007199254740991,
		NUMBER_MAX_SAFE_INTEGER = 9007199254740991;


	jQuery.sap.require("sap.ui.model.odata.type.Int64");
	jQuery.sap.require("sap.ui.core.Control");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Int64", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Int64();

		ok(oType instanceof sap.ui.model.odata.type.Int64, "is a Int64");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Int64", "type name");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	test("w/ format options", function () {
		var oType = new sap.ui.model.odata.type.Int64({
				minIntegerDigits: 5,
				maxIntegerDigits: 5,
				pattern: "",
				groupingEnabled: false,
				groupingSeparator: "'",
				plusSign: '+',
				minusSign: '-',
				showMeasure: true,
				style: 'short'
			});

		strictEqual(oType.oFormatOptions, undefined, "format options are ignored");
	});

	//*********************************************************************************************
	jQuery.each([
		{i: {nullable: true}, o: undefined},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: false}, o: {nullable: false}},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"}
	], function (i, oFixture) {
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
	jQuery.each([
		{test:"format to boolean", value:"12.34", targetType: "boolean",
			errorText:"Don't know how to format sap.ui.model.odata.type.Int64 to boolean"},
		{test:"format to int with overflow error", value: "9007199254740992",
			targetType: "int",
			errorText:"Enter a number with a maximum value of 9,007,199,254,740,991."},
		{test:"format to int with overflow error", value: "-9007199254740992",
			targetType: "int",
			errorText:"Enter a number with a minimum value of -9,007,199,254,740,991."}],
			function (i, oFixture) {
		test(oFixture.test, function () {
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

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Int64(); // constraints do not matter

		strictEqual(oType.parseValue(null, "foo"), null, "null");
		strictEqual(oType.parseValue("", "string"), null, "");
		strictEqual(oType.parseValue("1,234,567", "string"), "1234567",
			"multiple grouping separators");
		strictEqual(oType.parseValue(" -12345 ", "string"), "-12345", "spaces");
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
	jQuery.each(["foo", "1,234,567.890", "true", "-", "+"], function (i, sValue) {
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
		var fnLocaleData = sap.ui.core.LocaleData.getInstance,
			oType;

		// special: non-breaking space as grouping separator
		// We did not find any locale using different characters for plus or minus sign, so we
		// modify the LocaleData here.
		this.stub(sap.ui.core.LocaleData, "getInstance", function () {
			var oLocaleData = fnLocaleData.apply(this, arguments);
			oLocaleData.mData["symbols-latn-plusSign"] = ">";
			oLocaleData.mData["symbols-latn-minusSign"] = "<";
			return oLocaleData;
		});

		sap.ui.getCore().getConfiguration().setLanguage("sv");
		oType = new sap.ui.model.odata.type.Int64();

		strictEqual(oType.parseValue(">1 234 567 890 123 456", "string"),
			"1234567890123456", "plus sign, spaces");
		strictEqual(oType.parseValue("<1 234\u00a0567 890\t123 456 789\u00a0012", "string"),
			"-1234567890123456789012", "minus sign, tab, non-breaking spaces");
	}));

	//*********************************************************************************************
	test("validate success", 0, function () {
		var oType = new sap.ui.model.odata.type.Int64();

		jQuery.each(["+1", "-1", "+123", "-123", "0", null,
		             "-9223372036854775808", "9223372036854775807", "+9223372036854775807"],
			function (i, sValue) {
				oType.validateValue(sValue);
			}
		);
	});

	//*********************************************************************************************
	jQuery.each([false, 1.1, "foo", "1.234"], function (i, sValue) {
		test("validate errors: " + JSON.stringify(sValue), function () {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				var oType = new sap.ui.model.odata.type.Int64();
				try {
					oType.validateValue(sValue, "string");
					ok(false, "Expected ValidateException not thrown");
				}
				catch (e) {
					ok(e instanceof sap.ui.model.ValidateException)
					strictEqual(e.message, "EnterInt");
				}
			});
		});
	});

	//*********************************************************************************************
	jQuery.each([
		{ test: "exceeds min by length", value: "-92233720368547758090",
			message: "EnterIntMin -9,223,372,036,854,775,808"},
		{ test: "exceeds max by length", value: "92233720368547758080" ,
			message: "EnterIntMax 9,223,372,036,854,775,807"},
		{ test: "exceeds min by 1", value: "-9223372036854775809" ,
			message: "EnterIntMin -9,223,372,036,854,775,808"},
		{ test: "exceeds max by 1", value: "9223372036854775808",
			message: "EnterIntMax 9,223,372,036,854,775,807"}
	], function (i, oFixture) {
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

} ());
