/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.core.util.ODataHelper");
	jQuery.sap.require("sap.ui.core.format.NumberFormat");

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oCIRCULAR = {};

	oCIRCULAR.circle = oCIRCULAR; // some circular structure

	/**
	 * Formats the value using the ODataHelper and then parses the result via the complex parser.
	 * @param {any} vValue
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParse(vValue) {
		var sResult = sap.ui.core.util.ODataHelper.format(vValue);

		// @see applySettings: complex parser returns undefined if there is nothing to unescape
		return sap.ui.base.BindingParser.complexParser(sResult, undefined, true) || sResult;
	}

	/**
	 * Formats the value using the ODataHelper and then parses the result via the complex parser.
	 * Makes sure no warning is raised.
	 *
	 * @param {any} vValue
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParseNoWarning(vValue) {
		var oSandbox = sinon.sandbox.create(),
			oLogMock = oSandbox.mock(jQuery.sap.log);

		oLogMock.expects("warning").never();

		try {
			return formatAndParse(vValue);
		} finally {
			oLogMock.verify();
			oSandbox.restore();
		}
	}

	/**
	 * Tests proper console warnings on illegal values for a type.
	 * @param {any[]} aValues
	 *   Array of illegal values
	 * @param {string} sTitle
	 *   The test title
	 * @param {string} sType
	 *   The name of the Edm type
	 * @param {boolean} bAsObject
	 *   Determines if the value is passed in object format
	 */
	function testIllegalValues(aValues, sTitle, sType, bAsObject) {
		jQuery.each(aValues, function (i, vValue) {
			test(sTitle + " (invalid: " + vValue + ")", sinon.test(function () {
				var oLogMock = this.mock(jQuery.sap.log);

				oLogMock.expects("warning").once().withExactArgs(
					"Illegal value for " + sType + ": " + vValue,
					null, "sap.ui.core.util.ODataHelper");

				strictEqual(formatAndParse(bAsObject
					? {"@odata.type": sType, "value": vValue}
					: vValue
				), String(vValue));
			}));
		});
	}

	// WARNING! These are on by default and break the Promise polyfill...
	sinon.config.useFakeTimers = false;

	//*********************************************************************************************
	module("sap.ui.core.util.ODataHelper", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("decimal");
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group");
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign");
			sap.ui.getCore().getConfiguration().getFormatSettings().setDatePattern("medium");
			sap.ui.getCore().getConfiguration().getFormatSettings().setTimePattern("medium");
		}
	});

	/*
	   "Title": {
	      "@odata.type": "com.sap.vocabularies.UI.v1.DataField",
	      "Label": "Product Name",
	      "Value": {
	        "@odata.type": "Edm.Path",
	        "value": "Name"
	      }
	    }
	 */

	//*********************************************************************************************
	jQuery.each(["", "foo", "{path:'foo'}", 'path: "{\\f,o,o}"'], function (i, sString) {
		test("Constant of type String: " + sString, function () {
			strictEqual(formatAndParseNoWarning(sString), sString);
		});
	});

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "path:'foo'", 'path: "{\\f,o,o}"'], function (i, sPath) {
		test("Binding Path: " + sPath, function () {
			var oSingleBindingInfo = formatAndParseNoWarning({
					"@odata.type" : "Edm.Path",
					"value" : sPath
				});
			strictEqual(oSingleBindingInfo.path, sPath);
		});
	});
	// Q: output simple binding expression in case application has not opted-in to complex ones?
	//    /* if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {} */
	// A: rather not, we probably need complex bindings in many cases (e.g. for types)

	//*********************************************************************************************
	jQuery.each([undefined, null, {}, false, true, 0, 1, NaN], function (i, vPath) {
		test("Warning on illegal binding path: " + vPath, sinon.test(function () {
			var oLogMock = this.mock(jQuery.sap.log),
				oRawValue = {
					"@odata.type" : "Edm.Path",
					"value" : vPath
				};

			oLogMock.expects("warning").once().withExactArgs("Illegal value for Edm.Path: "
				+ vPath, null, "sap.ui.core.util.ODataHelper");

			strictEqual(formatAndParse(oRawValue), JSON.stringify(oRawValue));
		}));
	});

	//*********************************************************************************************
	jQuery.each([undefined, null, Function, oCIRCULAR],
		function (i, vRawValue) {
			test("Make sure that output is always a string: " + vRawValue, function () {
				strictEqual(formatAndParse(vRawValue), String(vRawValue));
			});
		}
	);

	//*********************************************************************************************
	jQuery.each([{}, {foo: "bar"}], function (i, oRawValue) {
		test("Stringify invalid input where possible: " + oRawValue, function () {
			strictEqual(formatAndParse(oRawValue), JSON.stringify(oRawValue));
		});
	});

	//*********************************************************************************************
	test("14.4.10 Expression edm:Int", function () {
		strictEqual(formatAndParseNoWarning(1234567890), "1,234,567,890");

		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(formatAndParseNoWarning(1234567890), "1'234'567'890");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group", "}");
		strictEqual(formatAndParseNoWarning(-1234567890), "{1}234}567}890");
	});

	//*********************************************************************************************
	testIllegalValues([Infinity, -Infinity, NaN, 9007199254740992, -9007199254740992,
	                   1234567890123456789], "14.4.10 Expression edm:Int", "Edm.Int64", false);

	//*********************************************************************************************
	test("14.4.10 Expression edm:Int (IEEE754Compatible)", function () {
		var oRawValue = {
				"@odata.type" : "Edm.Int64",
				value: "-1234567890"
			};

		strictEqual(formatAndParseNoWarning(oRawValue), "-1,234,567,890");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group", "}");
		strictEqual(formatAndParseNoWarning(oRawValue), "{1}234}567}890");
	});

	//*********************************************************************************************
	//TODO really treat numbers as illegal here?
	//TODO support large integers beyond 53 bit!
	testIllegalValues([null, true, 0, "1.0", "{}", "foo", "1a", "9007199254740992",
	                   "-9007199254740992", "1234567890123456789"],
	                   "14.4.10 Expression edm:Int (IEEE754Compatible)", "Edm.Int64", true);

	//*********************************************************************************************
	testIllegalValues([3.14], "14.4.10 Expression edm:Int", "Edm.Int64", false);

	//*********************************************************************************************
	test("14.4.2 Expression edm:Bool", function () {
		strictEqual(formatAndParseNoWarning(false), "No");
		strictEqual(formatAndParseNoWarning(true), "Yes");
	});

	//*********************************************************************************************
	test("14.4.3 Expression edm:Date", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Date",
			"value": "2000-01-01"
		}), "Jan 1, 2000");

		sap.ui.getCore().getConfiguration().getFormatSettings().setDatePattern("medium", "{}");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Date",
			"value": "2000-01-01"
		}), "{}");
	});

	//*********************************************************************************************
	testIllegalValues([null, 0, "{}", "20000101", "2000-13-01", "2000-01-01T16:00:00Z"],
		"14.4.3 Expression edm:Date", "Edm.Date", true);

	//*********************************************************************************************
	jQuery.each(["2000-01-01T16:00:00Z", "2000-01-01T16:00:00.0Z", "2000-01-01T16:00:00.000Z",
	             "2000-01-02T01:00:00.000+09:00", "2000-01-01T16:00:00.000456789012Z"],
// Note: milliseconds are not part of standard time patterns
		function (i, sDateTime) {
			test("14.4.4 Expression edm:DateTimeOffset (" + sDateTime + ")", function () {
				// Note: Date c'tor in IE8 cannot parse timestamps!
				var oDate = new Date();
				oDate.setUTCFullYear(2000);
				oDate.setUTCMonth(0);
				oDate.setUTCDate(1);
				oDate.setUTCHours(16);
				oDate.setUTCMinutes(0);
				oDate.setUTCSeconds(0);
				oDate.setUTCMilliseconds(0);

				sap.ui.getCore().getConfiguration().getFormatSettings()
					.setDatePattern("medium", "yyyy{MM}dd");
				strictEqual(formatAndParseNoWarning({
					"@odata.type": "Edm.DateTimeOffset",
					"value": sDateTime
				}), sap.ui.core.format.DateFormat.getDateTimeInstance().format(oDate));
			});
		}
	);

	//*********************************************************************************************
	testIllegalValues([null, "{}", "2000-01-01", "20000101 160000",
	             "2000-01-32T16:00:00.000Z",
	             "2000-01-01T16:00:00.1234567890123Z",
// Note: not checked by DateFormat, too much effort for us
//	             "2000-01-01T16:00:00.000+14:01", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
//	             "2000-01-01T16:00:00.000+00:60",
	             "2000-01-01T16:00:00.000~00:00",
	             "2000-01-01T16:00:00.Z"],
	             "14.4.4 Expression edm:DateTimeOffset", "Edm.DateTimeOffset", true);

	//*********************************************************************************************
	test("14.4.12 Expression edm:TimeOfDay", function () {
		// Note: milliseconds are not part of standard time patterns
		sap.ui.getCore().getConfiguration().getFormatSettings()
			.setTimePattern("medium", "HH{mm}ss.SSS");

		// Note: TimeOfDay is not UTC!
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59:59.123"
		}), "23{59}59.123");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59:59.123456789012"
		}), "23{59}59.123", "beyond millis");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59:59.1"
		}), "23{59}59.100");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59:59"
		}), "23{59}59.000");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59"
		}), "23{59}00.000");
	});

	//*********************************************************************************************
	testIllegalValues([null, 0, "{}", "23", "23:59:60", "23:60:59", "24:00:00",
	                   "23:59:59.1234567890123"],
	                   "14.4.12 Expression edm:TimeOfDay", "Edm.TimeOfDay", true);

	//*********************************************************************************************
	test("14.4.8 Expression edm:Float", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Double",
			"value": 1.23e4
		}), "12,300");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Double",
			"value": "INF"
		}), "Infinity");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Double",
			"value": "-INF"
		}), "Minus infinity");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Double",
			"value": "NaN"
		}), "Not a number");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group", "}");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Double",
			"value": -1.23e4
		}), "{12}300");
	});

	//*********************************************************************************************
	testIllegalValues([undefined, null, false, {}, "foo", "1a", "1e", "12.34", -Infinity, NaN],
		"14.4.8 Expression edm:Float", "Edm.Double", true);

	//*********************************************************************************************
	test("14.4.5 Expression edm:Decimal", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Decimal",
			"value": 12.34
		}), "12.34");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("decimal", "}");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Decimal",
			"value": -12.34
		}), "{12}34");
	});

	//*********************************************************************************************
	testIllegalValues([undefined, null, false, {}, "foo", "1a", "1e", -Infinity, NaN, "INF",
	                   "-INF", "NaN", "1e+12"],
		"14.4.5 Expression edm:Decimal", "Edm.Decimal", true);

	//*********************************************************************************************
	test("14.4.5 Expression edm:Decimal (IEEE754Compatible)", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "Edm.Decimal",
			"value": "12.34"
		}), "12.34");
	});

	//*********************************************************************************************
	jQuery.each(["+1.1", "+123.123", "-123.1", "+123.1", "1.123", "-1.123", "123.1", "1", "-123"],
		function (i, sDecimal) {
			test("14.4.5 Expression edm:Decimal (IEEE754Compatible): " + sDecimal, function () {
				var oFormatSettings = sap.ui.getCore().getConfiguration().getFormatSettings(),
					sResult;

				oFormatSettings.setNumberSymbol("minusSign", "{");
				oFormatSettings.setNumberSymbol("group", "}");
				sResult = sap.ui.core.format.NumberFormat.getFloatInstance().format(sDecimal);

				strictEqual(formatAndParseNoWarning({
					"@odata.type": "Edm.Decimal",
					"value": sDecimal
				}), sResult, "Expected result: " + sResult);
			});
		}
	);
} ());
