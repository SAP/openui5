/*!
 *{copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	jQuery.sap.require("sap.ui.core.Control");
	jQuery.sap.require("sap.ui.core.LocaleData");
	jQuery.sap.require("sap.ui.model.odata.type.Single");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Single", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Single();

		ok(oType instanceof sap.ui.model.odata.type.Single, "is a Single");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Single", "type name");
		strictEqual(oType.oFormatOptions, undefined, "default format options");
		strictEqual(oType.oConstraints, undefined, "default constraints");
		strictEqual(oType.oFormat, null, "no formatter preload");
	});

	//*********************************************************************************************
	test("format: English", function () {
		var oType = new sap.ui.model.odata.type.Single();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue("1.234", "any"), "1.234", "target type any");
		strictEqual(oType.formatValue("1.234", "float"), 1.234, "target type float");
		strictEqual(oType.formatValue("12.34", "int"), 12, "target type int");
		strictEqual(oType.formatValue("0", "string"), "0", "0");
		strictEqual(oType.formatValue("9999999", "string"), "9,999,999",
			"99999999");
		strictEqual(oType.formatValue("-9999999", "string"), "-9,999,999",
			"-99999999");
		strictEqual(oType.formatValue("0.0000001", "string"), "0.0000001", "0.0000001");
		strictEqual(oType.formatValue(".0000001", "string"), "0.0000001", ".0000001");
		strictEqual(oType.formatValue("+0.0000001", "string"), "0.0000001", "+0.0000001");
		strictEqual(oType.formatValue("-.0000001", "string"), "-0.0000001", "-.0000001");
		try {
			oType.formatValue(12.34, "boolean");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Single to boolean");
		}
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Single();

		try {
			oType.parseValue("4.2", "string");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message, "Unsupported operation: data type " + oType.getName()
				+ " is read-only.");
		}
	});

	//*********************************************************************************************
	test("validate", function () {
		var oType = new sap.ui.model.odata.type.Single();

		try {
			oType.validateValue(42);
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message, "Unsupported operation: data type " + oType.getName()
				+ " is read-only.");
		}
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Single();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		strictEqual(oType.formatValue("1234", "string"), "1,234",
			"before language change");
		sap.ui.getCore().getConfiguration().setLanguage("de-CH");
		strictEqual(oType.formatValue("1234", "string"), "1'234",
			"adjusted to changed language");
	});

	//*********************************************************************************************
	jQuery.each([{
		set: {foo: "bar"},
		expect: {foo: "bar", groupingEnabled: true}
	}, {
		set: {decimals: 3, groupingEnabled: false},
		expect: {decimals: 3, groupingEnabled: false}
	}], function (i, oFixture) {
		test("formatOptions: " + JSON.stringify(oFixture.set), function () {
			var oSpy,
				oType = new sap.ui.model.odata.type.Single(oFixture.set);

			deepEqual(oType.oFormatOptions, oFixture.set);

			oSpy = this.spy(sap.ui.core.format.NumberFormat, "getFloatInstance");
			oType.formatValue(42, "string");
			sinon.assert.calledWithExactly(oSpy, oFixture.expect);
		});
	});

} ());
