/*!
 *{copyright}
 */
sap.ui.require([
	"sap/ui/core/Control",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (Control, NumberFormat, FormatException, ParseException, ValidateException, Double,
		ODataType, TestUtils) {
	/*global QUnit, sinon */
	"use strict";
	/*eslint no-warning-comments: 0 */

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	jQuery.sap.require("sap.ui.core.Control");
	jQuery.sap.require("sap.ui.core.LocaleData");
	jQuery.sap.require("sap.ui.model.odata.type.Double");
	jQuery.sap.require("sap.ui.test.TestUtils");

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Double", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new Double();

		assert.ok(oType instanceof Double, "is a Double");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Double", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "default format options");
		assert.strictEqual(oType.oConstraints, undefined, "default constraints");
		assert.strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	[
		{i: {}, o: undefined},
		{i: {nullable: true}, o: undefined},
		{i: {nullable: false}, o: {nullable: false}},
		{i: {nullable: "true"}, o: undefined},
		{i: {nullable: "false"}, o: {nullable: false}},
		{i: {nullable: "foo"}, o: undefined, warning: "Illegal nullable: foo"}
	].forEach(function (oFixture) {
		QUnit.test("constraints: " + JSON.stringify(oFixture.i) + ")", function (assert) {
			var oType;

			if (oFixture.warning) {
				this.mock(jQuery.sap.log).expects("warning")
					.once().withExactArgs(oFixture.warning, null,
						"sap.ui.model.odata.type.Double");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
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
	});

	//*********************************************************************************************
	QUnit.test("format: modified Swedish", function (assert) {
		var oType = new Double({plusSign: ">", minusSign: "<"});

		// Swedish is interesting because it uses a different decimal separator, non-breaking
		// space as grouping separator and _not_ the 'E' for the exponential format.
		// TODO The 'e' is not replaced because NumberFormat doesn't care either (esp. in parse).
		sap.ui.getCore().getConfiguration().setLanguage("sv");

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
				var oType = new Double({}, {nullable: false});

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
		assert.expect(0);
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new Double();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		assert.strictEqual(oType.formatValue("1.234e3", "string"), "1,234",
			"before language change");
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		assert.strictEqual(oType.formatValue("1.234e3", "string"), "1'234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true}
	}, {
		set: {decimals: 7, groupingEnabled: false},
		expect: {decimals: 7, groupingEnabled: false}
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
});
