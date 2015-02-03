/*!
 * ${copyright}
 */
(function () {
	/*global asyncTest, deepEqual, equal, expect, module, notDeepEqual,
	notEqual, notStrictEqual, ok, raises, sinon, start, strictEqual, stop, test,
	*/
	"use strict";

	jQuery.sap.require("sap.ui.model.odata.type.ODataType");

	//*********************************************************************************************
	module("sap.ui.model.odata.type.ODataType");

	test("basics", function () {
		var oType = new sap.ui.model.odata.type.ODataType();

		ok(oType instanceof sap.ui.model.odata.type.ODataType, "is a ODataType");
		ok(oType instanceof sap.ui.model.SimpleType, "is a SimpleType");
		strictEqual(oType.getName(), undefined, "no type name is set");
		strictEqual(oType.sName, undefined, "no sName");

		strictEqual(oType.hasOwnProperty("oFormatOptions"), false, "no format options");
		strictEqual(oType.hasOwnProperty("oConstraints"), false, "no constraints");

		ok(sap.ui.model.odata.type.ODataType.prototype.setConstraints !==
			sap.ui.model.SimpleType.prototype.setConstraints, "type overwrites setConstraints");
		oType.setConstraints({foo: "bar"});
		strictEqual(oType.oConstraints, undefined, "no constraints");

		ok(sap.ui.model.odata.type.ODataType.prototype.setFormatOptions !==
			sap.ui.model.SimpleType.prototype.setFormatOptions, "type overwrites setFormatOptions");
		oType.setFormatOptions({foo: "bar"});
		strictEqual(oType.oFormatOptions, undefined, "no format options");
	});

} ());
