/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/model/SimpleType",
	"sap/ui/model/odata/type/ODataType"
], function (SimpleType, ODataType) {
	/*global QUnit */
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.type.ODataType");

	QUnit.test("basics", function (assert) {
		var oType = new ODataType();

		assert.ok(oType instanceof ODataType, "is an ODataType");
		assert.ok(oType instanceof SimpleType, "is a SimpleType");
		assert.strictEqual(oType.getName(), undefined, "no type name is set");
		assert.strictEqual(oType.sName, undefined, "no sName");

		assert.strictEqual(oType.hasOwnProperty("oFormatOptions"), false, "no format options");
		assert.strictEqual(oType.hasOwnProperty("oConstraints"), false, "no constraints");

		assert.ok(ODataType.prototype.setConstraints !==
			SimpleType.prototype.setConstraints, "type overwrites setConstraints");
		oType.setConstraints({foo: "bar"});
		assert.strictEqual(oType.oConstraints, undefined, "no constraints");

		assert.ok(ODataType.prototype.setFormatOptions !==
			SimpleType.prototype.setFormatOptions, "type overwrites setFormatOptions");
		oType.setFormatOptions({foo: "bar"});
		assert.strictEqual(oType.oFormatOptions, undefined, "no format options");
		assert.strictEqual(oType.getInterface(), oType, "returns no interface facade");
	});

});
