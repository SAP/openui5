/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/Control",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Int",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (Control, NumberFormat, FormatException, ParseException, ValidateException, Int,
		ODataType, TestUtils) {
	/*global QUnit, sinon */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	function anyInt(sName, iMin, iMax) {
		var oType;

		function createType(oFormatOptions, oConstraints) {
			return new (jQuery.sap.getObject(sName))(oFormatOptions, oConstraints);
		}

		function testRange(assert, iValue, sExpectedMessage) {
			TestUtils.withNormalizedMessages(function () {
				try {
					oType.validateValue(iValue);
					assert.ok(false, "Expected ValidateException not thrown");
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					assert.strictEqual(e.message, sExpectedMessage);
				}
			});
		}

		//*****************************************************************************************
		QUnit.module(sName, {
			beforeEach: function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
				oType = createType();
			},
			afterEach: function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		QUnit.test("basics", function (assert) {
			assert.ok(oType instanceof Int, "is an Int");
			assert.ok(oType instanceof ODataType, "is an ODataType");
			assert.strictEqual(oType.getName(), sName, "is the right name");
			assert.strictEqual(oType.oFormatOptions, undefined, "no formatting options");
			assert.strictEqual(oType.oConstraints, undefined, "are the right constraints");
			assert.strictEqual(oType.oFormat, null, "no formatter preload");
		});

		QUnit.test("localization change", function (assert) {
			var oControl = new Control();

			oType.formatValue(1234, "string"); // ensure that there is a formatter to remove
			oControl.bindProperty("tooltip", {path: "/unused", type: oType});
			sap.ui.getCore().getConfiguration().setLanguage("de-CH");
			assert.strictEqual(oType.oFormat, null, "localization change resets formatter");
			oType.formatValue(1234, "int");
			assert.strictEqual(oType.oFormat, null, "no formatter for int");
			assert.strictEqual(oType.formatValue(1234, "string"), "1'234",
				"adjusted to changed language");
			assert.ok(oType.oFormat, "Formatter has been created on demand");
		});

		QUnit.test("formatValue", function (assert) {
			assert.strictEqual(oType.formatValue(undefined), null, "undefined formatted as null");
			assert.strictEqual(oType.formatValue(null), null, "null formatted as null");

			assert.strictEqual(oType.formatValue(123, "string"), "123",
				"number formatted as string");
			assert.strictEqual(oType.formatValue(123.5, "string"), "123",
				"decimal number formatted as string");

			assert.strictEqual(oType.formatValue(123, "float"), 123, "decimal number as float");
			assert.strictEqual(oType.formatValue(123, "int"), 123, "decimal number as int");
			assert.strictEqual(oType.formatValue(123.89, "int"), 123,
				"decimal number rounded as int");
			assert.strictEqual(oType.formatValue(123, "any"), 123, "decimal number as any");

			try {
				oType.formatValue(123, "unknown");
				assert.ok(false, "Expected FormatException not thrown");
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message, "Don't know how to format " + sName + " to unknown");
			}
		});

		QUnit.test("parseValue", function (assert) {
			try {
				oType.parseValue("123");
				assert.ok(false, "Expected ParseException not thrown");
			} catch (e) {
				assert.ok(e instanceof ParseException);
				assert.strictEqual(e.message,
					"Don't know how to parse " + sName + " from undefined");
			}
			assert.strictEqual(oType.parseValue("1,234", "string"), 1234,
				"number parsed from string");
			assert.strictEqual(oType.parseValue("1234", "string"), 1234,
				"number parsed from string");
			assert.strictEqual(oType.parseValue(1234, "int"), 1234, "number parsed from int");

			assert.strictEqual(oType.parseValue(null, "foo"), null, "null accepted for any type");
			assert.strictEqual(oType.parseValue("", "foo"), null,
				"empty string becomes null for any type");

			sap.ui.getCore().getConfiguration().setLanguage("de-DE");
			oType = new (jQuery.sap.getObject(sName))();
			assert.strictEqual(oType.parseValue(1234.001, "float"), 1234,
				"don't parse float as string");
		});

		["foo", "123.809"].forEach(function (oValue) {
			QUnit.test("parse invalid value from string: " + oValue, function (assert) {
				TestUtils.withNormalizedMessages(function () {
					try {
						oType.parseValue(oValue, "string");
						assert.ok(false, "Expected ParseException not thrown");
					} catch (e) {
						assert.ok(e instanceof ParseException);
						assert.strictEqual(e.message, "EnterInt");
					}
				});
			});
		});

		["123", undefined, false].forEach(function (iValue) {
			QUnit.test("illegal values and value type: " + iValue,
				function (assert) {
					try {
						oType.validateValue(iValue);
						assert.ok(false, "Expected ValidateException not thrown");
					} catch (e) {
						assert.ok(e instanceof ValidateException);
						assert.strictEqual(e.message, iValue + " (of type " + typeof iValue
							+ ") is not a valid " + sName + " value");
					}
			});
		});

		[undefined, false, true].forEach(function (bNullable) {
			QUnit.test("setConstraints: nullable=" + bNullable, function (assert) {
				var oExpectedConstraints = bNullable === false ? {nullable: false} : undefined;

				oType = new (jQuery.sap.getObject(sName))({},
					{minimum: -100, maximum: 100, nullable: bNullable});
				assert.deepEqual(oType.oConstraints, oExpectedConstraints,
					"only nullable accepted");
			});
		});

		QUnit.test("validation success", function (assert) {
			[iMin, iMax].forEach(function (iValue) {
				oType.validateValue(iValue);
			});
			assert.expect(0);
		});

		QUnit.test("validate w/ decimal", function (assert) {
			try {
				oType.validateValue(123.456);
				assert.ok(false, "Expected ValidateException not thrown");
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, "Enter a number with no decimal places.");
			}
		});

		QUnit.test("range tests", function (assert) {
			var sExpectedMessage,
				oNumberFormat = NumberFormat.getIntegerInstance({
					groupingEnabled:true});

			sExpectedMessage = "EnterIntMin " + oNumberFormat.format(iMin);
			testRange(assert, -Infinity, sExpectedMessage);
			testRange(assert, iMin - 1, sExpectedMessage);

			sExpectedMessage = "EnterIntMax " + oNumberFormat.format(iMax);
			testRange(assert, iMax + 1, sExpectedMessage);
			testRange(assert, Infinity, sExpectedMessage);
		});

		QUnit.test("nullable", function (assert) {
			oType.validateValue(null);

			this.mock(jQuery.sap.log).expects("warning").withExactArgs("Illegal nullable: 42",
				null, sName);

			oType = new (jQuery.sap.getObject(sName))({});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: true});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: "true"});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: undefined});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: 42});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: false});
			assert.strictEqual(oType.oConstraints.nullable, false);

			oType = new (jQuery.sap.getObject(sName))({}, {nullable: "false"});
			assert.strictEqual(oType.oConstraints.nullable, false);

			TestUtils.withNormalizedMessages(function () {
				oType = createType({}, {nullable: false});
				try {
					oType.validateValue(null);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					assert.strictEqual(e.message, "EnterInt");
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
			QUnit.test("formatOptions: " + JSON.stringify(oFixture.set), function (assert) {
				var oSpy,
					oType = createType(oFixture.set);

				assert.deepEqual(oType.oFormatOptions, oFixture.set);

				oSpy = this.spy(NumberFormat, "getIntegerInstance");
				oType.formatValue(42, "string");
				sinon.assert.calledWithExactly(oSpy, oFixture.expect);
			});
		});
	}

	anyInt("sap.ui.model.odata.type.Int16", -32768, 32767);

	anyInt("sap.ui.model.odata.type.Int32", -2147483648, 2147483647);

	anyInt("sap.ui.model.odata.type.SByte", -128, 127);

	anyInt("sap.ui.model.odata.type.Byte", 0, 255);
});
