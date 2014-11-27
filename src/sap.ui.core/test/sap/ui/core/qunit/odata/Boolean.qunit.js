/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";


	//*********************************************************************************************
	module("sap.ui.model.odata.type.Boolean");

	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Boolean();

		ok(oType instanceof sap.ui.model.odata.type.Boolean, "is a Boolean");
		ok(oType instanceof sap.ui.model.SimpleType, "is a SimpleType");
		strictEqual(oType.sName, "sap.ui.model.odata.type.Boolean", "type name");
		deepEqual(oType.oFormatOptions, {}, "no format options");
		deepEqual(oType.oConstraints, {}, "no constraints");
		strictEqual(oType.oResourceBundle, null, "resources not preloaded");
	});

	//*********************************************************************************************
	test("format", function () {
		var oType = new sap.ui.model.odata.type.Boolean();

		strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		strictEqual(oType.formatValue(null, "foo"), null, "null");
		strictEqual(oType.formatValue(true, "boolean"), true, "true");
		strictEqual(oType.formatValue(false, "boolean"), false, "false");
		strictEqual(oType.formatValue(true, "any"), true, "true type any");
		strictEqual(oType.formatValue(false, "any"), false, "false type any");
		strictEqual(oType.formatValue(true, "string"), "Yes", "true, target type string");
		strictEqual(oType.formatValue(false, "string"), "No", "false, target type string");
		try {
			oType.formatValue(true, "int");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.FormatException);
			strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Boolean to int");
		}
	});

	//*********************************************************************************************
	test("parse", function () {
		var oType = new sap.ui.model.odata.type.Boolean();

		strictEqual(oType.parseValue(true, "boolean"), true, "true, boolean");
		strictEqual(oType.parseValue(false, "boolean"), false, "false, boolean");
		strictEqual(oType.parseValue("Yes", "string"), true, "Yes");
		strictEqual(oType.parseValue("No", "string"), false, "No");
		strictEqual(oType.parseValue("yes", "string"), true, "yes");
		strictEqual(oType.parseValue("no", "string"), false, "no");
		try {
			oType.parseValue("foo", "string");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message, "foo is not a valid sap.ui.model.odata.type.Boolean value");
		}

		try {
			oType.parseValue(42, "int");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ParseException);
			strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Boolean from int");
		}
	});

	//*********************************************************************************************
	test("validate", function () {
		var oType = new sap.ui.model.odata.type.Boolean();

		jQuery.each([false, true],
			function (i, sValue) {
				oType.validateValue(sValue);
			}
		);

		try {
			oType.validateValue("foo");
			ok(false);
		} catch (e) {
			ok(e instanceof sap.ui.model.ValidateException);
			strictEqual(e.message, "Illegal sap.ui.model.odata.type.Boolean value: foo");
		}
	});

	//*********************************************************************************************
	test("localization change", function () {
		var oControl = new sap.ui.core.Control(),
			oType = new sap.ui.model.odata.type.Boolean();

		oControl.bindProperty("tooltip", {path: "/unused", type: oType});
		oType.formatValue(true, "string");
		notStrictEqual(oType.oResourceBundle, undefined, "resources loaded");
		sap.ui.getCore().getConfiguration().setLanguage("en-GB");
		strictEqual(oType.oResourceBundle, null, "resources cleared");
		oType.formatValue(true, "string");
		notStrictEqual(oType.oResourceBundle, undefined, "resources loaded again");
	});
} ());
