/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/Guid",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/test/TestUtils"
], function (Log, FormatException, ParseException, ValidateException, Guid, ODataType, TestUtils) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Guid", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("warning").never();
			this.oLogMock.expects("error").never();
		}
	});

	//*********************************************************************************************
	QUnit.test("basics", function (assert) {
		var oType = new Guid();

		assert.ok(oType instanceof Guid, "is a Guid");
		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.strictEqual(oType.getName(), "sap.ui.model.odata.type.Guid", "type name");
		assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
		assert.ok(oType.hasOwnProperty("oConstraints"), "be V8-friendly");
		assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	QUnit.test("construct with null values for 'oFormatOptions' and 'oConstraints",
		function (assert) {
			var oType = new Guid(null, null);

			assert.deepEqual(oType.oFormatOptions, undefined, "no format options");
			assert.deepEqual(oType.oConstraints, undefined, "default constraints");
	});

	//*********************************************************************************************
	["false", false, "true", true, undefined].forEach(function (vNullable, i) {
		QUnit.test("with nullable=" + vNullable + " (type: " + typeof vNullable + ")",
			function (assert) {
				var oType;

				oType = new Guid({}, {
					foo : "a",
					nullable : vNullable
				});
				assert.deepEqual(oType.oConstraints, i >= 2 ? undefined : {nullable : false});
			});
	});

	//*********************************************************************************************
	QUnit.test("default nullable is true", function (assert) {
		var oType = new Guid({}, {nullable : false});

		this.oLogMock.expects("warning")
			.withExactArgs("Illegal nullable: foo", null, "sap.ui.model.odata.type.Guid");

		oType = new Guid(null, {nullable : "foo"});
		assert.deepEqual(oType.oConstraints, undefined, "illegal nullable -> default to true");
	});

	//*********************************************************************************************
	QUnit.test("format success", function (assert) {
		var oType = new Guid();

		assert.strictEqual(oType.formatValue(undefined, "foo"), null, "undefined");
		assert.strictEqual(oType.formatValue(null, "foo"), null, "null");
		// Note: case is preserved!
		assert.strictEqual(oType.formatValue("0050568d-393C-1ed4-9D97-E65F0F3FCC23", "string"),
			"0050568d-393C-1ed4-9D97-E65F0F3FCC23", "target type string");
		assert.strictEqual(oType.formatValue("0050568d-393C-1ed4-9D97-E65F0F3FCC23", "any"),
			"0050568d-393C-1ed4-9D97-E65F0F3FCC23", "target type any");

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.formatValue("0050568d-393C-1ed4-9D97-E65F0F3FCC23",
			"sap.ui.core.CSSSize"), "0050568d-393C-1ed4-9D97-E65F0F3FCC23");
	});

	//*********************************************************************************************
	["int", "boolean", "float", "object"].forEach(function (sTargetType) {
		QUnit.test("format fail for target type " + sTargetType, function (assert) {
			var oType = new Guid();

			try {
				oType.formatValue("0050568D-393C-1ED4-9D97-E65F0F3FCC23", sTargetType);
				assert.ok(false);
			} catch (e) {
				assert.ok(e instanceof FormatException);
				assert.strictEqual(e.message,
					"Don't know how to format sap.ui.model.odata.type.Guid to " + sTargetType);
			}
		});
	});

	//*********************************************************************************************
	QUnit.test("parse success", function (assert) {
		var oType = new Guid();

		assert.strictEqual(oType.parseValue(null, "string"), null, "null");
		assert.strictEqual(oType.parseValue("", "string"), null,
			"empty string is converted to null");
		// Note: case is preserved
		assert.strictEqual(oType.parseValue("0050568d-393C-1ed4-9D97-E65F0F3FCC23", "string"),
			"0050568d-393C-1ed4-9D97-E65F0F3FCC23", "real GUID, mixed case");
		assert.strictEqual(oType.parseValue("0050568d393C1ed49D97E65F0F3FCC23", "string"),
			"0050568d-393C-1ed4-9D97-E65F0F3FCC23", "real GUID without '-'");
		assert.strictEqual(oType.parseValue("-005--05-68d3-93C1e-d49D97E65F0F3FCC23-", "string"),
			"0050568d-393C-1ed4-9D97-E65F0F3FCC23", "GUID with separators at wrong places");
		assert.strictEqual(oType.parseValue("  0050\uFEFF568d 393C\t1ed49D97-E65F0F3FCC23 \n",
			"string"), "0050568d-393C-1ed4-9D97-E65F0F3FCC23", "real GUID");
		assert.strictEqual(oType.parseValue("0050568D-393c-1", "string"),
			"0050568D-393c-1", "parse invalid GUID");
		assert.strictEqual(oType.parseValue("005X568d-393C-1ed4-9D97-E65F0F3FCC23", "string"),
			"005X568d-393C-1ed4-9D97-E65F0F3FCC23", "invalid character X");

		this.mock(oType).expects("getPrimitiveType").withExactArgs("sap.ui.core.CSSSize")
			.returns("string");
		assert.strictEqual(oType.parseValue("0050568d-393C-1ed4-9D97-E65F0F3FCC23",
			"sap.ui.core.CSSSize"), "0050568d-393C-1ed4-9D97-E65F0F3FCC23");
	});

	//*********************************************************************************************
	[[123, "int"], [true, "boolean"], [1.23, "float"], ["foo", "object"]].forEach(
		function (aFixture) {
			QUnit.test("parse fail for source type " + aFixture[1], function (assert) {
				var oType = new Guid();

				try {
					oType.parseValue(aFixture[0], aFixture[1]);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof ParseException);
					assert.strictEqual(e.message,
						"Don't know how to parse sap.ui.model.odata.type.Guid from "
						+ aFixture[1]);
				}
			});
		}
	);

	//*********************************************************************************************
	QUnit.test("validate success", function (assert) {
		var oType = new Guid();

		// Note: case is ignored
		[null, "0050568d-393C-1ed4-9D97-E65F0F3FCC23"].forEach(function (sValue) {
			oType.validateValue(sValue);
		});
	});

	//*********************************************************************************************
	[
		{value : 1234, message : "Illegal sap.ui.model.odata.type.Guid value: 1234"},
		{value : "123", message : "EnterGuid"},
		{value : "0050568D-393C-1ED4-9D97-E65F0F3FCC23-2", message : "EnterGuid"},
		{value : "G050568D-393C-1ED4-9D97-E65F0F3FCC23", message : "EnterGuid"},
		{value : null, message : "EnterGuid"}
	].forEach(function (oFixture) {
		QUnit.test("validate exception for value " + oFixture.value, function (assert) {
			TestUtils.withNormalizedMessages(function () {
				var oType = new Guid({}, {nullable : false});

				try {
					oType.validateValue(oFixture.value);
					assert.ok(false);
				} catch (e) {
					assert.ok(e instanceof ValidateException);
					assert.strictEqual(e.message, oFixture.message);
				}
			});
		});
	});
});