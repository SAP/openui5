/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");
	jQuery.sap.require("sap.ui.core.format.NumberFormat");

	var oCIRCULAR = {},
		sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
		oMetaModel = new sap.ui.model.json.JSONModel({
			"definitions": {
				"SomeEntity": {
					"properties": {
						"ProductID" : {
							"type" : "number", //TODO string
							"maxLength" : 10,
							"@Common.Label" : "Product ID",
							"@TODO.updatable" : "false"
						},
						"SupplierName" : {
							"type" : ["number", "null"], //TODO string
							"maxLength" : 80,
							"@Common.Label" : "Company Name",
							"@TODO.creatable" : "false",
							"@TODO.updatable" : "false"
						},
						"WeightMeasure" : {
							"anyOf" : [{
								"type" : "number",
								"multipleOf" : 0.001,
								"minimum" : -9999999999.999,
								"maximum" : 9999999999.999
							}, {
								"type" : "null"
							}],
							"@TODO.unit" : "WeightUnit",
							"@Common.Label" : "Wt. Measure",
							"@Org.OData.Measures.V1.Unit" : {
								"@odata.type" : "#Path",
								"value" : "WeightUnit"
							}
						},
						"WeightUnit" : {
							"type" : ["string", "null"],
							"maxLength" : 3,
							"@Common.Label" : "Qty. Unit",
							"@TODO.semantics" : "unit-of-measure"
						},
					},
					"@com.sap.vocabularies.UI.v1.DataPoint" : {
						"@odata.type" : "#com.sap.vocabularies.UI.v1.DataPointType",
						"Title" : "Weight",
						"Description" : {},
						"Value" : {
							"@odata.type" : "#Path",
							"value" : "WeightMeasure"
						}
					},
					"@com.sap.vocabularies.UI.v1.Identification" : [{
						"@odata.type" : "#com.sap.vocabularies.UI.v1.DataField",
						"Label" : "Product ID",
						"Value" : {
							"@odata.type" : "#Path",
							"value" : "ProductID"
						}
					}, {
						"@odata.type" : "#com.sap.vocabularies.UI.v1.DataField",
						"Label" : "Supplier",
						"Value" : {
							"@odata.type" : "#Path",
							"value" : "SupplierName"
						}
					}, {
						"@odata.type" : "#com.sap.vocabularies.UI.v1.DataField",
						"Label" : "Weight",
						"Value" : {
							"@odata.type" : "#Path",
							"value" : "WeightMeasure"
						}
					}]
				}
			}
		});

	oCIRCULAR.circle = oCIRCULAR; // some circular structure

	/**
	 * Formats the value using the AnnotationHelper and then parses the result via the complex parser.
	 * Provides access to the given current binding.
	 *
	 * @param {any} vValue
	 * @param {sap.ui.model.Binding} oCurrentBinding
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParse(vValue, oCurrentBinding) {
		var sResult,
			oThis = {
				currentBinding: function () {
					return oCurrentBinding;
				}
			};

		sResult = sap.ui.model.odata.AnnotationHelper.format.call(oThis, vValue);

		// @see applySettings: complex parser returns undefined if there is nothing to unescape
		return sap.ui.base.BindingParser.complexParser(sResult, undefined, true) || sResult;
	}

	/**
	 * Formats the value using the AnnotationHelper and then parses the result via the complex parser.
	 * Makes sure no warning is raised. Provides access to the given current binding.
	 *
	 * @param {any} vValue
	 * @param {sap.ui.model.Binding} oCurrentBinding
	 * @returns {object|string}
	 *   a binding info or the formatted, unescaped value
	 */
	function formatAndParseNoWarning(vValue, oCurrentBinding) {
		var oSandbox = sinon.sandbox.create(),
			oLogMock = oSandbox.mock(jQuery.sap.log);

		oLogMock.expects("warning").never();

		try {
			return formatAndParse(vValue, oCurrentBinding);
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
					null, "sap.ui.model.odata.AnnotationHelper");

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
	module("sap.ui.model.odata.AnnotationHelper", {
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

	//*********************************************************************************************
	jQuery.each(["", "foo", "{path:'foo'}", 'path: "{\\f,o,o}"'], function (i, sString) {
		test("14.4.11 Expression edm:String: " + sString, function () {
			strictEqual(formatAndParseNoWarning(sString), sString);
		});
	});

	//*********************************************************************************************
	jQuery.each(["", "/", ".", "foo", "path:'foo'", 'path: "{\\f,o,o}"'], function (i, sPath) {
		test("14.5.12 Expression edm:Path: " + sPath, function () {
			var oMetaModel = new sap.ui.model.json.JSONModel({
					"Value": {
						"@odata.type": "#Path",
						"value": sPath
					}
				}),
				sMetaPath = "/Value",
				oCurrentBinding = oMetaModel.bindProperty(sMetaPath),
				oRawValue = oMetaModel.getProperty(sMetaPath),
				oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentBinding);

			strictEqual(oSingleBindingInfo.path, sPath);
			strictEqual(oSingleBindingInfo.type, undefined);
		});
	});
	// Q: output simple binding expression in case application has not opted-in to complex ones?
	//    /* if (ManagedObject.bindingParser === sap.ui.base.BindingParser.simpleParser) {} */
	// A: rather not, we probably need complex bindings in many cases (e.g. for types)

	//*********************************************************************************************
	testIllegalValues([undefined, null, {}, false, true, 0, 1, NaN], "14.5.12 Expression edm:Path",
		"#Path", true);

	//*********************************************************************************************
	jQuery.each([undefined, Function, oCIRCULAR],
		function (i, vRawValue) {
			test("Make sure that output is always a string: " + vRawValue, function () {
				strictEqual(formatAndParse(vRawValue), String(vRawValue));
			});
		}
	);

	//*********************************************************************************************
	jQuery.each([null, {}, {foo: "bar"}, {"@odata.type" : "#Unsupported"}],
		function (i, oRawValue) {
			test("Stringify invalid input where possible: " + JSON.stringify(oRawValue),
				function () {
					strictEqual(formatAndParse(oRawValue),
						"Unsupported type: " + JSON.stringify(oRawValue));
				}
			);
		}
	);

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
	                   1234567890123456789], "14.4.10 Expression edm:Int", "#Int64", false);

	//*********************************************************************************************
	test("14.4.10 Expression edm:Int (IEEE754Compatible)", function () {
		var oRawValue = {
				"@odata.type" : "#Int64",
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
	                   "14.4.10 Expression edm:Int (IEEE754Compatible)", "#Int64", true);

	//*********************************************************************************************
	testIllegalValues([3.14], "14.4.10 Expression edm:Int", "#Int64", false);

	//*********************************************************************************************
	test("14.4.2 Expression edm:Bool", function () {
		strictEqual(formatAndParseNoWarning(false), "No");
		strictEqual(formatAndParseNoWarning(true), "Yes");
	});

	//*********************************************************************************************
	test("14.4.3 Expression edm:Date", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Date",
			"value": "2000-01-01"
		}), "Jan 1, 2000");

		sap.ui.getCore().getConfiguration().getFormatSettings().setDatePattern("medium", "{}");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Date",
			"value": "2000-01-01"
		}), "{}");
	});

	//*********************************************************************************************
	testIllegalValues([null, 0, "{}", "20000101", "2000-13-01", "2000-01-01T16:00:00Z"],
		"14.4.3 Expression edm:Date", "#Date", true);

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
					"@odata.type": "#DateTimeOffset",
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
	             "14.4.4 Expression edm:DateTimeOffset", "#DateTimeOffset", true);

	//*********************************************************************************************
	test("14.4.12 Expression edm:TimeOfDay", function () {
		// Note: milliseconds are not part of standard time patterns
		sap.ui.getCore().getConfiguration().getFormatSettings()
			.setTimePattern("medium", "HH{mm}ss.SSS");

		// Note: TimeOfDay is not UTC!
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#TimeOfDay",
			"value": "23:59:59.123"
		}), "23{59}59.123");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#TimeOfDay",
			"value": "23:59:59.123456789012"
		}), "23{59}59.123", "beyond millis");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#TimeOfDay",
			"value": "23:59:59.1"
		}), "23{59}59.100");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#TimeOfDay",
			"value": "23:59:59"
		}), "23{59}59.000");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#TimeOfDay",
			"value": "23:59"
		}), "23{59}00.000");
	});

	//*********************************************************************************************
	testIllegalValues([null, 0, "{}", "23", "23:59:60", "23:60:59", "24:00:00",
	                   "23:59:59.1234567890123"],
	                   "14.4.12 Expression edm:TimeOfDay", "#TimeOfDay", true);

	//*********************************************************************************************
	test("14.4.8 Expression edm:Float", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Double",
			"value": 1.23e4
		}), "12,300");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Double",
			"value": "INF"
		}), "Infinity");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Double",
			"value": "-INF"
		}), "Minus infinity");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Double",
			"value": "NaN"
		}), "Not a number");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("group", "}");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Double",
			"value": -1.23e4
		}), "{12}300");
	});

	//*********************************************************************************************
	testIllegalValues([undefined, null, false, {}, "foo", "1a", "1e", "12.34", -Infinity, NaN],
		"14.4.8 Expression edm:Float", "#Double", true);

	//*********************************************************************************************
	test("14.4.5 Expression edm:Decimal", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Decimal",
			"value": 12.34
		}), "12.34");

		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("minusSign", "{");
		sap.ui.getCore().getConfiguration().getFormatSettings().setNumberSymbol("decimal", "}");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Decimal",
			"value": -12.34
		}), "{12}34");
	});

	//*********************************************************************************************
	testIllegalValues([undefined, null, false, {}, "foo", "1a", "1e", -Infinity, NaN, "INF",
	                   "-INF", "NaN", "1e+12"],
		"14.4.5 Expression edm:Decimal", "#Decimal", true);

	//*********************************************************************************************
	test("14.4.5 Expression edm:Decimal (IEEE754Compatible)", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Decimal",
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
					"@odata.type": "#Decimal",
					"value": sDecimal
				}), sResult, "Expected result: " + sResult);
			});
		}
	);

	//*********************************************************************************************
	test("14.4.9 Expression edm:Guid", function () {
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Guid",
			"value": "86a96539-871b-45cf-b96b-93dbc235105a"}), "86a96539-871b-45cf-b96b-93dbc235105a");
		strictEqual(formatAndParseNoWarning({
			"@odata.type": "#Guid",
			"value": "86A96539-871B-45CF-B96B-93DBC235105A"}), "86A96539-871B-45CF-B96B-93DBC235105A");
	});

	//*********************************************************************************************
	testIllegalValues([undefined, null, false, {}, "foo", "123g5678-1234-1234-1234-123456789abc",
	                   "12345-1234-1234-1234-123456789abc", "12_45678-1234-1234-1234-123456789abc"],
		"14.4.9 Expression edm:Guid", "#Guid", true);

	//*********************************************************************************************
	jQuery.each(["", "U0FQ", "QUI=", "QQ==",
	    "THEQUICKBROWNFOXJUMPSOVERTHELAZYDOG-__--_thequickbrownfoxjumpsoverthelazydog0123456789AA"],
		function (i, sValue) {
			test("14.4.1 Expression edm:Binary: " + sValue, function () {
				strictEqual(
					formatAndParseNoWarning({"@odata.type": "#Binary", "value": sValue}),
					sValue.replace(/-/g, "+").replace(/_/g, "/")
				);
			});
		}
	);

	//*********************************************************************************************
	testIllegalValues([undefined, null, false, {}, "A===", "+", "/", "%"],
	                   "14.4.1 Expression edm:Binary", "#Binary", true);

	//*********************************************************************************************
	jQuery.each([{
		path: "/definitions/SomeEntity/@com.sap.vocabularies.UI.v1.DataPoint/Value"
	}, {
		path: "Value",
		context: oMetaModel.createBindingContext(
			"/definitions/SomeEntity/@com.sap.vocabularies.UI.v1.DataPoint/")
	}, {
		path: "/definitions/SomeEntity/@com.sap.vocabularies.UI.v1.Identification/0/Value"
	}, {
		path: "/definitions/SomeEntity/@com.sap.vocabularies.UI.v1.Identification/1/Value"
	}, {
		path: "/definitions/SomeEntity/@com.sap.vocabularies.UI.v1.Identification/2/Value"
	}, {
		path: "Value",
		context: oMetaModel.createBindingContext(
			"/definitions/SomeEntity/@com.sap.vocabularies.UI.v1.Identification/2/")
	}], function (i, oFixture) {
		test("14.5.12 Expression edm:Path w/ type, path = " + oFixture.path, function () {
			var oCurrentBinding = oMetaModel.bindProperty(oFixture.path, oFixture.context),
				oRawValue = oCurrentBinding.getValue(),
				oSingleBindingInfo;

			oSingleBindingInfo = formatAndParseNoWarning(oRawValue, oCurrentBinding);

			strictEqual(oSingleBindingInfo.path, oRawValue.value);
			ok(oSingleBindingInfo.type instanceof sap.ui.model.type.Float);
		});
	});

	//TODO {..., formatOptions: {minFractionDigits: 3, maxIntegerDigits: 10}}
	//TODO {..., type: 'sap.ui.model.odata.type.Decimal', formatOptions: {scale: 3, precision: 13}}
	//TODO jQuery.sap.require() for "non-core types"

	//TODO anyOf/allOf "trees" can hardly be supported
//	"CreatedAt" : {
//		"anyOf" : [{
//			"allOf" : [{
//				"$ref" : "http://docs.oasis-open.org/odata/odata-json-csdl/v4.0/edm.json#/definitions/Edm.DateTime"
//			}, {
//				"pattern" : "(^[^.]*$|[.][0-9]{1,7}$)"
//			}]
//		}, {
//			"type" : "null"
//		}],
//	},
} ());
