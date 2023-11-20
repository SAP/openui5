/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/DefaultTypeMap",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/model/SimpleType",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Time",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Unit",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Float"
],
function(
	DefaultTypeMap,
	BaseType,
	SimpleType,
	DateType,
	DateTime,
	Time,
	BooleanType,
	Unit,
	Currency,
	Integer,
	Float
) {
    "use strict";

	QUnit.test("DefaultTypeMap.getUnitBaseType", function(assert) {
		assert.equal(DefaultTypeMap.getUnitBaseType(undefined), BaseType.Unit, "Returns BaseType.Unit - no oFormatOptions");
		assert.equal(DefaultTypeMap.getUnitBaseType({}), BaseType.Unit, "Returns BaseType.Unit - empty oFormatOptions");
		assert.equal(DefaultTypeMap.getUnitBaseType({showMeasure: true}), BaseType.Unit, "Returns BaseType.Unit - oFormatOptions.showMeasure");
		assert.equal(DefaultTypeMap.getUnitBaseType({showNumber: true}), BaseType.Unit, "Returns BaseType.Unit - oFormatOptions.showNumber");
		assert.equal(DefaultTypeMap.getUnitBaseType({showMeasure: false}), BaseType.Numeric, "Returns BaseType.Number - oFormatOptions.showMeasure:false");
	});

	QUnit.test("DefaultTypeMap.getUnitOptions", function(assert) {
		assert.deepEqual(DefaultTypeMap.getUnitOptions({}, {}), [{},{}], "Empty oFormatOptions, Empty oConstraints");
		assert.deepEqual(DefaultTypeMap.getUnitOptions({}, {}, {}), [{strictParsing: true, showNumber: false, showMeasure: false},{}], "oFormatOptions from oCustomOptions");
		assert.deepEqual(DefaultTypeMap.getUnitOptions({}, {}, {showNumber: true, showMeasure: true}), [{strictParsing: true, showNumber: true, showMeasure: true},{}], "oFormatOptions from oCustomOptions");
		assert.deepEqual(DefaultTypeMap.getUnitOptions({unitOptional: true}, {}), [{},{}], "oFormatOptions without unitOptional");

	});

	QUnit.module("Legacy tests - sap.ui.mdc.DefaultTypeMap");

	QUnit.test("getBaseType", function(assert) {

		const aTypeList = [
			["sap.ui.model.type.Date", undefined, {displayFormat: "Date"}, BaseType.Date],
			["sap.ui.model.type.Currency", undefined, undefined, BaseType.Unit],
			["sap.ui.model.type.Currency", {showMeasure:false}, undefined, BaseType.Numeric],
			["String", undefined, undefined, BaseType.String]
		];

		aTypeList.forEach(function (aEntry) {
			const sType = aEntry[0];
			const oFormatOptions = aEntry[1];
			const oConstraints = aEntry[2];
			const oExpected = aEntry[3];
			assert.equal(DefaultTypeMap.getBaseType(sType, oFormatOptions, oConstraints), oExpected, "expected baseType returned for type " + sType + ": " + oExpected);
		});
	});

	QUnit.test("getBaseTypeForType", function(assert) {

		const aTypeList = [
			[new DateType({style: "long"}, {displayFormat: "Date"}), BaseType.Date],
			[new DateTime(), BaseType.DateTime],
			[new Time(), BaseType.Time],
			[new BooleanType(), BaseType.Boolean],
			[new Unit(), BaseType.Unit],
			[new Unit({showMeasure:false}), BaseType.Numeric],
			[new Currency(), BaseType.Unit],
			[new Currency({showMeasure:false}), BaseType.Numeric],
			[new SimpleType(), BaseType.String]
		];

		aTypeList.forEach(function (aEntry) {
			const oType = aEntry[0];
			const oExpected = aEntry[1];
			assert.equal(DefaultTypeMap.getBaseTypeForType(oType), oExpected, "expected baseType returned for type " + oType.getName() + ": " + oExpected);
		});

		const aNumerics = [Integer, Float];

		aNumerics.forEach(function (NumericType) {
			const oType = new NumericType();
			assert.equal(DefaultTypeMap.getBaseTypeForType(oType), BaseType.Numeric, "expected baseType returned for type " + oType.getName() + ": " + BaseType.Numeric);
		});
	});

	QUnit.test("getTypeConfig", function (assert) {
		const oTypeConfig = DefaultTypeMap.getTypeConfig("sap.ui.model.type.Date");
		assert.equal(oTypeConfig.className, "sap.ui.model.type.Date", "expected typestring returned");
		assert.ok(oTypeConfig.typeInstance.isA("sap.ui.model.type.Date") , "expected model type returned");
		assert.equal(oTypeConfig.baseType, BaseType.Date , "expected basetype returned");
	});

	QUnit.test("getTypeConfig with formatOptions", function (assert) {

		let oTypeConfig = DefaultTypeMap.getTypeConfig("sap.ui.model.type.Currency", {showMeasure: false});
		assert.equal(oTypeConfig.baseType, BaseType.Numeric , "expected basetype returned");

		oTypeConfig = DefaultTypeMap.getTypeConfig("sap.ui.model.type.Currency", {showMeasure: true});
		assert.equal(oTypeConfig.baseType, BaseType.Unit , "expected basetype returned");
	});

	QUnit.test("_normalizeType", function (assert) {

		let oTypeInstance = DefaultTypeMap._normalizeType("sap.ui.model.type.Currency", {showMeasure: false}, {maximum: 999});
		assert.ok(oTypeInstance instanceof SimpleType, "type instance returned");
		assert.equal(oTypeInstance.getFormatOptions().showMeasure, false, "formatoptions are considered");
		assert.equal(oTypeInstance.getConstraints().maximum, 999, "constraints are considered");

		oTypeInstance = DefaultTypeMap._normalizeType(new Currency());
		assert.ok(oTypeInstance instanceof SimpleType, "type instance returned");
	});

	QUnit.test("internalizeValue", function (assert) {
		let oType = new DateType();
		let oTypedValue = DefaultTypeMap.internalizeValue("2000-01-01", oType);
		let oDate = new Date(2000, 0, 1);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oTypedValue = DefaultTypeMap.internalizeValue("2000-01-01T00:00:00+0100", oType); // old variant value for pure date inside DateTime FilterField
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oType.destroy();
		oType = new DateTime();
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100));
		oTypedValue = DefaultTypeMap.internalizeValue("2000-01-01T10:10:10.100Z", oType);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oDate = new Date("2000-01-01T10:10:10+0100");
		oTypedValue = DefaultTypeMap.internalizeValue("2000-01-01T10:10:10+0100", oType); // old variant value for DateTime FilterField
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oType.destroy();
		oType = new DateTime({UTC: true});
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100));
		oTypedValue = DefaultTypeMap.internalizeValue("2000-01-01T10:10:10.100Z", oType);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned"); // UTC dateTime is used as local one

		oType.destroy();
		oType = new Time();
		oDate = new Date(1970, 0, 1, 10, 10, 10);
		oTypedValue = DefaultTypeMap.internalizeValue("10:10:10", oType);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");
		oType.destroy();
	});

	QUnit.test("externalizeValue", function (assert) {
		let oType = new DateType();
		let oDate = new Date(2000, 0, 1); // inside type the date is 00:00:00 on local time
		let oStringifiedValue = DefaultTypeMap.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "2000-01-01", "stringified value returned");

		oType.destroy();
		oType = new DateTime();
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100));
		oStringifiedValue = DefaultTypeMap.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "2000-01-01T10:10:10.100Z", "stringified value returned");

		oType.destroy();
		oType = new DateTime({UTC: true});
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100)); // as local date is used as UTC date
		oStringifiedValue = DefaultTypeMap.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "2000-01-01T10:10:10.100Z", "stringified value returned");

		oType.destroy();
		oType = new Time();
		oDate = new Date(1970, 0, 1, 10, 10, 10);
		oStringifiedValue = DefaultTypeMap.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "10:10:10", "stringified value returned");
		oType.destroy();
	});
});