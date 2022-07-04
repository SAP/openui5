/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/field/ConditionType",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/field/FieldHelpBase",
	"sap/ui/mdc/field/FieldBaseDelegate",
	"sap/ui/mdc/ValueHelp",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Currency",
	"sap/ui/model/type/Date",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/base/strings/whitespaceReplacer"
], function (
		ConditionType,
		Condition,
		FieldHelpBase,
		FieldBaseDelegate,
		ValueHelp,
		FilterOperatorUtil,
		Operator,
		ConditionValidated,
		FieldDisplay,
		IntegerType,
		CurrencyType,
		DateType,
		FormatException,
		ParseException,
		StringType,
		DateTimeWithTimezoneType,
		DateTimeOffsetType,
		whitespaceReplacer
	) {
	"use strict";

	var oConditionType;
	var oValueType;

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

		var sResult = oConditionType.formatValue();
		assert.equal(sResult, null, "Result of formatting");

	});

	QUnit.test("Formatting: EQ - simple String", function(assert) {

		var oCondition = Condition.createCondition("EQ", ["Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "=Test", "Result of formatting");

		oCondition.validated = ConditionValidated.Validated;
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

		oCondition = Condition.createCondition("EQ", ["1"]);
		sResult = oConditionType.formatValue(oCondition, "int");
		assert.equal(sResult, 1, "Result of formatting");

	});

	QUnit.test("Formatting: EQ - key/Description", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		oConditionType.oFormatOptions.operators = ["EQ"]; // fake setting directly
		var oCondition = Condition.createItemCondition("A", "Test");
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Formatting: EQ - simple String with whitespaces", function(assert) {

		var oCondition = Condition.createCondition("EQ", ["Test   Test"], undefined, undefined, ConditionValidated.Validated);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test   Test", "Result of formatting");

		oConditionType.oFormatOptions.convertWhitespaces = true; // fake setting directly
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, whitespaceReplacer("Test   Test"), "Result of formatting");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		var oException;

		try {
			oConditionType.formatValue("Test");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		oException = undefined;

		var oCondition = Condition.createCondition("EQ", []);
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

		var oCondition = Condition.createCondition("Contains", ["Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "*Test*", "Result of formatting");

	});

	QUnit.test("Formatting: Contains - simple String (hideOperator)", function(assert) {

		oConditionType.oFormatOptions.hideOperator = true; // fake setting directly
		var oCondition = Condition.createCondition("Contains", ["Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Parsing: Default - simple String", function(assert) {

		var oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "1", "Values entry");

		// Default operator not in list of operators
		oConditionType.setFormatOptions({operators: ["GT", "LT"]});

		oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "1", "Values entry");

	});

	QUnit.test("Parsing: only EQ - simple String", function(assert) {

		oConditionType.setFormatOptions({operators: ["EQ"]});
		var oCondition = oConditionType.parseValue("Test");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length"); // second value not set right now TODO: validate for help too?
		assert.equal(oCondition.values[0], "1", "Values entry");

	});

	QUnit.test("Parsing: EQ - simple String as 'any'", function(assert) {

		oConditionType.setFormatOptions({operators: ["EQ"]});
		var oCondition = oConditionType.parseValue("Test", "any");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

	});

	QUnit.test("Parsing: EQ - empty string", function(assert) {

		oConditionType.setFormatOptions({operators: ["EQ"]});
		var oCondition = oConditionType.parseValue("");
		assert.notOk(oCondition, "no Result returned");

	});

	QUnit.test("Parsing: limited operators - simple string", function(assert) {

		oConditionType.setFormatOptions({operators: ["NOTGT", "GT", "NOTLT", "LT"]});
		var oCondition = oConditionType.parseValue(">Test");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue("Test");
		assert.equal(oCondition.operator, "GT", "Operator"); // first include operator should be used as default
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

	});

	QUnit.test("Parsing: single operator - simple string", function(assert) {

		oConditionType.setFormatOptions({operators: ["GT"]});
		var oCondition = oConditionType.parseValue(">Test");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

		oCondition = oConditionType.parseValue("Test");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "Test", "Values entry");

	});

	QUnit.test("Parsing: <empty> - string", function(assert) {

		var oCondition = oConditionType.parseValue("<empty>");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "Empty", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 0, "Values length");

	});

	QUnit.test("Parsing: null", function(assert) {

		var oCondition = oConditionType.parseValue(null);
		assert.ok(oCondition === null, "null returned");

	});

	QUnit.test("destroyed ConditionType", function(assert) {

		oConditionType.destroy();
		var oCondition = Condition.createCondition("EQ", ["Test"]);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, null, "no formatting");

		oCondition = oConditionType.parseValue("Test");
		assert.notOk(oCondition, "nothing parsed");

		var oException;

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

		var oCondition = Condition.createCondition("EQ", [2]);
		var sResult = oConditionType.formatValue(oCondition);
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

		oConditionType.setFormatOptions({operators: ["EQ"], fieldPath: "X"});
		var oCondition = oConditionType.parseValue("1");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

		oCondition = oConditionType.parseValue(1, "int");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

		oCondition = oConditionType.parseValue(1, "sap.ui.mdc.raw");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

	});

	QUnit.test("Parsing: GreaterThan - number", function(assert) {

		var oCondition = oConditionType.parseValue(">1");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], 1, "Values entry");

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		var oException;

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		var oCondition = Condition.createCondition("EQ", [200]);
		var oException;

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

		oException = undefined;
		try {
			oConditionType.validateValue("XXX");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");

		oException = undefined;
		oCondition = Condition.createCondition("XX", [200]);
		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");

	});

	var oOriginalType;
	QUnit.module("Date type", {
		beforeEach: function() {
			oValueType = new DateType({pattern: "yyyy-MM-dd"}, {minimum: new Date(2000, 0, 1)});
			oOriginalType = new DateType({pattern: "dd.MM.yyyy"}, {minimum: new Date(2000, 0, 1)});
			oConditionType = new ConditionType({valueType: oValueType, originalDateType: oOriginalType, fieldPath: "X", operators: ["EQ"]});
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

		var oCondition = Condition.createCondition("EQ", [new Date(2020, 1, 3)], undefined, undefined, ConditionValidated.Validated);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "2020-02-03", "Result of formatting");

	});

	QUnit.test("Parsing: EQ - date", function(assert) {

		var oCondition = oConditionType.parseValue("2020-02-03");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], new Date(2020, 1, 3), "Values entry");

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		var oException;
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

		var oCondition = Condition.createCondition("EQ", [new Date(1900, 0, 1)]);
		var oException;
		sinon.spy(oValueType, "validateValue");
		sinon.spy(oOriginalType, "validateValue");

		try {
			oConditionType.validateValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.ok(oException && oException.message.startsWith("Enter a date after 01.01.2000"), "Pattern of original date used in message");
		assert.ok(oValueType.validateValue.calledWith(new Date(1900, 0, 1)), "validateValue of ValueType called with currentValue");
		assert.ok(oOriginalType.validateValue.calledWith(new Date(1900, 0, 1)), "validateValue of originalDateType called with currentValue");

	});

	var oDateTimeOffsetType;
	var oStringType;
	var oValueType2;
	var oConditionType2;
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
				operators: ["EQ"],
				hideOperator: true,
				delegate: FieldBaseDelegate
			});

			oValueType2 = new DateTimeWithTimezoneType({showTimezone: true, showDate: false, showTime: false});
			oConditionType2 = new ConditionType({
				valueType: oValueType2,
				originalDateType: oOriginalType,
				compositeTypes: [oDateTimeOffsetType, oStringType],
				operators: ["EQ"],
				hideOperator: true,
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

		var oCondition = Condition.createCondition("EQ", [["2022-02-25T07:06:30+01:00", "Europe/Berlin"]], undefined, undefined, ConditionValidated.NotValidated);
		var sResult = oConditionType.formatValue(oCondition);
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
		var oCondition = oConditionType.parseValue("2022-02-25T07:32:30");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], ["2022-02-25T07:32:30+01:00", "Europe/Berlin"], "Values entry");

		// changing of TimeZone not a use case right now
		oCondition = oConditionType2.parseValue("Americas, New York");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], ["2022-02-25T07:06:30+01:00", "America/New_York"], "Values entry");

		oCondition = oConditionType2.parseValue("Europe/Berlin", "sap.ui.mdc.raw:1"); // without type parsing
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.deepEqual(oCondition.values[0], ["2022-02-25T07:06:30+01:00", "Europe/Berlin"], "Values entry");

	});

	QUnit.test("Validating: valid value", function(assert) {

		var oCondition = Condition.createCondition("EQ", [["2022-02-25T07:06:30+01:00", "Europe/Berlin"]], undefined, undefined, ConditionValidated.NotValidated);
		var oException;
		sinon.spy(oValueType, "validateValue");
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
		assert.ok(oStringType.validateValue.calledWith("Europe/Berlin"), "validateValue of StringType called with current timezone");
		assert.notOk(oOriginalType.validateValue.called, "validateValue of originalDateType not called");

	});

	var oFieldHelp;
	var bAsyncCalled;
	var fnAsync = function(oPromise) {
		bAsyncCalled = true;
		if (!(oPromise instanceof Promise)) {
			throw new Error("needs promise");
		}
	};

	QUnit.module("Key/Description using FieldHelpBase", {
		beforeEach: function() {
			oFieldHelp = new FieldHelpBase("FH1");
			var oStub = sinon.stub(oFieldHelp, "getTextForKey");
			oStub.withArgs("I1").returns("Item1");
			oStub.withArgs("I2").returns({key: "i2", description: "Item 2", inParameters: {in1: "I2"}, outParameters: {out1: "I2"}});
			oStub.withArgs("I3").returns("Item3");
			oStub = sinon.stub(oFieldHelp, "getKeyForText");
			oStub.withArgs("Item1").returns("I1");
			oStub.withArgs("Item2").returns({key: "i2", description: "Item 2", inParameters: {in1: "I2"}, outParameters: {out1: "I2"}});
			oStub.withArgs("Item3").returns("I3");
			var fnGetItemsForValue = function(oConfig) {
				if (oConfig.value === "I1" || oConfig.value === "Item1") {
					return {key: "I1", description: "Item1"};
				} else if (oConfig.value === "I2" || oConfig.value === "Item2") {
					return {key: "i2", description: "Item 2", inParameters: {in1: "I2"}, outParameters: {out1: "I2"}};
				} else if (oConfig.value === "I3" || oConfig.value === "Item3") {
					return {key: "I3", description: "Item3"};
				} else if (oConfig.value === "YY") {
					throw new Error("myError");
				} else if (oConfig.value === "ZZZ") {
					throw new ParseException("myParseException");
				}
				return null;
			};
			oStub = sinon.stub(oFieldHelp, "getItemForValue").callsFake(fnGetItemsForValue);

			oConditionType = new ConditionType({
				display: FieldDisplay.Description,
				fieldHelpID: "FH1",
				operators: ["EQ"],
				asyncParsing: fnAsync,
				delegate: FieldBaseDelegate,
				bindingContext: "BC", // just dummy to test forwarding to fieldHelp
				conditionModel: "CM", // just dummy to test forwarding to fieldHelp
				conditionModelName: "Name", // just dummy to test forwarding to fieldHelp
				control: "Control" // just dummy to test forwarding to fieldHelp
			});
		},
		afterEach: function() {
			oFieldHelp.destroy();
			oFieldHelp = undefined;
			oConditionType.destroy();
			oConditionType = undefined;
			bAsyncCalled = undefined;
		}
	});

	QUnit.test("Formatting: key -> description (from condition)", function(assert) {

		var oCondition = Condition.createItemCondition("I1", "Text1");
		var sResult = oConditionType.formatValue(oCondition);
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

		var oCondition = Condition.createCondition("EQ", ["I1"], undefined, undefined, ConditionValidated.Validated);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Item1", "Result of formatting");
		assert.ok(oFieldHelp.getTextForKey.calledWith("I1", undefined, undefined, "BC", "CM", "Name"), "getTextForKey called");

		oConditionType.oFormatOptions.display = FieldDisplay.DescriptionValue; // fake setting directly
		oCondition.values.push(undefined);
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Item1 (I1)", "Result of formatting");

		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly
		oCondition = Condition.createCondition("EQ", ["I2"], undefined, undefined, ConditionValidated.Validated);
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "i2 (Item 2)", "Result of formatting");

		oConditionType.oFormatOptions.preventGetDescription = true; // fake setting directly
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "I2", "Result of formatting");

	});

	QUnit.test("Formatting: invalid key -> description (from help)", function(assert) {

		oFieldHelp.getTextForKey.withArgs("X").throws(new FormatException("Value \"X\" does not exist."));
		var oCondition = Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.Validated);
		var oException;

		try {
			oConditionType.formatValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException.message, "Value \"X\" does not exist.", "error text");

	});

	QUnit.test("Formatting: key -> description (from help) Async", function(assert) {

		// test fallbacks without delegate
		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		var oCondition = Condition.createCondition("EQ", ["I1"], undefined, undefined, ConditionValidated.Validated);
		oFieldHelp.getTextForKey.restore();
		var oStub = sinon.stub(oFieldHelp, "getTextForKey");

		oStub.callsFake(function(vKey) {
			var oPromise = new Promise(function(fResolve) {
				setTimeout(function () { // simulate request
					var vResult;
					switch (vKey) {
					case "I1":
						vResult = "Item1";
						break;

					case "I2":
						vResult = {key: "i2", description: "Item2"};
						break;

					case "I3":
						vResult = "Item3";
						break;

					default:
						break;
					}

					fResolve(vResult);
				}, 0);
			});
			return oPromise;
		});

		var sResult = oConditionType.formatValue(oCondition);
		assert.ok(sResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		sResult.then(function(sDescription) {
			assert.equal(sDescription, "Item1", "Result of formatting");

			oCondition.values.push(undefined);
			sResult = oConditionType.formatValue(oCondition);
			assert.ok(sResult instanceof Promise, "Promise returned");

			sResult.then(function(sDescription) {
				assert.equal(sDescription, "Item1", "Result of formatting");

				oCondition = Condition.createCondition("EQ", ["I2"], undefined, undefined, ConditionValidated.Validated);
				sResult = oConditionType.formatValue(oCondition);
				assert.ok(sResult instanceof Promise, "Promise returned");

				sResult.then(function(sDescription) {
					assert.equal(sDescription, "Item2", "Result of formatting");
					fnDone();
				});
			});
		});

	});

	QUnit.test("Formatting: key -> description (from help) with error Async", function(assert) {

		var oCondition = Condition.createCondition("EQ", ["I1"], undefined, undefined, ConditionValidated.Validated);
		oFieldHelp.getTextForKey.restore();
		var oStub = sinon.stub(oFieldHelp, "getTextForKey");

		oStub.callsFake(function(vKey) {
			var oPromise = new Promise(function(fResolve, fReject) {
				setTimeout(function () { // simulate request
					try {
						throw new FormatException("Cannot format value " + vKey);
					} catch (oError) {
						fReject(oError);
					}
				}, 0);
			});
			return oPromise;
		});

		var sResult = oConditionType.formatValue(oCondition);
		assert.ok(sResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		sResult.catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof FormatException, "Error is a FormatException");
			assert.equal(oError.message, "Cannot format value I1", "Error message");

			oFieldHelp.setValidateInput(false);
			sResult = oConditionType.formatValue(oCondition);
			assert.ok(sResult instanceof Promise, "Promise returned");

			sResult.then(function(sDescription) {
				assert.equal(sDescription, "I1", "Result of formatting");
				fnDone();
			});
		});

	});

	QUnit.test("Parsing: description -> key", function(assert) {

		var oCondition = oConditionType.parseValue("Item1");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "I1", "Values entry0");
		assert.equal(oCondition.values[1], "Item1", "Values entry1");
		assert.notOk(oCondition.inParameters, "no in-parameters returned");
		assert.notOk(oCondition.outParameters, "no out-parameters returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
		assert.notOk(bAsyncCalled, "asyncParsing function not called");

		oCondition = oConditionType.parseValue("Item2");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "i2", "Values entry0");
		assert.equal(oCondition.values[1], "Item 2", "Values entry1");
		assert.deepEqual(oCondition.inParameters, {in1: "I2"} , "in-parameters returned");
		assert.deepEqual(oCondition.outParameters, {out1: "I2"} , "out-parameters returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
		assert.notOk(bAsyncCalled, "asyncParsing function not called");

	});

	QUnit.test("Parsing: key -> key and description", function(assert) {

		// test fallbacks without delegate
		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		var oCondition = oConditionType.parseValue("I2");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "i2", "Values entry0");
		assert.equal(oCondition.values[1], "Item 2", "Values entry1");
		assert.deepEqual(oCondition.inParameters, {in1: "I2"} , "in-parameters returned");
		assert.deepEqual(oCondition.outParameters, {out1: "I2"} , "out-parameters returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

	});

	QUnit.test("Parsing: key and description -> key and Description (from help)", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly

		var oCondition = oConditionType.parseValue("I2 (X)");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "i2", "Values entry0");
		assert.equal(oCondition.values[1], "Item 2", "Values entry1");
		assert.deepEqual(oCondition.inParameters, {in1: "I2"} , "in-parameters returned");
		assert.deepEqual(oCondition.outParameters, {out1: "I2"} , "out-parameters returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
		assert.ok(oFieldHelp.getItemForValue.calledWith({value: "I2", parsedValue: "I2", dataType: oConditionType._oDefaultType, inParameters: undefined, outParameters: undefined, bindingContext: "BC", checkKeyFirst: true, checkKey: true, checkDescription: true, conditionModel: "CM", conditionModelName: "Name", exception: ParseException, control: "Control"}), "getItemForValue called");

		oCondition = oConditionType.parseValue("Item3");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "I3", "Values entry0");
		assert.equal(oCondition.values[1], "Item3", "Values entry1");
		assert.notOk(oCondition.inParameters, "no in-parameters returned");
		assert.notOk(oCondition.outParameters, "no out-parameters returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

		oCondition = oConditionType.parseValue("x (Item2)");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "i2", "Values entry0");
		assert.equal(oCondition.values[1], "Item 2", "Values entry1");
		assert.deepEqual(oCondition.inParameters, {in1: "I2"} , "in-parameters returned");
		assert.deepEqual(oCondition.outParameters, {out1: "I2"} , "out-parameters returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

	});

	QUnit.test("Parsing: key and description -> key and Description (from help) with error", function(assert) {

		// test fallbacks without delegate
		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		var oType = new StringType({}, {maxLength: 2}); // use type to test invalid key is not checked for description
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly
		var oException;
		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "Value \"X\" does not exist.", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		oFieldHelp.getItemForValue.resetHistory();
		oException = null;

		try {
			oConditionType.parseValue("XXX");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "Value \"XXX\" does not exist.", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		// test own error (like runtime error) just forwarded
		oFieldHelp.getItemForValue.resetHistory();
		oException = null;
		try {
			oConditionType.parseValue("YY");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "myError", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		oFieldHelp.getItemForValue.resetHistory();
		oException = null;
		oConditionType.oFormatOptions.display = FieldDisplay.DescriptionValue; // fake setting directly

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException.message, "Value \"X\" does not exist.", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		oFieldHelp.getItemForValue.resetHistory();
		oException = null;

		try {
			oConditionType.parseValue("XXX");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException.message, "Value \"XXX\" does not exist.", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		oType.destroy();

	});

	QUnit.test("Parsing: description -> key with error", function(assert) {

		var oType = new StringType({}, {maxLength: 2}); // use type to test invalid key is not checked for description
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly
		var oException;

		try {
			oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "Value \"X\" does not exist.", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		// test own error (like runtime error) just forwarded
		oFieldHelp.getItemForValue.resetHistory();
		oException = null;
		try {
			oConditionType.parseValue("YY");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "myError", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		// test own error (like runtime error) just forwarded
		oFieldHelp.getItemForValue.resetHistory();
		oException = null;
		try {
			oConditionType.parseValue("YY");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "myError", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		// test invalid key because of type validation
		oFieldHelp.getItemForValue.resetHistory();
		oException = null;
		try {
			oConditionType.parseValue("ZZZ");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "myParseException", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

	});

	QUnit.test("Parsing: description -> key (from help) with default Operator", function(assert) {

		oConditionType.oFormatOptions.operators = ["EQ", "Contains"]; // fake setting directly
		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator("Contains")); // fake contains as default operator

		var oCondition = oConditionType.parseValue("X");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "Contains", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "X", "Values entry1");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		// invalid default operator
		oFieldHelp.getItemForValue.reset();
		oConditionType.oFormatOptions.operators = ["GT", "EQ"]; // fake setting directly
		oCondition = oConditionType.parseValue("X");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "GT", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "X", "Values entry1");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		// only one operator
		oFieldHelp.getItemForValue.reset();
		oConditionType.oFormatOptions.operators = ["EQ"]; // fake setting directly
		var oException;
		try {
			oCondition = oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "Value \"X\" does not exist.", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getItemForValue called");

		// use EQ operator -> if invalid don't use as default
		FilterOperatorUtil.getDefaultOperator.returns(FilterOperatorUtil.getOperator("EQ"));
		oFieldHelp.getItemForValue.reset();
		oException = undefined;
		try {
			oCondition = oConditionType.parseValue("X");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.equal(oException && oException.message, "Value \"X\" does not exist.", "error text");
		assert.ok(oFieldHelp.getItemForValue.calledOnce, "getKeyForText called");

		FilterOperatorUtil.getDefaultOperator.restore();

	});

	QUnit.test("Parsing: description -> key (from help) with custom Operator", function(assert) {

		var oOperator = new Operator({
			name: "MyContains",
			filterOperator: "Contains",
			tokenParse: "^\\*(.*)\\*$",
			tokenFormat: "*{0}*",
			valueTypes: [Operator.ValueType.Self],
			validateInput: false
		});
		FilterOperatorUtil.addOperator(oOperator);

		oOperator = new Operator({
			name: "MyInclude",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oOperator = new Operator({ // test excluding operator with validation
			name: "MyExclude",
			filterOperator: "NE",
			tokenParse: "^!=(.+)$",
			tokenFormat: "!(={0})",
			valueTypes: [Operator.ValueType.Self],
			exclude: true,
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oConditionType.oFormatOptions.operators = ["MyExclude", "MyContains", "MyInclude"]; // fake setting directly

		// existing value
		var oCondition = oConditionType.parseValue("Item3");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "MyInclude", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "I3", "Values entry0");
		assert.notOk(oCondition.inParameters, "no in-parameters returned");
		assert.notOk(oCondition.outParameters, "no out-parameters returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

		// not existing value
		oCondition = oConditionType.parseValue("X");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "MyContains", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0], "X", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

		// exlude value
		oCondition = oConditionType.parseValue("!=Item3");
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

	});

	QUnit.test("Parsing: description -> key (from help) Async", function(assert) {

		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve) {
				setTimeout(function () { // simulate request
					var vKey;
					switch (oConfig.value) {
					case "Item1":
						vKey = "I1";
						break;

					case "Item2":
						vKey = "I2";
						break;

					case "Item3":
						vKey = "I3";
						break;

					default:
						break;
					}

					var oResult;
					if (vKey) {
						oResult = {key: vKey, description: oConfig.value};
					}
					fResolve(oResult);
				}, 0);
			});
			return oPromise;
		});

		var vResult = oConditionType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.ok(bAsyncCalled, "asyncParsing function called");

		var fnDone = assert.async();
		vResult.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, "EQ", "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "I2", "Values entry0");
			assert.equal(oCondition.values[1], "Item2", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
			fnDone();
		});

	});

	QUnit.test("Parsing: key and description -> key and Description (from help) Async", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly
		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve, fReject) {
				setTimeout(function () { // simulate request
					switch (oConfig.parsedValue) {
					case "I1":
						fResolve({key: oConfig.parsedValue, description: "Item1"});
						break;

					case "I2":
						fResolve({key: "I2", description: "Item2", inParameters: {in1: "I2"}, outParameters: {out1: "I2"}});
						break;

					case "I3":
					case "Item3":
						fResolve({key: "I3", description: "Item3"});
						break;

					default:
						fReject();
					}
				}, 0);
			});
			return oPromise;
		});

		var vResult = oConditionType.parseValue("I2 (X)");
		assert.ok(vResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		vResult.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, "EQ", "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "I2", "Values entry0");
			assert.equal(oCondition.values[1], "Item2", "Values entry1");
			assert.deepEqual(oCondition.inParameters, {in1: "I2"} , "in-parameters returned");
			assert.deepEqual(oCondition.outParameters, {out1: "I2"} , "out-parameters returned");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			vResult = oConditionType.parseValue("Item3");
			assert.ok(vResult instanceof Promise, "Promise returned");

			vResult.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, "EQ", "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 2, "Values length");
				assert.equal(oCondition.values[0], "I3", "Values entry0");
				assert.equal(oCondition.values[1], "Item3", "Values entry1");
				assert.notOk(oCondition.inParameters, "no in-parameters returned");
				assert.notOk(oCondition.outParameters, "no out-parameters returned");
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

	});

	QUnit.test("Parsing: description -> key (from help) with error Async", function(assert) {

		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve, fReject) {
				var oException;
				if (oConfig.value === "Item2") {
					oException = new ParseException("Cannot parse value " + oConfig.value);
				} else {
					oException = new ParseException("not Unique " + oConfig.value);
					oException._bNotUnique = true;
				}
				throw oException;
			});
			return oPromise;
		});

		var vResult = oConditionType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		vResult.then(function(oCondition) {
			assert.notOk(true, "Promise Then must not be called");
			fnDone();
		}).catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			assert.equal(oError.message, "Cannot parse value Item2", "Error message");

			vResult = oConditionType.parseValue("Item3");
			assert.ok(vResult instanceof Promise, "Promise returned");

			vResult.then(function(oCondition) {
				assert.notOk(true, "Promise Then must not be called");
				fnDone();
			}).catch(function(oError) {
				assert.ok(oError, "Error Fired");
				assert.ok(oError instanceof ParseException, "Error is a ParseException");
				assert.equal(oError.message, "not Unique Item3", "Error message");

				oFieldHelp.setValidateInput(false);
				vResult = oConditionType.parseValue("Item2");
				assert.ok(vResult instanceof Promise, "Promise returned");

				vResult.then(function(oCondition) {
					assert.ok(true, "Promise Then must be called");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, "EQ", "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 1, "Values length");
					assert.equal(oCondition.values[0], "Item2", "Values entry0");
					assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

					vResult = oConditionType.parseValue("Item3");
					assert.ok(vResult instanceof Promise, "Promise returned");

					vResult.then(function(oCondition) {
						assert.ok(true, "Promise Then must be called");
						assert.equal(typeof oCondition, "object", "Result is object");
						assert.equal(oCondition.operator, "EQ", "Operator");
						assert.ok(Array.isArray(oCondition.values), "values are array");
						assert.equal(oCondition.values.length, 1, "Values length");
						assert.equal(oCondition.values[0], "Item3", "Values entry0");
						assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

						oConditionType.oFormatOptions.operators = []; // fake setting directly
						vResult = oConditionType.parseValue("=Item2");
						assert.ok(vResult instanceof Promise, "Promise returned");

						vResult.then(function(oCondition) {
							assert.ok(true, "Promise Then must be called");
							assert.equal(typeof oCondition, "object", "Result is object");
							assert.equal(oCondition.operator, "EQ", "Operator");
							assert.ok(Array.isArray(oCondition.values), "values are array");
							assert.equal(oCondition.values.length, 1, "Values length");
							assert.equal(oCondition.values[0], "Item2", "Values entry0");
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
		});

	});

	QUnit.test("Parsing: description -> key (from help) with default Operator Async", function(assert) {

		oConditionType.oFormatOptions.operators = []; // fake setting directly
		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator("Contains")); // fake contains as default operator
		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve, fReject) {
				throw new ParseException("Cannot parse value " + oConfig.value);
			});
			return oPromise;
		});

		var vResult = oConditionType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		vResult.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, "Contains", "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 1, "Values length");
			assert.equal(oCondition.values[0], "Item2", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch must not be called");

			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		});

	});

	QUnit.test("Parsing: description (key entered) -> key (from help) Async", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator("Contains")); // fake contains as default operator
		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve, fReject) {
				setTimeout(function () { // simulate request
					switch (oConfig.parsedValue) {
					case "I1":
						fResolve({key: oConfig.parsedValue, description: "Item1"});
						break;

					case "I2":
						fResolve({key: oConfig.parsedValue, description: "Item2"});
						break;

					case "I3":
						fResolve({key: oConfig.parsedValue, description: "Item3"});
						break;

					default:
						fReject(new ParseException("Cannot parse value " + oConfig.parsedValue));
					}
				}, 0);
			});
			return oPromise;
		});

		var vResult = oConditionType.parseValue("I2");
		assert.ok(vResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		vResult.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, "EQ", "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "I2", "Values entry0");
			assert.equal(oCondition.values[1], "Item2", "Values entry1");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			vResult = oConditionType.parseValue("X");
			assert.ok(vResult instanceof Promise, "Promise returned");
			vResult.then(function(oCondition) {
				assert.notOk(true, "Promise Then must not be called");

				FilterOperatorUtil.getDefaultOperator.restore();
				fnDone();
			}).catch(function(oError) {
				assert.ok(oError, "Error Fired");
				assert.ok(oError instanceof ParseException, "Error is a ParseException");
				assert.equal(oError.message, "Cannot parse value X", "Error message");

				oConditionType.oFormatOptions.operators = []; // fake setting directly
				vResult = oConditionType.parseValue("X");
				assert.ok(vResult instanceof Promise, "Promise returned");
				vResult.then(function(oCondition) {
					assert.ok(oCondition, "Result returned");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, "Contains", "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 1, "Values length");
					assert.equal(oCondition.values[0], "X", "Values entry1");
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

	QUnit.test("Parsing: value only -> validation from help Async", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Value; // fake setting directly
		sinon.stub(FilterOperatorUtil, "getDefaultOperator").returns(FilterOperatorUtil.getOperator("Contains")); // fake contains as default operator
		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve, fReject) {
				throw new ParseException("Cannot parse value " + oConfig.parsedValue);
			});
			return oPromise;
		});

		var vResult = oConditionType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		vResult.then(function(oCondition) {
			assert.notOk(true, "Promise Then must not be called");

			FilterOperatorUtil.getDefaultOperator.restore();
			fnDone();
		}).catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof ParseException, "Error is a ParseException");
			assert.equal(oError.message, "Cannot parse value Item2", "Error message");

			oConditionType.oFormatOptions.operators = []; // fake setting directly
			vResult = oConditionType.parseValue("Item2");
			vResult.then(function(oCondition) {
				assert.ok(oCondition, "Result returned");
				assert.equal(typeof oCondition, "object", "Result is object");
				assert.equal(oCondition.operator, "Contains", "Operator");
				assert.ok(Array.isArray(oCondition.values), "values are array");
				assert.equal(oCondition.values.length, 1, "Values length");
				assert.equal(oCondition.values[0], "Item2", "Values entry1");
				assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

				oConditionType.oFormatOptions.operators = ["EQ"]; // fake setting directly
				oFieldHelp.setValidateInput(false);
				vResult = oConditionType.parseValue("Item2");
				vResult.then(function(oCondition) {
					assert.ok(oCondition, "Result returned");
					assert.equal(typeof oCondition, "object", "Result is object");
					assert.equal(oCondition.operator, "EQ", "Operator");
					assert.ok(Array.isArray(oCondition.values), "values are array");
					assert.equal(oCondition.values.length, 1, "Values length");
					assert.equal(oCondition.values[0], "Item2", "Values entry1");
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

		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.parsedValue === "") {
				return {key: "", description: "Empty"};
			}
		});

		var oCondition = oConditionType.parseValue("");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "", "Values entry0");
		assert.equal(oCondition.values[1], "Empty", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

	});

	QUnit.test("Parsing: empty digsequence-string -> key and description", function(assert) {

		var oType = new StringType({}, {maxLength: 6, isDigitSequence: true, nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly

		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.parsedValue === "000000" && oConfig.value === "") {
				return {key: "000000", description: "Empty"};
			}
		});

		var oCondition = oConditionType.parseValue("");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "000000", "Values entry0");
		assert.equal(oCondition.values[1], "Empty", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

	});

	QUnit.test("Parsing: empty string -> key and description with not found", function(assert) {

		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.parsedValue === "" && oConfig.value === "") {
				throw new ParseException("not found");
			}
		});

		var oException;
		var oCondition;

		try {
			oCondition = oConditionType.parseValue("");
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.notOk(oCondition, "no condition returned");

	});

	QUnit.test("Parsing: empty digsequence-string -> key and description with not found", function(assert) {

		var oType = new StringType({}, {maxLength: 6, isDigitSequence: true, nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly

		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.parsedValue === "000000" && oConfig.value === "") {
				throw new ParseException("not found");
			}
		});

		var oException;
		var oCondition;

		try {
			oCondition = oConditionType.parseValue("");
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");
		assert.notOk(oCondition, "no condition returned");

	});

	QUnit.test("Parsing: empty string -> key only", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Value; // fake setting directly
		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.parsedValue === "" && oConfig.value === "") {
				return {key: "", description: "Empty"};
			}
		});

		var oCondition = oConditionType.parseValue("");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "", "Values entry0");
		assert.equal(oCondition.values[1], "Empty", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

		var oType = new StringType(); // use odata-String type to parse "" to null -> so "" cannot be a value for typing
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly

		oCondition = oConditionType.parseValue("");
		assert.notOk(oCondition, "no result returned");

		oType.destroy();

	});

	QUnit.test("Parsing: empty string -> key and description (Async)", function(assert) {

		var vResult = oConditionType.parseValue("");
		assert.equal(vResult, null, "null returned");

		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");
		var bExist = true;

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve, fReject) {
				setTimeout(function () { // simulate request
					switch (oConfig.parsedValue) {
					case "":
						if (bExist) {
							fResolve({key: "", description: "Empty"});
						} else {
							fResolve(null);
						}
						break;

					default:
						fReject(new ParseException("Cannot parse value " + oConfig.parsedValue));
					}
				}, 0);
			});
			return oPromise;
		});

		var fnDone = assert.async();
		vResult = oConditionType.parseValue("");
		assert.ok(vResult instanceof Promise, "Promise returned");
		vResult.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, "EQ", "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "", "Values entry1");
			assert.equal(oCondition.values[1], "Empty", "Values no entry2");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			bExist = false;
			vResult = oConditionType.parseValue("");
			assert.ok(vResult instanceof Promise, "Promise returned");
			vResult.then(function(oCondition) {
				assert.equal(oCondition, null, "null returned");
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

	QUnit.test("Parsing: empty string -> key only (Async)", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.Value; // fake setting directly
		var vResult = oConditionType.parseValue("");
		assert.equal(vResult, null, "null returned");

		oFieldHelp.getItemForValue.restore();
		var oStub = sinon.stub(oFieldHelp, "getItemForValue");
		var bExist = true;

		oStub.callsFake(function(oConfig) {
			var oPromise = new Promise(function(fResolve, fReject) {
				setTimeout(function () { // simulate request
					switch (oConfig.parsedValue) {
					case "":
						if (bExist) {
							fResolve({key: "", description: "Empty"});
						} else {
							fResolve(null);
						}
						break;

					default:
						fReject(new ParseException("Cannot parse value " + oConfig.parsedValue));
					}
				}, 0);
			});
			return oPromise;
		});

		var fnDone = assert.async();
		vResult = oConditionType.parseValue("");
		assert.ok(vResult instanceof Promise, "Promise returned");
		vResult.then(function(oCondition) {
			assert.ok(oCondition, "Result returned");
			assert.equal(typeof oCondition, "object", "Result is object");
			assert.equal(oCondition.operator, "EQ", "Operator");
			assert.ok(Array.isArray(oCondition.values), "values are array");
			assert.equal(oCondition.values.length, 2, "Values length");
			assert.equal(oCondition.values[0], "", "Values entry1");
			assert.equal(oCondition.values[1], "Empty", "Values no entry2");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

			bExist = false;
			vResult = oConditionType.parseValue("");
			assert.ok(vResult instanceof Promise, "Promise returned");
			vResult.then(function(oCondition) {
				assert.equal(oCondition, null, "null returned");
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

	QUnit.test("Parsing: unsing condition from navigation", function(assert) {

		var oNavigateCondition = Condition.createItemCondition("I3", "Item3", {testIn: "A"}, {testOut: "B"});
		oConditionType.oFormatOptions.navigateCondition = oNavigateCondition; // fake setting directly

		var vResult = oConditionType.parseValue("Item3");
		assert.deepEqual(vResult, oNavigateCondition, "navigationCondition returned");

		vResult = oConditionType.parseValue("Item1");
		assert.notDeepEqual(vResult, oNavigateCondition, "navigationCondition not returned");

	});

	var oUnitConditionType;
	var oOneFieldType;
	var oOneFieldConditionType;
	var oUnitType;

	QUnit.module("Currency type", {
		beforeEach: function() {
			oValueType = new CurrencyType({showMeasure: false});
			oUnitType = new CurrencyType({showNumber: false});
			oOriginalType = new CurrencyType();
			oConditionType = new ConditionType({valueType: oValueType, additionalType: oUnitType, operators: ["EQ"], originalDateType: oOriginalType, delegate: FieldBaseDelegate});
			oUnitConditionType = new ConditionType({valueType: oUnitType, additionalType: oValueType, operators: ["EQ"], hideOperator: true, originalDateType: oOriginalType, delegate: FieldBaseDelegate});
			oOneFieldType = new CurrencyType();
			oOneFieldConditionType = new ConditionType({valueType: oOneFieldType, operators: ["EQ", "BT"], delegate: FieldBaseDelegate});
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

		var oType = new CurrencyType({showMeasure: false});
		var sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspace and local dependend
		var oCondition = Condition.createCondition("EQ", [[123.45, "USD"]], undefined, undefined, ConditionValidated.Validated);
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, sValue, "Result of number formatting");

		sResult = oUnitConditionType.formatValue(oCondition);
		assert.equal(sResult, "USD", "Result of unit formatting");

		oType = new CurrencyType();
		sValue = oType.formatValue([123.45, "USD"], "string"); // because of special whitspace and local dependend
		sResult = oOneFieldConditionType.formatValue(oCondition); // formatting in display case
		assert.equal(sResult, sValue, "Result of one-field formatting");

	});

	QUnit.test("Formatting: BT - Currency", function(assert) {

		oConditionType.oFormatOptions.operators = []; // fake setting directly
		var oType = new CurrencyType({showMeasure: false});
		var sValue1 = oType.formatValue([1, "USD"], "string"); // because of special whitspace and local dependend
		var sValue2 = oType.formatValue([2, "USD"], "string"); // because of special whitspace and local dependend
		var oCondition = Condition.createCondition("BT", [[1, "USD"], [2, "USD"]]);
		var sResult = oConditionType.formatValue(oCondition);
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

		var oException;
		var oCondition = Condition.createCondition("EQ", ["X"]);

		try {
			oConditionType.formatValue(oCondition);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: unit from FieldHelp", function(assert) {

		oFieldHelp = new FieldHelpBase("FH1");
		var oStub = sinon.stub(oFieldHelp, "getTextForKey");
		oStub.withArgs("EUR").returns("Euro");
		oUnitConditionType.oFormatOptions.fieldHelpID = "FH1"; // fake setting directly
		oUnitConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		var oCondition = Condition.createCondition("EQ", [[123.45, "EUR"]], undefined, undefined, ConditionValidated.Validated);

		var sResult = oUnitConditionType.formatValue(oCondition);
		assert.equal(sResult, "Euro", "Result of unit formatting");

		oFieldHelp.destroy();
		oFieldHelp = undefined;

	});

	QUnit.test("Parsing: with unit", function(assert) {

		sinon.spy(oValueType, "parseValue");
		sinon.stub(oValueType, "getParseWithValues").returns(true); // fake parseWithValue (to simulate oData type)

		var oCondition = oConditionType.parseValue("1.23");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.deepEqual(oCondition.values[0][1], null, "Values entry1"); // deepEqual to distinguish between null and undefined
		assert.ok(oValueType.parseValue.calledWith("1.23", "string", []), "parseValue of type called with currentValue");

		oCondition = oUnitConditionType.parseValue("USD");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");

		oCondition = oConditionType.parseValue("123.45");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
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
		assert.equal(oCondition.operator, "BT", "Operator");
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
//		assert.equal(oCondition.operator, "EQ", "Operator"); // as it don't have the old condition just the old value
//		assert.ok(Array.isArray(oCondition.values), "values are array");
//		assert.equal(oCondition.values.length, 1, "Values length");
//		assert.equal(oCondition.values[0].length, 2, "Values0 length");
//		assert.ok(isNaN(oCondition.values[0][0]), "Values entry0"); // as number is cleared by type if unit is cleared
//		assert.equal(oCondition.values[0][1], null, "Values entry1");

		var oException;

		try {
			oCondition = oConditionType.parseValue("");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired (Currency cannot parse empty value)");

		// test number and unit entered in one field
		var oType = new CurrencyType();
		var sValue = oType.formatValue([1.23, "USD"], "string"); // because of special whitspace and local dependend
		oCondition = oOneFieldConditionType.parseValue(sValue);
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");
		oType.destroy();

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

		var oCondition = oConditionType.parseValue("1.23");
		oCondition = oUnitConditionType.parseValue("USD");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");

		oCondition = oConditionType.parseValue("");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 0, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");

		// oCondition = oUnitConditionType.parseValue("");
		// assert.ok(oCondition, "Result returned");
		// assert.equal(typeof oCondition, "object", "Result is object");
		// assert.equal(oCondition.operator, "EQ", "Operator");
		// assert.ok(Array.isArray(oCondition.values), "values are array");
		// assert.equal(oCondition.values.length, 1, "Values length");
		// assert.equal(oCondition.values[0].length, 2, "Values0 length");
		// assert.equal(oCondition.values[0][0], 0, "Values entry0");
		// assert.equal(oCondition.values[0][1], "", "Values entry1");

	});

	QUnit.test("Parsing: BT with unit", function(assert) {

		oConditionType.oFormatOptions.operators = ["EQ", "BT"]; // fake setting directly
		sinon.spy(oValueType, "parseValue");
		sinon.stub(oValueType, "getParseWithValues").returns(true); // fake parseWithValue

		var oCondition = oConditionType.parseValue("1.23...4.56");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "BT", "Operator");
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

		oUnitConditionType.oFormatOptions.operators = ["EQ", "BT"]; // fake setting directly
		var oException;

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

		var oCondition = oConditionType.parseValue("1.23");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1.23, "Values0 entry0");
		assert.deepEqual(oCondition.values[0][1], null, "Values0 entry1"); // deepEqual to distinguish between null and undefined
		assert.deepEqual(oCondition.values[0][1], null, "Values entry1"); // deepEqual to distinguish between null and undefined
		assert.ok(oValueType.parseValue.calledWith("1.23", "string", []), "parseValue of type called with currentValue");

	});

	QUnit.test("Parsing: unit from FieldHelp", function(assert) {

		oFieldHelp = new FieldHelpBase("FH1", {validateInput: false}); // test invalid input returned if OK for Type
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "Euro") {
				return {key: "EUR", description: "Euro"};
			} else if (oConfig.value === "USD" || oConfig.value === "X") {
				throw new ParseException("Cannot parse value " + oConfig.parsedValue);
			}
		});
		oUnitConditionType.oFormatOptions.fieldHelpID = "FH1"; // fake setting directly
		oUnitConditionType.oFormatOptions.display = FieldDisplay.Description; // fake setting directly
		oUnitType._aCurrentValue = [1, "USD"]; // fake existing value
		oValueType._aCurrentValue = [1, "USD"]; // fake existing value

		var oCondition = oUnitConditionType.parseValue("Euro");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1, "Values entry0");
		assert.equal(oCondition.values[0][1], "EUR", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");

		oCondition = oUnitConditionType.parseValue("USD"); // valid currency for type but not for Help
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 1, "Values length");
		assert.equal(oCondition.values[0].length, 2, "Values0 length");
		assert.equal(oCondition.values[0][0], 1, "Values entry0");
		assert.equal(oCondition.values[0][1], "USD", "Values entry1");
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "condition not validated");

		var oException;

		try {
			oCondition = undefined;
			oCondition = oUnitConditionType.parseValue("X"); // invalid currency
		} catch (e) {
			oException = e;
		}

		assert.notOk(oCondition, "No Result returned");
		assert.ok(oException, "Exception returned");
		assert.ok(oException instanceof ParseException, "Exception is a ParseException");

//		oCondition = oUnitConditionType.parseValue("");
//		assert.ok(oCondition, "Result returned");
//		assert.equal(typeof oCondition, "object", "Result is object");
//		assert.equal(oCondition.operator, "EQ", "Operator");
//		assert.ok(Array.isArray(oCondition.values), "values are array");
//		assert.equal(oCondition.values.length, 1, "Values length");
//		assert.equal(oCondition.values[0].length, 2, "Values0 length");
//		assert.ok(isNaN(oCondition.values[0][0]), "Values entry0"); // as number is cleared by type if unit is cleared
//		assert.equal(oCondition.values[0][1], null, "Values entry1");

		oFieldHelp.destroy();
		oFieldHelp = undefined;

	});

	QUnit.test("Validation: with unit", function(assert) {

		sinon.spy(oValueType, "validateValue");
		sinon.spy(oUnitType, "validateValue");

		var oCondition = Condition.createCondition("EQ", [[123.45, "USD"]]);
		oConditionType.validateValue(oCondition);

		assert.ok(oValueType.validateValue.calledWith([123.45, "USD"]), "Currency type used for validation");

		oUnitConditionType.validateValue(oCondition);
		assert.ok(oValueType.validateValue.calledOnce, "Currency type not used for unit validation");
		assert.ok(oUnitType.validateValue.calledWith([123.45, "USD"]), "Unit type used for validation");

	});

	QUnit.module("Not nullable type", {
		beforeEach: function() {
			oValueType = new StringType({}, {nullable: false});
			oConditionType = new ConditionType({valueType: oValueType, fieldPath: "X", operators: ["EQ"]});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Validating: null", function(assert) {

		var oException;

		try {
			oConditionType.validateValue(null);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.module("Not nullable type with parseKeepsEmptyString", {
		beforeEach: function() {
			oValueType = new StringType({parseKeepsEmptyString: true}, {nullable: false});
			oConditionType = new ConditionType({valueType: oValueType, fieldPath: "X", operators: ["EQ"]});
		},
		afterEach: function() {
			oConditionType.destroy();
			oConditionType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Validating: null", function(assert) {

		var oException;

		try {
			oConditionType.validateValue(null);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: null digsequence-string", function(assert) {

		var oType = new StringType({}, {maxLength: 6, isDigitSequence: true, nullable: false}); // use digsequencce to test internal format for check
		oConditionType.oFormatOptions.valueType = oType; // fake setting directly

		var oException;

		try {
			oConditionType.validateValue(null);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.module("multiple async requests", {
		beforeEach: function() {
			oFieldHelp = new FieldHelpBase("FH1");
			var oStub = sinon.stub(oFieldHelp, "getTextForKey");
			oStub.withArgs("S").returns("Sync Text");
			oStub = sinon.stub(oFieldHelp, "getItemForValue");
			oStub.withArgs("S").returns({key: "S", description: "Sync Text"});
			oStub.withArgs("Sync Text").returns({key: "S", description: "Sync Text"});

			oConditionType = new ConditionType({
				display: FieldDisplay.Description,
				fieldHelpID: "FH1",
				operators: ["EQ", "GT"],
				asyncParsing: fnAsync,
				delegate: FieldBaseDelegate,
				bindingContext: "BC", // just dummy to test forwarding to fieldHelp
				conditionModel: "CM", // just dummy to test forwarding to fieldHelp
				conditionModelName: "Name" // just dummy to test forwarding to fieldHelp
			});
		},
		afterEach: function() {
			oFieldHelp.destroy();
			oFieldHelp = undefined;
			oConditionType.destroy();
			oConditionType = undefined;
			bAsyncCalled = undefined;
		}
	});

	QUnit.test("Formatting: multiple promises", function(assert) {

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		var fResolve3;
		var oPromise3 = new Promise(function(fResolve, fReject) {
			fResolve3 = fResolve;
		});
		oFieldHelp.getTextForKey.withArgs("1").returns(oPromise1);
		oFieldHelp.getTextForKey.withArgs("2").returns(oPromise2);
		oFieldHelp.getTextForKey.withArgs("3").returns(oPromise3);

		var oCondition = Condition.createCondition("EQ", ["1"], undefined, undefined, ConditionValidated.Validated);
		var vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["2"], undefined, undefined, ConditionValidated.Validated);
		var vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["3"], undefined, undefined, ConditionValidated.Validated);
		var vResult3 = oConditionType.formatValue(oCondition);
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2("Text 2");
		fResolve3("Text 3");
		fResolve1("Text 1");

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		var fReject3;
		var oPromise3 = new Promise(function(fResolve, fReject) {
			fReject3 = fReject;
		});
		oFieldHelp.getTextForKey.withArgs("1").returns(oPromise1);
		oFieldHelp.getTextForKey.withArgs("2").returns(oPromise2);
		oFieldHelp.getTextForKey.withArgs("3").returns(oPromise3);

		var oCondition = Condition.createCondition("EQ", ["1"], undefined, undefined, ConditionValidated.Validated);
		var vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["2"], undefined, undefined, ConditionValidated.Validated);
		var vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["3"], undefined, undefined, ConditionValidated.Validated);
		var vResult3 = oConditionType.formatValue(oCondition);
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2("Text 2");
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject3(new FormatException("wrong value"));
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve1("Text 1");
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last exception is shown
		var fnDone = assert.async();

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
					assert.notOk(true, "Promise3 must not be resolved (as errot thrown)");
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

		var fReject1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fReject1 = fReject;
		});
		var fReject2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fReject2 = fReject;
		});
		var fResolve3;
		var oPromise3 = new Promise(function(fResolve, fReject) {
			fResolve3 = fResolve;
		});
		oFieldHelp.getTextForKey.withArgs("1").returns(oPromise1);
		oFieldHelp.getTextForKey.withArgs("2").returns(oPromise2);
		oFieldHelp.getTextForKey.withArgs("3").returns(oPromise3);

		var oCondition = Condition.createCondition("EQ", ["1"], undefined, undefined, ConditionValidated.Validated);
		var vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["2"], undefined, undefined, ConditionValidated.Validated);
		var vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["3"], undefined, undefined, ConditionValidated.Validated);
		var vResult3 = oConditionType.formatValue(oCondition);
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fReject2(new FormatException("wrong value"));
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve3("Text 3");
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject1(new FormatException("wrong value"));
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		oFieldHelp.getTextForKey.withArgs("1").returns(oPromise1);
		oFieldHelp.getTextForKey.withArgs("2").returns(oPromise2);

		var oCondition = Condition.createCondition("EQ", ["1"], undefined, undefined, ConditionValidated.Validated);
		var vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["2"], undefined, undefined, ConditionValidated.Validated);
		var vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		oCondition = Condition.createCondition("EQ", ["S", "Sync Text"], undefined, undefined, ConditionValidated.Validated);
		var vResult3 = oConditionType.formatValue(oCondition);
		assert.equal(vResult3, "Sync Text", "Description returned");

		fResolve2("Text 2");
		fResolve1("Text 1");

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		var fResolve3;
		var oPromise3 = new Promise(function(fResolve, fReject) {
			fResolve3 = fResolve;
		});
		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "1") {
				return oPromise1;
			} else if (oConfig.value === "2") {
				return oPromise2;
			} else if (oConfig.value === "3") {
				return oPromise3;
			}
			return null;
		});

		var vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		var vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		var vResult3 = oConditionType.parseValue("3");
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2({key: "2", description: "Text 2"});
		fResolve3({key: "3", description: "Text 3"});
		fResolve1({key: "1", description: "Text 1"});

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		var fReject3;
		var oPromise3 = new Promise(function(fResolve, fReject) {
			fReject3 = fReject;
		});
		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "1") {
				return oPromise1;
			} else if (oConfig.value === "2") {
				return oPromise2;
			} else if (oConfig.value === "3") {
				return oPromise3;
			}
			return null;
		});

		var vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		var vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		var vResult3 = oConditionType.parseValue("3");
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fResolve2({key: "2", description: "Text 2"});
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject3(new ParseException("wrong value"));
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve1({key: "1", description: "Text 1"});
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last exception is shown
		var fnDone = assert.async();

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

		var fReject1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fReject1 = fReject;
		});
		var fReject2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fReject2 = fReject;
		});
		var fResolve3;
		var oPromise3 = new Promise(function(fResolve, fReject) {
			fResolve3 = fResolve;
		});
		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "1") {
				return oPromise1;
			} else if (oConfig.value === "2") {
				return oPromise2;
			} else if (oConfig.value === "3") {
				return oPromise3;
			}
			return null;
		});

		var vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		var vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		var vResult3 = oConditionType.parseValue("3");
		assert.ok(vResult3 instanceof Promise, "Promise returned");

		fReject2(new FormatException("wrong value"));
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fResolve3({key: "3", description: "Text 3"});
		}, 0);
		setTimeout(function () { // as requests will be also asyn. (otherwise promise then will be executed before exceptions)
			fReject1(new FormatException("wrong value"));
		}, 0);

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "1") {
				return oPromise1;
			} else if (oConfig.value === "2") {
				return oPromise2;
			}
			return null;
		});

		var vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		var vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		var vResult3 = oConditionType.parseValue(">S");
		assert.equal(vResult3.values[0], "S", "Condition returned");

		fResolve2({key: "2", description: "Text 2"});
		fResolve1({key: "1", description: "Text 1"});

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		oFieldHelp.getTextForKey.withArgs("1").returns(oPromise1);
		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "1") {
				return oPromise1;
			} else if (oConfig.value === "2") {
				return oPromise2;
			}
			return null;
		});

		var oCondition = Condition.createCondition("EQ", ["1"], undefined, undefined, ConditionValidated.Validated);
		var vResult1 = oConditionType.formatValue(oCondition);
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		var vResult2 = oConditionType.parseValue("2");
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		fResolve2({key: "2", description: "Text 2"});
		fResolve1("Text 1");

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

		var fResolve1;
		var oPromise1 = new Promise(function(fResolve, fReject) {
			fResolve1 = fResolve;
		});
		var fResolve2;
		var oPromise2 = new Promise(function(fResolve, fReject) {
			fResolve2 = fResolve;
		});
		oFieldHelp.getItemForValue.restore();
		sinon.stub(oFieldHelp, "getItemForValue").callsFake(function(oConfig) {
			if (oConfig.value === "1") {
				return oPromise1;
			} else if (oConfig.value === "2") {
				return oPromise2;
			}
			return null;
		});
		oFieldHelp.getTextForKey.withArgs("2").returns(oPromise2);

		var vResult1 = oConditionType.parseValue("1");
		assert.ok(vResult1 instanceof Promise, "Promise returned");

		var oCondition = Condition.createCondition("EQ", ["2"], undefined, undefined, ConditionValidated.Validated);
		var vResult2 = oConditionType.formatValue(oCondition);
		assert.ok(vResult2 instanceof Promise, "Promise returned");

		fResolve2("Text 2");
		fResolve1({key: "1", description: "Text 1"});

		// all promises resolved after the last one should return the result of the last one -> at the end the last value is shown
		var fnDone = assert.async();
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

	// Just test usage of API. Interaction is already tested with FieldHelpBase
	var oValueHelp;
	QUnit.module("Key/Description using ValueHelp", {
		beforeEach: function() {
			oValueHelp = new ValueHelp("VH1");
			sinon.spy(oValueHelp, "getTextForKey");
			sinon.spy(oValueHelp, "getKeyForText");
			var fnGetItemsForValue = function(oConfig) {
				if (oConfig.value === "I1" || oConfig.value === "Item1") {
					return {key: "I1", description: "Item1"};
				} else if (oConfig.value === "I2" || oConfig.value === "Item2") {
					return {key: "i2", description: "Item 2", payload: {in1: "I2", out1: "I2"}};
				} else if (oConfig.value === "I3" || oConfig.value === "Item3") {
					return {key: "I3", description: "Item3"};
				} else if (oConfig.value === "YY") {
					throw new Error("myError");
				} else if (oConfig.value === "ZZZ") {
					throw new ParseException("myParseException");
				}
				return null;
			};
			sinon.stub(oValueHelp, "getItemForValue").callsFake(fnGetItemsForValue);
			sinon.stub(oValueHelp, "isValidationSupported").returns(true);

			oValueType = new StringType(); // use odata-String type to parse "" to null -> so "" cannot be a value for typing
			oConditionType = new ConditionType({
				valueType: oValueType,
				display: FieldDisplay.Description,
				fieldHelpID: "VH1",
				operators: ["EQ"],
				asyncParsing: fnAsync,
				delegate: FieldBaseDelegate,
				bindingContext: "BC", // just dummy to test forwarding to fieldHelp
				conditionModel: "CM", // just dummy to test forwarding to fieldHelp
				conditionModelName: "Name", // just dummy to test forwarding to fieldHelp
				control: "Control" // just dummy to test forwarding to fieldHelp
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

	QUnit.test("Formatting: key -> description (from help)", function(assert) {

		var oCondition = Condition.createCondition("EQ", ["I1"], undefined, undefined, ConditionValidated.Validated);
		var oConfig = { // to compare
			value: "I1",
			parsedValue: "I1",
			dataType: oValueType,
			checkKey: true,
			checkDescription: false,
			context: {inParameters: undefined, outParameters: undefined, payload: undefined},
			bindingContext: "BC",
			conditionModel: "CM",
			conditionModelName: "Name",
			control: "Control",
			caseSensitive: true,
			exception: FormatException
		};
		var sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Item1", "Result of formatting");
		assert.notOk(oValueHelp.getTextForKey.called, "getTextForKey not called");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		oValueHelp.getItemForValue.resetHistory();
		sResult = oConditionType.formatValue(oCondition);
		assert.equal(sResult, "Item1", "Result of formatting");
		assert.notOk(oValueHelp.getTextForKey.called, "getTextForKey not called");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

	});

	QUnit.test("Parsing: key and description -> key and Description (from help)", function(assert) {

		oConditionType.oFormatOptions.display = FieldDisplay.ValueDescription; // fake setting directly

		var oCondition = oConditionType.parseValue("I2 (X)");
		var oConfig = { // to compare
			value: "I2",
			parsedValue: "I2",
			dataType: oValueType,
			checkKey: true,
			checkKeyFirst: true,
			checkDescription: true,
			inParameters: undefined, // TODO: needed?
			outParameters: undefined, // TODO: needed?
			bindingContext: "BC",
			conditionModel: "CM",
			conditionModelName: "Name",
			control: "Control",
			exception: ParseException
		};
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "i2", "Values entry0");
		assert.equal(oCondition.values[1], "Item 2", "Values entry1");
		assert.deepEqual(oCondition.payload, {in1: "I2", out1: "I2"} , "payload returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

		oConditionType.oFormatOptions.delegate = undefined; // fake setting directly
		oValueHelp.getItemForValue.resetHistory();
		oCondition = oConditionType.parseValue("I2 (X)");
		assert.ok(oCondition, "Result returned");
		assert.equal(typeof oCondition, "object", "Result is object");
		assert.equal(oCondition.operator, "EQ", "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are array");
		assert.equal(oCondition.values.length, 2, "Values length");
		assert.equal(oCondition.values[0], "i2", "Values entry0");
		assert.equal(oCondition.values[1], "Item 2", "Values entry1");
		assert.deepEqual(oCondition.payload, {in1: "I2", out1: "I2"} , "payload returned");
		assert.equal(oCondition.validated, ConditionValidated.Validated, "condition validated");
		assert.ok(oValueHelp.getItemForValue.calledWith(oConfig), "getItemForValue called with config");

	});

});
