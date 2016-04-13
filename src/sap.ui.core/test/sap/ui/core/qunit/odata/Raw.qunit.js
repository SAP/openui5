/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/FormatException",
	"sap/ui/model/odata/type/ODataType",
	"sap/ui/model/odata/type/Raw"
], function (FormatException, ODataType, Raw) {
	/*global QUnit */
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.Raw");

	QUnit.test("basics", function (assert) {
		var oRaw = new Raw(undefined, undefined);

		assert.ok(oRaw instanceof ODataType, "is an ODataType");
		assert.strictEqual(oRaw.getName(), "sap.ui.model.odata.type.Raw");

		[undefined, false, true, 0, 1, null, {}, "", "foo"].forEach(function (vValue) {
			assert.strictEqual(oRaw.formatValue(vValue, "any"), vValue);
		});

		["", "boolean", "int", "float", "object", "string"].forEach(function (sTargetType) {
			assert.throws(function () {
				oRaw.formatValue("", sTargetType);
			}, new FormatException("Unsupported operation: sap.ui.model.odata.type.Raw#formatValue,"
				+ " sTargetType must be 'any'"));
		});
		assert.throws(function () {
			oRaw.parseValue("", "string");
		}, new Error("Unsupported operation: sap.ui.model.odata.type.Raw#parseValue"));
		assert.throws(function () {
			oRaw.validateValue(null);
		}, new Error("Unsupported operation: sap.ui.model.odata.type.Raw#validateValue"));

		assert.throws(function () {
			return new Raw(false);
		}, new Error("Unsupported arguments"));
		assert.throws(function () {
			return new Raw(undefined, false);
		}, new Error("Unsupported arguments"));
		assert.throws(function () {
			return new Raw(undefined, undefined, undefined);
		}, new Error("Unsupported arguments"));
	});

});
