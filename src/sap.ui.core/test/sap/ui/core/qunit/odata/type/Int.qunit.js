/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/Control",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/Int",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/SByte",
	"sap/ui/test/TestUtils"
], function (Log, Localization, Control, NumberFormat, FormatException,
		ParseException, ValidateException, Byte, Int, Int16, Int32, ODataType, SByte, TestUtils) {
	/*global QUnit, sinon */
	"use strict";

	var sDefaultLanguage = Localization.getLanguage();

	function anyInt(TypeClass, sName, iMin, iMax) {
		var oType;

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
			beforeEach : function () {
				this.oLogMock = this.mock(Log);
				this.oLogMock.expects("warning").never();
				this.oLogMock.expects("error").never();
				Localization.setLanguage("en-US");
				oType = new TypeClass();
			},
			afterEach : function () {
				Localization.setLanguage(sDefaultLanguage);
			}
		});

		QUnit.test("basics", function (assert) {
			assert.ok(oType instanceof Int, "is an Int");
			assert.ok(oType instanceof ODataType, "is an ODataType");
			assert.strictEqual(oType.getName(), sName, "is the right name");
			assert.strictEqual(oType.oFormatOptions, undefined, "no formatting options");
			assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
			assert.strictEqual(oType.oConstraints, undefined, "are the right constraints");
			assert.strictEqual(oType.oFormat, null, "no formatter preload");
		});

		//*****************************************************************************************
		QUnit.test("constructor calls checkParseEmptyValueToZero", function (assert) {
			var oConstraints = {nullable : false}; // otherwise there are no constraints set to the type
			var oFormatOptions = {"~formatOption" : "foo"};

			var oExpectation = this.mock(ODataType.prototype).expects("checkParseEmptyValueToZero")
					.withExactArgs()
					.callsFake(function () {
						assert.deepEqual(this.oConstraints, oConstraints);
						assert.strictEqual(this.oFormatOptions, oFormatOptions);
					});

			// code under test
			var oType = new TypeClass(oFormatOptions, oConstraints);

			assert.ok(oExpectation.calledOn(oType));
			assert.deepEqual(oType.oConstraints, oConstraints);
			assert.strictEqual(oType.oFormatOptions, oFormatOptions);
		});

		QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
			function (assert) {
				var oType = new TypeClass(null, null);

				assert.deepEqual(oType.oFormatOptions, null, "no format options");
				assert.deepEqual(oType.oConstraints, undefined, "default constraints");
		});

		QUnit.test("localization change", function (assert) {
			var oControl = new Control();

			oType.formatValue(1234, "string"); // ensure that there is a formatter to remove
			oControl.bindProperty("tooltip", {path : "/unused", type : oType});
			Localization.setLanguage("de-CH");
			assert.strictEqual(oType.oFormat, null, "localization change resets formatter");
			oType.formatValue(1234, "int");
			assert.strictEqual(oType.oFormat, null, "no formatter for int");
			assert.strictEqual(oType.formatValue(1234, "string"), "1’234",
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
				oType.formatValue(123, "object");
				assert.ok(false, "Expected FormatException not thrown");
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message, "Don't know how to format " + sName + " to object");
			}

			this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
				.returns("string");
			assert.strictEqual(oType.formatValue(123, "sap.ui.core.CSSSize"), "123");
		});

		QUnit.test("parseValue", function (assert) {
			try {
				oType.parseValue(true, "boolean");
				assert.ok(false, "Expected ParseException not thrown");
			} catch (e) {
				assert.ok(e instanceof ParseException);
				assert.strictEqual(e.message,
					"Don't know how to parse " + sName + " from boolean");
			}
			assert.strictEqual(oType.parseValue("1,234", "string"), 1234,
				"number parsed from string");
			assert.strictEqual(oType.parseValue("1234", "string"), 1234,
				"number parsed from string");
			assert.strictEqual(oType.parseValue(1234, "int"), 1234, "number parsed from int");

			assert.strictEqual(oType.parseValue(null, "foo"), null, "null accepted for any type");

			Localization.setLanguage("de-DE");
			oType = new TypeClass();
			assert.strictEqual(oType.parseValue(1234.001, "float"), 1234,
				"don't parse float as string");

			this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
				.returns("string");
			assert.strictEqual(oType.parseValue("1234", "sap.ui.core.CSSSize"), 1234);
		});

		//*****************************************************************************************
		QUnit.test("parseValue calls getEmptyValue", function (assert) {
			var oType = new TypeClass();

			this.mock(oType).expects("getEmptyValue")
				.withExactArgs("~emptyString", /*bNumeric*/ true)
				.returns("~emptyValue");

			// code under test
			assert.strictEqual(oType.parseValue("~emptyString", "foo"), "~emptyValue");
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
				var oExpectedConstraints = bNullable === false ? {nullable : false} : undefined;

				oType = new TypeClass({},
					{minimum : -100, maximum : 100, nullable : bNullable});
				assert.deepEqual(oType.oConstraints, oExpectedConstraints,
					"only nullable accepted");
			});
		});

		QUnit.test("validation success", function (assert) {
			[iMin, iMax].forEach(function (iValue) {
				oType.validateValue(iValue);
			});
		});

		QUnit.test("validate w/ decimal", function (assert) {
			TestUtils.withNormalizedMessages(function () {
				try {
					oType.validateValue(123.456);
					assert.ok(false, "Expected ValidateException not thrown");
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					assert.strictEqual(e.message, "EnterInt");
				}
			});
		});

		QUnit.test("range tests", function (assert) {
			var sExpectedMessage,
				oNumberFormat = NumberFormat.getIntegerInstance({
					groupingEnabled :true});

			sExpectedMessage = "EnterNumberMin " + oNumberFormat.format(iMin);
			testRange(assert, -Infinity, sExpectedMessage);
			testRange(assert, iMin - 1, sExpectedMessage);

			sExpectedMessage = "EnterNumberMax " + oNumberFormat.format(iMax);
			testRange(assert, iMax + 1, sExpectedMessage);
			testRange(assert, Infinity, sExpectedMessage);
		});

		QUnit.test("nullable", function (assert) {
			oType.validateValue(null);

			this.oLogMock.expects("warning")
				.withExactArgs("Illegal nullable: 42", null, sName);

			oType = new TypeClass({});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new TypeClass({}, {nullable : true});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new TypeClass({}, {nullable : "true"});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new TypeClass({}, {nullable : undefined});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new TypeClass({}, {nullable : 42});
			assert.strictEqual(oType.oConstraints, undefined);

			oType = new TypeClass({}, {nullable : false});
			assert.strictEqual(oType.oConstraints.nullable, false);

			oType = new TypeClass({}, {nullable : "false"});
			assert.strictEqual(oType.oConstraints.nullable, false);

			TestUtils.withNormalizedMessages(function () {
				oType = new TypeClass({}, {nullable : false});
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
			set : {foo : "bar"},
			expect : {foo : "bar", groupingEnabled : true}
		}, {
			set : {decimals : 7, groupingEnabled : false},
			expect : {decimals : 7, groupingEnabled : false}
		}].forEach(function (oFixture) {
			QUnit.test("formatOptions: " + JSON.stringify(oFixture.set), function (assert) {
				var oSpy,
					oType = new TypeClass(oFixture.set);

				assert.deepEqual(oType.oFormatOptions, oFixture.set);

				oSpy = this.spy(NumberFormat, "getIntegerInstance");
				oType.formatValue(42, "string");
				sinon.assert.calledWithExactly(oSpy, oFixture.expect);
			});
		});

		QUnit.test("format: bad input type", function (assert) {
			// no need to use UI5Date.getInstance as date value doesn't matter
			var oBadModelValue = new Date(),
				oType = new TypeClass();

			["string", "int", "float"].forEach(function (sTargetType) {
				assert.throws(function () {
					oType.formatValue(oBadModelValue, sTargetType);
				}, new FormatException("Illegal " + sName + " value: " + oBadModelValue));
			});
			assert.strictEqual(oType.formatValue(oBadModelValue, "any"), oBadModelValue);
		});

		//*********************************************************************************************
		QUnit.test("getFormat", function (assert) {
			var oType = new TypeClass({parseEmptyValueToZero : true}, {nullable : false});

			assert.strictEqual(oType.oFormat, null);

			this.mock(NumberFormat).expects("getIntegerInstance")
				.withExactArgs({groupingEnabled : true})
				.returns("~integerInstance");

			// code under test
			assert.strictEqual(oType.getFormat(), "~integerInstance");
		});
	}

	anyInt(Int16, "sap.ui.model.odata.type.Int16", -32768, 32767);

	anyInt(Int32, "sap.ui.model.odata.type.Int32", -2147483648, 2147483647);

	anyInt(SByte, "sap.ui.model.odata.type.SByte", -128, 127);

	anyInt(Byte, "sap.ui.model.odata.type.Byte", 0, 255);
});