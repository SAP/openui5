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

	// WARNING! These are on by default and break the Promise polyfill...
	sinon.config.useFakeTimers = false;

	//*********************************************************************************************
	module("sap.ui.core.util.ODataHelper", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign");
			sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group");
			sap.ui.getCore().getConfiguration().getFormatSettings().setDatePattern("medium");
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
			strictEqual(formatAndParse(sString), sString);
		});
	});

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "path:'foo'", 'path: "{\\f,o,o}"'], function (i, sPath) {
		test("Binding Path: " + sPath, function () {
			var oSingleBindingInfo = formatAndParse({
					"@odata.type" : "Edm.Path",
					"value" : sPath
				});
			strictEqual(oSingleBindingInfo.path, sPath);
		});
	});

	//*********************************************************************************************
	jQuery.each([undefined, null, {}, false, true, 0, 1, NaN], function (i, vPath) {
		test("Warning on illegal binding path: " + vPath, sinon.test(function () {
			var oLogMock = this.mock(jQuery.sap.log),
				oRawValue = {
					"@odata.type" : "Edm.Path",
					"value" : vPath
				};

			oLogMock.expects("warning").once().calledWith("Illegal value for Edm.Path: " + vPath,
				null, "sap.ui.core.util.ODataHelper");

			strictEqual(formatAndParse(oRawValue), JSON.stringify(oRawValue));
		}));
	});

	//*********************************************************************************************
	jQuery.each([undefined, null, NaN, Function, oCIRCULAR],
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
		strictEqual(formatAndParse(1234567890), "1,234,567,890");

		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(formatAndParse(1234567890), "1'234'567'890");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group", "}");
		strictEqual(formatAndParse(-1234567890), "{1}234}567}890");
	});

	//*********************************************************************************************
	test("14.4.10 Expression edm:Int (IEEE754Compatible)", function () {
		var oRawValue = {
				"@odata.type" : "Edm.Int64",
				value: "-1234567890"
			};

		strictEqual(formatAndParse(oRawValue), "-1,234,567,890");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group", "}");
		strictEqual(formatAndParse(oRawValue), "{1}234}567}890");
	});

	//*********************************************************************************************
	test("14.4.2 Expression edm:Bool", function () {
		strictEqual(formatAndParse(false), "No");
		strictEqual(formatAndParse(true), "Yes");
	});

	//*********************************************************************************************
	test("14.4.3 Expression edm:Date", function () {
		strictEqual(formatAndParse({
			"@odata.type": "Edm.Date",
			"value": "2000-01-01"
		}), "Jan 1, 2000");

		sap.ui.getCore().getConfiguration().getFormatSettings().setDatePattern("medium", "{}");
		strictEqual(formatAndParse({
			"@odata.type": "Edm.Date",
			"value": "2000-01-01"
		}), "{}");
	});

	//*********************************************************************************************
	jQuery.each([null, 0, "{}", "20000101", "2000-13-01", "2000-01-01T16:00:00Z"],
		function (i, sDate) {
			test("14.4.3 Expression edm:Date (invalid: " + sDate + ")", sinon.test(function () {
				var oLogMock = this.mock(jQuery.sap.log);

				oLogMock.expects("warning").once().calledWith("Illegal value for Edm.Date: " + sDate,
					null, "sap.ui.core.util.ODataHelper");

				strictEqual(formatAndParse({
					"@odata.type": "Edm.Date",
					"value": sDate
				}), String(sDate));
			}));
		}
	);

	//*********************************************************************************************
	jQuery.each(["2000-01-01T16:00:00Z", "2000-01-01T16:00:00.0Z", "2000-01-01T16:00:00.000Z",
	             "2000-01-02T01:00:00.000+09:00"],
// Date cannot handle more than 3 digits for milliseconds! "2000-01-01T16:00:00.0000000000Z",
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
				strictEqual(formatAndParse({
					"@odata.type": "Edm.DateTimeOffset",
					"value": sDateTime
				}), sap.ui.core.format.DateFormat.getDateTimeInstance().format(oDate));
			});
		}
	);

	//*********************************************************************************************
	jQuery.each([null, "{}", "2000-01-01", "20000101 160000",
	             "2000-01-32T16:00:00.000Z",
// Note: not checked by DateFormat, too much effort for us
//	             "2000-01-01T16:00:00.000+14:01", // http://www.w3.org/TR/xmlschema11-2/#nt-tzFrag
//	             "2000-01-01T16:00:00.000+00:60",
	             "2000-01-01T16:00:00.000~00:00",
	             "2000-01-01T16:00:00.Z"],
		function (i, sDateTime) {
			test("14.4.4 Expression edm:DateTimeOffset (invalid: " + sDateTime + ")",
				sinon.test(function () {
					var oLogMock = this.mock(jQuery.sap.log);

					oLogMock.expects("warning").once()
						.calledWith("Illegal value for Edm.DateTimeOffset: " + sDateTime, null,
							"sap.ui.core.util.ODataHelper");

					strictEqual(formatAndParse({
						"@odata.type": "Edm.DateTimeOffset",
						"value": sDateTime
					}), String(sDateTime));
				})
			);
		}
	);

	//*********************************************************************************************
	test("14.4.12 Expression edm:TimeOfDay", function () {
		// Note: milliseconds are not part of standard time patterns
		sap.ui.getCore().getConfiguration().getFormatSettings()
			.setTimePattern("medium", "HH{mm}ss.SSS");

		// Note: TimeOfDay is not UTC!
		strictEqual(formatAndParse({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59:59.123"
		}), "23{59}59.123");
		strictEqual(formatAndParse({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59:59.1"
		}), "23{59}59.100");
		strictEqual(formatAndParse({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59:59"
		}), "23{59}59.000");
		strictEqual(formatAndParse({
			"@odata.type": "Edm.TimeOfDay",
			"value": "23:59"
		}), "23{59}00.000");
	});

	//*********************************************************************************************
	jQuery.each([null, 0, "{}", "23", "23:59:60", "23:60:59", "24:00:00", "23:59:59.123456789012"],
		function (i, sTimeOfDay) {
			test("14.4.12 Expression edm:TimeOfDay (invalid: " + sTimeOfDay + ")",
				sinon.test(function () {
					var oLogMock = this.mock(jQuery.sap.log);

					oLogMock.expects("warning").once().calledWith(
						"Illegal value for Edm.TimeOfDay: " + sTimeOfDay,
						null, "sap.ui.core.util.ODataHelper");

					strictEqual(formatAndParse({
						"@odata.type": "Edm.TimeOfDay",
						"value": sTimeOfDay
					}), String(sTimeOfDay));
				})
			);
		}
	);
	//TODO "23:59:59.123456789012" is an example by Ralf Handl and valid according to the spec:
	// http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/abnf/odata-abnf-construction-rules.txt
	// fractionalSeconds = 1*12DIGIT
	// --> this means 1..12 digits in my opinion

	// Q: output simple binding expression in case application has not opted-in to complex ones?
	//    /* if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {} */
	// A: rather not, we probably need complex bindings in many cases (e.g. for types)
} ());
