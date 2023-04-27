/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/odata/TypeMap",
	"sap/ui/mdc/util/TypeUtilFactory",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/model/odata/type/Time",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/SByte",
	"sap/ui/model/odata/type/Decimal",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Int32",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/model/odata/type/Single",
	"sap/ui/model/odata/type/Double"
],
function(
	ODataTypeMap,
	TypeUtilFactory,
	BaseType,
	ODataDateTime,
	ODataDateTimeOffset,
	ODataTime,
	ODataBooleanType,
	ODataByte,
	ODataSByte,
	ODataDecimal,
	ODataInt16,
	ODataInt32,
	ODataInt64,
	ODataSingle,
	ODataDouble
) {
    "use strict";

	QUnit.test("ODataTypeMap.getDateTimeBaseType", function(assert) {
		var sBaseType = ODataTypeMap.getDateTimeBaseType();
		assert.equal(sBaseType, BaseType.DateTime, "DateTime baseType is returned");
		sBaseType = ODataTypeMap.getDateTimeBaseType(undefined, {displayFormat: "Date"});
		assert.equal(sBaseType, BaseType.Date, "Date baseType is returned");
	});

	QUnit.module("Legacy tests - sap.ui.mdc.odata.ODataTypeUtil");

	var ODataTypeUtil = TypeUtilFactory.getUtil(ODataTypeMap);

	QUnit.test("getBaseTypeForType", function(assert) {

		var aTypeList = [
			[new ODataDateTime(), BaseType.DateTime],
			[new ODataDateTime({},{displayFormat: "Date"}), BaseType.Date],
			[new ODataDateTimeOffset(), BaseType.DateTime],
			[new ODataTime(), BaseType.Time],
			[new ODataBooleanType(), BaseType.Boolean]
		];

		aTypeList.forEach(function (aEntry) {
			var oType = aEntry[0];
			var oExpected = aEntry[1];
			assert.equal(ODataTypeUtil.getBaseTypeForType(oType), oExpected, "expected baseType returned for type " + oType.getName() + ": " + oExpected);
		});

		var aNumerics = [ODataByte, ODataSByte, ODataDecimal, ODataInt16, ODataInt32, ODataInt64, ODataSingle, ODataDouble];

		aNumerics.forEach(function (NumericType) {
			var oType = new NumericType();
			assert.equal(ODataTypeUtil.getBaseTypeForType(oType), BaseType.Numeric, "expected baseType returned for type " + oType.getName() + ": " + BaseType.Numeric);
		});
	});

	QUnit.test("getDataTypeClass", function(assert) {

		var mEdmTypes = {
			"Edm.Boolean": "sap.ui.model.odata.type.Boolean",
			"Edm.Byte": "sap.ui.model.odata.type.Byte",
			"Edm.DateTime": "sap.ui.model.odata.type.DateTime",
			"Edm.DateTimeOffset": "sap.ui.model.odata.type.DateTimeOffset",
			"Edm.Decimal": "sap.ui.model.odata.type.Decimal",
			"Edm.Double": "sap.ui.model.odata.type.Double",
			"Edm.Float": "sap.ui.model.odata.type.Single",
			"Edm.Guid": "sap.ui.model.odata.type.Guid",
			"Edm.Int16": "sap.ui.model.odata.type.Int16",
			"Edm.Int32": "sap.ui.model.odata.type.Int32",
			"Edm.Int64": "sap.ui.model.odata.type.Int64",
			"Edm.SByte": "sap.ui.model.odata.type.SByte",
			"Edm.Single": "sap.ui.model.odata.type.Single",
			"Edm.String": "sap.ui.model.odata.type.String",
			"Edm.Time": "sap.ui.model.odata.type.Time"
		};

		Object.keys(mEdmTypes).forEach(function (sKey) {
			var oExpected = mEdmTypes[sKey];
			assert.equal(ODataTypeUtil.getDataTypeClassName(sKey), oExpected, "expected odata type returned for edm type " + sKey + ": " + oExpected);
		});

		assert.throws(function() {
			ODataTypeUtil.getDataTypeClass("invalid classname");
		}, function(oError) {
			return oError instanceof Error && oError.message.indexOf("DataType '" + "invalid classname" + "' cannot be determined") >= 0;
		}, "invalid types lead to error");

	});

	QUnit.test("getTypeConfig with constraints", function (assert) {

		var oTypeConfig = ODataTypeUtil.getTypeConfig("sap.ui.model.odata.type.DateTime", undefined, undefined);
		assert.equal(oTypeConfig.baseType, BaseType.DateTime , "expected basetype returned");

		oTypeConfig = ODataTypeUtil.getTypeConfig("sap.ui.model.odata.type.DateTime", undefined, {displayFormat: "Date"});
		assert.equal(oTypeConfig.baseType, BaseType.Date , "expected basetype returned");
	});

	QUnit.test("internalizeValue", function (assert) {
		var oTypedValue = ODataTypeUtil.internalizeValue(50, new ODataInt64()); //
		assert.equal(oTypedValue, '50', "expected value returned");

		oTypedValue = ODataTypeUtil.internalizeValue('50', new ODataInt64());
		assert.equal(oTypedValue, '50', "expected value returned");

		oTypedValue = ODataTypeUtil.internalizeValue(50, new ODataDecimal()); //
		assert.equal(oTypedValue, '50', "expected value returned");

		oTypedValue = ODataTypeUtil.internalizeValue('50', new ODataDecimal());
		assert.equal(oTypedValue, '50', "expected value returned");
	});

	QUnit.test("externalizeValue", function (assert) {
		var oStringifiedValue = ODataTypeUtil.externalizeValue(50, new ODataInt64());
		assert.equal(oStringifiedValue, "50", "stringified value returned");

		oStringifiedValue = ODataTypeUtil.externalizeValue('50', new ODataInt64());
		assert.equal(oStringifiedValue, "50", "stringified value returned");

		oStringifiedValue = ODataTypeUtil.externalizeValue(50, new ODataDecimal()); //
		assert.equal(oStringifiedValue, '50', "expected value returned");

		oStringifiedValue = ODataTypeUtil.externalizeValue('50', new ODataDecimal());
		assert.equal(oStringifiedValue, '50', "expected value returned");
	});
});