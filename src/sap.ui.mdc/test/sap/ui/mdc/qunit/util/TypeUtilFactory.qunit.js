/*!
 * ${copyright}
 */

/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/util/TypeUtilFactory",
	"sap/ui/mdc/DefaultTypeMap",
	"sap/ui/model/SimpleType",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Time",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/type/Unit",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Float"

], function(
	TypeUtilFactory,
	DefaultTypeMap,
	SimpleType,
	BaseType,
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

	// eslint-disable-next-line new-cap
	var oTypeUtil;

	QUnit.module("Basic");

	QUnit.test("creation", function (assert) {
		sinon.spy(TypeUtilFactory, "_create");
		oTypeUtil = TypeUtilFactory.getUtil(DefaultTypeMap);
		assert.ok(TypeUtilFactory._create.called, "First call creates type util via _create ");
		assert.equal(oTypeUtil, TypeUtilFactory.getUtil(DefaultTypeMap), "created TypeUtils are cached by TypeMap configuration.");
		assert.notOk(TypeUtilFactory._create.calledTwice, "_create is not called twice for same TypeMap");
	});

	QUnit.test("getBaseType", function(assert) {

		var aTypeList = [
			["sap.ui.model.type.Date", undefined, {displayFormat: "Date"}, BaseType.Date],
			["sap.ui.model.type.Currency", undefined, undefined, BaseType.Unit],
			["sap.ui.model.type.Currency", {showMeasure:false}, undefined, BaseType.Numeric],
			["String", undefined, undefined, BaseType.String]
		];

		aTypeList.forEach(function (aEntry) {
			var sType = aEntry[0];
			var oFormatOptions = aEntry[1];
			var oConstraints = aEntry[2];
			var oExpected = aEntry[3];
			assert.equal(oTypeUtil.getBaseType(sType, oFormatOptions, oConstraints), oExpected, "expected baseType returned for type " + sType + ": " + oExpected);
		});
	});

	QUnit.test("getBaseTypeForType", function(assert) {

		var aTypeList = [
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
			var oType = aEntry[0];
			var oExpected = aEntry[1];
			assert.equal(oTypeUtil.getBaseTypeForType(oType), oExpected, "expected baseType returned for type " + oType.getName() + ": " + oExpected);
		});

		var aNumerics = [Integer, Float];

		aNumerics.forEach(function (NumericType) {
			var oType = new NumericType();
			assert.equal(oTypeUtil.getBaseTypeForType(oType), BaseType.Numeric, "expected baseType returned for type " + oType.getName() + ": " + BaseType.Numeric);
		});
	});

	QUnit.test("getTypeConfig", function (assert) {
		var oTypeConfig = oTypeUtil.getTypeConfig("sap.ui.model.type.Date");
		assert.equal(oTypeConfig.className, "sap.ui.model.type.Date", "expected typestring returned");
		assert.ok(oTypeConfig.typeInstance.isA("sap.ui.model.type.Date") , "expected model type returned");
		assert.equal(oTypeConfig.baseType, BaseType.Date , "expected basetype returned");
	});

	QUnit.test("getTypeConfig with formatOptions", function (assert) {

		var oTypeConfig = oTypeUtil.getTypeConfig("sap.ui.model.type.Currency", {showMeasure: false});
		assert.equal(oTypeConfig.baseType, BaseType.Numeric , "expected basetype returned");

		oTypeConfig = oTypeUtil.getTypeConfig("sap.ui.model.type.Currency", {showMeasure: true});
		assert.equal(oTypeConfig.baseType, BaseType.Unit , "expected basetype returned");
	});

	QUnit.test("_normalizeType", function (assert) {

		var oTypeInstance = oTypeUtil._normalizeType("sap.ui.model.type.Currency", {showMeasure: false}, {maximum: 999});
		assert.ok(oTypeInstance instanceof SimpleType, "type instance returned");
		assert.equal(oTypeInstance.getFormatOptions().showMeasure, false, "formatoptions are considered");
		assert.equal(oTypeInstance.getConstraints().maximum, 999, "constraints are considered");

		oTypeInstance = oTypeUtil._normalizeType(new Currency());
		assert.ok(oTypeInstance instanceof SimpleType, "type instance returned");
	});

	QUnit.test("internalizeValue", function (assert) {
		var oType = new DateType();
		var oTypedValue = oTypeUtil.internalizeValue("2000-01-01", oType);
		var oDate = new Date(2000, 0, 1);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oTypedValue = oTypeUtil.internalizeValue("2000-01-01T00:00:00+0100", oType); // old variant value for pure date inside DateTime FilterField
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oType.destroy();
		oType = new DateTime();
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100));
		oTypedValue = oTypeUtil.internalizeValue("2000-01-01T10:10:10.100Z", oType);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oDate = new Date("2000-01-01T10:10:10+0100");
		oTypedValue = oTypeUtil.internalizeValue("2000-01-01T10:10:10+0100", oType); // old variant value for DateTime FilterField
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");

		oType.destroy();
		oType = new DateTime({UTC: true});
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100));
		oTypedValue = oTypeUtil.internalizeValue("2000-01-01T10:10:10.100Z", oType);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned"); // UTC dateTime is used as local one

		oType.destroy();
		oType = new Time();
		oDate = new Date(1970, 0, 1, 10, 10, 10);
		oTypedValue = oTypeUtil.internalizeValue("10:10:10", oType);
		assert.equal(oTypedValue.toString(), oDate.toString(), "expected value returned");
		oType.destroy();
	});

	QUnit.test("externalizeValue", function (assert) {
		var oType = new DateType();
		var oDate = new Date(2000, 0, 1); // inside type the date is 00:00:00 on local time
		var oStringifiedValue = oTypeUtil.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "2000-01-01", "stringified value returned");

		oType.destroy();
		oType = new DateTime();
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100));
		oStringifiedValue = oTypeUtil.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "2000-01-01T10:10:10.100Z", "stringified value returned");

		oType.destroy();
		oType = new DateTime({UTC: true});
		oDate = new Date(Date.UTC(2000, 0, 1, 10, 10, 10, 100)); // as local date is used as UTC date
		oStringifiedValue = oTypeUtil.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "2000-01-01T10:10:10.100Z", "stringified value returned");

		oType.destroy();
		oType = new Time();
		oDate = new Date(1970, 0, 1, 10, 10, 10);
		oStringifiedValue = oTypeUtil.externalizeValue(oDate, oType);
		assert.equal(oStringifiedValue, "10:10:10", "stringified value returned");
		oType.destroy();
	});
});
