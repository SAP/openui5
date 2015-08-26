/*!
 *{copyright}
 */
sap.ui.require([
	"sap/ui/core/Control",
	"sap/ui/core/LocaleData",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/Single",
	"sap/ui/test/TestUtils"
], function (Control, LocaleData, NumberFormat, FormatException, ParseException, ValidateException,
		ODataType, Single, TestUtils) {
	/*global QUnit, sinon */
	"use strict";
	/*eslint no-warning-comments: 0 */

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Single", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new Single();

		assert.ok(oType instanceof Single, "is a Single");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Single", "type name");
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
						"sap.ui.model.odata.type.Single");
			} else {
				this.mock(jQuery.sap.log).expects("warning").never();
			}

			oType = new Single({}, oFixture.i);
			assert.deepEqual(oType.oConstraints, oFixture.o);
		});
	});

	//*********************************************************************************************
	QUnit.test("format: English", function (assert) {
		var oType = new Single();

		// number to string
		assert.strictEqual(oType.formatValue(0, "string"), "0", "0");
		assert.strictEqual(oType.formatValue(9999999, "string"), "9,999,999", "99999999");
		assert.strictEqual(oType.formatValue(-9999999, "string"), "-9,999,999", "-99999999");
		assert.strictEqual(oType.formatValue(0.0000001, "string"), "0.0000001", "0.0000001");
		assert.strictEqual(oType.formatValue(Math.fround(1.6), "string"), "1.6", "1.6");
		assert.strictEqual(oType.formatValue(1.2345678, "string"), "1.234568",
			"1.2345678 toPrecision(7)");
		assert.strictEqual(oType.formatValue(1234567.8, "string"), "1,234,568",
			"1234567.8 toPrecision(7)");

		// source type string
		assert.strictEqual(oType.formatValue("1.5", "any"), "1.5", "target type any");
		assert.strictEqual(oType.formatValue("9999999", "string"), "9,999,999",
			"99999999 as String");
		assert.strictEqual(oType.formatValue("1.25", "float"), 1.25, "target type float");
		assert.strictEqual(oType.formatValue("12.34", "int"), 12, "target type int");

		// other target types
		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
		assert.strictEqual(oType.formatValue(1.5, "any"), 1.5, "target type any");
		assert.strictEqual(oType.formatValue(1.25, "float"), 1.25, "target type float");
		assert.strictEqual(oType.formatValue(12.34, "int"), 12, "target type int");

		try {
			oType.formatValue(12.34, "boolean");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Single to boolean");
		}
	});

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oType = new Single();

		assert.strictEqual(oType.parseValue(null, "foo"), null, "null is always accepted");
		assert.strictEqual(oType.parseValue("", "string"), null, "empty string becomes null");

		assert.strictEqual(oType.parseValue(" 1,000.234", "string"), Math.fround(1000.234),
			"type string ' 1,000.234'");
		assert.strictEqual(oType.parseValue(" -12,345.6", "string"), Math.fround(-12345.6),
			"type string ' -12,345.6'");
		assert.strictEqual(oType.parseValue("0.12345678", "string"), Math.fround(0.12345678),
			"type string, round to precision");

		assert.strictEqual(oType.parseValue(1234, "int"), 1234, "type int");
		assert.strictEqual(oType.parseValue(1234.56, "float"), Math.fround(1234.56), "type float");

		try {
			oType.parseValue(true, "boolean");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Single from boolean");
		}
	});

	//*********************************************************************************************
	QUnit.test("values rounded", function (assert) {
		var oType = new Single();
		assert.strictEqual(oType.formatValue(oType.parseValue("0.12345678", "string"), "string"),
			"0.1234568");
	});


	//*********************************************************************************************
	QUnit.test("parse: user error", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new Single();

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
	QUnit.test("validate success", function (assert) {
		var oType = new Single();

		[null, 0, -0, -100000, -9999999.00].forEach(function (sValue) {
			oType.validateValue(sValue);
			assert.ok(true, sValue);
		});
	});

	//*********************************************************************************************
	[false, null, {}, "foo"].forEach(function (sValue) {
		QUnit.test("validate errors: " + JSON.stringify(sValue), function (assert) {
			TestUtils.withNormalizedMessages(function () {
				var oType = new Single({}, {nullable: false});

				try {
					oType.validateValue(sValue);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					// TODO "Enter a number"? We gave lots of numbers!
					assert.strictEqual(e.message, "EnterNumber");
				}
			});
		});
	});

	//*********************************************************************************************
	QUnit.test("localization change", function (assert) {
		var oControl = new Control(),
			oType = new Single();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		assert.strictEqual(oType.formatValue(1234, "string"), "1,234",
			"before language change");
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		assert.strictEqual(oType.formatValue(1234, "string"), "1'234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	[{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true}
	}, {
		set: {decimals: 3, groupingEnabled: false},
		expect: {decimals: 3, groupingEnabled: false}
	}, {
		set: {maxFractionDigits: 3},
		expect: {groupingEnabled: true, maxFractionDigits: 3}
	}].forEach(function (oFixture) {
		QUnit.test("formatOptions: " + JSON.stringify(oFixture.set), function (assert) {
			var oSpy,
				oType = new Single(oFixture.set);

			assert.deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(NumberFormat, "getFloatInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});
});
