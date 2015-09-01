/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (FormatException, ParseException, ValidateException, Boolean, ODataType, TestUtils) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	QUnit.module("Boolean", {
		beforeEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach: function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	QUnit.test("basics", function (assert) {
		var oType = new Boolean();

		assert.ok(oType instanceof Boolean, "is a Boolean");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Boolean", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "no format options");
		assert.strictEqual(oType.oConstraints, undefined, "no constraints");
	});

	//*********************************************************************************************
	QUnit.test("format", function (assert) {
		var oType = new Boolean();

		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
		assert.strictEqual(oType.formatValue(true, "boolean"), true, "true");
		assert.strictEqual(oType.formatValue(false, "boolean"), false, "false");
		assert.strictEqual(oType.formatValue(true, "any"), true, "true type any");
		assert.strictEqual(oType.formatValue(false, "any"), false, "false type any");
		assert.strictEqual(oType.formatValue(true, "string"), "Yes", "true, target type string");
		assert.strictEqual(oType.formatValue(false, "string"), "No", "false, target type string");
		try {
			oType.formatValue(true, "int");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof FormatException);
			assert.strictEqual(e.message,
				"Don't know how to format sap.ui.model.odata.type.Boolean to int");
		}
	});

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oType = new Boolean();

		assert.strictEqual(oType.parseValue(true, "boolean"), true, "true, boolean");
		assert.strictEqual(oType.parseValue(false, "boolean"), false, "false, boolean");
		assert.strictEqual(oType.parseValue(null, "boolean"), null, "null, boolean");
		assert.strictEqual(oType.parseValue("", "string"), null, "empty string, string");
		assert.strictEqual(oType.parseValue("Yes  ", "string"), true, "Yes");
		assert.strictEqual(oType.parseValue("  No", "string"), false, "No");
		assert.strictEqual(oType.parseValue("yes  ", "string"), true, "yes");
		assert.strictEqual(oType.parseValue(" no ", "string"), false, "no");
		try {
			oType.parseValue(42, "int");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ParseException);
			assert.strictEqual(e.message,
				"Don't know how to parse sap.ui.model.odata.type.Boolean from int");
		}
	});

	//*********************************************************************************************
	QUnit.test("parse: user error", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new Boolean();

			try {
				oType.parseValue("foo", "string");
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ParseException);
				assert.strictEqual(e.message, 'EnterYesOrNo YES NO');
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("validate", function (assert) {
		var oType = new Boolean();

		[false, true, null].forEach(function (sValue) {
			oType.validateValue(sValue);
		});

		try {
			oType.validateValue("foo");
			assert.ok(false);
		} catch (e) {
			assert.ok(e instanceof ValidateException);
			assert.strictEqual(e.message, "Illegal sap.ui.model.odata.type.Boolean value: foo");
		}

		TestUtils.withNormalizedMessages(function () {
			oType = new Boolean({}, {nullable: false});
			try {
				oType.validateValue(null);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof ValidateException);
				assert.strictEqual(e.message, 'EnterYesOrNo YES NO');
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("setConstraints", function (assert) {
		var oType = new Boolean();

		this.mock(jQuery.sap.log).expects("warning")
			.once()
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Boolean");

		oType = new Boolean({}, {nullable: false});
		assert.deepEqual(oType.oConstraints, {nullable: false}, "nullable false");

		oType = new Boolean({}, {nullable: "false"});
		assert.deepEqual(oType.oConstraints, {nullable: false}, 'nullable "false"');

		oType = new Boolean({}, {nullable: true});
		assert.strictEqual(oType.oConstraints, undefined, "nullable true");

		oType = new Boolean({}, {nullable: "true"});
		assert.strictEqual(oType.oConstraints, undefined, 'nullable "true"');

		oType = new Boolean({}, {nullable: "foo"});
		assert.strictEqual(oType.oConstraints, undefined, "illegal nullable -> ignored");
	});
});
