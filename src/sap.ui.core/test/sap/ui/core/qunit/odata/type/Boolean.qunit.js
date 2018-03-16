/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/FormatException",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (jQuery, ManagedObject, FormatException, JSONModel, ParseException, ValidateException,
		BooleanType, ODataType, TestUtils) {
	/*global QUnit */
	"use strict";

	var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Boolean", {
		beforeEach : function () {
			this.oLogMock = this.mock(jQuery.sap.log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
			sap.ui.getCore().getConfiguration().setLanguage("en-US");
		},
		afterEach : function () {
			sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new BooleanType();

		assert.ok(oType instanceof BooleanType, "is a Boolean");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Boolean", "type name");
		assert.strictEqual(oType.oFormatOptions, undefined, "no format options");
		assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
		assert.strictEqual(oType.oConstraints, undefined, "no constraints");
	});

	//*********************************************************************************************
	QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
		function (assert) {
			var oType = new BooleanType(null, null);

			assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
			assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("format", function (assert) {
		var oType = new BooleanType();

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

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.formatValue(true, "sap.ui.core.CSSSize"), "Yes");
	});

	//*********************************************************************************************
	QUnit.test("format: Integration test getPrimitiveType", function (assert) {
		var oModel = new JSONModel({value : true}),
			TestControl = ManagedObject.extend("test.sap.ui.model.odata.type.Boolean", {
				metadata : {
					properties : {
						// use sap.ui.core.ID for testing as "Yes" needs to be a valid value
						labelFor : "sap.ui.core.ID"
					}
				}
			}),
			oControl = new TestControl();

		oControl.setModel(oModel);

		oControl.bindProperty("labelFor", {path : "/value",
			type : "sap.ui.model.odata.type.Boolean"});

		assert.strictEqual(oControl.getProperty("labelFor"), "Yes");
	});

	//*********************************************************************************************
	QUnit.test("parse", function (assert) {
		var oType = new BooleanType();

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

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.parseValue("Yes", "sap.ui.core.CSSSize"), true);
	});

	//*********************************************************************************************
	QUnit.test("parse: user error", function (assert) {
		TestUtils.withNormalizedMessages(function () {
			var oType = new BooleanType();

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
		var oType = new BooleanType();

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
			oType = new BooleanType({}, {nullable : false});
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
		var oType;

		this.oLogMock.expects("warning")
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Boolean");

		oType = new BooleanType({}, {nullable : false});
		assert.deepEqual(oType.oConstraints, {nullable : false}, "nullable false");

		oType = new BooleanType({}, {nullable : "false"});
		assert.deepEqual(oType.oConstraints, {nullable : false}, 'nullable "false"');

		oType = new BooleanType({}, {nullable : true});
		assert.strictEqual(oType.oConstraints, undefined, "nullable true");

		oType = new BooleanType({}, {nullable : "true"});
		assert.strictEqual(oType.oConstraints, undefined, 'nullable "true"');

		oType = new BooleanType({}, {nullable : "foo"});
		assert.strictEqual(oType.oConstraints, undefined, "illegal nullable -> ignored");

		oType = new BooleanType({}, {});
		assert.strictEqual(oType.oConstraints, undefined, "empty constraints");
	});
});
