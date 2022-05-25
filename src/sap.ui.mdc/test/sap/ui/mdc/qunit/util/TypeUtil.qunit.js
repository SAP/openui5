/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/util/TypeUtil",
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
	TypeUtil,
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

	QUnit.module("Basic", {
		beforeEach: function() {},

		afterEach: function() {}
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
			assert.equal(TypeUtil.getBaseType(sType, oFormatOptions, oConstraints), oExpected, "expected baseType returned for type " + sType + ": " + oExpected);
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
			assert.equal(TypeUtil.getBaseTypeForType(oType), oExpected, "expected baseType returned for type " + oType.getName() + ": " + oExpected);
		});

		var aNumerics = [Integer, Float];

		aNumerics.forEach(function (NumericType) {
			var oType = new NumericType();
			assert.equal(TypeUtil.getBaseTypeForType(oType), BaseType.Numeric, "expected baseType returned for type " + oType.getName() + ": " + BaseType.Numeric);
		});
	});

	QUnit.test("getTypeConfig", function (assert) {
		var oTypeConfig = TypeUtil.getTypeConfig("sap.ui.model.type.Date");
		assert.equal(oTypeConfig.className, "sap.ui.model.type.Date", "expected typestring returned");
		assert.ok(oTypeConfig.typeInstance.isA("sap.ui.model.type.Date") , "expected model type returned");
		assert.equal(oTypeConfig.baseType, BaseType.Date , "expected basetype returned");
	});

	QUnit.test("getTypeConfig with formatOptions", function (assert) {

		var oTypeConfig = TypeUtil.getTypeConfig("sap.ui.model.type.Currency", {showMeasure: false});
		assert.equal(oTypeConfig.baseType, BaseType.Numeric , "expected basetype returned");

		oTypeConfig = TypeUtil.getTypeConfig("sap.ui.model.type.Currency", {showMeasure: true});
		assert.equal(oTypeConfig.baseType, BaseType.Unit , "expected basetype returned");
	});

	QUnit.test("_normalizeType", function (assert) {

		var oTypeInstance = TypeUtil._normalizeType("sap.ui.model.type.Currency", {showMeasure: false}, {maximum: 999});
		assert.ok(oTypeInstance instanceof SimpleType, "type instance returned");
		assert.equal(oTypeInstance.getFormatOptions().showMeasure, false, "formatoptions are considered");
		assert.equal(oTypeInstance.getConstraints().maximum, 999, "constraints are considered");

		oTypeInstance = TypeUtil._normalizeType(new Currency());
		assert.ok(oTypeInstance instanceof SimpleType, "type instance returned");
	});

	QUnit.test("internalizeValue", function (assert) {
		var oTypedValue = TypeUtil.internalizeValue("2000-01-01", new DateType());
		assert.equal(oTypedValue.toDateString(), 'Sat Jan 01 2000', "expected value returned");
	});

	QUnit.test("externalizeValue", function (assert) {
		var oDate = new Date("2000-01-01 UTC");
		var oStringifiedValue = TypeUtil.externalizeValue(oDate, new DateType());
		assert.equal(oStringifiedValue, "2000-01-01", "stringified value returned");
	});
});
