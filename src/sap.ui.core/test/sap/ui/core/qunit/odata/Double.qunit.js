/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	jQuery.sap.require("sap.ui.core.Control");
	jQuery.sap.require("sap.ui.core.LocaleData");
	jQuery.sap.require("sap.ui.model.odata.type.Double");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Double", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Double();

		ok(oType instanceof sap.ui.model.odata.type.Double, "is a Double");
		ok(oType instanceof sap.ui.model.SimpleType, "is a SimpleType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Double", "type name");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	test("w/ float format options", function () {
		var oType = new sap.ui.model.odata.type.Double({
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
		{i: {}, o: undefined},
		{i: {nullable: true}, o: undefined},
		{i: {nullable: false}, o: {nullable: false}},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"},
	], function (i, oFixture) {
		test("constraints: " + JSON.stringify(oFixture.i) + ")", sinon.test(function () {
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
		}));
	});

	//*********************************************************************************************
	test("format: English", function () {
		var oType = new sap.ui.model.odata.type.Double();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("1.234E3", "any"), "1.234E3", "target type any");
		strictEqual(oType.formatValue("1.234567E3", "float"), 1234.567, "target type float");
		strictEqual(oType.formatValue("1.2341e3", "int"), 1234, "target type int");
		strictEqual(oType.formatValue("0", "string"), "0", "0");
		strictEqual(oType.formatValue("9.99999999999999e+14", "string"), "999,999,999,999,999",
			"9.99999999999999e+14");
		strictEqual(oType.formatValue("1e+15", "string"), "1 E+15", "1e+15");
		strictEqual(oType.formatValue("-9.99999999999999e+14", "string"), "-999,999,999,999,999",
			"-9.99999999999999e+14");
		strictEqual(oType.formatValue("-1e+15", "string"), "-1 E+15", "-1e+15");
		strictEqual(oType.formatValue("1e-4", "string"), "0.0001", "1e-4");
		strictEqual(oType.formatValue("9.99999999999999e-5", "string"), "9.99999999999999 E-5",
			"9.99999999999999e-5");
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
	test("format: modified Swedish", sinon.test(function () {
		var oType,
			fnLocaleData = sap.ui.core.LocaleData.getInstance;

		sinon.stub(sap.ui.core.LocaleData, "getInstance", function () {
			var oLocaleData = fnLocaleData.apply(this, arguments);
			oLocaleData.mData["symbols-latn-plusSign"] = ">";
			oLocaleData.mData["symbols-latn-minusSign"] = "<";
			return oLocaleData;
		});

		// Swedish is interesting because it uses a different decimal separator, non-breaking
		// space as grouping separator and _not_ the 'E' for the exponential format. We did not
		// find any locale using different characters for plus or minus sign, so we modify the
		// LocaleData here.
		// TODO The 'e' is not replaced because NumberFormat doesn't care either (esp. in parse).
		sap.ui.getCore().getConfiguration().setLanguage("sv");
		oType = new sap.ui.model.odata.type.Double();

		strictEqual(oType.formatValue("-1.234e+3", "string"), "<1\u00a0234", "check modification");
		strictEqual(oType.formatValue("-1.234e+15", "string"), "<1,234 E>15", "check replacement");
	}));

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Double();

		strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");

		strictEqual(oType.parseValue("1,234", "string"), "1.234e+3", "type string");
		strictEqual(oType.parseValue("-12345", "string"), "-1.2345e+4", "type string");
		strictEqual(oType.parseValue("12.345E-3", "string"), "1.2345e-2", "type string w/ exp");
		strictEqual(oType.parseValue("12.345 E-3", "string"), "1.2345e-2",
			"type string w/ exp and space");
		strictEqual(oType.parseValue(1234, "int"), "1.234e+3", "type int");
		strictEqual(oType.parseValue(1234.567, "float"), "1.234567e+3", "type float");

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
		var oType = new sap.ui.model.odata.type.Double();

		try {
			oType.parseValue("foo", "string");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message, "Enter a number.");
		}
	});

	//*********************************************************************************************
	jQuery.each([false, null, 1, {}, "foo", "1.1", "1234"], function (i, sValue) {
		test("validate errors: " + JSON.stringify(sValue), function () {
			var oType = new sap.ui.model.odata.type.Double({}, {nullable: false});

			try {
				oType.validateValue(sValue);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, "Enter a number.");
			}
		});
	});

	//*********************************************************************************************
	test("validate success", 0, function () {
		var oType = new sap.ui.model.odata.type.Double();

		jQuery.each([null, "+1.1e0", "+1.123E-4", "-1e+5", "+1.234E+235", "1e10"],
			function (i, sValue) {
				oType.validateValue(sValue);
			}
		);
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

	// TODO precision (max 15 according to spec)
} ());
