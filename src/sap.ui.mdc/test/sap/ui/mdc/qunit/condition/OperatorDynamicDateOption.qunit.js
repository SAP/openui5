/*!
 * ${copyright}
 */

/* global QUnit */
/*eslint no-warning-comments: 0 */

sap.ui.define([
	"sap/ui/mdc/condition/OperatorDynamicDateOption",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/model/ValidateException",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Integer",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UniversalDateUtils",
	"sap/m/DynamicDateValueHelpUIType",
	"sap/m/DynamicDateRange",
	"sap/m/DynamicDateUtil",
	"sap/m/Slider",
	"sap/m/DatePicker",
	"sap/m/DateTimePicker"
], function(
	OperatorDynamicDateOption,
	Operator,
	RangeOperator,
	BaseType,
	ValidateException,
	FilterOperator,
	DateType,
	DateTimeType,
	IntegerType,
	UniversalDate,
	UniversalDateUtils,
	DynamicDateValueHelpUIType,
	DynamicDateRange,
	DynamicDateUtil,
	Slider,
	DatePicker,
	DateTimePicker
) {
	"use strict";

	var oType;
	var oOperator;
	var oOperatorDynamicDateOption;
	var oDynamicDateRange;

	var fnTeardown = function() {
		oOperatorDynamicDateOption.destroy();
		oOperatorDynamicDateOption = undefined;
		oType.destroy();
		oType = undefined;
		oOperator = undefined;
		oDynamicDateRange.destroy();
		oDynamicDateRange = undefined;
	};

	QUnit.module("Date type", {
		beforeEach: function() {
			oType = new DateType({style: "long", calendarType: "Gregorian", UTC: true}); // UTC to check conversion
			oOperator = new Operator({
				name: "Range",
				// alias: "DATERANGE",
				filterOperator: FilterOperator.BT,
				tokenParse: "^([^!].*):::(.+)$", // just some pattern
				tokenFormat: "{0}:::{1}",
				longText: "My Range",
				group: {id: 9, text: "My group"},
				valueTypes: [Operator.ValueType.Self, Operator.ValueType.Self],
				validate: function(aValues, oType) {
					// in Between 2 different Values must be defined
					if (aValues.length === 2) { // if aValues has wrong length this is checked in default logic
						if (!aValues[0] && !aValues[1]) {
							return; // let empty condition be valid
						} else if (!aValues[0] || !aValues[1]) {
							throw new ValidateException("Missing value"); //"Between must have two values"
						} else if (aValues[0] === aValues[1]) {
							throw new ValidateException("Same Values"); //"Between must have two different values"
						}
					}

					Operator.prototype.validate.apply(this, [aValues, oType]);
				}
			});
			oOperatorDynamicDateOption = new OperatorDynamicDateOption("O1", {
				key: "Date-Range",
				operator: oOperator,
				type: oType,
				baseType: BaseType.Date
			});
			DynamicDateUtil.addOption(oOperatorDynamicDateOption);

			oDynamicDateRange = new DynamicDateRange("DDR1", { // needed for UI functions
				formatter: {date: {style: "long"}}
			});
		},

		afterEach: fnTeardown
	});

	QUnit.test("wrong configuration", function(assert) {

		var oException;

		try {
			oOperatorDynamicDateOption.setOperator({x: "X"});
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException.message, '"[object Object]" is of type object, expected sap.ui.mdc.condition.Operator for property "operator" of Element sap.ui.mdc.condition.OperatorDynamicDateOption#O1', "error message");

		oException = undefined;

		try {
			oOperatorDynamicDateOption.setType({x: "X"});
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.equal(oException.message, '"[object Object]" is of type object, expected sap.ui.model.Type for property "type" of Element sap.ui.mdc.condition.OperatorDynamicDateOption#O1', "error message");

	});

	QUnit.test("getKey", function(assert) {

		var sKey = oOperatorDynamicDateOption.getKey();
		assert.equal(sKey, "Date-Range", "Key of Option returned");

	});

	QUnit.test("isRange", function(assert) {

		var bRange = oOperatorDynamicDateOption.isRange();
		assert.notOk(bRange, "Not a RangeOperator"); // TODO: is something like Between a range?

	});

	QUnit.test("getText", function(assert) {

		var sText = oOperatorDynamicDateOption.getText();
		assert.equal(sText, "My Range", "Text");

	});

	QUnit.test("getGroup", function(assert) {

		var iGroup = oOperatorDynamicDateOption.getGroup();
		assert.equal(iGroup, 9, "Group");

	});

	QUnit.test("getGroupHeader", function(assert) {

		var sText = oOperatorDynamicDateOption.getGroupHeader();
		assert.equal(sText, "My group", "Group header");

	});

	QUnit.test("getValueHelpUITypes", function(assert) {

		var aDynamicDateValueHelpUIType = oOperatorDynamicDateOption.getValueHelpUITypes();
		assert.ok(Array.isArray(aDynamicDateValueHelpUIType), "Array returned");
		assert.equal(aDynamicDateValueHelpUIType.length, 2, "Array length");
		assert.ok(aDynamicDateValueHelpUIType[0] instanceof DynamicDateValueHelpUIType, "DynamicDateValueHelpUIType returned");
		assert.equal(aDynamicDateValueHelpUIType[0].getType(), "date", "type of oDynamicDateValueHelpUIType");
		assert.ok(aDynamicDateValueHelpUIType[1] instanceof DynamicDateValueHelpUIType, "DynamicDateValueHelpUIType returned");
		assert.equal(aDynamicDateValueHelpUIType[1].getType(), "date", "type of oDynamicDateValueHelpUIType");

	});

	QUnit.test("createValueHelpUI", function(assert) {

		var iChange = 0;
		var fnChange = function(oEvent) {
			iChange++;
		};

		var oValue = {
			operator: "Date-Range",
			values: [new Date(Date.UTC(2021, 9, 4)), new Date(Date.UTC(2021, 9, 5))]
		};
		oDynamicDateRange.setValue(oValue);

		var aControls = oOperatorDynamicDateOption.createValueHelpUI(oDynamicDateRange, fnChange);
		assert.ok(Array.isArray(aControls), "Array returned");
		assert.equal(aControls.length, 2, "2 controls created");
		assert.ok(aControls[0].isA("sap.m.DatePicker"), "First control is DatePicker");
		assert.ok(aControls[1].isA("sap.m.DatePicker"), "Second control is DatePicker");
		assert.deepEqual(aControls[0].getDateValue(), new Date(2021, 9, 4), "DateValue of first DatePicker");
		assert.equal(aControls[0].getDisplayFormat(), "long", "displayFormat of first DatePicker");
		assert.equal(aControls[0].getDisplayFormatType(), "Gregorian", "displayFormatType of first DatePicker");
		assert.deepEqual(aControls[1].getDateValue(), new Date(2021, 9, 5), "DateValue of second DatePicker");
		assert.equal(aControls[1].getDisplayFormat(), "long", "displayFormat of second DatePicker");
		assert.equal(aControls[1].getDisplayFormatType(), "Gregorian", "displayFormatType of second DatePicker");

		aControls[0].fireChange();
		assert.equal(iChange, 1, "Change function called for first DatePicker");
		aControls[1].fireChange();
		assert.equal(iChange, 2, "Change function called for second DatePicker");

		// check getValueHelpOutput here as UI needs to be created before
		var oResult = oOperatorDynamicDateOption.getValueHelpOutput(oDynamicDateRange);
		assert.ok(oResult, "getValueHelpOutput returns result");
		assert.deepEqual(oResult, oValue, "Result returns right dates");

		// check validateValueHelpUI here as UI needs to be created before
		var bValid = oOperatorDynamicDateOption.validateValueHelpUI(oDynamicDateRange);
		assert.ok(bValid, "validateValueHelpUI: valid");

		aControls[1].setDateValue(); // make empty to check if invalid
		bValid = oOperatorDynamicDateOption.validateValueHelpUI(oDynamicDateRange);
		assert.notOk(bValid, "validateValueHelpUI: not valid");

		// cleanup as normally destroyed by DynamicDateRange control
		for (var i = 0; i < aControls.length; i++) {
			aControls[i].destroy();
		}

	});

	QUnit.test("toDates", function(assert) {

		var oValue = {
			operator: "Date-Range",
			values: [new Date(Date.UTC(2021, 9, 4)), new Date(Date.UTC(2021, 9, 5))]
		};

		var aRange = oOperatorDynamicDateOption.toDates(oValue);
		assert.ok(Array.isArray(aRange), "Array returned");
		assert.equal(aRange.length, 2, "Range length");
		assert.deepEqual(aRange[0], new Date(2021, 9, 4), "First value");
		assert.deepEqual(aRange[1], new Date(2021, 9, 5), "Second value");

	});

	QUnit.test("format", function(assert) {

		var oValue = {
			operator: "Date-Range",
			values: [new Date(Date.UTC(2021, 9, 4)), new Date(Date.UTC(2021, 9, 5))]
		};
		var sCheckResult = oType.formatValue(oValue.values[0], "string") + ":::" + oType.formatValue(oValue.values[1], "string"); // to have language independednt test (need not to check formmting of type here)

		var sResult = oOperatorDynamicDateOption.format(oValue);
		assert.equal(sResult, sCheckResult, "formatted value");

	});

	QUnit.test("parse", function(assert) {

		var oValue = {
			operator: "Date-Range",
			values: [new Date(Date.UTC(2021, 9, 4)), new Date(Date.UTC(2021, 9, 5))]
		};
		var sCheckValue = oType.formatValue(oValue.values[0], "string") + ":::" + oType.formatValue(oValue.values[1], "string"); // to have language independednt test (need not to check formmting of type here)

		var oResult = oOperatorDynamicDateOption.parse(sCheckValue);
		assert.deepEqual(oResult, oValue, "parsed value");

	});

	QUnit.test("enhanceFormattedValue", function(assert) {

		var bEnhance = oOperatorDynamicDateOption.enhanceFormattedValue();
		assert.notOk(bEnhance, "must not be enhanced");

	});

	QUnit.module("DateTime type", {
		beforeEach: function() {
			oType = new DateTimeType({style: "long", calendarType: "Gregorian", UTC: true}); // UTC to check conversion
			oOperator = new Operator({
				name: "Equal",
				// alias: "DATERANGE",
				filterOperator: FilterOperator.EQ,
				tokenParse: "^=(.+)$", // just some pattern
				tokenFormat: "={0}",
				longText: "My Equal",
				valueTypes: [Operator.ValueType.Self]
			});
			oOperatorDynamicDateOption = new OperatorDynamicDateOption("O1", {
				key: "DateTime-Equal",
				operator: oOperator,
				type: oType,
				baseType: BaseType.DateTime
			});
			DynamicDateUtil.addOption(oOperatorDynamicDateOption);

			oDynamicDateRange = new DynamicDateRange("DDR1", { // needed for UI functions
				formatter: {date: {style: "long"}}
			});
		},

		afterEach: fnTeardown
	});

	QUnit.test("getValueHelpUITypes", function(assert) {

		var aDynamicDateValueHelpUIType = oOperatorDynamicDateOption.getValueHelpUITypes();
		assert.ok(Array.isArray(aDynamicDateValueHelpUIType), "Array returned");
		assert.equal(aDynamicDateValueHelpUIType.length, 1, "Array length");
		assert.ok(aDynamicDateValueHelpUIType[0] instanceof DynamicDateValueHelpUIType, "DynamicDateValueHelpUIType returned");
		assert.equal(aDynamicDateValueHelpUIType[0].getType(), "datetime", "type of oDynamicDateValueHelpUIType");

	});

	QUnit.test("createValueHelpUI", function(assert) {

		var iChange = 0;
		var fnChange = function(oEvent) {
			iChange++;
		};

		var oValue = {
			operator: "DateTime-Equal",
			values: [new Date(Date.UTC(2022, 0, 18, 11, 17, 30))]
		};
		oDynamicDateRange.setValue(oValue);

		var aControls = oOperatorDynamicDateOption.createValueHelpUI(oDynamicDateRange, fnChange);
		assert.ok(Array.isArray(aControls), "Array returned");
		assert.equal(aControls.length, 1, "1 control created");
		assert.ok(aControls[0].isA("sap.m.DateTimePicker"), "control is DateTimePicker");
		assert.deepEqual(aControls[0].getDateValue(), new Date(2022, 0, 18, 11, 17, 30), "DateValue of first DateTimePicker");
		assert.equal(aControls[0].getDisplayFormat(), "long", "displayFormat of first DatePicker");
		assert.equal(aControls[0].getDisplayFormatType(), "Gregorian", "displayFormatType of first DatePicker");

		aControls[0].fireChange();
		assert.equal(iChange, 1, "Change function called for DateTimePicker");

		// check getValueHelpOutput here as UI needs to be created before
		var oResult = oOperatorDynamicDateOption.getValueHelpOutput(oDynamicDateRange);
		assert.ok(oResult, "getValueHelpOutput returns result");
		assert.deepEqual(oResult, oValue, "Result returns right dates");

		// check validateValueHelpUI here as UI needs to be created before
		var bValid = oOperatorDynamicDateOption.validateValueHelpUI(oDynamicDateRange);
		assert.ok(bValid, "validateValueHelpUI: valid");

		aControls[0].setDateValue(); // make empty to check if invalid
		bValid = oOperatorDynamicDateOption.validateValueHelpUI(oDynamicDateRange);
		assert.notOk(bValid, "validateValueHelpUI: not valid");

		// cleanup as normally destroyed by DynamicDateRange control
		for (var i = 0; i < aControls.length; i++) {
			aControls[i].destroy();
		}

	});

	QUnit.test("toDates", function(assert) {

		var oValue = {
			operator: "DateTime-Equal",
			values: [new Date(Date.UTC(2022, 0, 18, 11, 17, 30))]
		};

		var aRange = oOperatorDynamicDateOption.toDates(oValue);
		assert.ok(Array.isArray(aRange), "Array returned");
		assert.equal(aRange.length, 2, "Range length");
		assert.deepEqual(aRange[0], new Date(2022, 0, 18, 11, 17, 30), "First value");
		assert.deepEqual(aRange[1], new Date(2022, 0, 18, 11, 17, 30), "Second value");

	});

	QUnit.module("Integer RangeOperator", {
		beforeEach: function() {
			oType = new DateType({style: "long", calendarType: "Gregorian", UTC: true}); // UTC to check conversion
			oOperator = new RangeOperator({
				name: "Range",
				// alias: "DATERANGE",
				filterOperator: FilterOperator.BT,
				tokenParse: "^#tokenText#$",
				tokenFormat: "#tokenText#",
				tokenText: "Range: {0}",
				longText: "My Range",
				valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 1, maximum: 4}}],
				paramTypes: ["(\\d+)"],
				defaultValues: [1],
				calcRange: function(iValue) {
					var startDate = new UniversalDate();
					iValue = iValue || 1;
					startDate.setMonth((iValue - 1) * 3 - 1);
					return UniversalDateUtils.getRange(3, "MONTH", startDate, true);
				}
			});
			oOperatorDynamicDateOption = new OperatorDynamicDateOption("O1", {
				key: "Date-Range",
				operator: oOperator,
				type: oType,
				baseType: BaseType.Date
			});
			DynamicDateUtil.addOption(oOperatorDynamicDateOption);

			oDynamicDateRange = new DynamicDateRange("DDR1", { // needed for UI functions
				formatter: {date: {style: "long"}}
			});
		},

		afterEach: fnTeardown
	});

	QUnit.test("getGroup", function(assert) {

		var iGroup = oOperatorDynamicDateOption.getGroup();
		assert.equal(iGroup, 1, "Group");

	});

	QUnit.test("getGroupHeader", function(assert) {

		var sText = oOperatorDynamicDateOption.getGroupHeader();
		assert.equal(sText, "Include", "Group header");

	});

	QUnit.test("getValueHelpUITypes", function(assert) {

		var aDynamicDateValueHelpUIType = oOperatorDynamicDateOption.getValueHelpUITypes();
		assert.ok(Array.isArray(aDynamicDateValueHelpUIType), "Array returned");
		assert.equal(aDynamicDateValueHelpUIType.length, 1, "Array length");
		assert.ok(aDynamicDateValueHelpUIType[0] instanceof DynamicDateValueHelpUIType, "DynamicDateValueHelpUIType returned");
		assert.equal(aDynamicDateValueHelpUIType[0].getType(), "int", "type of oDynamicDateValueHelpUIType");

	});

	QUnit.test("createValueHelpUI", function(assert) {

		var iChange = 0;
		var fnChange = function(oEvent) {
			iChange++;
		};

		var oValue = {
			operator: "Date-Range",
			values: [1]
		};
		// don't set value on Control to check default value

		var aControls = oOperatorDynamicDateOption.createValueHelpUI(oDynamicDateRange, fnChange);
		assert.ok(Array.isArray(aControls), "Array returned");
		assert.equal(aControls.length, 1, "1 control created");
		assert.ok(aControls[0].isA("sap.m.Input"), "Control is Input");
		assert.deepEqual(aControls[0].getValue(), "1", "Value of Input control");

		aControls[0].fireChange();
		assert.equal(iChange, 1, "Change function called for Input control");

		// check getValueHelpOutput here as UI needs to be created before
		var oResult = oOperatorDynamicDateOption.getValueHelpOutput(oDynamicDateRange);
		assert.ok(oResult, "getValueHelpOutput returns result");
		assert.deepEqual(oResult, oValue, "Result returns right dates");

		// check validateValueHelpUI here as UI needs to be created before
		var bValid = oOperatorDynamicDateOption.validateValueHelpUI(oDynamicDateRange);
		assert.ok(bValid, "validateValueHelpUI: valid");

		aControls[0].setValue(5); // check invalid input
		bValid = oOperatorDynamicDateOption.validateValueHelpUI(oDynamicDateRange);
		assert.notOk(bValid, "validateValueHelpUI: not valid");
		assert.equal(aControls[0].getValueState(), "Error", "ValueState");

		// second call -> new controls needs to be created
		var aControls2 = oOperatorDynamicDateOption.createValueHelpUI(oDynamicDateRange, fnChange);
		assert.ok(Array.isArray(aControls2), "Array returned");
		assert.equal(aControls2.length, 1, "1 control created");
		assert.ok(aControls2[0].isA("sap.m.Input"), "Control is Input");
		assert.deepEqual(aControls2[0].getValue(), "1", "Value of Input control");
		assert.ok(aControls[0].bIsDestroyed, "old control destroyed");

		// cleanup as normally destroyed by DynamicDateRange control
		for (var i = 0; i < aControls2.length; i++) {
			aControls2[i].destroy();
		}

	});

	QUnit.test("toDates", function(assert) {

		var oValue = {
			operator: "Date-Range",
			values: [1]
		};

		var aRange = oOperatorDynamicDateOption.toDates(oValue);
		assert.ok(Array.isArray(aRange), "Array returned");
		assert.equal(aRange.length, 2, "Range length");
		assert.deepEqual(aRange[0], new Date(new Date().getFullYear(), 0, 1), "First value");
		assert.deepEqual(aRange[1], new Date(new Date().getFullYear(), 2, 31), "Second value");

	});

	QUnit.test("format", function(assert) {

		var oValue = {
			operator: "Date-Range",
			values: [1]
		};

		var sResult = oOperatorDynamicDateOption.format(oValue);
		assert.equal(sResult, "Range: 1", "formatted value");

	});

	QUnit.test("parse", function(assert) {

		var oValue = {
			operator: "Date-Range",
			values: [1]
		};

		var oResult = oOperatorDynamicDateOption.parse("Range: 1");
		assert.deepEqual(oResult, oValue, "parsed value");

	});

	QUnit.module("Static RangeOperator", {
		beforeEach: function() {
			oType = new DateType({style: "long", calendarType: "Gregorian", UTC: true}); // UTC to check conversion
			oOperator = new RangeOperator({
				name: "MyToday",
				tokenText: "MyToday",
				longText: "My Today",
				valueTypes: [Operator.ValueType.Static],
				calcRange: function() {
					return UniversalDateUtils.ranges.today();
				},
				formatRange: function(aRange, oDataType) {
					return oDataType.formatValue(aRange[0], "string");
				}
			});
			oOperatorDynamicDateOption = new OperatorDynamicDateOption("O1", {
				key: "Date-MyToday",
				operator: oOperator,
				type: oType,
				baseType: BaseType.Date
			});
			DynamicDateUtil.addOption(oOperatorDynamicDateOption);

			oDynamicDateRange = new DynamicDateRange("DDR1", { // needed for UI functions
				formatter: {date: {style: "long"}}
			});
		},

		afterEach: fnTeardown
	});

	QUnit.test("getValueHelpUITypes", function(assert) {

		var aDynamicDateValueHelpUIType = oOperatorDynamicDateOption.getValueHelpUITypes();
		assert.ok(Array.isArray(aDynamicDateValueHelpUIType), "Array returned");
		assert.equal(aDynamicDateValueHelpUIType.length, 0, "Array length");

	});

	QUnit.test("createValueHelpUI", function(assert) {

		var fnChange = function(oEvent) {
		};

		var oValue = {
			operator: "Date-MyToday",
			values: []
		};
		oDynamicDateRange.setValue(oValue);

		var aControls = oOperatorDynamicDateOption.createValueHelpUI(oDynamicDateRange, fnChange);
		assert.ok(Array.isArray(aControls), "Array returned");
		assert.equal(aControls.length, 0, "no control created");

		// check getValueHelpOutput here as UI needs to be created before
		var oResult = oOperatorDynamicDateOption.getValueHelpOutput(oDynamicDateRange);
		assert.ok(oResult, "getValueHelpOutput returns result");
		assert.deepEqual(oResult, oValue, "Result returns right dates");

		// cleanup as normally destroyed by DynamicDateRange control
		for (var i = 0; i < aControls.length; i++) {
			aControls[i].destroy();
		}

	});

	QUnit.test("toDates", function(assert) {

		var oValue = {
			operator: "Date-MyToday",
			values: []
		};
		var oToday = new Date();

		var aRange = oOperatorDynamicDateOption.toDates(oValue);
		assert.ok(Array.isArray(aRange), "Array returned");
		assert.equal(aRange.length, 2, "Range length");
		assert.deepEqual(aRange[0], new Date(oToday.getFullYear(), oToday.getMonth(), oToday.getDate()), "First value");
		assert.deepEqual(aRange[1], new Date(oToday.getFullYear(), oToday.getMonth(), oToday.getDate()), "Second value");

	});

	QUnit.test("format", function(assert) {

		var oValue = {
			operator: "Date-MyToday",
			values: []
		};

		var sResult = oOperatorDynamicDateOption.format(oValue);
		assert.equal(sResult, "MyToday", "formatted value");

	});

	QUnit.test("parse", function(assert) {

		var oValue = {
			operator: "Date-MyToday",
			values: []
		};

		var oResult = oOperatorDynamicDateOption.parse("MyToday");
		assert.deepEqual(oResult, oValue, "parsed value");

	});

	QUnit.module("Custom control", {
		beforeEach: function() {
			oType = new DateType({style: "long", calendarType: "Gregorian", UTC: true}); // UTC to check conversion
			oOperator = new Operator({
				name: "Range",
				filterOperator: FilterOperator.BT,
				tokenParse: "^#tokenText#$",
				tokenFormat: "#tokenText#",
				tokenText: "Range: {0}",
				longText: "My Range",
				group: {id: 9, text: "My group"},
				valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}, constraints: { minimum: 1, maximum: 4}}],
				paramTypes: ["(\\d+)"],
				createControl: function(oType, sPath, iIndex, sId, aClass)  {
					var oSlider = new Slider(sId, {
						value: { path: sPath, type: oType, mode: 'TwoWay' },
						width: "100%",
						min: 1,
						max: 4,
						enableTickmarks: true
					});
					return oSlider;
				}
			});
			oOperatorDynamicDateOption = new OperatorDynamicDateOption({
				key: "Date-Range",
				operator: oOperator,
				type: oType,
				baseType: BaseType.Date
			});
			DynamicDateUtil.addOption(oOperatorDynamicDateOption);

			oDynamicDateRange = new DynamicDateRange("DDR1", { // needed for UI functions
				formatter: {date: {style: "long"}}
			});
		},

		afterEach: fnTeardown
	});

	QUnit.test("createValueHelpUI", function(assert) {

		var iChange = 0;
		var fnChange = function(oEvent) {
			iChange++;
		};

		var oValue = {
			operator: "Date-Range",
			values: [2]
		};
		oDynamicDateRange.setValue(oValue);

		var aControls = oOperatorDynamicDateOption.createValueHelpUI(oDynamicDateRange, fnChange);
		assert.ok(Array.isArray(aControls), "Array returned");
		assert.equal(aControls.length, 1, "1 control created");
		assert.ok(aControls[0].isA("sap.m.Slider"), "Control is Slider");
		assert.deepEqual(aControls[0].getValue(), 2, "Value of Slider control");

		aControls[0].setValue(3); // as triggered by model update
		assert.equal(iChange, 1, "Change function called for Slider control");

		// check getValueHelpOutput here as UI needs to be created before
		var oResult = oOperatorDynamicDateOption.getValueHelpOutput(oDynamicDateRange);
		assert.ok(oResult, "getValueHelpOutput returns result");
		assert.deepEqual(oResult, {operator: "Date-Range",values: [3]}, "Result returns right dates");

		// cleanup as normally destroyed by DynamicDateRange control
		for (var i = 0; i < aControls.length; i++) {
			aControls[i].destroy();
		}

	});

	QUnit.test("toDates", function(assert) {

		var oValue = {
			operator: "Date-Range",
			values: [1]
		};

		try {
			oOperatorDynamicDateOption.toDates(oValue);
		} catch (oError) {
			assert.ok(oError, "Error thrown");
		}

	});

});
