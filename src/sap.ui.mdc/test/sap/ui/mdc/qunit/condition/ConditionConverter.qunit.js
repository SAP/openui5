/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/mdc/condition/ConditionConverter",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/odata/v4/TypeMap",
	"sap/ui/mdc/enums/OperatorName",
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
	ConditionConverter,
	Condition,
	ODataV4TypeMap,
	OperatorName,
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

		let oCondition;
		let oResult;

		if (sOperator === OperatorName.EQ) {
			oCondition = Condition.createItemCondition(aValuesIn[0], aValuesIn[1]); // to use validate logic
		} else {
			oCondition = Condition.createCondition(sOperator, aValuesIn);
		}

		if (bToString) {
			oResult = ConditionConverter.toString(oCondition, oType, ODataV4TypeMap);
		} else {
			oResult = ConditionConverter.toType(oCondition, oType, ODataV4TypeMap);
		}

		assert.equal(typeof oResult, "object", "Object returned");
		assert.equal(oResult.operator, oCondition.operator, "operator");
		assert.ok(Array.isArray(oResult.values), "value array returned");
		assert.equal(oResult.values.length, aValuesOut.length, "expect number of values returned");
		for (let i = 0; i < aValuesOut.length; i++) {
			assert.deepEqual(oResult.values[i], aValuesOut[i], "stringified value" + i);
		}

		oType.destroy();

	}

	QUnit.module("toString", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("String", function(assert) {

		const oType = new StringType();
		_testConvert(assert, true, oType, OperatorName.EQ, ["Test"], ["Test"]);

	});

	QUnit.test("Date", function(assert) {

		const oType = new DateType({style: "long"});
		_testConvert(assert, true, oType, OperatorName.GT, [new Date(2019, 11, 11)], ["2019-12-11"]);

	});

	QUnit.test("V2-Date", function(assert) {

		const oType = new V2DateTimeType({style: "long"}, {displayFormat: "Date"});
		_testConvert(assert, true, oType, OperatorName.BT, [new Date(Date.UTC(2019, 11, 11)), new Date(Date.UTC(2019, 11, 12))], ["2019-12-11", "2019-12-12"]);

	});

	QUnit.test("V4-Date", function(assert) {

		const oType = new V4DateType({style: "long"});
		_testConvert(assert, true, oType, OperatorName.LT, ["2019-12-11"], ["2019-12-11"]);

	});

	QUnit.test("Time", function(assert) {

		const oType = new TimeType({style: "long"});
		_testConvert(assert, true, oType, OperatorName.EQ, [new Date(2019, 11, 12, 19, 38, 30)], ["19:38:30"]);

	});

	QUnit.test("V2-Time", function(assert) {

		const oType = new V2TimeType({style: "long"});
		_testConvert(assert, true, oType, OperatorName.EQ, [{__edmType: "Edm.Time", ms: 27510000}], ["07:38:30"]);

	});

	QUnit.test("V4Time", function(assert) {

		const oType = new V4TimeType({style: "long"});
		_testConvert(assert, true, oType, OperatorName.EQ, ["07:38:30"], ["07:38:30"]);

	});

	QUnit.test("Boolean", function(assert) {

		let oType = new V2Boolean();
		_testConvert(assert, true, oType, OperatorName.EQ, [true, "Yes"], [true]);
		_testConvert(assert, true, oType, OperatorName.EQ, [false, "No"], [false]);

		_testConvert(assert, true, oType, OperatorName.EQ, [true], [true]);
		_testConvert(assert, true, oType, OperatorName.EQ, [false], [false]);

		oType = new V4Boolean();
		_testConvert(assert, true, oType, OperatorName.EQ, [true, "Yes"], [true]);
		_testConvert(assert, true, oType, OperatorName.EQ, [false, "No"], [false]);

		_testConvert(assert, true, oType, OperatorName.EQ, [true], [true]);
		_testConvert(assert, true, oType, OperatorName.EQ, [false], [false]);

	});

	QUnit.test("Byte", function(assert) {

		const oType = new Byte();
		_testConvert(assert, true, oType, OperatorName.EQ, [123], [123]);

	});

	QUnit.test("SByte", function(assert) {

		const oType = new SByte();
		_testConvert(assert, true, oType, OperatorName.EQ, [-123], [-123]);

	});

	QUnit.test("Int16", function(assert) {

		const oType = new Int16();
		_testConvert(assert, true, oType, OperatorName.EQ, [1234], [1234]);

	});

	QUnit.test("Int64", function(assert) {

		const oType = new Int64();
		_testConvert(assert, true, oType, OperatorName.EQ, ["12345678"], ["12345678"]);

	});

	QUnit.test("Double", function(assert) {

		const oType = new Double();
		_testConvert(assert, true, oType, OperatorName.EQ, [123456.78], [123456.78]);

	});

	QUnit.test("Decimal", function(assert) {

		const oType = new Decimal();
		_testConvert(assert, true, oType, OperatorName.EQ, ["123456.78"], ["123456.78"]);

	});

	QUnit.test("EQ Operator", function(assert) {

		const oType = new StringType();
		_testConvert(assert, true, oType, OperatorName.EQ, ["id", "desc"], ["id"]);

	});

	QUnit.test("Today", function(assert) {

		const oType = new V4DateType({style: "long"});
		// Today has no Values and the oType will be not used
		_testConvert(assert, true, oType, OperatorName.TODAY, [], []);

	});

	QUnit.test("Next x Days", function(assert) {

		const oType = new V4DateType({style: "long"});
		// NEXTDAYS has an integer type for the values and the oType will internal not be used
		_testConvert(assert, true, oType, OperatorName.NEXTDAYS, [10], [10]);

	});

	QUnit.test("Empty", function(assert) {

		const oType = new StringType();
		// EMPTY has no values
		_testConvert(assert, true, oType, OperatorName.Empty, [], []);

	});

	QUnit.module("toType", {
		beforeEach: function() {},

		afterEach: function() {}
	});

	QUnit.test("String", function(assert) {

		const oType = new StringType();
		_testConvert(assert, false, oType, OperatorName.EQ, ["Test"], ["Test"]);

	});

	QUnit.test("Date", function(assert) {

		const oType = new DateType({style: "long"});
		_testConvert(assert, false, oType, OperatorName.GT, ["2019-12-11"], [new Date(2019, 11, 11)]);

	});

	QUnit.test("V2-Date", function(assert) {

		const oType = new V2DateTimeType({style: "long"}, {displayFormat: "Date"});
		_testConvert(assert, false, oType, OperatorName.BT, ["2019-12-11", "2019-12-12"], [new Date(Date.UTC(2019, 11, 11)), new Date(Date.UTC(2019, 11, 12))]);

	});

	QUnit.test("V4-Date", function(assert) {

		const oType = new V4DateType({style: "long"});
		_testConvert(assert, false, oType, OperatorName.LT, ["2019-12-11"], ["2019-12-11"]);

	});

	QUnit.test("Time", function(assert) {

		const oType = new TimeType({style: "long"});
		_testConvert(assert, false, oType, OperatorName.EQ, ["19:38:30"], [new Date(1970, 0, 1, 19, 38, 30)]);

	});

	QUnit.test("V2Time", function(assert) {

		const oType = new V2TimeType({style: "long"});
		_testConvert(assert, false, oType, OperatorName.EQ, ["07:38:30"], [{__edmType: "Edm.Time", ms: 27510000}]);

	});

	QUnit.test("V4Time", function(assert) {

		const oType = new V4TimeType({style: "long"});
		_testConvert(assert, false, oType, OperatorName.EQ, ["07:38:30"], ["07:38:30"]);

	});

	QUnit.test("Boolean", function(assert) {

		let oType = new V2Boolean();
		_testConvert(assert, false, oType, OperatorName.EQ, [true], [true]);
		_testConvert(assert, false, oType, OperatorName.EQ, [false], [false]);

		oType = new V4Boolean();
		_testConvert(assert, false, oType, OperatorName.EQ, [true], [true]);
		_testConvert(assert, false, oType, OperatorName.EQ, [false], [false]);

	});

	QUnit.test("Byte", function(assert) {

		const oType = new Byte();
		_testConvert(assert, false, oType, OperatorName.EQ, [123], [123]);

	});

	QUnit.test("SByte", function(assert) {

		const oType = new SByte();
		_testConvert(assert, false, oType, OperatorName.EQ, [-123], [-123]);

	});

	QUnit.test("Int16", function(assert) {

		const oType = new Int16();
		_testConvert(assert, false, oType, OperatorName.EQ, [123], [123]);

	});

	QUnit.test("Int64", function(assert) {

		const oType = new Int64();
		_testConvert(assert, false, oType, OperatorName.EQ, ["12345678"], ["12345678"]);

	});

	QUnit.test("Double", function(assert) {

		const oType = new Double();
		_testConvert(assert, false, oType, OperatorName.EQ, [123456.78], [123456.78]);

	});

	QUnit.test("Decimal", function(assert) {

		const oType = new Decimal();
		_testConvert(assert, false, oType, OperatorName.EQ, ["123456.78"], ["123456.78"]);

	});


	QUnit.test("EQ Operator", function(assert) {

		const oType = new StringType();
		_testConvert(assert, false, oType, OperatorName.EQ, ["id"], ["id"]);

	});

	QUnit.test("Today", function(assert) {

		const oType = new V4DateType({style: "long"});
		// Today has no Values and the oType will be not used
		_testConvert(assert, false, oType, OperatorName.TODAY, [], []);

	});

	QUnit.test("Next x Days", function(assert) {

		const oType = new V4DateType({style: "long"});
		// NEXTDAYS has an integer type for the values and the oType will internal not be used
		_testConvert(assert, false, oType, OperatorName.NEXTDAYS, [10], [10]);

	});

	QUnit.test("Empty", function(assert) {

		const oType = new StringType();
		// EMPTY has no values
		_testConvert(assert, false, oType, OperatorName.Empty, [], []);

	});

});
