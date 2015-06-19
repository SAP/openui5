/*!
 * ${copyright}
 */
(function () {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	function anyInt(sName, iMin, iMax) {
		var oType;

		function createType(oFormatOptions, oConstraints) {
			return new (jQuery.sap.getObject(sName))(oFormatOptions, oConstraints);
		}

		function testRange(iValue, sExpectedMessage) {
			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				try {
					oType.validateValue(iValue);
					ok(false, "Expected ValidateException not thrown");
				}
				catch (e) {
					ok(e instanceof sap.ui.model.ValidateException)
					equal(e.message, sExpectedMessage);
				}
			});
		}

		//*********************************************************************************************
		module(sName, {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
				oType = createType();
			},
			afterEach: function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		test("basics", function () {
			ok(oType instanceof sap.ui.model.odata.type.Int, "is an Int");
			ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
			equal(oType.getName(), sName, "is the right name");
			strictEqual(oType.oFormatOptions, undefined, "no formatting options");
			strictEqual(oType.oConstraints, undefined, "are the right constraints");
			strictEqual(oType.oFormat, null, "no formatter preload");
		});

		test("localization change", function () {
			var oControl = new sap.ui.core.Control();

			oType.formatValue(1234, "string"); // ensure that there is a formatter to remove
			oControl.bindProperty("tooltip", {path: "/unused", type: oType});
			sap.ui.getCore().getConfiguration().setLanguage("de-CH");
			strictEqual(oType.oFormat, null, "localization change resets formatter");
			oType.formatValue(1234, "int");
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

		["foo", "123.809"].forEach(function (oValue) {
			test("parse invalid value from string: " + oValue, function () {
				sap.ui.test.TestUtils.withNormalizedMessages(function () {
					try {
						oType.parseValue(oValue, "string");
						ok(false, "Expected ParseException not thrown");
					}
					catch (e) {
						ok(e instanceof sap.ui.model.ParseException);
						strictEqual(e.message, "EnterInt");
					}
				});
			});
		});

		["123", undefined, false].forEach(function (iValue) {
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

		[undefined, false, true].forEach(function (bNullable) {
			test("setConstraints: nullable=" + bNullable, function () {
				var oExpectedConstraints = bNullable === false ? {nullable: false} : undefined;

				oType = new (jQuery.sap.getObject(sName))({},
					{minimum: -100, maximum: 100, nullable: bNullable});
				deepEqual(oType.oConstraints, oExpectedConstraints, "only nullable accepted");
			});
		});

		test("validation success", function () {
			[iMin, iMax].forEach(function (iValue) {
				oType.validateValue(iValue);
			});
			expect(0);
		});

		test("validate w/ decimal", function () {
			try {
				oType.validateValue(123.456);
				ok(false, "Expected ValidateException not thrown");
			}
			catch (e) {
				ok(e instanceof sap.ui.model.ValidateException)
				equal(e.message, "Enter a number with no decimal places.");
			}
		});

		test("range tests", function () {
			var sExpectedMessage,
				oNumberFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
					groupingEnabled:true}),

			sExpectedMessage = "EnterIntMin " + oNumberFormat.format(iMin);
			testRange(-Infinity, sExpectedMessage);
			testRange(iMin - 1, sExpectedMessage);

			sExpectedMessage = "EnterIntMax " + oNumberFormat.format(iMax);
			testRange(iMax + 1, sExpectedMessage);
			testRange(Infinity, sExpectedMessage);
		});

		test("nullable", function () {
			oType.validateValue(null);

			this.mock(jQuery.sap.log).expects("warning").never();

			oType = new (jQuery.sap.getObject(sName))({});
			strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: true});
			strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: "true"});
			strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: false});
			strictEqual(oType.oConstraints.nullable, false);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: "false"});
			strictEqual(oType.oConstraints.nullable, false);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: true});
			strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: "true"});
			strictEqual(oType.oConstraints, undefined);

			sap.ui.test.TestUtils.withNormalizedMessages(function () {
				oType = createType({}, {nullable: false});
				try {
					oType.validateValue(null);
					ok(false);
				} catch (e) {
					ok(e instanceof sap.ui.model.ValidateException)
					equal(e.message, "EnterInt");
				}
			});
		});

		[{
			set: {foo: "bar"},
			expect: {foo: "bar", groupingEnabled: true}
		}, {
			set: {decimals: 7, groupingEnabled: false},
			expect: {decimals: 7, groupingEnabled: false}
		}].forEach(function (oFixture) {
			test("formatOptions: " + JSON.stringify(oFixture.set), function () {
				var oSpy,
					oType = createType(oFixture.set);

				deepEqual(oType.oFormatOptions, oFixture.set);

				oSpy = this.spy(sap.ui.core.format.NumberFormat, "getIntegerInstance");
				oType.formatValue(42, "string");
				sinon.assert.calledWithExactly(oSpy, oFixture.expect);
			});
		});
	}

	anyInt("sap.ui.model.odata.type.Int16", -32768, 32767);

	anyInt("sap.ui.model.odata.type.Int32", -2147483648, 2147483647);

	anyInt("sap.ui.model.odata.type.SByte", -128, 127);

	anyInt("sap.ui.model.odata.type.Byte", 0, 255);
} ());
