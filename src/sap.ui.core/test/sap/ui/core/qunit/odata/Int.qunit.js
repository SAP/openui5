/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	function anyInt(sName, iMin, iMax) {
		var oType;

		//*********************************************************************************************
		module(sName, {
			setup: function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
				oType = new (jQuery.sap.getObject(sName))();
			},
			teardown: function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		test("basics", function () {
			var oDefaultConstraints = {
					minimum: iMin,
					maximum: iMax,
					nullable: true
				};

			ok(oType instanceof sap.ui.model.odata.type.Int, "is an Int");
			ok(oType instanceof sap.ui.model.SimpleType, "is a SimpleType");
			equal(oType.getName(), sName, "is the right name");

			deepEqual(oType.oFormatOptions, undefined, "no formatting options");
			deepEqual(oType.oConstraints, oDefaultConstraints, "are the right constraints");
			strictEqual(oType.oFormat, null, "no formatter preload");
		});

		test("localization change", function () {
			var oControl = new sap.ui.core.Control();

			oControl.bindProperty("tooltip", {path: "/unused", type: oType});
			sap.ui.getCore().getConfiguration().setLanguage("de-CH");
			strictEqual(oType.oFormat, null, "localization change resets formatter");
			strictEqual(oType.formatValue(1234, "int"), 1234,
				"formatter will be creates only for string");
			strictEqual(oType.oFormat, null, "no formatter for int");
			strictEqual(oType.formatValue(1234, "string"), "1'234", "adjusted to changed language");
			ok(oType.oFormat, "Formatter has been created on demand");
		});

		test("formatValue", function () {
			strictEqual(oType.formatValue(undefined), null, "undefined formatted as null");
			strictEqual(oType.formatValue(null), null, "null formatted as null");

			strictEqual(oType.formatValue(123, "string"), "123", "number formatted as string");
			strictEqual(oType.formatValue(123.5, "string"), "123",
				"decimal number formatted as string");

			strictEqual(oType.formatValue(123, "float"), 123, "decimal number as float");
			strictEqual(oType.formatValue(123, "int"), 123, "decimal number as int");
			strictEqual(oType.formatValue(123.89, "int"), 123, "decimal number rounded as int");
			strictEqual(oType.formatValue(123, "any"), 123, "decimal number as any");

			try {
				oType.formatValue(123, "unknown");
				ok(false, "Expected FormatException not thrown");
			}
			catch (e) {
				ok(e instanceof sap.ui.model.FormatException);
				equal(e.message, "Don't know how to format " + sName + " to unknown");
			}
		});

		test("parseValue", function () {
			try {
				oType.parseValue("123");
				ok(false, "Expected ParseException not thrown");
			}
			catch (e) {
				ok(e instanceof sap.ui.model.ParseException)
				equal(e.message,
					"Don't know how to parse " + sName + " from undefined");
			}
			strictEqual(oType.parseValue("1,234", "string"), 1234, "number parsed from string");
			strictEqual(oType.parseValue("1234", "string"), 1234, "number parsed from string");
			strictEqual(oType.parseValue(1234, "int"), 1234, "number parsed from int");

			strictEqual(oType.parseValue(null, "foo"), null, "null accepted for any type");
			strictEqual(oType.parseValue("", "foo"), null,
				"empty string becomes null for any type");

			sap.ui.getCore().getConfiguration().setLanguage("de-DE");
			oType = new (jQuery.sap.getObject(sName))();
			strictEqual(oType.parseValue(1234.001, "float"), 1234, "don't parse float as string");

		});

		jQuery.each(["foo", "123.809"], function (i, oValue) {
			test("parse invalid value from string: " + oValue,
				function () {
					try {
						oType.parseValue(oValue, "string");
						ok(false, "Expected ParseException not thrown");
					}
					catch (e) {
						ok(e instanceof sap.ui.model.ParseException)
						equal(e.message, oValue + " is not a valid " + sName + " value");
					}
				});
		});

		jQuery.each(["123", undefined, 123.456, NaN], function (i, iValue) {
			test("illegal values and value type: " + iValue,
				function () {
					try {
						oType.validateValue(iValue);
						ok(false, "Expected ValidateException not thrown");
					}
					catch (e) {
						ok(e instanceof sap.ui.model.ValidateException)
						equal(e.message, iValue + " (of type " + typeof iValue
							+ ") is not a valid " + sName + " value");
					}
			});
		});

		test("setConstraints: empty", function () {
			oType.setConstraints();
			deepEqual(oType.oConstraints, {
				minimum: iMin,
				maximum: iMax,
				nullable: true
			}, "default constraints");
		});

		jQuery.each([undefined, false, true], function (i, bNullable) {
			test("setConstraints: nullable=" + bNullable, function () {
				var oExpectedConstraints = {
					minimum: iMin,
					maximum: iMax,
					nullable: bNullable !== false
				};

				oType.setConstraints({minimum: -100, maximum: 100, nullable: bNullable});
				deepEqual(oType.oConstraints, oExpectedConstraints, "only nullable accepted");
			});
		});

		test("validation success", 0, function () {
			jQuery.each([iMin, iMax], function (i, iValue) {
				oType.validateValue(iValue);
			});
		});

		jQuery.each([-Infinity, iMin - 1, iMax + 1, Infinity], function (i, iValue) {
			test("not in value range: " + iValue,
				function () {
					try {
						oType.validateValue(iValue);
						ok(false, "Expected ValidateException not thrown");
					}
					catch (e) {
						ok(e instanceof sap.ui.model.ValidateException)
						equal(e.message, iValue + " is out of range for " + sName + " [" + iMin
							+ ", " + iMax + "]",
							"out of range");
					}
				});
		});

		test("validation: null", function () {
			oType.validateValue(null);

			oType.setConstraints({nullable: false});
			try {
				oType.validateValue(null);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException)
				equal(e.message, "null (of type object) is not a valid " + sName + " value");
			}
		});
	}

	anyInt("sap.ui.model.odata.type.Int16", -32768, 32767);

	anyInt("sap.ui.model.odata.type.Int32", -2147483648, 2147483647);

	anyInt("sap.ui.model.odata.type.SByte", -128, 127);

} ());
