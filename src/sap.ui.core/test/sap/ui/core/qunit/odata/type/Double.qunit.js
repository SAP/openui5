/*!
 *{copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/Control",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (Log, Localization, Control, NumberFormat, FormatException, ParseException,
		ValidateException, Double, ODataType, TestUtils) {
	/*global QUnit, sinon */
	"use strict";
	/*eslint no-warning-comments: 0 */

	var sDefaultLanguage = Localization.getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Double", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			Localization.setLanguage("en-US");
		},
		afterEach : function () {
			Localization.setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new Double();

		assert.ok(oType instanceof Double, "is a Double");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Double", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "default format options");
		assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
		assert.strictEqual(oType.oConstraints, undefined, "default constraints");
		assert.strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	QUnit.test("constructor calls checkParseEmptyValueToZero", function (assert) {
		var oConstraints = {nullable : false};
		var oFormatOptions = {"~formatOption" : "foo"};

		var oExpectation = this.mock(ODataType.prototype).expects("checkParseEmptyValueToZero")
				.withExactArgs()
				.callsFake(function () {
					assert.deepEqual(this.oConstraints, oConstraints);
					assert.strictEqual(this.oFormatOptions, oFormatOptions);
				});

		// code under test
		var oType = new Double(oFormatOptions, oConstraints);

		assert.ok(oExpectation.calledOn(oType));
		assert.deepEqual(oType.oConstraints, oConstraints);
		assert.strictEqual(oType.oFormatOptions, oFormatOptions);
	});

	//*********************************************************************************************
	QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
		function (assert) {
			var oType = new Double(null, null);

			assert.deepEqual(oType.oFormatOptions, null, "no format options");
			assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
[
	undefined,
	{},
	{preserveDecimals : true},
	{preserveDecimals : "yes"},
	{preserveDecimals : undefined},
	{preserveDecimals : null},
	{preserveDecimals : false}
].forEach(function (oFormatOptions, i) {
	QUnit.test("constructor: oFormatOptions.preserveDecimals; #" + i, function (assert) {
		// code under test
		var oType = new Double(oFormatOptions);

		// format options are taken as they are - preserveDecimals is considered when creating the
		// formatter instance
		assert.strictEqual(oType.oFormatOptions, oFormatOptions);
	});
});

	//*********************************************************************************************
	[
		{i : {}, o : undefined},
		{i : {nullable : true}, o : undefined},
		{i : {nullable : false}, o : {nullable : false}},
		{i : {nullable : "true"}, o : undefined},
		{i : {nullable : "false"}, o : {nullable : false}},
		{i : {nullable : "foo"}, o : undefined, warning : "Illegal nullable: foo"}
	].forEach(function (oFixture) {
		QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
			var oType;

			if (oFixture.warning) {
				this.oLogMock.expects("warning")
					.withExactArgs(oFixture.warning, null, "sap.ui.model.odata.type.Double");
			}

			oType = new Double({}, oFixture.i);
			assert.deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	QUnit.test("format: English", function (assert) {
		var oType = new Double();

		// number to string
		assert.strictEqual(oType.formatValue(0, "string"), "0", "0");
		assert.strictEqual(oType.formatValue(9999999, "string"), "9,999,999", "99999999");
		assert.strictEqual(oType.formatValue(-9999999, "string"), "-9,999,999", "-99999999");
		assert.strictEqual(oType.formatValue(9.99999999999999e+14, "string"),
			"999,999,999,999,999", "9.99999999999999e+14");
		assert.strictEqual(oType.formatValue(1e+15, "string"), "1\u00a0E+15", "1e+15");
		assert.strictEqual(oType.formatValue(-9.99999999999999e+14, "string"),
			"-999,999,999,999,999", "-9.99999999999999e+14");
		assert.strictEqual(oType.formatValue(-1e+15, "string"), "-1\u00a0E+15", "-1e+15");
		assert.strictEqual(oType.formatValue(1e-4, "string"), "0.0001", "1e-4");
		assert.strictEqual(oType.formatValue(9.99999999999999e-5, "string"),
			"9.99999999999999\u00a0E-5", "9.99999999999999e-5");

		// source type string
		assert.strictEqual(oType.formatValue("123,4", "any"), "123,4", "target type any");
		assert.strictEqual(oType.formatValue("9999999", "string"), "9,999,999", "99999999");
		assert.strictEqual(oType.formatValue("1234.567", "float"), 1234.567, "target type float");
		assert.strictEqual(oType.formatValue("1234.1", "int"), 1234, "target type int");

		// TODO "NaN", "Infinity", "-Infinity"

		// other target types
		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
		assert.strictEqual(oType.formatValue(123.4, "any"), 123.4, "target type any");
		assert.strictEqual(oType.formatValue(1234.567, "float"), 1234.567, "target type float");
		assert.strictEqual(oType.formatValue(1234.1, "int"), 1234, "target type int");

		try {
			oType.formatValue(12.34, "boolean");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Double to boolean");
		}

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.formatValue(9999999, "sap.ui.core.CSSSize"), "9,999,999");
	});

	//*********************************************************************************************
	QUnit.test("format: modified Swedish", function (assert) {
		var oType = new Double({plusSign : ">", minusSign : "<"});

		// Swedish is interesting because it uses a different decimal separator, non-breaking
		// space as grouping separator and _not_ the 'E' for the exponential format.
		// TODO The 'e' is not replaced because NumberFormat doesn't care either (esp. in parse).
		Localization.setLanguage("sv");

		assert.strictEqual(oType.formatValue("-1.234e+3", "string"), "<1\u00a0234",
			"check modification");
		assert.strictEqual(oType.formatValue("-1.234e+15", "string"), "<1,234\u00a0E>15",
			"check replacement");
	});

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oType = new Double();

		assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");

		assert.strictEqual(oType.parseValue("1.234", "string"), 1.234, "type string");
		assert.strictEqual(oType.parseValue("-12345", "string"), -12345, "type string");
		assert.strictEqual(oType.parseValue("12.345E-3", "string"), 0.012345,
			"type string w/ exp");
		assert.strictEqual(oType.parseValue("12.345 E-3", "string"), 0.012345,
			"type string w/ exp and space");
		assert.strictEqual(oType.parseValue("12.345\u00a0E-3", "string"), 0.012345,
			"type string w/ exp and non-breaking space");
		assert.strictEqual(oType.parseValue(1234, "int"), 1234, "type int");
		assert.strictEqual(oType.parseValue(1234.567, "float"), 1234.567, "type float");

		try {
			oType.parseValue(true, "boolean");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Double from boolean");
		}

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.parseValue("1.234", "sap.ui.core.CSSSize"), 1.234);
	});

	//*********************************************************************************************
	QUnit.test("parse: user error", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new Double();

			try {
				oType.parseValue("foo", "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ParseException);
				assert.strictEqual(e.message, "EnterNumber");
			}
		});
	});

	//*********************************************************************************************
	[false, null, {}, "foo"].forEach(function (sValue) {
		QUnit.test("validate errors: " + JSON.stringify(sValue), function (assert) {
			TestUtils.withNormalizedMessages(function () {
				var oType = new Double({}, {nullable : false});

				try {
					oType.validateValue(sValue);
					assert.ok(false, "no error thrown");
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					assert.strictEqual(e.message, "EnterNumber");
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("validate success", function (assert) {
		var oType = new Double();

		// TODO "NaN", "Infinity", "-Infinity"
		[null, 1.1, 1.234E+235].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new Double();

		oControl.bindProperty("tooltip", {path : "/unused", type : oType});
		assert.strictEqual(oType.formatValue("1.234e3", "string"), "1,234",
			"before language change");
		Localization.setLanguage("de-CH");
		assert.strictEqual(oType.formatValue("1.234e3", "string"), "1’234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[{
		set : undefined,
		expect : {groupingEnabled : true, preserveDecimals : true}
	}, {
		set : {},
		expect : {groupingEnabled : true, preserveDecimals : true}
	}, {
		set : {preserveDecimals : true},
		expect : {groupingEnabled : true, preserveDecimals : true}
	}, {
		set : {preserveDecimals : "yes"},
		expect : {groupingEnabled : true, preserveDecimals : "yes"}
	}, {
		set : {preserveDecimals : undefined},
		expect : {groupingEnabled : true, preserveDecimals : undefined}
	}, {
		set : {preserveDecimals : null},
		expect : {groupingEnabled : true, preserveDecimals : null}
	}, {
		set : {preserveDecimals : false},
		expect : {groupingEnabled : true, preserveDecimals : false}
	}, {
		set : {style : "short"},
		expect : {groupingEnabled : true, style : "short"}
	}, {
		set : {style : "long"},
		expect : {groupingEnabled : true, style : "long"}
	}, {
		set : {style : "standard"},
		expect : {groupingEnabled : true, preserveDecimals : true, style : "standard"}
	}, {
		set : {preserveDecimals : true, style : "short"},
		expect : {groupingEnabled : true, preserveDecimals : true, style : "short"}
	}, {
		set : {preserveDecimals : true, style : "long"},
		expect : {groupingEnabled : true, preserveDecimals : true, style : "long"}
	}, {
		set : {foo : "bar"},
		expect : {foo : "bar", groupingEnabled : true, preserveDecimals : true}
	}, {
		set : {decimals : 7, groupingEnabled : false},
		expect : {decimals : 7, groupingEnabled : false, preserveDecimals : true}
	}].forEach(function (oFixture) {
		QUnit.test("formatOptions: " + JSON.stringify(oFixture.set), function (assert) {
			var oSpy,
				oType = new Double(oFixture.set);

			assert.deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(NumberFormat, "getFloatInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});

	//*********************************************************************************************
	QUnit.test("format: bad input type", function (assert) {
		// no need to use UI5Date.getInstance as date value doesn't matter
		var oBadModelValue = new Date(),
			oType = new Double();

		["string", "int", "float"].forEach(function (sTargetType) {
			assert.throws(function () {
				oType.formatValue(oBadModelValue, sTargetType);
			}, new FormatException("Illegal " + oType.getName() + " value: " + oBadModelValue));
		});
		assert.strictEqual(oType.formatValue(oBadModelValue, "any"), oBadModelValue);
	});

	//*********************************************************************************************
	QUnit.test("getFormat", function (assert) {
		var oType = new Double({parseEmptyValueToZero : true}, {nullable : false});

		assert.strictEqual(oType.oFormat, null);

		this.mock(NumberFormat).expects("getFloatInstance")
			.withExactArgs({preserveDecimals: true, groupingEnabled: true})
			.returns("~floatInstance");

		// code under test
		assert.strictEqual(oType.getFormat(), "~floatInstance");
		assert.strictEqual(oType.oFormat, "~floatInstance");
	});

	//*********************************************************************************************
	QUnit.test("parseValue calls getEmptyValue", function (assert) {
		var oType = new Double();

		this.mock(oType).expects("getEmptyValue").withExactArgs("~emptyString", /*bNumeric*/true)
			.returns("~emptyValue");

		// code under test
		assert.strictEqual(oType.parseValue("~emptyString", "foo"), "~emptyValue");
	});
});