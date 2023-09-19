/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	'sap/ui/mdc/util/TypeUtil',
	"delegates/odata/v4/TypeUtil",
	'sap/ui/mdc/enums/BaseType',
	"sap/ui/model/SimpleType",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTimeOffset",
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
	ODataDateTimeOffset,
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

		const aTypeList = [
			[new ODataDate({style: "long"}, {displayFormat: "Date"}), BaseType.Date],
			[new ODataTimeOfDay(), BaseType.Time],
			[new Unit(), BaseType.Unit],
			[new Unit({showMeasure:false}), BaseType.Numeric],
			[new Currency(), BaseType.Unit],
			[new Currency({showMeasure:false}), BaseType.Numeric]
		];

		aTypeList.forEach(function (aEntry) {
			const oType = aEntry[0];
			const oExpected = aEntry[1];
			assert.equal(ODataV4TypeUtil.getBaseTypeForType(oType), oExpected, "expected baseType returned for type " + oType.getName() + ": " + oExpected);
		});

		const oGetBaseTypeSpy = sinon.spy(TypeUtil, "getBaseType");
		ODataV4TypeUtil.getBaseTypeForType(new SimpleType());
		assert.ok(oGetBaseTypeSpy.calledOnce, "Unknown types are checked by mdc/TypeUtil");
		oGetBaseTypeSpy.restore();

	});

	QUnit.test("getDataTypeClass", function(assert) {

		const mEdmTypes = {
			"Edm.Date": "sap.ui.model.odata.type.Date", // V4 Date
			"Edm.TimeOfDay": "sap.ui.model.odata.type.TimeOfDay" // V4 constraints: {precision}
		};

		Object.keys(mEdmTypes).forEach(function (sKey) {
			const oExpected = mEdmTypes[sKey];
			assert.equal(ODataV4TypeUtil.getDataTypeClassName(sKey), oExpected, "expected odata type returned for edm type " + sKey + ": " + oExpected);
		});
	});

	QUnit.test("internalizeValue", function (assert) {
		let oType = new ODataDate();
		let sTypedValue = ODataV4TypeUtil.internalizeValue("2000-01-01", oType);
		assert.equal(sTypedValue, "2000-01-01", "expected value returned");

		sTypedValue = ODataV4TypeUtil.internalizeValue("2000-01-01T00:00:00+0100", oType); // old variant value for pure date inside DateTime FilterField
		assert.equal(sTypedValue, "2000-01-01", "expected value returned");

		oType.destroy();
		let oDate = new Date(2000, 0, 1, 10, 10, 10, 100);
		oType = new ODataDateTimeOffset({pattern: "yyyy M d hh mm ss"}, {V4: true});
		sTypedValue = ODataV4TypeUtil.internalizeValue(oDate.toISOString(), oType);
		assert.equal(sTypedValue, oType.parseValue("2000 1 1 10 10 10", "string"), "expected value returned"); // compare with parsing result as string depends on browser timezone

		oDate = new Date(Date.UTC(2000, 0, 1, 9, 10, 10, 100));
		const sString = "" + oDate.getFullYear() + " " + (oDate.getMonth() + 1) + " " + oDate.getDate() + " " + oDate.getHours() + " " + oDate.getMinutes() + " " + oDate.getSeconds();
		sTypedValue = ODataV4TypeUtil.internalizeValue("2000-01-01T10:10:10+0100", oType); // old variant value for DateTime FilterField
		assert.equal(sTypedValue, oType.parseValue(sString, "string"), "expected value returned"); // compare with parsing result as string depends on browser timezone

		// with UTC (UTC date is shown as locale date)
		oType.destroy();
		oType = new ODataDateTimeOffset({pattern: "yyyy M d hh mm ss", UTC: true}, {V4: true});
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100));
		sTypedValue = ODataV4TypeUtil.internalizeValue("2000-01-01T10:10:10Z", oType);
		assert.equal(sTypedValue, oType.parseValue("2000 1 1 10 10 10", "string"), "expected value returned"); // compare with parsing result

		oType.destroy();
		oType = new ODataTimeOfDay();
		sTypedValue = ODataV4TypeUtil.internalizeValue("10:10:10", oType);
		assert.equal(sTypedValue, "10:10:10", "expected value returned");
		oType.destroy();
	});

	QUnit.test("externalizeValue", function (assert) {
		let oType = new ODataDate();
		let sStringifiedValue = ODataV4TypeUtil.externalizeValue("2000-01-01", oType);
		assert.equal(sStringifiedValue, "2000-01-01", "stringified value returned");

		oType.destroy();
		oType = new ODataDateTimeOffset({pattern: "yyyy M d hh mm ss"}, {V4: true});
		const oDate = new Date(2000, 0, 1, 10, 10, 10);
		sStringifiedValue = ODataV4TypeUtil.externalizeValue(oType.parseValue("2000 1 1 10 10 10", "string"), oType);
		assert.equal(sStringifiedValue, oDate.toISOString(), "stringified value returned");

		oType.destroy();
		oType = new ODataDateTimeOffset({pattern: "yyyy M d hh mm ss", UTC: true}, {V4: true});
		sStringifiedValue = ODataV4TypeUtil.externalizeValue(oType.parseValue("2000 1 1 10 10 10", "string"), oType);
		assert.equal(sStringifiedValue, "2000-01-01T10:10:10.000Z", "stringified value returned");

		oType.destroy();
		oType = new ODataTimeOfDay();
		sStringifiedValue = ODataV4TypeUtil.externalizeValue("10:10:10", oType);
		assert.equal(sStringifiedValue, "10:10:10", "stringified value returned");
		oType.destroy();
	});

});
