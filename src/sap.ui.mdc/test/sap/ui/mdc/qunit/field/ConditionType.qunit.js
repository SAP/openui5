/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/field/ConditionType",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/field/FieldBaseDelegate",
	"sap/ui/mdc/ValueHelp",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/ConditionValidateException",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorValueType",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/Date",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/base/strings/whitespaceReplacer",
	"sap/base/util/deepEqual"
], function (
		ConditionType,
		Condition,
		FieldBaseDelegate,
		ValueHelp,
		FilterOperatorUtil,
		Operator,
		ConditionValidateException,
		ConditionValidated,
		FieldDisplay,
		OperatorValueType,
		OperatorName,
		FilterOperator,
		IntegerType,
		CurrencyType,
		DateType,
		FormatException,
		ParseException,
		StringType,
		DateTimeWithTimezoneType,
		DateTimeOffsetType,
		whitespaceReplacer,
		deepEqual
	) {
	"use strict";

	let oConditionType;
	let oValueType;

	QUnit.module("Default type", {
		beforeEach: function() {
			oConditionType = new ConditionType({delegate: FieldBaseDelegate});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
		}
	});

	QUnit.test("Formatting: nothing", function(assert) {

		const sResult = oConditionType.formatValue();
		assert.equal(sResult, null, "Result of formatting");

	});

	QUnit.test("Formatting: EQ - simple String", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["Test"]);
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "=Test", "Result of formatting");

		oCondition.validated = ConditionValidated.Validated;
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

		oCondition = Condition.createCondition(OperatorName.EQ, ["1"]);
		sResult = oConditionType.formatValue(oCondition, "int");
		assert.equal(sResult, 1, "Result of formatting");

	});

	QUnit.test("Formatting: EQ - key/Description", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		oConditionType.oFormatOptions.operators = [OperatorName.EQ]; // fake setting directly
		const oCondition = Condition.createItemCondition("A", "Test");
		const sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Formatting: EQ - simple String with whitespaces", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, ["Test   Test"], undefined, undefined, ConditionValidated.Validated);
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test   Test", "Result of formatting");

		oConditionType.oFormatOptions.convertWhitespaces = true; // fake setting directly
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, whitespaceReplacer("Test   Test"), "Result of formatting");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		let oException;

		try {
			oConditionType.formatValue("Test");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		oException = undefined;

		let oCondition = Condition.createCondition(OperatorName.EQ, []);
		try {
			oConditionType.formatValue(oCondition, "int");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

		oException = undefined;

		oCondition = Condition.createCondition("XY", ["XY"]);
		try {
			oConditionType.formatValue(oCondition, "string");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: Contains - simple String", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.Contains, ["Test"]);
		const sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "*Test*", "Result of formatting");

	});

	QUnit.test("Formatting: Contains - simple String (hideOperator)", function(assert) {

		oConditionType.oFormatOptions.hideOperator = true; // fake setting directly
		const oCondition = Condition.createCondition(OperatorName.Contains, ["Test"]);
		const sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Parsing: Default/hideOperator - simple String", function(assert) {

		let oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "1", "Values entry");

		oConditionType.setFormatOptions({hideOperator: true, operators: [OperatorName.EQ]});

		oCondition = oConditionType.parseValue("=Test"); // if operator hidden it will be taken as text
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "=Test", "Values entry");

		oCondition = oConditionType.parseValue("="); // if operator hidden it will be taken as text
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "=", "Values entry");

		// Default operator not in list of operators
		oConditionType.setFormatOptions({operators: [OperatorName.GT, OperatorName.LT]});

		oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.GT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.GT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "1", "Values entry");

		// Default operator set in FormatOptions
		oConditionType.setFormatOptions({operators: [OperatorName.GT, OperatorName.LT], defaultOperatorName: "LT"});

		oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.LT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

	});

	QUnit.test("Parsing: only EQ - simple String", function(assert) {

		oConditionType.setFormatOptions({operators: [OperatorName.EQ]});
		let oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length"); // second value not set right now TODO: validate for help too?
		assert.equal(oCondition.values[0], "1", "Values entry");

	});

	QUnit.test("Parsing: EQ - simple String as 'any'", function(assert) {

		oConditionType.setFormatOptions({operators: [OperatorName.EQ]});
		const oCondition = oConditionType.parseValue("Test", "any");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

	});

	QUnit.test("Parsing: EQ - empty string", function(assert) {

		oConditionType.setFormatOptions({operators: [OperatorName.EQ]});
		const oCondition = oConditionType.parseValue("");
		assert.notOk(oCondition, "no Result returned");

	});

	QUnit.test("Parsing: limited operators - simple string", function(assert) {

		oConditionType.setFormatOptions({operators: [OperatorName.NOTGT, OperatorName.GT, OperatorName.NOTLT, OperatorName.LT]});
		let oCondition = oConditionType.parseValue(">Test");
		assert.equal(oCondition.operator, OperatorName.GT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue("Test");
		assert.equal(oCondition.operator, OperatorName.GT, "Operator"); // first include operator should be used as default
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

	});

	QUnit.test("Parsing: single operator - simple string", function(assert) {

		oConditionType.setFormatOptions({operators: [OperatorName.GT]});
		let oCondition = oConditionType.parseValue(">Test");
		assert.equal(oCondition.operator, OperatorName.GT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], ">Test", "Values entry"); // as for single operator no operator symbol is used

		oCondition = oConditionType.parseValue("Test");
		assert.equal(oCondition.operator, OperatorName.GT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

	});

	QUnit.test("Parsing: <empty> - string", function(assert) {

		const oCondition = oConditionType.parseValue("<empty>");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.Empty, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 0, "Values length");

	});

	QUnit.test("Parsing: null", function(assert) {

		const oCondition = oConditionType.parseValue(null);
		assert.ok(oCondition === null, "null returned");

	});

	QUnit.test("destroyed ConditionType", function(assert) {

		oConditionType.destroy();
		let oCondition = Condition.createCondition(OperatorName.EQ, ["Test"]);
		const sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, null, "no formatting");

		oCondition = oConditionType.parseValue("Test");
		assert.notOk(oCondition, "nothing parsed");

		let oException;

		try {
			oConditionType.validateValue("X"); // invalid condition
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no validation");

	});

	QUnit.module("Number type", {
		beforeEach: function() {
			oValueType = new IntegerType({}, {maximum: 100});
			oConditionType = new ConditionType({valueType: oValueType, fieldPath: "X"});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Formatting: EQ - number", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [2]);
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "=2", "Result of formatting");

		oCondition.validated = ConditionValidated.Validated;
		sResult = oConditionType.formatValue(oCondition, "string");
		assert.equal(sResult, "2", "Result of formatting");

		sResult = oConditionType.formatValue(oCondition, "int");
		assert.equal(sResult, 2, "Result of formatting");

		sResult = oConditionType.formatValue(oCondition, "sap.ui.mdc.raw");
		assert.equal(sResult, 2, "Result of formatting");

	});

	QUnit.test("Parsing: EQ - number", function(assert) {

		oConditionType.setFormatOptions({operators: [OperatorName.EQ], fieldPath: "X"});
		let oCondition = oConditionType.parseValue("1");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

		oCondition = oConditionType.parseValue(1, "sap.ui.mdc.raw");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

	});

	QUnit.test("Parsing: GreaterThan - number", function(assert) {

		const oCondition = oConditionType.parseValue(">1");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.GT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		let oException;

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, [200]);
		let oException;

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");

		oException = undefined;
		try {
			oConditionType.validateValue("XXX");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), "XXX", "exception condition");

		oException = undefined;
		oCondition = Condition.createCondition("XX", [200]);
		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");

	});

	let oOriginalType;
	QUnit.module("Date type", {
		beforeEach: function() {
			oValueType = new DateType({pattern: "yyyy-MM-dd"}, {minimum: new Date(2000, 0, 1)});
			oOriginalType = new DateType({pattern: "dd.MM.yyyy"}, {minimum: new Date(2000, 0, 1)});
			oConditionType = new ConditionType({valueType: oValueType, originalDateType: oOriginalType, fieldPath: "X", operators: [OperatorName.EQ]});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
			oOriginalType.destroy();
			oOriginalType = undefined;
		}
	});

	QUnit.test("Formatting: EQ - date", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [new Date(2020, 1, 3)], undefined, undefined, ConditionValidated.Validated);
		const sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "2020-02-03", "Result of formatting");

	});

	QUnit.test("Parsing: EQ - date", function(assert) {

		const oCondition = oConditionType.parseValue("2020-02-03");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], new Date(2020, 1, 3), "Values entry");

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		let oException;
		sinon.spy(oValueType, "parseValue");
		sinon.spy(oOriginalType, "parseValue");

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oValueType.parseValue.calledWith("X", "string"), "parseValue of ValueType called with currentValue");
		assert.ok(oOriginalType.parseValue.calledWith("X", "string"), "parseValue of originalDateType called with currentValue");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [new Date(1900, 0, 1)]);
		let oException;
		sinon.spy(oValueType, "validateValue");
		sinon.spy(oOriginalType, "validateValue");

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException && oException.message.startsWith("Enter a date after 01.01.2000"), "Pattern of original date used in message");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");
		assert.ok(oValueType.validateValue.calledWith(new Date(1900, 0, 1)), "validateValue of ValueType called with currentValue");
		assert.ok(oOriginalType.validateValue.calledWith(new Date(1900, 0, 1)), "validateValue of originalDateType called with currentValue");

	});

	QUnit.test("Validating: invalid null value", function(assert) {

		let oException;
		sinon.spy(oValueType, "validateValue");
		sinon.spy(oOriginalType, "validateValue");

		try {
			oConditionType.validateValue(null);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException && oException.message.startsWith("Enter a date after 01.01.2000"), "Pattern of original date used in message");
		assert.deepEqual(oException && oException.getCondition(), null, "exception condition");
		assert.ok(oValueType.validateValue.calledWith(null), "validateValue of ValueType called with null");
		assert.ok(oOriginalType.validateValue.calledWith(null), "validateValue of originalDateType called with null");

	});

	let oDateTimeOffsetType;
	let oStringType;
	let oValueType2;
	let oConditionType2;
	QUnit.module("DateTimeWithTimezone type", {
		beforeEach: function() {
			oValueType = new DateTimeWithTimezoneType({pattern: "yyyy-MM-dd'T'HH:mm:ss", showTimezone: false});
			oOriginalType = new DateTimeWithTimezoneType({showTimezone: true});
			oDateTimeOffsetType = new DateTimeOffsetType({}, {V4: true});
			oStringType = new StringType();
			oConditionType = new ConditionType({
				valueType: oValueType,
				originalDateType: oOriginalType,
				compositeTypes: [oDateTimeOffsetType, oStringType],
				operators: [OperatorName.EQ],
				delegate: FieldBaseDelegate
			});

			oValueType2 = new DateTimeWithTimezoneType({showTimezone: true, showDate: false, showTime: false});
			oConditionType2 = new ConditionType({
				valueType: oValueType2,
				originalDateType: oOriginalType,
				compositeTypes: [oDateTimeOffsetType, oStringType],
				operators: [OperatorName.EQ],
				delegate: FieldBaseDelegate
			});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
			oConditionType2.destroy();
			oConditionType2 = undefined;
			oValueType2.destroy();
			oValueType2 = undefined;
			oOriginalType.destroy();
			oOriginalType = undefined;
			oDateTimeOffsetType.destroy();
			oDateTimeOffsetType = undefined;
			oStringType.destroy();
			oStringType = undefined;
		}
	});

	QUnit.test("Formatting: EQ", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [["2022-02-25T07:06:30+01:00", "Europe/Berlin"]], undefined, undefined, ConditionValidated.NotValidated);
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "2022-02-25T07:06:30", "Result of formatting for DateTime part");

		sResult = oConditionType2.formatValue(oCondition);
		assert.equal(sResult, "Europe, Berlin", "Result of formatting for Timezone part");

		sResult = oConditionType2.formatValue(oCondition, "sap.ui.mdc.raw:1"); // without type formatting
		assert.equal(sResult, "Europe/Berlin", "Result of formatting for Timezone part");

	});

	QUnit.test("Parsing: EQ", function(assert) {

		oValueType._aCurrentValue = ["2022-02-25T07:06:30+01:00", "Europe/Berlin"]; // fake formatting before (to have at least timezone)
		oValueType2._aCurrentValue = ["2022-02-25T07:06:30+01:00", "Europe/Berlin"]; // fake formatting before (to have at least timezone)
		oOriginalType._aCurrentValue = ["2022-02-25T07:06:30+01:00", "Europe/Berlin"]; // fake formatting before (to have at least timezone)
		let oCondition = oConditionType.parseValue("2022-02-25T07:32:30");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], ["2022-02-25T07:32:30+01:00", "Europe/Berlin"], "Values entry");

		// changing of TimeZone not a use case right now
		oCondition = oConditionType2.parseValue("Americas, New York");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], ["2022-02-25T07:06:30+01:00", "America/New_York"], "Values entry");

		oCondition = oConditionType2.parseValue("Europe/Berlin", "sap.ui.mdc.raw:1"); // without type parsing
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], ["2022-02-25T07:06:30+01:00", "Europe/Berlin"], "Values entry");

	});

	QUnit.test("Validating: valid value", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [["2022-02-25T07:06:30+01:00", "Europe/Berlin"]], undefined, undefined, ConditionValidated.NotValidated);
		let oException;
		sinon.spy(oValueType, "validateValue");
		sinon.spy(oValueType2, "validateValue");
		sinon.spy(oOriginalType, "validateValue");
		sinon.spy(oDateTimeOffsetType, "validateValue");
		sinon.spy(oStringType, "validateValue");

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.ok(oValueType.validateValue.calledWith([new Date(2022, 1, 25, 7, 6, 30), "Europe/Berlin"]), "validateValue of ValueType called with currentValue");
		assert.ok(oDateTimeOffsetType.validateValue.calledWith("2022-02-25T07:06:30+01:00"), "validateValue of DateTimeOffsetType called with current Date");
		assert.notOk(oStringType.validateValue.called, "validateValue of StringType not called called");
		assert.notOk(oOriginalType.validateValue.called, "validateValue of originalDateType not called");

		oException = undefined;
		oValueType.validateValue.reset();
		oDateTimeOffsetType.validateValue.reset();
		oStringType.validateValue.reset();
		oOriginalType.validateValue.reset();
		try {
			oConditionType2.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.ok(oValueType2.validateValue.calledWith([new Date(2022, 1, 25, 7, 6, 30), "Europe/Berlin"]), "validateValue of ValueType called with currentValue");
		assert.notOk(oDateTimeOffsetType.validateValue.called, "validateValue of DateTimeOffsetType not called");
		assert.ok(oStringType.validateValue.calledWith("Europe/Berlin"), "validateValue of StringType called with current timezone");
		assert.notOk(oOriginalType.validateValue.called, "validateValue of originalDateType not called");

	});

	let oValueHelp;
	let bAsyncCalled;
	const fnAsync = function(oPromise) {
		bAsyncCalled = true;
		if (!(oPromise instanceof Promise)) {
			throw new Error("needs promise");
		}
	};

	QUnit.module("Key/Description using ValueHelp", {
		beforeEach: function() {
			oValueHelp = new ValueHelp("VH1");
			const fnGetItemsForValue = function(oConfig) {
				if (oConfig.value === "I1" || oConfig.value === "Item1") {
					return Promise.resolve({key: "I1", description: "Item1"});
				} else if (oConfig.value === "=I1" || oConfig.value === "=Item1") {
					return Promise.resolve({key: "=I1", description: "=Item1"});
				} else if (oConfig.value === "I2" || oConfig.value === "Item2") {
					return new Promise(function(fResolve, fReject) {
						setTimeout(function () { // simulate request
							fResolve({key: "i2", description: "Item 2", payload: {payload: "I2"}});
						}, 0);
					});
				} else if (oConfig.value === "I3" || oConfig.value === "Item3") {
					return Promise.resolve({key: "I3", description: "Item3"});
				} else if (oConfig.value === "XXX") {
					return Promise.resolve(null);
				} else if (oConfig.value === "YY") {
					throw new Error("myError");
				} else if (oConfig.value === "ZZZ") {
					return Promise.reject(new oConfig.exception("myException"));
				} else if (oConfig.value === "notUnique") {
					const oException = new oConfig.exception("not Unique");
					oException._bNotUnique = true;
					return Promise.reject(oException);
				} else if (oConfig.value === "Sync" || oConfig.value === "SyncCall") { // TODO: remove after ValueHelp removed completely
					return {key: "Sync", description: "SyncCall", inParameters: {in1: "ISync"}, outParameters: {out1: "OSync"}};
				} else if (oConfig.parsedValue === "") {
					return Promise.resolve({key: "", description: "Empty"});
				} else if (oConfig.parsedValue === null && oConfig.value === "") {
					return Promise.resolve(null);
				}
				return null;
			};
			sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemsForValue);
			sinon.stub(oValueHelp, "isValidationSupported").returns(true);

			oValueType = new StringType(); // use odata-String type to parse "" to null -> so "" cannot be a value for typing
			oConditionType = new ConditionType({
				valueType: oValueType,
				display: FieldDisplay.Description,
				valueHelpID: "VH1",
				operators: [OperatorName.EQ],
				asyncParsing: fnAsync,
				delegate: FieldBaseDelegate,
				bindingContext: "BC", // just dummy to test forwarding to valueHelp
				control: "Control" // just dummy to test forwarding to valueHelp
			});
		},
		afterEach: function() {
			oValueHelp.destroy();
			oValueHelp = undefined;
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
			bAsyncCalled = undefined;
		}
	});

	QUnit.test("Formatting: key -> description (from condition)", function(assert) {

		const oCondition = Condition.createItemCondition("I1", "Text1");
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Text1", "Result of formatting (Description)");

		oConditionType.oFormatOptions.display = FieldDisplay.DescriptionValue; // fake setting directly
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Text1 (I1)", "Result of formatting (DescriptionValue)");

		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "I1 (Text1)", "Result of formatting (ValueDescription)");

		oConditionType.oFormatOptions.display = FieldDisplay.Value; // fake setting directly
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "I1", "Result of formatting (Value)");

	});

	QUnit.test("Formatting: key -> description (from help)", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["Sync"], undefined, undefined, ConditionValidated.Validated);
		const oConfig = { // to compare
			value: "Sync",
			parsedValue: "Sync",
			parsedDescription: undefined,
			dataType: oValueType,
			checkKey: true,
			checkDescription: false,
			context: {inParameters: undefined, outParameters: undefined, payload: undefined},
			bindingContext: "BC",
			control: "Control",
			caseSensitive: true,
			exactMatch: true,
			exception: FormatException
		};
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "SyncCall", "Result of formatting");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

		const fnDone = assert.async();
		oCondition = Condition.createCondition(OperatorName.EQ, ["I1"], undefined, undefined, ConditionValidated.Validated);
		let oPromise = oConditionType.formatValue(oCondition);
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(sDescription) {
			assert.equal(sDescription, "Item1", "Result of formatting");
			oConfig.value = "I1";
			oConfig.parsedValue = "I1";
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

			oConditionType.oFormatOptions.display = FieldDisplay.DescriptionValue; // fake setting directly
			oCondition.values.push(undefined);
			oPromise = oConditionType.formatValue(oCondition);
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(sDescription) {
				assert.equal(sDescription, "Item1 (I1)", "Result of formatting");

				oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly
				oCondition = Condition.createCondition(OperatorName.EQ, ["I2"], undefined, undefined, ConditionValidated.Validated);
				oPromise = oConditionType.formatValue(oCondition);
				assert.ok(oPromise instanceof Promise, "Promise returned");
				oPromise.then(function(sDescription) {
					assert.equal(sDescription, "i2 (Item 2)", "Result of formatting");

					// preventGetDescription -> no description is read
					oConditionType.oFormatOptions.preventGetDescription = true; // fake setting directly
					sResult = oConditionType.formatValue(oCondition);
					assert.equal(sResult, "I2", "Result of formatting");
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise Catch must not be called");
					fnDone();
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch must not be called");
				fnDone();
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Formatting: invalid key -> description (from help)", function(assert) {

		// test fallbacks without delegate
		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		let oCondition = Condition.createCondition(OperatorName.EQ, ["YY"], undefined, undefined, ConditionValidated.Validated);
		let oException;

		try {
			oConditionType.formatValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException.message, "myError", "error text");

		oCondition = Condition.createCondition(OperatorName.EQ, ["ZZZ"], undefined, undefined, ConditionValidated.Validated);
		let oPromise;
		oException = undefined;
		try {
			oPromise = oConditionType.formatValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oPromise instanceof Promise, "Promise returned");
		assert.notOk(oException, "no exception fired");

		const fnDone = assert.async();
		oPromise.then(function(sDescription) {
			assert.notOk(true, "Promise Then must not be called");
			fnDone();
		}).catch(function(oException) {
			assert.ok(oException, "exception fired");
			assert.ok(oException instanceof FormatException, "Error is a FormatException");
			assert.equal(oException.message, "myException", "error text");

			oValueHelp.setValidateInput(false); // invalid input is returned
			oPromise = oConditionType.formatValue(oCondition);
			assert.ok(oPromise instanceof Promise, "Promise returned");

			oPromise.then(function(sDescription) {
				assert.equal(sDescription, "ZZZ", "Result of formatting");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch must not be called");
				fnDone();
			});
		});

	});

	QUnit.test("Parsing: description -> key", function(assert) {

		const oCondition = oConditionType.parseValue("SyncCall");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "Sync", "Values entry0");
		assert.equal(oCondition.values[1], "SyncCall", "Values entry1");
		assert.deepEqual(oCondition.inParameters, {in1: "ISync"} , "in-parameters returned");
		assert.deepEqual(oCondition.outParameters, {out1: "OSync"} , "out-parameters returned");
		assert.notOk(oCondition.payload, "no payload returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
		assert.notOk(bAsyncCalled, "asyncParsing function not called");

		const fnDone = assert.async();
		const oPromise =  oConditionType.parseValue("Item1");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "I1", "Values entry0");
			assert.equal(oCondition.values[1], "Item1", "Values entry1");
			assert.notOk(oCondition.inParameters, "no in-parameters returned");
			assert.notOk(oCondition.outParameters, "no out-parameters returned");
			assert.notOk(oCondition.payload, "no payload returned");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			assert.ok(bAsyncCalled, "asyncParsing function called");

			bAsyncCalled = undefined;
			const oPromise =  oConditionType.parseValue("Item2");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 2, "Values length");
				assert.equal(oCondition.values[0], "i2", "Values entry0");
				assert.equal(oCondition.values[1], "Item 2", "Values entry1");
				assert.notOk(oCondition.inParameters, "no in-parameters returned");
				assert.notOk(oCondition.outParameters, "no out-parameters returned");
				assert.deepEqual(oCondition.payload, {payload: "I2"} , "payload returned");
				assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
				assert.ok(bAsyncCalled, "asyncParsing function called");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch must not be called");
				fnDone();
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: key -> key and description", function(assert) {

		// test fallbacks without delegate
		const fnDone = assert.async();
		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		const oPromise = oConditionType.parseValue("I2");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "i2", "Values entry0");
			assert.equal(oCondition.values[1], "Item 2", "Values entry1");
			assert.notOk(oCondition.inParameters, "no in-parameters returned");
			assert.notOk(oCondition.outParameters, "no out-parameters returned");
			assert.deepEqual(oCondition.payload, {payload: "I2"} , "payload returned");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: key and description -> key and Description", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly

		const fnDone = assert.async();
		let oPromise = oConditionType.parseValue("I2 (X)");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "i2", "Values entry0");
			assert.equal(oCondition.values[1], "Item 2", "Values entry1");
			assert.notOk(oCondition.inParameters, "no in-parameters returned");
			assert.notOk(oCondition.outParameters, "no out-parameters returned");
			assert.deepEqual(oCondition.payload, {payload: "I2"} , "payload returned");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			const oConfig = { // to compare
				value: "I2",
				parsedValue: "I2",
				parsedDescription: "X",
				dataType: oValueType,
				checkKey: true,
				checkDescription: true,
				bindingContext: "BC",
				control: "Control",
				exactMatch: false,
				caseSensitive: undefined,
				exception: ParseException
			};
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called");

			oPromise = oConditionType.parseValue("Item3");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 2, "Values length");
				assert.equal(oCondition.values[0], "I3", "Values entry0");
				assert.equal(oCondition.values[1], "Item3", "Values entry1");
				assert.notOk(oCondition.inParameters, "no in-parameters returned");
				assert.notOk(oCondition.outParameters, "no out-parameters returned");
				assert.notOk(oCondition.payload, "no payload returned");
				assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

				oPromise = oConditionType.parseValue("x (Item2)");
				assert.ok(oPromise instanceof Promise, "Promise returned");
				oPromise.then(function(oCondition) {
					assert.ok(oCondition, "Result returned");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 2, "Values length");
					assert.equal(oCondition.values[0], "i2", "Values entry0");
					assert.equal(oCondition.values[1], "Item 2", "Values entry1");
					assert.notOk(oCondition.inParameters, "no in-parameters returned");
					assert.notOk(oCondition.outParameters, "no out-parameters returned");
					assert.deepEqual(oCondition.payload, {payload: "I2"} , "payload returned");
					assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise Catch must not be called");
					fnDone();
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch must not be called");
				fnDone();
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: key and description -> key and Description with error", function(assert) {

		// test fallbacks without delegate
		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		const oType = new StringType({}, {maxLength: 2}); // use type to test invalid key is not checked for description
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly
		let oException;
		let oPromise;
		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "Value \"X\" does not exist.", "error text");
		assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

		oValueHelp.getItemForValue.resetHistory();
		oException = null;

		const fnDone = assert.async();
		try {
			oPromise = oConditionType.parseValue("XXX");
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.notOk(true, "Promise Then must not be called");
			oType.destroy();
			fnDone();
		}).catch(function(oException) {
			assert.ok(oException, "exception fired");
			assert.ok(oException instanceof ParseException, "Error is a ParseException");
			assert.equal(oException && oException.message, "Value \"XXX\" does not exist.", "error text");
			assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

			// test own error (like runtime error) just forwarded
			oValueHelp.getItemForValue.resetHistory();
			oException = null;
			try {
				oConditionType.parseValue("YY");
			} catch (e) {
				oException = e;
			}

			assert.ok(oException, "exception fired");
			assert.equal(oException && oException.message, "myError", "error text");
			assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

			oValueHelp.getItemForValue.resetHistory();
			oException = null;
			oConditionType.oFormatOptions.display = FieldDisplay.DescriptionValue; // fake setting directly

			try {
				oConditionType.parseValue("X");
			} catch (e) {
				oException = e;
			}

			assert.ok(oException, "exception fired");
			assert.equal(oException.message, "Value \"X\" does not exist.", "error text");
			assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

			oValueHelp.getItemForValue.resetHistory();
			oException = null;

			try {
				oPromise = oConditionType.parseValue("XXX");
			} catch (e) {
				oException = e;
			}

			assert.notOk(oException, "no exception fired");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.notOk(true, "Promise Then must not be called");
				oType.destroy();
				fnDone();
			}).catch(function(oException) {
				assert.ok(oException, "exception fired");
				assert.ok(oException instanceof ParseException, "Error is a ParseException");
				assert.equal(oException.message, "Value \"XXX\" does not exist.", "error text");
				assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

				oType.destroy();
				fnDone();
			});
		});

	});

	QUnit.test("Parsing: description -> key with error", function(assert) {

		const oType = new StringType({}, {maxLength: 2}); // use type to test invalid key is not checked for description
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly
		let oException;

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "Value \"X\" does not exist.", "error text");
		assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

		// test own error (like runtime error) just forwarded
		oValueHelp.getItemForValue.resetHistory();
		oException = null;
		try {
			oConditionType.parseValue("YY");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "myError", "error text");
		assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

		// test invalid key because of type validation
		oValueHelp.getItemForValue.resetHistory();
		oException = null;
		let oPromise;
		const fnDone = assert.async();
		try {
			oPromise = oConditionType.parseValue("ZZZ");
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.notOk(true, "Promise Then must not be called");
			oType.destroy();
			fnDone();
		}).catch(function(oException) {
			assert.ok(oException, "exception fired");
			assert.ok(oException instanceof ParseException, "Error is a ParseException");
			assert.equal(oException && oException.message, "myException", "error text");
			assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

			// test non-unique key because of type validation
			oValueHelp.getItemForValue.resetHistory();
			oException = null;
			try {
				oPromise = oConditionType.parseValue("notUnique");
			} catch (e) {
				oException = e;
			}

			assert.notOk(oException, "no exception fired");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.notOk(true, "Promise Then must not be called");
				oType.destroy();
				fnDone();
			}).catch(function(oException) {
				assert.ok(oException, "exception fired");
				assert.ok(oException instanceof ParseException, "Error is a ParseException");
				assert.equal(oException && oException.message, "not Unique", "error text");
				assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
				oType.destroy();
				fnDone();
			});
		});

	});

	QUnit.test("Parsing: description -> key with error and no inputValidation", function(assert) {

		const fnDone = assert.async();
		oValueHelp.setValidateInput(false);
		let oPromise = oConditionType.parseValue("ZZZ");
		assert.ok(oPromise instanceof Promise, "Promise returned");

		oPromise.then(function(oCondition) {
			assert.ok(true, "Promise Then must be called");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 1, "Values length");
			assert.equal(oCondition.values[0], "ZZZ", "Values entry0");
			assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

			oPromise = oConditionType.parseValue("notUnique");
			assert.ok(oPromise instanceof Promise, "Promise returned");

			oPromise.then(function(oCondition) {
				assert.ok(true, "Promise Then must be called");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 1, "Values length");
				assert.equal(oCondition.values[0], "notUnique", "Values entry0");
				assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

				oConditionType.oFormatOptions.operators = []; // fake setting directly
				oPromise = oConditionType.parseValue("=ZZZ");
				assert.ok(oPromise instanceof Promise, "Promise returned");

				oPromise.then(function(oCondition) {
					assert.ok(true, "Promise Then must be called");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 1, "Values length");
					assert.equal(oCondition.values[0], "ZZZ", "Values entry0");
					assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise must not fail");
					fnDone();
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise must not fail");
				fnDone();
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise must not fail");
			fnDone();
		});

	});

	QUnit.test("Parsing: description -> key with default Operator", function(assert) {

		oConditionType.oFormatOptions.operators = [OperatorName.EQ, OperatorName.Contains]; // fake setting directly
		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator(OperatorName.Contains)); // fake contains as default operator

		const oCondition = oConditionType.parseValue("X");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.Contains, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "X", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");
		assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

		// default operator not allowed
		oValueHelp.getItemForValue.resetHistory();
		oConditionType.oFormatOptions.operators = [OperatorName.GT, OperatorName.EQ]; // fake setting directly
		const fnDone = assert.async();
		let oPromise = oConditionType.parseValue("ZZZ");
		assert.ok(oPromise instanceof Promise, "Promise returned");

		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.GT, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 1, "Values length");
			assert.equal(oCondition.values[0], "ZZZ", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");
			assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

			// use EQ operator -> if invalid don't use as default
			FilterOperatorUtil.getDefaultOperator.returns(FilterOperatorUtil.getOperator(OperatorName.EQ));
			oValueHelp.getItemForValue.resetHistory();
			let oException;
			try {
				oPromise = oConditionType.parseValue("XXX");
			} catch (e) {
				oException = e;
			}
			assert.notOk(oException, "no exception fired");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.notOk(true, "Promise Then must not be called");
				FilterOperatorUtil.getDefaultOperator.restore();
				fnDone();
			}).catch(function(oException) {
				assert.ok(oException, "exception fired");
				assert.ok(oException instanceof ParseException, "Error is a ParseException");
				assert.equal(oException && oException.message, "Value \"XXX\" does not exist.", "error text");
				assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

				// only one operator
				oValueHelp.getItemForValue.resetHistory();
				oConditionType.oFormatOptions.operators = [OperatorName.EQ]; // fake setting directly
				oException = undefined;
				try {
					oPromise = oConditionType.parseValue("XXX");
				} catch (e) {
					oException = e;
				}
				assert.notOk(oException, "no exception fired");
				assert.ok(oPromise instanceof Promise, "Promise returned");
				oPromise.then(function(oCondition) {
					assert.notOk(true, "Promise Then must not be called");
					FilterOperatorUtil.getDefaultOperator.restore();
					fnDone();
				}).catch(function(oException) {
					assert.ok(oException, "exception fired");
					assert.ok(oException instanceof ParseException, "Error is a ParseException");
					assert.equal(oException && oException.message, "Value \"XXX\" does not exist.", "error text");
					assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");

					FilterOperatorUtil.getDefaultOperator.restore();
					fnDone();
				});
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise must not fail");
			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		});

	});

	QUnit.test("Parsing: description -> key with entered symbol", function(assert) {

		oConditionType.oFormatOptions.operators = [OperatorName.EQ, OperatorName.Contains]; // fake setting directly

		const oConfig = { // to compare
			value: "X",
			parsedValue: "X",
			parsedDescription: "X",
			dataType: oValueType,
			checkKey: true,
			checkDescription: true,
			bindingContext: "BC",
			control: "Control",
			caseSensitive: true,
			exactMatch: true,
			exception: ParseException
		};

		const oCondition = oConditionType.parseValue("=X");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "X", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");
		assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

		oValueHelp.getItemForValue.resetHistory();
		oConfig.value = "ZZZ";
		oConfig.parsedValue = "ZZZ";
		oConfig.parsedDescription = "ZZZ";
		const fnDone = assert.async();
		let oPromise = oConditionType.parseValue("=ZZZ");
		assert.ok(oPromise instanceof Promise, "Promise returned");

		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 1, "Values length");
			assert.equal(oCondition.values[0], "ZZZ", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");
			assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

			oValueHelp.getItemForValue.resetHistory();
			oConfig.value = "Item1";
			oConfig.parsedValue = "Item1";
			oConfig.parsedDescription = "Item1";
			oPromise = oConditionType.parseValue("=Item1");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 2, "Values length");
				assert.equal(oCondition.values[0], "I1", "Values entry1");
				assert.equal(oCondition.values[1], "Item1", "Values entry2");
				assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
				assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
				assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

				oValueHelp.getItemForValue.resetHistory();
				oConfig.value = "";
				oConfig.parsedValue = null;
				oConfig.parsedDescription = undefined;
				oConfig.checkDescription = false;
				oPromise = oConditionType.parseValue("=");
				assert.ok(oPromise instanceof Promise, "Promise returned");
				oPromise.then(function(oCondition) {
					assert.deepEqual(oCondition, null, "null returned");
					assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
					assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

					fnDone();
				}).catch(function(oException) {
					assert.notOk(oException, "exception fired");
					fnDone();
				});
				}).catch(function(oException) {
				assert.notOk(oException, "exception fired");
				fnDone();
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise must not fail");
			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		});

	});

	QUnit.test("Parsing: description -> key with entered symbol and hidden operator", function(assert) {

		oConditionType.oFormatOptions.operators = [OperatorName.EQ]; // fake setting directly
		oConditionType.oFormatOptions.hideOperator = true;

		const oConfig = { // to compare
			value: "=X",
			parsedValue: "=X",
			parsedDescription: "=X",
			dataType: oValueType,
			checkKey: true,
			checkDescription: true,
			bindingContext: "BC",
			control: "Control",
			caseSensitive: undefined,
			exactMatch: false,
			exception: ParseException
		};

		let oException;
		try {
			oConditionType.parseValue("=X");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.ok(oException instanceof ParseException, "Error is a ParseException");
		assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

		oValueHelp.getItemForValue.resetHistory();
		const fnDone = assert.async();
		oConfig.value = "=Item1";
		oConfig.parsedValue = "=Item1";
		oConfig.parsedDescription = "=Item1";
		const oPromise = oConditionType.parseValue("=Item1");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "=I1", "Values entry1");
			assert.equal(oCondition.values[1], "=Item1", "Values entry2");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			oValueHelp.getItemForValue.resetHistory();
			oConfig.value = "=";
			oConfig.parsedValue = "=";
			oConfig.parsedDescription = "=";
			try {
				oConditionType.parseValue("=");
			} catch (e) {
				oException = e;
			}
			assert.ok(oException, "exception fired");
			assert.ok(oException instanceof ParseException, "Error is a ParseException");
			assert.ok(oValueHelp.getItemForValue.calledOnce, "getItemForValue called");
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

			fnDone();
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not fail");
			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		});

	});

	QUnit.test("Parsing: description -> key with custom Operator", function(assert) {

		let oOperator = new Operator({
			name: "MyContains",
			filterOperator: FilterOperator.Contains,
			tokenTest: "^\\*(.*)\\*$",
			tokenParse: "^\\*(.+)?\\*$|^([^\\*]?.*[^\\*]?)$",
			tokenFormat: "*{0}*",
			valueTypes: [OperatorValueType.Self],
			validateInput: false
		});
		FilterOperatorUtil.addOperator(oOperator);

		oOperator = new Operator({
			name: "MyInclude",
			filterOperator: FilterOperator.EQ,
			tokenTest: "^=(.+)?$",
			tokenParse: "^=?(.+)?$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oOperator = new Operator({ // test excluding operator with validation
			name: "MyExclude",
			filterOperator: FilterOperator.NE,
			tokenParse: "^!=(.+)$",
			tokenFormat: "!(={0})",
			valueTypes: [OperatorValueType.Self],
			exclude: true,
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oConditionType.oFormatOptions.operators = ["MyExclude", "MyContains", "MyInclude"]; // fake setting directly

		// existing value
		const fnDone = assert.async();
		let oPromise = oConditionType.parseValue("Item3");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, "MyInclude", "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 1, "Values length");
			assert.equal(oCondition.values[0], "I3", "Values entry0");
			assert.notOk(oCondition.inParameters, "no in-parameters returned");
			assert.notOk(oCondition.outParameters, "no out-parameters returned");
			assert.notOk(oCondition.payload, "no payload returned");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			// not existing value
			oPromise = oConditionType.parseValue("XXX");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, "MyContains", "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 1, "Values length");
				assert.equal(oCondition.values[0], "XXX", "Values entry1");
				assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

				// exlude value
				oPromise = oConditionType.parseValue("!=Item3");
				assert.ok(oPromise instanceof Promise, "Promise returned"); // Promise because validateInput is set to determine key
				oPromise.then(function(oCondition) {
					assert.ok(oCondition, "Result returned");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, "MyExclude", "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 1, "Values length");
					assert.equal(oCondition.values[0], "I3", "Values entry1");
					assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

					delete FilterOperatorUtil.removeOperator("MyContains");
					delete FilterOperatorUtil.removeOperator("MyInclude");
					delete FilterOperatorUtil.removeOperator("MyExclude");
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise Catch must not be called");
					delete FilterOperatorUtil.removeOperator("MyContains");
					delete FilterOperatorUtil.removeOperator("MyInclude");
					delete FilterOperatorUtil.removeOperator("MyExclude");
					fnDone();
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch must not be called");
				delete FilterOperatorUtil.removeOperator("MyContains");
				delete FilterOperatorUtil.removeOperator("MyInclude");
				delete FilterOperatorUtil.removeOperator("MyExclude");
				fnDone();
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			delete FilterOperatorUtil.removeOperator("MyContains");
			delete FilterOperatorUtil.removeOperator("MyInclude");
			delete FilterOperatorUtil.removeOperator("MyExclude");
			fnDone();
		});

	});

	QUnit.test("Parsing: description (key entered) -> key", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator(OperatorName.Contains)); // fake contains as default operator

		let oPromise = oConditionType.parseValue("I2");
		assert.ok(oPromise instanceof Promise, "Promise returned");

		const fnDone = assert.async();
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "i2", "Values entry0");
			assert.equal(oCondition.values[1], "Item 2", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			oPromise = oConditionType.parseValue("XXX");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.notOk(true, "Promise Then must not be called");

				FilterOperatorUtil.getDefaultOperator.restore();
				fnDone();
			}).catch(function(oError) {
				assert.ok(oError, "Error Fired");
				assert.ok(oError instanceof ParseException, "Error is a ParseException");
				assert.equal(oError.message, "Value \"XXX\" does not exist.", "Error message");

				oConditionType.oFormatOptions.operators = []; // fake setting directly
				oPromise = oConditionType.parseValue("XXX");
				assert.ok(oPromise instanceof Promise, "Promise returned");
				oPromise.then(function(oCondition) {
					assert.ok(oCondition, "Result returned");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, OperatorName.Contains, "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 1, "Values length");
					assert.equal(oCondition.values[0], "XXX", "Values entry1");
					assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

					FilterOperatorUtil.getDefaultOperator.restore();
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise Catch must not be called");

					FilterOperatorUtil.getDefaultOperator.restore();
					fnDone();
				});
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");

			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		});

	});

	QUnit.test("Parsing: value only -> validation from help", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Value; // fake setting directly
		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator(OperatorName.Contains)); // fake contains as default operator

		let oPromise = oConditionType.parseValue("ZZZ");
		assert.ok(oPromise instanceof Promise, "Promise returned");

		const fnDone = assert.async();
		oPromise.then(function(oCondition) {
			assert.notOk(true, "Promise Then must not be called");

			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		}).catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			assert.equal(oError.message, "myException", "Error message");

			oConditionType.oFormatOptions.operators = []; // fake setting directly
			oPromise = oConditionType.parseValue("ZZZ");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, OperatorName.Contains, "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 1, "Values length");
				assert.equal(oCondition.values[0], "ZZZ", "Values entry1");
				assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

				oConditionType.oFormatOptions.operators = [OperatorName.EQ]; // fake setting directly
				oValueHelp.setValidateInput(false);
				oPromise = oConditionType.parseValue("ZZZ");
				assert.ok(oPromise instanceof Promise, "Promise returned");
				oPromise.then(function(oCondition) {
					assert.ok(oCondition, "Result returned");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 1, "Values length");
					assert.equal(oCondition.values[0], "ZZZ", "Values entry1");
					assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

					FilterOperatorUtil.getDefaultOperator.restore();
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise Catch must not be called");

					FilterOperatorUtil.getDefaultOperator.restore();
					fnDone();
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch must not be called");

				FilterOperatorUtil.getDefaultOperator.restore();
				fnDone();
			});
		});

	});

	QUnit.test("Parsing: empty string -> key and description", function(assert) {

		const oType = new StringType({parseKeepsEmptyString: true}, {nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly
		const oPromise = oConditionType.parseValue("");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		const fnDone = assert.async();
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "", "Values entry0");
			assert.equal(oCondition.values[1], "Empty", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			oType.destroy();
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			oType.destroy();
			fnDone();
		});

	});

	QUnit.test("Parsing: empty digsequence-string -> key and description", function(assert) {

		const oType = new StringType({}, {maxLength: 6, isDigitSequence: true, nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly

		oValueHelp.getItemForValue.callsFake(function(oConfig) {
			if (oConfig.parsedValue === "000000" && oConfig.value === "") {
				return Promise.resolve({key: "000000", description: "Empty"});
			}
		});

		const oPromise = oConditionType.parseValue("");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		const fnDone = assert.async();
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "000000", "Values entry0");
			assert.equal(oCondition.values[1], "Empty", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			oType.destroy();
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			oType.destroy();
			fnDone();
		});

	});

	QUnit.test("Parsing: empty string -> key and description with not found", function(assert) {

		const oType = new StringType({parseKeepsEmptyString: true}, {nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly
		oValueHelp.getItemForValue.callsFake(function(oConfig) {
			if (oConfig.parsedValue === "" && oConfig.value === "") {
				return Promise.reject(new oConfig.exception("not found"));
			}
		});

		let oException;
		let oPromise;
		const fnDone = assert.async();

		try {
			oPromise = oConditionType.parseValue("");
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.notOk(oCondition, "no condition returned");
			oType.destroy();
			fnDone();
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not fail");
			oType.destroy();
			fnDone();
		});

	});

	QUnit.test("Parsing: empty digsequence-string -> key and description with not found", function(assert) {

		const oType = new StringType({}, {maxLength: 6, isDigitSequence: true, nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly

		oValueHelp.getItemForValue.callsFake(function(oConfig) {
			if (oConfig.parsedValue === "000000" && oConfig.value === "") {
				return Promise.reject(new oConfig.exception("not found"));
			}
		});

		let oException;
		let oPromise;
		const fnDone = assert.async();

		try {
			oPromise = oConditionType.parseValue("");
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.notOk(oCondition, "no condition returned");
			oType.destroy();
			fnDone();
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not fail");
			oType.destroy();
			fnDone();
		});

	});

	QUnit.test("Parsing: empty string -> key only", function(assert) {

		const oType = new StringType({parseKeepsEmptyString: true}, {nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly
		oConditionType.oFormatOptions.display = FieldDisplay.Value; // fake setting directly

		const fnDone = assert.async();
		let oPromise = oConditionType.parseValue("");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "", "Values entry0");
			assert.equal(oCondition.values[1], "Empty", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			oType.destroy();
			// use standard odata-String type to parse "" to null -> so "" cannot be a value for typing
			oConditionType.oFormatOptions.valueType = oValueType; // fake setting directly
			oValueHelp.getItemForValue.resetHistory();

			oPromise = oConditionType.parseValue("");
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.notOk(oCondition, "no result returned");
				fnDone();
			}).catch(function(oException) {
				assert.notOk(true, "Promise must not fail");
				fnDone();
			});
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not fail");
			oType.destroy();
			fnDone();
		});

	});

	QUnit.test("Parsing: unsing condition from navigation", function(assert) {

		const oNavigateCondition = Condition.createItemCondition("I3", "Item3", {testIn: "A"}, {testOut: "B"});
		const oCompareCondition = Condition.createItemCondition("I3", "Item3", {testIn: "A"}, {testOut: "B"}); // as internal propertys (output) must not be returned
		oConditionType.oFormatOptions.navigateCondition = oNavigateCondition; // fake setting directly

		let vResult = oConditionType.parseValue("Item3");
		assert.deepEqual(vResult, oCompareCondition, "navigationCondition returned");

		vResult = oConditionType.parseValue("Item1");
		assert.notDeepEqual(vResult, oCompareCondition, "navigationCondition not returned");

		// for autocomplete output could be different than formattes value (bevause of delegate implementation / case insensitiveness)
		oNavigateCondition.output = "item3";
		vResult = oConditionType.parseValue("item3");
		assert.deepEqual(vResult, oCompareCondition, "navigationCondition returned");

	});

	let oUnitConditionType;
	let oOneFieldType;
	let oOneFieldConditionType;
	let oUnitType;

	QUnit.module("Currency type", {
		beforeEach: function() {
			oValueType = new CurrencyType({showMeasure: false}, {maximum: 1000});
			oUnitType = new CurrencyType({showNumber: false}, {maximum: 1000});
			oOriginalType = new CurrencyType(undefined, {maximum: 1000});
			oConditionType = new ConditionType({valueType: oValueType, additionalType: oUnitType, operators: [OperatorName.EQ], originalDateType: oOriginalType, delegate: FieldBaseDelegate});
			oUnitConditionType = new ConditionType({valueType: oUnitType, additionalType: oValueType, operators: [OperatorName.EQ], originalDateType: oOriginalType, delegate: FieldBaseDelegate});
			oOneFieldType = new CurrencyType();
			oOneFieldConditionType = new ConditionType({valueType: oOneFieldType, operators: [OperatorName.EQ, OperatorName.BT], delegate: FieldBaseDelegate});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
			oUnitType.destroy();
			oUnitType = undefined;
			oOriginalType.destroy();
			oOriginalType = undefined;
			oUnitConditionType.destroy();
			oUnitConditionType = undefined;
			oOneFieldConditionType.destroy();
			oOneFieldConditionType = undefined;
			oOneFieldType.destroy();
			oOneFieldType = undefined;
		}
	});

	QUnit.test("Formatting: EQ - Currency", function(assert) {

		let oType = new CurrencyType({showMeasure: false});
		let sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspace and local dependend
		const oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "USD"]], undefined, undefined, ConditionValidated.Validated);
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, sValue, "Result of number formatting");

		sResult = oUnitConditionType.formatValue(oCondition);
		assert.equal(sResult, "USD", "Result of unit formatting");

		assert.deepEqual(oUnitType._aCurrentValue, [123.45, "USD"], "CurrentValue stored in unit type");
		assert.deepEqual(oValueType._aCurrentValue, [123.45, "USD"], "CurrentValue stored in value type");
		assert.deepEqual(oOriginalType._aCurrentValue, [123.45, "USD"], "CurrentValue stored in original type");

		sResult = oConditionType.formatValue(null); // after initialization no old value must be shown
		assert.equal(sResult, null, "Result of number formatting");

		sResult = oUnitConditionType.formatValue(null);
		assert.equal(sResult, null, "Result of unit formatting");

		assert.deepEqual(oUnitType._aCurrentValue, [], "CurrentValue initialized in unit type");
		assert.deepEqual(oValueType._aCurrentValue, [], "CurrentValue initialized in value type");
		assert.deepEqual(oOriginalType._aCurrentValue, [], "CurrentValue initialized in original type");

		oType = new CurrencyType();
		sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspace and local dependend
		sResult = oOneFieldConditionType.formatValue(oCondition); // formatting in display case
		assert.equal(sResult, sValue, "Result of one-field formatting");

	});

	QUnit.test("Formatting: BT - Currency", function(assert) {

		oConditionType.oFormatOptions.operators = []; // fake setting directly
		let oType = new CurrencyType({showMeasure: false});
		let sValue1 = oType.formatValue([1, "USD"], "string"); // because of special whitspace and local dependend
		let sValue2 = oType.formatValue([2, "USD"], "string"); // because of special whitspace and local dependend
		const oCondition = Condition.createCondition(OperatorName.BT, [[1, "USD"], [2, "USD"]]);
		let sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, sValue1 + "..." + sValue2, "Result of number formatting");

		sResult = oUnitConditionType.formatValue(oCondition);
		assert.equal(sResult, "USD", "Result of unit formatting");

		oType = new CurrencyType();
		sValue1 = oType.formatValue([1, "USD"], "string"); // because of special whitspace and local dependend
		sValue2 = oType.formatValue([2, "USD"], "string"); // because of special whitspace and local dependend
		sResult = oOneFieldConditionType.formatValue(oCondition);
		assert.equal(sResult, sValue1 + "..." + sValue2, "Result of one-field formatting");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		let oException;
		const oCondition = Condition.createCondition(OperatorName.EQ, ["X"]);

		try {
			oConditionType.formatValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: unit from ValueHelp", function(assert) {

		oValueHelp = new ValueHelp("VH1");
		sinon.stub(oValueHelp, "isValidationSupported").returns(true);
		sinon.stub(oValueHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.parsedValue === "EUR") {
				return Promise.resolve({key: "EUR", description: "Euro"});
			}
		});
		oUnitConditionType.oFormatOptions.valueHelpID = "VH1"; // fake setting directly
		oUnitConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		const oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "EUR"]], undefined, undefined, ConditionValidated.Validated);

		const fnDone = assert.async();
		const oPromise = oUnitConditionType.formatValue(oCondition);
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(sDescription) {
			assert.equal(sDescription, "Euro", "Result of unit formatting");
			oValueHelp.destroy();
			oValueHelp = undefined;
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			oValueHelp.destroy();
			oValueHelp = undefined;
			fnDone();
		});

	});

	QUnit.test("Parsing: with unit", function(assert) {

		sinon.spy(oValueType, "parseValue");
		sinon.stub(oValueType, "getParseWithValues").returns(true); // fake parseWithValue (to simulate oData type)
		sinon.spy(oUnitType, "parseValue");
		sinon.stub(oUnitType, "getParseWithValues").returns(true); // fake parseWithValue (to simulate oData type)

		let oCondition = oConditionType.parseValue("1.23");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.deepEqual(oCondition.values[0][1], null, "Values entry1"); // deepEqual to distinguish between null and undefined
		assert.ok(oValueType.parseValue.calledWith("1.23", "string", []), "parseValue of type called with currentValue");

		oCondition = oUnitConditionType.parseValue("USD");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");
		assert.ok(oUnitType.parseValue.calledWith("USD", "string", [1.23, null]), "parseValue of type called with currentValue");

		oCondition = oConditionType.parseValue("123.45");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 123.45, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1"); // as last entry used from type
		assert.ok(oValueType.parseValue.calledWith("123.45", "string", [1.23, "USD"]), "parseValue of type called with currentValue");

		oConditionType.oFormatOptions.operators = []; // fake setting directly
		oCondition = oConditionType.parseValue("1...2");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.BT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1, "Values0 entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values0 entry1"); // as last entry used from type
		assert.equal(oCondition.values[1][0], 2, "Values1 entry0");
		assert.equal(oCondition.values[1][1], "USD", "Values1 entry1"); // as last entry used from type

//		oCondition = oUnitConditionType.parseValue("");
//		assert.ok(oCondition, "Result returned");
//		assert.equal(typeof oCondition, "object", "Result is object");
//		assert.equal(oCondition.operator, OperatorName.EQ", "Operator"); // as it don't have the old condition just the old value
//		assert.ok(Array.isArray(oCondition.values), "values are array");
//		assert.equal(oCondition.values.length, 1, "Values length");
//		assert.equal(oCondition.values[0].length, 2, "Values0 length");
//		assert.ok(isNaN(oCondition.values[0][0]), "Values entry0"); // as number is cleared by type if unit is cleared
//		assert.equal(oCondition.values[0][1], null, "Values entry1");

		let oException;

		try {
			oCondition = oConditionType.parseValue("");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired (Currency cannot parse empty value)");

		// test number and unit entered in one field
		const oType = new CurrencyType();
		const sValue = oType.formatValue([1.23, "USD"], "string"); // because of special whitspace and local dependend
		oCondition = oOneFieldConditionType.parseValue(sValue);
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");
		oType.destroy();

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		let oException;
		sinon.spy(oValueType, "parseValue");
		sinon.spy(oUnitType, "parseValue");
		sinon.spy(oOriginalType, "parseValue");

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oValueType.parseValue.calledWith("X", "string"), "parseValue of ValueType called with currentValue");
		assert.notOk(oOriginalType.parseValue.called, "parseValue of originalDateType not called");

		try {
			oUnitConditionType.parseValue("XXXXX");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oUnitType.parseValue.calledWith("XXXXX", "string"), "parseValue of UnitType called with currentValue");
		assert.notOk(oOriginalType.parseValue.called, "parseValue of originalDateType not called");

	});

	QUnit.test("Parsing: with unit and nullable type", function(assert) {

		oValueType.destroy();
		oUnitType.destroy();
		oOriginalType.destroy();
		oValueType = new CurrencyType({showMeasure: false, emptyString: 0});
		oUnitType = new CurrencyType({showNumber: false, emptyString: 0});
		oOriginalType = new CurrencyType({emptyString: 0});
		oConditionType.oFormatOptions.valueType = oValueType; // fake setting directly
		oConditionType.oFormatOptions.additionalType = oUnitType; // fake setting directly
		oConditionType.oFormatOptions.originalDateType = oOriginalType; // fake setting directly
		oUnitConditionType.oFormatOptions.valueType = oUnitType; // fake setting directly
		oUnitConditionType.oFormatOptions.additionalType = oValueType; // fake setting directly
		oUnitConditionType.oFormatOptions.originalDateType = oOriginalType; // fake setting directly

		sinon.spy(oValueType, "parseValue");
		sinon.stub(oValueType, "getParseWithValues").returns(true); // fake parseWithValue (to simulate oData type)

		let oCondition = oConditionType.parseValue("1.23");
		oCondition = oUnitConditionType.parseValue("USD");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");

		oCondition = oConditionType.parseValue("");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 0, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");

		// oCondition = oUnitConditionType.parseValue("");
		// assert.ok(oCondition, "Result returned");
		// assert.equal(typeof oCondition, "object", "Result is object");
		// assert.equal(oCondition.operator, OperatorName.EQ", "Operator");
		// assert.ok(Array.isArray(oCondition.values), "values are array");
		// assert.equal(oCondition.values.length, 1, "Values length");
		// assert.equal(oCondition.values[0].length, 2, "Values0 length");
		// assert.equal(oCondition.values[0][0], 0, "Values entry0");
		// assert.equal(oCondition.values[0][1], "", "Values entry1");

	});

	QUnit.test("Parsing: BT with unit", function(assert) {

		oConditionType.oFormatOptions.operators = [OperatorName.EQ, OperatorName.BT]; // fake setting directly
		sinon.spy(oValueType, "parseValue");
		sinon.stub(oValueType, "getParseWithValues").returns(true); // fake parseWithValue

		let oCondition = oConditionType.parseValue("1.23...4.56");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.BT, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values0 entry0");
		assert.deepEqual(oCondition.values[0][1], null, "Values0 entry1"); // deepEqual to distinguish between null and undefined
		assert.equal(oCondition.values[1].length, 2, "Values1 length");
		assert.equal(oCondition.values[1][0], 4.56, "Values1 entry0");
		assert.deepEqual(oCondition.values[1][1], null, "Values1 entry1"); // deepEqual to distinguish between null and undefined
		assert.ok(oValueType.parseValue.calledWith("1.23", "string", []), "parseValue of type called with first value");
		assert.ok(oValueType.parseValue.calledWith("4.56", "string", []), "parseValue of type called with second value");

		oUnitConditionType.oFormatOptions.operators = [OperatorName.EQ, OperatorName.BT]; // fake setting directly
		let oException;

		try {
			oCondition = oUnitConditionType.parseValue("USD...EUR");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired (Unit can only parse EQ)");

	});

	QUnit.test("Parsing: default Operator with unit", function(assert) {

		oConditionType.oFormatOptions.operators = []; // fake setting directly
		sinon.spy(oValueType, "parseValue");
		sinon.stub(oValueType, "getParseWithValues").returns(true); // fake parseWithValue

		const oCondition = oConditionType.parseValue("1.23");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values0 entry0");
		assert.deepEqual(oCondition.values[0][1], null, "Values0 entry1"); // deepEqual to distinguish between null and undefined
		assert.deepEqual(oCondition.values[0][1], null, "Values entry1"); // deepEqual to distinguish between null and undefined
		assert.ok(oValueType.parseValue.calledWith("1.23", "string", []), "parseValue of type called with currentValue");

	});

	QUnit.test("Parsing: unit from ValueHelp", function(assert) {

		oValueHelp = new ValueHelp("VH1", {validateInput: false}); // test invalid input returned if OK for Type
		sinon.stub(oValueHelp, "isValidationSupported").returns(true);
		sinon.stub(oValueHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "Euro") {
				return Promise.resolve({key: "EUR", description: "Euro"});
			} else if (oConfig.value === "USD" || oConfig.value === "X") {
				return Promise.reject(new oConfig.exception("Cannot parse value " + oConfig.parsedValue));
			}
		});
		oUnitConditionType.oFormatOptions.valueHelpID = "VH1"; // fake setting directly
		oUnitConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		oUnitType._aCurrentValue = [1, "USD"]; // fake existing value
		oValueType._aCurrentValue = [1, "USD"]; // fake existing value
		oOriginalType._aCurrentValue = [1, "USD"]; // fake existing value

		const fnDone = assert.async();
		let oPromise = oUnitConditionType.parseValue("Euro");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 1, "Values length");
			assert.equal(oCondition.values[0].length, 2, "Values0 length");
			assert.equal(oCondition.values[0][0], 1, "Values entry0");
			assert.equal(oCondition.values[0][1], "EUR", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			oPromise = oUnitConditionType.parseValue("USD"); // valid currency for type but not for Help
			assert.ok(oPromise instanceof Promise, "Promise returned");
			oPromise.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 1, "Values length");
				assert.equal(oCondition.values[0].length, 2, "Values0 length");
				assert.equal(oCondition.values[0][0], 1, "Values entry0");
				assert.equal(oCondition.values[0][1], "USD", "Values entry1");
				assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

				let oException;

				try {
					oPromise = oUnitConditionType.parseValue("X"); // invalid currency
				} catch (e) {
					oException = e;
				}

				assert.notOk(oException, "no exception fired");
				assert.ok(oPromise instanceof Promise, "Promise returned");
				oPromise.then(function(oCondition) {
					assert.notOk(true, "Promise Then must not be called");
					fnDone();
				}).catch(function(oException) {
					assert.ok(oException, "Exception returned");
					assert.ok(oException instanceof ParseException, "Exception is a ParseException");

//		oCondition = oUnitConditionType.parseValue("");
//		assert.ok(oCondition, "Result returned");
//		assert.equal(typeof oCondition, "object", "Result is object");
//		assert.equal(oCondition.operator, OperatorName.EQ", "Operator");
//		assert.ok(Array.isArray(oCondition.values), "values are array");
//		assert.equal(oCondition.values.length, 1, "Values length");
//		assert.equal(oCondition.values[0].length, 2, "Values0 length");
//		assert.ok(isNaN(oCondition.values[0][0]), "Values entry0"); // as number is cleared by type if unit is cleared
//		assert.equal(oCondition.values[0][1], null, "Values entry1");

					oValueHelp.destroy();
					oValueHelp = undefined;
					fnDone();
				});
			}).catch(function(oException) {
				assert.notOk(true, "Promise must not fail");
				oValueHelp.destroy();
				oValueHelp = undefined;
				fnDone();
			});
		}).catch(function(oException) {
			assert.notOk(true, "Promise must not fail");
			oValueHelp.destroy();
			oValueHelp = undefined;
			fnDone();
		});

	});

	QUnit.test("Validation: with unit", function(assert) {

		sinon.spy(oValueType, "validateValue");
		sinon.spy(oUnitType, "validateValue");

		const oCondition = Condition.createCondition(OperatorName.EQ, [[123.45, "USD"]]);
		oConditionType.validateValue(oCondition);

		assert.ok(oValueType.validateValue.calledWith([123.45, "USD"]), "Currency type used for validation");

		oUnitConditionType.validateValue(oCondition);
		assert.ok(oValueType.validateValue.calledOnce, "Currency type not used for unit validation");
		assert.ok(oUnitType.validateValue.calledWith([123.45, "USD"]), "Unit type used for validation");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, [[999999, "USD"]]);
		let oException;
		sinon.spy(oValueType, "validateValue");
		sinon.spy(oUnitType, "validateValue");
		sinon.spy(oOriginalType, "validateValue");

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");
		assert.ok(oValueType.validateValue.calledWith([999999, "USD"]), "validateValue of ValueType called with currentValue");
		assert.notOk(oOriginalType.validateValue.called, "validateValue of originalDateType not called");

		try {
			oUnitConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");
		assert.ok(oUnitType.validateValue.calledWith([999999, "USD"]), "validateValue of UnitType called with currentValue");
		assert.notOk(oOriginalType.validateValue.called, "validateValue of originalDateType not called");


	});

	QUnit.module("Not nullable type", {
		beforeEach: function() {
			oValueType = new StringType({}, {nullable: false});
			oConditionType = new ConditionType({valueType: oValueType, fieldPath: "X", operators: [OperatorName.EQ]});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Validating: null", function(assert) {

		let oException;

		try {
			oConditionType.validateValue(null);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.notOk(oException && oException.getCondition(), "exception has no condition");

	});

	QUnit.module("Not nullable type with parseKeepsEmptyString", {
		beforeEach: function() {
			oValueType = new StringType({parseKeepsEmptyString: true}, {nullable: false});
			oConditionType = new ConditionType({valueType: oValueType, fieldPath: "X", operators: [OperatorName.EQ]});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Validating: null", function(assert) {

		let oException;

		try {
			oConditionType.validateValue(null);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: null digsequence-string", function(assert) {

		const oType = new StringType({}, {maxLength: 6, isDigitSequence: true, nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly

		let oException;

		try {
			oConditionType.validateValue(null);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	let fResolve1;
	let fReject1;
	let oPromise1;
	let fResolve2;
	let fReject2;
	let oPromise2;
	let fResolve3;
	let fReject3;
	let oPromise3;

	QUnit.module("multiple async requests", {
		beforeEach: function() {
			oValueHelp = new ValueHelp("VH1");
			sinon.stub(oValueHelp, "isValidationSupported").returns(true);
			sinon.stub(oValueHelp, "getItemForValue").callsFake(function(oConfig) {
				if (oConfig.value === "S" || oConfig.value === "Sync Text") {
					return {key: "S", description: "Sync Text"};
				} else if (oConfig.value === "1") {
					if (!oPromise1) {
						oPromise1 = new Promise(function(fResolve, fReject) {
							fResolve1 = fResolve;
							fReject1 = fReject;
						});
					}
					return oPromise1;
				} else if (oConfig.value === "2") {
					if (!oPromise2) {
						oPromise2 = new Promise(function(fResolve, fReject) {
							fResolve2 = fResolve;
							fReject2 = fReject;
						});
					}
					return oPromise2;
				} else if (oConfig.value === "3") {
					if (!oPromise3) {
						oPromise3 = new Promise(function(fResolve, fReject) {
							fResolve3 = fResolve;
							fReject3 = fReject;
						});
					}
					return oPromise3;
				}
			});

			oConditionType = new ConditionType({
				display: FieldDisplay.Description,
				valueHelpID: "VH1",
				operators: [OperatorName.EQ, OperatorName.GT],
				asyncParsing: fnAsync,
				delegate: FieldBaseDelegate,
				bindingContext: "BC" // just dummy to test forwarding to valueHelp
			});
		},
		afterEach: function() {
			oValueHelp.destroy();
			oValueHelp = undefined;
			oConditionType.destroy();
			oConditionType = undefined;
			bAsyncCalled = undefined;
			fResolve1 = undefined;
			fReject1 = undefined;
			oPromise1 = undefined;
			fResolve2 = undefined;
			fReject2 = undefined;
			oPromise2 = undefined;
			fResolve3 = undefined;
			fReject3 = undefined;
			oPromise3 = undefined;
		}
	});

	QUnit.test("Formatting: multiple promises", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["1"], undefined, undefined, ConditionValidated.Validated);
		const vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["2"], undefined, undefined, ConditionValidated.Validated);
		const vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["3"], undefined, undefined, ConditionValidated.Validated);
		const vResult3 = oConditionType.formatValue(oCondition);
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2("Text 2");
		fResolve3("Text 3");
		fResolve1("Text 1");

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		Promise.all([vResult1, vResult2, vResult3]).then(function(aResult) {
			assert.ok(true, "All promises resolved");
			assert.equal(aResult[0], "Text 3", "Result 1");
			assert.equal(aResult[1], "Text 2", "Result 2");
			assert.equal(aResult[2], "Text 3", "Result 3");
			assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Formatting: multiple promises with error on last call", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["1"], undefined, undefined, ConditionValidated.Validated);
		const vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["2"], undefined, undefined, ConditionValidated.Validated);
		const vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["3"], undefined, undefined, ConditionValidated.Validated);
		const vResult3 = oConditionType.formatValue(oCondition);
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2("Text 2");
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject3(new FormatException("wrong value"));
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve1("Text 1");
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last exception is shown
		const fnDone = assert.async();

		// PromiseAll cannot be used for test as we need to check exception for every single Promise
		vResult1.then(function(sResult) {
			assert.notOk(true, "Promise1 must not be resolved (as resolved after error)");
			fnDone();
		}).catch(function(oError) {
			assert.ok(true, "Promise1 Catch called");
			assert.ok(oError instanceof FormatException, "Error is a FormatException");
			assert.equal(oError.message, "wrong value", "Error message");

			vResult2.then(function(sResult) {
				assert.ok(true, "Promise2 must be resolved (as resoved before error)");
				assert.equal(sResult, "Text 2", "Result 2");

				vResult3.then(function(sResult) {
					assert.notOk(true, "Promise3 must not be resolved (as error thrown)");
					fnDone();
				}).catch(function(oError) {
					assert.ok(true, "Promise3 Catch called");
					assert.ok(oError instanceof FormatException, "Error is a FormatException");
					assert.equal(oError.message, "wrong value", "Error message");
					assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
					fnDone();
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise2 Catch must not be called");
				fnDone();
			});
		});

	});

	QUnit.test("Formatting: multiple promises with error between", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["1"], undefined, undefined, ConditionValidated.Validated);
		const vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["2"], undefined, undefined, ConditionValidated.Validated);
		const vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["3"], undefined, undefined, ConditionValidated.Validated);
		const vResult3 = oConditionType.formatValue(oCondition);
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fReject2(new FormatException("wrong value"));
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve3("Text 3");
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject1(new FormatException("wrong value"));
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		// PromiseAll cannot be used for test as we need to check exception for every single Promise
		vResult1.then(function(sResult) {
			assert.ok(true, "Promise1 must be resolved (as resoved after success)");
			assert.equal(sResult, "Text 3", "Result 1");

			vResult2.then(function(sResult) {
				assert.notOk(true, "Promise2 must not be resolved (as errot thrown)");
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise2 Catch called");
				assert.ok(oError instanceof FormatException, "Error is a FormatException");
				assert.equal(oError.message, "wrong value", "Error message");

				vResult3.then(function(sResult) {
					assert.ok(true, "Promise3 must be resolved (rsolved as last)");
					assert.equal(sResult, "Text 3", "Result 3");
					assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise3 Catch must not be called");
					fnDone();
				});
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise1 Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Formatting: multiple promises and call with given description", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["1"], undefined, undefined, ConditionValidated.Validated);
		const vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["2"], undefined, undefined, ConditionValidated.Validated);
		const vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition(OperatorName.EQ, ["S", "Sync Text"], undefined, undefined, ConditionValidated.Validated);
		const vResult3 = oConditionType.formatValue(oCondition);
		assert.equal(vResult3, "Sync Text", "Description returned");

		fResolve2("Text 2");
		fResolve1("Text 1");

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		Promise.all([vResult1, vResult2]).then(function(aResult) {
			assert.ok(true, "All promises resolved");
			assert.equal(aResult[0], "Sync Text", "Result 1");
			assert.equal(aResult[1], "Sync Text", "Result 2");
			assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: multiple promises", function(assert) {

		const vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		const vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		const vResult3 = oConditionType.parseValue("3");
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2({key: "2", description: "Text 2"});
		fResolve3({key: "3", description: "Text 3"});
		fResolve1({key: "1", description: "Text 1"});

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		Promise.all([vResult1, vResult2, vResult3]).then(function(aResult) {
			assert.ok(true, "All promises resolved");
			assert.equal(aResult[0].values[0], "3", "Result 1");
			assert.equal(aResult[1].values[0], "2", "Result 2");
			assert.equal(aResult[2].values[0], "3", "Result 3");
			assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: multiple promises with error on last call", function(assert) {

		const vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		const vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		const vResult3 = oConditionType.parseValue("3");
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2({key: "2", description: "Text 2"});
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject3(new ParseException("wrong value"));
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve1({key: "1", description: "Text 1"});
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last exception is shown
		const fnDone = assert.async();

		// PromiseAll cannot be used for test as we need to check exception for every single Promise
		vResult1.then(function(oCondition) {
			assert.notOk(true, "Promise1 must not be resolved (as resolved after error)");
			fnDone();
		}).catch(function(oError) {
			assert.ok(true, "Promise1 Catch called");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			assert.equal(oError.message, "wrong value", "Error message");

			vResult2.then(function(oCondition) {
				assert.ok(true, "Promise2 must be resolved (as resoved before error)");
				assert.equal(oCondition.values[0], "2", "Result 2");

				vResult3.then(function(oCondition) {
					assert.notOk(true, "Promise3 must not be resolved (as errot thrown)");
					fnDone();
				}).catch(function(oError) {
					assert.ok(true, "Promise3 Catch called");
					assert.ok(oError instanceof ParseException, "Error is a ParseException");
					assert.equal(oError.message, "wrong value", "Error message");
					assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
					fnDone();
				});
			}).catch(function(oError) {
				assert.notOk(true, "Promise2 Catch must not be called");
				fnDone();
			});
		});

	});

	QUnit.test("Parsing: multiple promises with error between", function(assert) {

		const vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		const vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		const vResult3 = oConditionType.parseValue("3");
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fReject2(new FormatException("wrong value"));
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve3({key: "3", description: "Text 3"});
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject1(new FormatException("wrong value"));
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		// PromiseAll cannot be used for test as we need to check exception for every single Promise
		vResult1.then(function(oCondition) {
			assert.ok(true, "Promise1 must be resolved (as resoved after success)");
			assert.equal(oCondition.values[0], "3", "Result 1");

			vResult2.then(function(oCondition) {
				assert.notOk(true, "Promise2 must not be resolved (as errot thrown)");
				fnDone();
			}).catch(function(oError) {
				assert.ok(true, "Promise2 Catch called");
				assert.ok(oError instanceof ParseException, "Error is a ParseException");
				assert.equal(oError.message, "wrong value", "Error message");

				vResult3.then(function(oCondition) {
					assert.ok(true, "Promise3 must be resolved (rsolved as last)");
					assert.equal(oCondition.values[0], "3", "Result 3");
					assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
					fnDone();
				}).catch(function(oError) {
					assert.notOk(true, "Promise3 Catch must not be called");
					fnDone();
				});
			});
		}).catch(function(oError) {
			assert.notOk(true, "Promise1 Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: multiple promises and sync parsing", function(assert) {

		const vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		const vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		const vResult3 = oConditionType.parseValue(">S");
		assert.equal(vResult3.values[0], "S", "Condition returned");

		fResolve2({key: "2", description: "Text 2"});
		fResolve1({key: "1", description: "Text 1"});

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		Promise.all([vResult1, vResult2]).then(function(aResult) {
			assert.ok(true, "All promises resolved");
			assert.equal(aResult[0].values[0], "S", "Result 1");
			assert.equal(aResult[1].values[0], "S", "Result 2");
			assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Formatting and Parsing", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, ["1"], undefined, undefined, ConditionValidated.Validated);
		const vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		const vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		fResolve2({key: "2", description: "Text 2"});
		fResolve1("Text 1");

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		Promise.all([vResult1, vResult2]).then(function(aResult) {
			assert.ok(true, "All promises resolved");
			assert.equal(aResult[0], "Text 2", "Result 1");
			assert.equal(aResult[1].values[0], "2", "Result 2");
			assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing and Formatting", function(assert) {

		const vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		const oCondition = Condition.createCondition(OperatorName.EQ, ["2"], undefined, undefined, ConditionValidated.Validated);
		const vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		fResolve2("Text 2");
		fResolve1({key: "1", description: "Text 1"});

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		const fnDone = assert.async();
		Promise.all([vResult1, vResult2]).then(function(aResult) {
			assert.ok(true, "All promises resolved");
			assert.equal(aResult[0].values[0], "2", "Result 1");
			assert.equal(aResult[1], "Text 2", "Result 2");
			assert.equal(oConditionType._oCalls.last, 0, "Internal Async counter cleared");
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	let oAdditionalType;
	QUnit.module("different type for description", {
		beforeEach: function() {
			oValueType = new IntegerType({}, {maximum: 100});
			oAdditionalType = new DateType({pattern: "yyyy-MM-dd"}, {minimum: new Date(2000, 0, 1)});
			oConditionType = new ConditionType({
				valueType: oValueType,
				additionalValueType: oAdditionalType,
				operators: [OperatorName.EQ],
				display: FieldDisplay.ValueDescription,
				asyncParsing: fnAsync,
				delegate: FieldBaseDelegate,
				bindingContext: "BC", // just dummy to test forwarding to valueHelp
				control: "Control" // just dummy to test forwarding to valueHelp
			});

			oValueHelp = new ValueHelp("VH1");
			const fnGetItemsForValue = function(oConfig) {
				if (oConfig.parsedValue === 1 && oConfig.checkKey) {
					return Promise.resolve({key: 1, description: new Date(2023, 6, 31)});
				} else if (deepEqual(oConfig.parsedDescription, new Date(2023, 6, 31)) && !oConfig.checkKey && oConfig.checkDescription) {
					return Promise.resolve({key: 2, description: new Date(2023, 6, 31)});
				}
				return null;
			};
			sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemsForValue);
			sinon.stub(oValueHelp, "isValidationSupported").returns(true);
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
			oAdditionalType.destroy();
			oAdditionalType = undefined;
			oValueHelp.destroy();
			oValueHelp = undefined;
			bAsyncCalled = undefined;
		}
	});

	QUnit.test("Formatting: EQ", function(assert) {

		const oCondition = Condition.createItemCondition(2, new Date(2023, 6, 31));
		const sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "2 (2023-07-31)", "Result of formatting");

	});

	QUnit.test("Parsing: EQ", function(assert) {

		const oCondition = oConditionType.parseValue("2 (2023-07-31)");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], 2, "Values: first entry");
		assert.deepEqual(oCondition.values[1], new Date(2023, 6, 31), "Values: second entry");

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		let oException;

		try {
			oConditionType.parseValue("X (2023-07-31)");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

		oException = undefined;
		try {
			oConditionType.parseValue("1 (x)");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		let oCondition = Condition.createItemCondition(200, new Date(2023, 6, 31));
		let oException;

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");

		oException = undefined;
		oCondition = Condition.createItemCondition(2, new Date(1900, 6, 31));
		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");

	});

	QUnit.test("Formatting: key -> description (from help)", function(assert) {

		oConditionType.oFormatOptions.valueHelpID = "VH1"; // fake setting directly
		const fnDone = assert.async();
		const oCondition = Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.Validated);
		const oConfig = { // to compare
			value: 1,
			parsedValue: 1,
			parsedDescription: undefined,
			dataType: oValueType,
			checkKey: true,
			checkDescription: false,
			context: {inParameters: undefined, outParameters: undefined, payload: undefined},
			bindingContext: "BC",
			control: "Control",
			caseSensitive: true,
			exactMatch: true,
			exception: FormatException
		};

		const oPromise = oConditionType.formatValue(oCondition);
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(sDescription) {
			assert.equal(sDescription, "1 (2023-07-31)", "Result of formatting");
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: description -> key", function(assert) {

		oConditionType.oFormatOptions.valueHelpID = "VH1"; // fake setting directly
		const fnDone = assert.async();
		const oConfig = { // to compare
			value: "2023-07-31",
			parsedValue: undefined,
			parsedDescription: new Date(2023, 6, 31),
			dataType: oValueType,
			checkKey: false,
			checkDescription: true,
			bindingContext: "BC",
			control: "Control",
			exactMatch: false,
			caseSensitive: undefined,
			exception: ParseException
		};

		const oPromise =  oConditionType.parseValue("2023-07-31");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], 2, "Values entry0");
			assert.deepEqual(oCondition.values[1], new Date(2023, 6, 31), "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			assert.ok(bAsyncCalled, "asyncParsing function called");
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: key -> description", function(assert) {

		oConditionType.oFormatOptions.valueHelpID = "VH1"; // fake setting directly
		const fnDone = assert.async();
		const oConfig = { // to compare
			value: "1",
			parsedValue: 1,
			parsedDescription: undefined,
			dataType: oValueType,
			checkKey: true,
			checkDescription: false,
			bindingContext: "BC",
			control: "Control",
			exactMatch: false,
			caseSensitive: undefined,
			exception: ParseException
		};

		const oPromise =  oConditionType.parseValue("1");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], 1, "Values entry0");
			assert.deepEqual(oCondition.values[1], new Date(2023, 6, 31), "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			assert.ok(bAsyncCalled, "asyncParsing function called");
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

	QUnit.test("Parsing: key and description -> key and description", function(assert) {

		oConditionType.oFormatOptions.valueHelpID = "VH1"; // fake setting directly
		const fnDone = assert.async();
		const oConfig = { // to compare
			value: "1",
			parsedValue: 1,
			parsedDescription: new Date(2023, 6, 31),
			dataType: oValueType,
			checkKey: true,
			checkDescription: true,
			bindingContext: "BC",
			control: "Control",
			exactMatch: false,
			caseSensitive: undefined,
			exception: ParseException
		};

		const oPromise =  oConditionType.parseValue("1 (2023-07-31)");
		assert.ok(oPromise instanceof Promise, "Promise returned");
		oPromise.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, OperatorName.EQ, "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], 1, "Values entry0");
			assert.deepEqual(oCondition.values[1], new Date(2023, 6, 31), "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			assert.ok(bAsyncCalled, "asyncParsing function called");
			assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");
			fnDone();
		});

	});

});
