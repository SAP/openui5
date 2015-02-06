/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	module("sap.ui.model.odata.type.Boolean", {
		setup: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		teardown: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	test("basics", function () {
		var oType = new sap.ui.model.odata.type.Boolean();

		ok(oType instanceof sap.ui.model.odata.type.Boolean, "is a Boolean");
		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		strictEqual(oType.getName(), "sap.ui.model.odata.type.Boolean", "type name");
		strictEqual(oType.oFormatOptions, undefined, "no format options");
		strictEqual(oType.oConstraints, undefined, "no constraints");
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
		strictEqual(oType.parseValue(null, "boolean"), null, "null, boolean");
		strictEqual(oType.parseValue("", "string"), null, "empty string, string");
		strictEqual(oType.parseValue("Yes  ", "string"), true, "Yes");
		strictEqual(oType.parseValue("  No", "string"), false, "No");
		strictEqual(oType.parseValue("yes  ", "string"), true, "yes");
		strictEqual(oType.parseValue(" no ", "string"), false, "no");
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
	test("parse: user error", function () {
		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			var oType = new sap.ui.model.odata.type.Boolean();

			try {
				oType.parseValue("foo", "string");
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ParseException);
				strictEqual(e.message, 'EnterYesOrNo YES NO');
			}
		});
	});

	//*********************************************************************************************
	test("validate", function () {
		var oType = new sap.ui.model.odata.type.Boolean();

		jQuery.each([false, true, null],
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

		sap.ui.test.TestUtils.withNormalizedMessages(function () {
			oType = new sap.ui.model.odata.type.Boolean({}, {nullable: false});
			try {
				oType.validateValue(null);
				ok(false);
			} catch (e) {
				ok(e instanceof sap.ui.model.ValidateException);
				strictEqual(e.message, 'EnterYesOrNo YES NO');
			}
		});
	});

	//*********************************************************************************************
	test("setConstraints", function () {
		var oType = new sap.ui.model.odata.type.Boolean();

		this.mock(jQuery.sap.log).expects("warning")
			.once()
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Boolean");

		oType = new sap.ui.model.odata.type.Boolean({}, {nullable: false});
		deepEqual(oType.oConstraints, {nullable: false}, "nullable false");

		oType = new sap.ui.model.odata.type.Boolean({}, {nullable: "false"});
		deepEqual(oType.oConstraints, {nullable: false}, 'nullable "false"');

		oType = new sap.ui.model.odata.type.Boolean({}, {nullable: true});
		strictEqual(oType.oConstraints, undefined, "nullable true");

		oType = new sap.ui.model.odata.type.Boolean({}, {nullable: "true"});
		strictEqual(oType.oConstraints, undefined, 'nullable "true"');

		oType = new sap.ui.model.odata.type.Boolean({}, {nullable: "foo"});
		strictEqual(oType.oConstraints, undefined, "illegal nullable -> ignored");
	});
} ());
