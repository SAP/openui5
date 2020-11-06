/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	'sap/ui/mdc/util/TypeUtil',
	"sap/ui/mdc/odata/v4/TypeUtil",
	'sap/ui/mdc/enum/BaseType',
	"sap/ui/model/SimpleType",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/model/odata/type/Unit",
	"sap/ui/model/odata/type/Currency",
	"sap/ui/model/odata/type/String",
	"sap/ui/mdc/condition/Condition"

], function(
	TypeUtil,
	ODataV4TypeUtil,
	BaseType,
	SimpleType,
	ODataDate,
	ODataTimeOfDay,
	Unit,
	Currency,
	ODataString,
	Condition
) {
	"use strict";

	QUnit.module("Basic", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("getBaseTypeForType", function(assert) {

		var aTypeList = [
			[new ODataDate({style: "long"}, {displayFormat: "Date"}), BaseType.Date],
			[new ODataTimeOfDay(), BaseType.Time],
			[new Unit(), BaseType.Unit],
			[new Unit({showMeasure:false}), BaseType.Numeric],
			[new Currency(), BaseType.Unit],
			[new Currency({showMeasure:false}), BaseType.Numeric]
		];

		aTypeList.forEach(function (aEntry) {
			var oType = aEntry[0];
			var oExpected = aEntry[1];
			assert.equal(ODataV4TypeUtil.getBaseTypeForType(oType), oExpected, "expected baseType returned for type " + oType.getName() + ": " + oExpected);
		});

		var oGetBaseTypeSpy = sinon.spy(TypeUtil, "getBaseType");
		ODataV4TypeUtil.getBaseTypeForType(new SimpleType());
		assert.ok(oGetBaseTypeSpy.calledOnce, "Unknown types are checked by mdc/TypeUtil");
		oGetBaseTypeSpy.restore();

	});

	QUnit.test("getDataTypeClass", function(assert) {

		var mEdmTypes = {
			"Edm.Date": "sap.ui.model.odata.type.Date", // V4 Date
			"Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay" // V4 constraints: {precision}
		};

		Object.keys(mEdmTypes).forEach(function (sKey) {
			var oExpected = mEdmTypes[sKey];
			assert.equal(ODataV4TypeUtil.getDataTypeClassName(sKey), oExpected, "expected odata type returned for edm type " + sKey + ": " + oExpected);
		});
	});
});
