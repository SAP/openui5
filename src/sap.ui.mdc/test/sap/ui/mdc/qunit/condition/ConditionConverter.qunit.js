/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/mdc/condition/ConditionConverter",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/odata/v4/TypeUtil",
	"sap/ui/model/type/String",
	"sap/ui/model/type/Date",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTime",
	"sap/ui/model/type/Time",
	"sap/ui/model/odata/type/Time",
	"sap/ui/model/odata/type/TimeOfDay",
	"sap/ui/model/type/Boolean",
	"sap/ui/model/odata/type/Boolean",
	"sap/ui/model/odata/type/Byte",
	"sap/ui/model/odata/type/SByte",
	"sap/ui/model/odata/type/Int16",
	"sap/ui/model/odata/type/Int64",
	"sap/ui/model/odata/type/Double",
	"sap/ui/model/odata/type/Decimal"
], function(
	jQuery,
	ConditionConverter,
	Condition,
	TypeUtil,
	StringType,
	DateType,
	V4DateType,
	V2DateTimeType,
	TimeType,
	V2TimeType,
	V4TimeType,
	V2Boolean,
	V4Boolean,
	Byte,
	SByte,
	Int16,
	Int64,
	Double,
	Decimal
) {
	"use strict";

	function _testConvert(assert, bToString, oType, sOperator, aValuesIn, aValuesOut) {

		var oCondition;
		var oResult;

		if (sOperator === "EQ") {
			oCondition = Condition.createItemCondition(aValuesIn[0], aValuesIn[1]); // to use validate logic
		} else {
			oCondition = Condition.createCondition(sOperator, aValuesIn);
		}

		var oTypeConfig = TypeUtil.getTypeConfig(oType);

		if (bToString) {
			oResult = ConditionConverter.toString(oCondition, oTypeConfig, TypeUtil);
		} else {
			oResult = ConditionConverter.toType(oCondition, oTypeConfig, TypeUtil);
		}

		assert.equal(typeof oResult, "object", "Object returned");
		assert.equal(oResult.operator, oCondition.operator, "operator");
		assert.ok(Array.isArray(oResult.values), "value array returned");
		assert.equal(oResult.values.length, aValuesOut.length, "expect number of values returned");
		for (var i = 0; i < aValuesOut.length; i++) {
			assert.deepEqual(oResult.values[i], aValuesOut[i], "stringified value" + i);
		}

		oType.destroy();

	}

	QUnit.module("toString", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("String", function(assert) {

		var oType = new StringType();
		_testConvert(assert, true, oType, "EQ", ["Test"], ["Test"]);

	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({style: "long"});
		_testConvert(assert, true, oType, "GT", [new Date(2019, 11, 11)], ["2019-12-11"]);

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({style: "long"}, {displayFormat: "Date"});
		_testConvert(assert, true, oType, "BT", [new Date(Date.UTC(2019, 11, 11)), new Date(Date.UTC(2019, 11, 12))], ["2019-12-11", "2019-12-12"]);

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({style: "long"});
		_testConvert(assert, true, oType, "LT", ["2019-12-11"], ["2019-12-11"]);

	});

	QUnit.test("Time", function(assert) {

		var oType = new TimeType({style: "long"});
		_testConvert(assert, true, oType, "EQ", [new Date(2019, 11, 12, 19, 38, 30)], ["19:38:30"]);

	});

	QUnit.test("V2-Time", function(assert) {

		var oType = new V2TimeType({style: "long"});
		_testConvert(assert, true, oType, "EQ", [{__edmType: "Edm.Time", ms: 27510000}], ["07:38:30"]);

	});

	QUnit.test("V4Time", function(assert) {

		var oType = new V4TimeType({style: "long"});
		_testConvert(assert, true, oType, "EQ", ["07:38:30"], ["07:38:30"]);

	});

	QUnit.test("Boolean", function(assert) {

		var oType = new V2Boolean();
		_testConvert(assert, true, oType, "EQ", [true, "Yes"], [true]);
		_testConvert(assert, true, oType, "EQ", [false, "No"], [false]);

		_testConvert(assert, true, oType, "EQ", [true], [true]);
		_testConvert(assert, true, oType, "EQ", [false], [false]);

		oType = new V4Boolean();
		_testConvert(assert, true, oType, "EQ", [true, "Yes"], [true]);
		_testConvert(assert, true, oType, "EQ", [false, "No"], [false]);

		_testConvert(assert, true, oType, "EQ", [true], [true]);
		_testConvert(assert, true, oType, "EQ", [false], [false]);

	});

	QUnit.test("Byte", function(assert) {

		var oType = new Byte();
		_testConvert(assert, true, oType, "EQ", [123], [123]);

	});

	QUnit.test("SByte", function(assert) {

		var oType = new SByte();
		_testConvert(assert, true, oType, "EQ", [-123], [-123]);

	});

	QUnit.test("Int16", function(assert) {

		var oType = new Int16();
		_testConvert(assert, true, oType, "EQ", [1234], [1234]);

	});

	QUnit.test("Int64", function(assert) {

		var oType = new Int64();
		_testConvert(assert, true, oType, "EQ", ["12345678"], ["12345678"]);

	});

	QUnit.test("Double", function(assert) {

		var oType = new Double();
		_testConvert(assert, true, oType, "EQ", [123456.78], [123456.78]);

	});

	QUnit.test("Decimal", function(assert) {

		var oType = new Decimal();
		_testConvert(assert, true, oType, "EQ", ["123456.78"], ["123456.78"]);

	});

	QUnit.test("EQ Operator", function(assert) {

		var oType = new StringType();
		_testConvert(assert, true, oType, "EQ", ["id", "desc"], ["id"]);

	});

	QUnit.test("Today", function(assert) {

		var oType = new V4DateType({style: "long"});
		// Today has no Values and the oType will be not used
		_testConvert(assert, true, oType, "TODAY", [], []);

	});

	QUnit.test("Next x Days", function(assert) {

		var oType = new V4DateType({style: "long"});
		// NEXTDAYS has an integer type for the values and the oType will internal not be used
		_testConvert(assert, true, oType, "NEXTDAYS", [10], [10]);

	});

	QUnit.test("Empty", function(assert) {

		var oType = new StringType();
		// EMPTY has no values
		_testConvert(assert, true, oType, "Empty", [], []);

	});

	QUnit.module("toType", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("String", function(assert) {

		var oType = new StringType();
		_testConvert(assert, false, oType, "EQ", ["Test"], ["Test"]);

	});

	QUnit.test("Date", function(assert) {

		var oType = new DateType({style: "long"});
		_testConvert(assert, false, oType, "GT", ["2019-12-11"], [new Date(2019, 11, 11)]);

	});

	QUnit.test("V2-Date", function(assert) {

		var oType = new V2DateTimeType({style: "long"}, {displayFormat: "Date"});
		_testConvert(assert, false, oType, "BT", ["2019-12-11", "2019-12-12"], [new Date(Date.UTC(2019, 11, 11)), new Date(Date.UTC(2019, 11, 12))]);

	});

	QUnit.test("V4-Date", function(assert) {

		var oType = new V4DateType({style: "long"});
		_testConvert(assert, false, oType, "LT", ["2019-12-11"], ["2019-12-11"]);

	});

	QUnit.test("Time", function(assert) {

		var oType = new TimeType({style: "long"});
		_testConvert(assert, false, oType, "EQ", ["19:38:30"], [new Date(1970, 0, 1, 19, 38, 30)]);

	});

	QUnit.test("V2Time", function(assert) {

		var oType = new V2TimeType({style: "long"});
		_testConvert(assert, false, oType, "EQ", ["07:38:30"], [{__edmType: "Edm.Time", ms: 27510000}]);

	});

	QUnit.test("V4Time", function(assert) {

		var oType = new V4TimeType({style: "long"});
		_testConvert(assert, false, oType, "EQ", ["07:38:30"], ["07:38:30"]);

	});

	QUnit.test("Boolean", function(assert) {

		var oType = new V2Boolean();
		_testConvert(assert, false, oType, "EQ", [true], [true]);
		_testConvert(assert, false, oType, "EQ", [false], [false]);

		oType = new V4Boolean();
		_testConvert(assert, false, oType, "EQ", [true], [true]);
		_testConvert(assert, false, oType, "EQ", [false], [false]);

	});

	QUnit.test("Byte", function(assert) {

		var oType = new Byte();
		_testConvert(assert, false, oType, "EQ", [123], [123]);

	});

	QUnit.test("SByte", function(assert) {

		var oType = new SByte();
		_testConvert(assert, false, oType, "EQ", [-123], [-123]);

	});

	QUnit.test("Int16", function(assert) {

		var oType = new Int16();
		_testConvert(assert, false, oType, "EQ", [123], [123]);

	});

	QUnit.test("Int64", function(assert) {

		var oType = new Int64();
		_testConvert(assert, false, oType, "EQ", ["12345678"], ["12345678"]);

	});

	QUnit.test("Double", function(assert) {

		var oType = new Double();
		_testConvert(assert, false, oType, "EQ", [123456.78], [123456.78]);

	});

	QUnit.test("Decimal", function(assert) {

		var oType = new Decimal();
		_testConvert(assert, false, oType, "EQ", ["123456.78"], ["123456.78"]);

	});


	QUnit.test("EQ Operator", function(assert) {

		var oType = new StringType();
		_testConvert(assert, false, oType, "EQ", ["id"], ["id"]);

	});

	QUnit.test("Today", function(assert) {

		var oType = new V4DateType({style: "long"});
		// Today has no Values and the oType will be not used
		_testConvert(assert, false, oType, "TODAY", [], []);

	});

	QUnit.test("Next x Days", function(assert) {

		var oType = new V4DateType({style: "long"});
		// NEXTDAYS has an integer type for the values and the oType will internal not be used
		_testConvert(assert, false, oType, "NEXTDAYS", [10], [10]);

	});

	QUnit.test("Empty", function(assert) {

		var oType = new StringType();
		// EMPTY has no values
		_testConvert(assert, false, oType, "Empty", [], []);

	});

});
