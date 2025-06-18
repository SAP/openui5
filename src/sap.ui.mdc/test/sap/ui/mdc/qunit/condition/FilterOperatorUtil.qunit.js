/*!
 * ${copyright}
 */

/* global QUnit, sinon */
/*eslint no-warning-comments: 0 */

sap.ui.define([
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorValueType",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Unit",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UniversalDateUtils",
	"sap/ui/core/date/UI5Date",
	"sap/m/library",
	"sap/ui/mdc/enums/OperatorOverwrite",
	"sap/ui/core/Lib",
	"sap/base/Log"
], function(
	FilterOperatorUtil,
	Operator,
	RangeOperator,
	Condition,
	BaseType,
	ConditionValidated,
	FieldDisplay,
	OperatorValueType,
	OperatorName,
	Filter,
	FilterOperator,
	IntegerType,
	UnitType,
	StringType,
	DateType,
	DateTimeWithTimezoneType,
	DateTimeOffsetType,
	UniversalDate,
	UniversalDateUtils,
	UI5Date,
	mLibrary,
	OperatorOverwrite,
	Library,
	Log
) {
	"use strict";

	const mdcMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");
	const mMessageBundle = Library.getResourceBundleFor("sap.m");

	QUnit.module("Operator", {
		beforeEach: function() {

		},

		afterEach: function() {}
	});

	QUnit.test("createOperator", function(assert) {

		const _getModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			return new Filter({ path: sFieldPath, operator: FilterOperator.EQ, value1: new Date().getFullYear() });
		};
		let oOperator = new Operator({
			name: "THISYEAR",
			valueTypes: [],
			group: "myGroup",
			getModelFilter: _getModelFilter
		});

		assert.equal(oOperator.name, "THISYEAR", "Name set");
		assert.ok(oOperator.format, "Format function set by default");
		assert.ok(oOperator.parse, "Parse function set by default");
		assert.ok(oOperator.validate, "Validate function set by default");
		assert.equal(oOperator.getModelFilter, _getModelFilter, "GetModelFilter not default");
		assert.equal(oOperator.group, "myGroup", "group set");
		oOperator.destroy();

		// invalid operator
		oOperator = undefined;
		let oError;
		try {
			oOperator = new Operator({
				name: "INVALID",
				valueTypes: []
			});
		} catch (myError) {
			oError = myError;
		}

		assert.notOk(oOperator, "no invalid operator created");
		assert.ok(oError, "Error thrown");

		oError = undefined;
		try {
			oOperator = new Operator();
		} catch (myError) {
			oError = myError;
		}

		assert.notOk(oOperator, "no invalid operator created");
		assert.ok(oError, "Error thrown");

		sinon.spy(Log, "warning");
		oOperator = new Operator({
			valueTypes: [],
			getModelFilter: _getModelFilter
		});

		assert.ok(Log.warning.calledOnce, "Warning written to log");
		assert.notOk(oOperator.name, "NoName set");
		assert.ok(oOperator.format, "Format function set by default");
		assert.ok(oOperator.parse, "Parse function set by default");
		assert.ok(oOperator.validate, "Validate function set by default");
		assert.equal(oOperator.getModelFilter, _getModelFilter, "GetModelFilter not default");
		oOperator.destroy();
		Log.warning.restore();

	});

	QUnit.test("createRangeOperator", function(assert) {

		const _getModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			return new Filter({ path: sFieldPath, operator: FilterOperator.EQ, value1: new Date().getFullYear() });
		};

		const oOperator = new RangeOperator({
			name: "TODAY",
			valueTypes: [OperatorValueType.Static],
			longText: "My Today",
			calcRange: function() {
				return UniversalDateUtils.ranges.today();
			},
			formatRange: function(aRange, oDataType) {
				return oDataType.formatValue(aRange[0], "string");
			},
			getModelFilter: _getModelFilter
		});

		assert.equal(oOperator.name, "TODAY", "Name set");
		assert.ok(oOperator.format, "Format function set by default");
		assert.ok(oOperator.parse, "Parse function set by default");
		assert.ok(oOperator.validate, "Validate function set by default");
		assert.equal(oOperator.getModelFilter, _getModelFilter, "GetModelFilter not default");
		assert.equal(oOperator.getLongText(), "My Today", "GetLongText");
		assert.equal(oOperator.tokenFormat, "My Today", "tokenFormat");

		assert.ok(oOperator.calcRange, "calcRange function set");
		assert.ok(oOperator.formatRange, "formatRange function set");
		oOperator.destroy();
	});

	QUnit.module("FilterOperatorUtil", {
		beforeEach: function() {

		},

		afterEach: function() {}
	});

	QUnit.test("default operator creation", function(assert) {

		assert.ok(FilterOperatorUtil._mOperators, "standard operators created");
		assert.ok(FilterOperatorUtil._mOperators.equal, "standard EQ operator created");
		assert.ok(FilterOperatorUtil._mOperators.between, "standard BT operator created");
		assert.ok(FilterOperatorUtil._mOperators.lessThan, "standard LT operator created");
		assert.ok(FilterOperatorUtil._mOperators.greaterThan, "standard GT operator created");
		assert.ok(FilterOperatorUtil._mOperators.lessEqual, "standard LE operator created");
		assert.ok(FilterOperatorUtil._mOperators.greaterEqual, "standard GE operator created");
		assert.ok(FilterOperatorUtil._mOperators.startsWith, "standard StartsWith operator created");
		assert.ok(FilterOperatorUtil._mOperators.endsWith, "standard EndsWith operator created");
		assert.ok(FilterOperatorUtil._mOperators.contains, "standard Contains operator created");
		assert.ok(FilterOperatorUtil._mOperators.notEqual, "standard NE operator created");
		assert.ok(FilterOperatorUtil._mOperators.empty, "standard Empty operator created");
		assert.ok(FilterOperatorUtil._mOperators.notEmpty, "standard NotEmpty operator created");

		assert.ok(FilterOperatorUtil._mOperators.today, "standard today operator created");
		assert.ok(FilterOperatorUtil._mOperators.thisYear, "standard currentYear operator created");
	});

	QUnit.test("getOperatorsForType", function(assert) {

		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.String).length, 20, "Default operators for String");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Date).length, 66, "Default operators for date");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.DateTime).length, 74, "Default operators for datetime");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Time).length, 12, "Default operators for time");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Numeric).length, 12, "Default operators for numeric");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Boolean).length, 2, "Default operators for boolean");

		// TODO, test what operators are returned

	});

	QUnit.test("getOperator", function(assert) {

		const oOperator = FilterOperatorUtil.getOperator(OperatorName.EQ);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, OperatorName.EQ, "EQ operator returned");

	});

	QUnit.test("getEQOperator", function(assert) {

		const oMyOperator = new Operator({
			name: "MyEqual",
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oMyOperator);

		let oOperator = FilterOperatorUtil.getEQOperator();
		assert.equal(oOperator && oOperator.name, OperatorName.EQ, "EQ operator returned");

		oOperator = FilterOperatorUtil.getEQOperator([OperatorName.GT, oMyOperator.name, OperatorName.LT]);
		assert.equal(oOperator && oOperator.name, oMyOperator.name, "custom operator returned");

		oOperator = FilterOperatorUtil.getEQOperator([OperatorName.GT, OperatorName.LT]);
		assert.equal(oOperator && oOperator.name, OperatorName.EQ, "EQ operator returned");

		delete FilterOperatorUtil._mOperators[oMyOperator.name]; // TODO API to remove operator
		oMyOperator.destroy();

	});

	QUnit.test("getOperatorForDynamicDateOption", function(assert) {

		const oMyOperator = new Operator({
			name: "MyDate",
			alias: { Date: "DATE", DateTime: "DATETIME" },
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});

		FilterOperatorUtil.addOperator(oMyOperator);

		let oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("FROM", BaseType.Date, []);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, OperatorName.GE, "GE operator returned");

		oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("Date-EQ", BaseType.Date, []);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, OperatorName.EQ, "EQ operator returned");

		oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("DATE", BaseType.Date, ["From"]);
		assert.notOk(oOperator, "No Operator returned");

		oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("DATE", BaseType.Date, ["From", "EQ"]);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, OperatorName.EQ, "EQ operator returned");

		oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("DATE", BaseType.Date, ["From", "MyDate"]);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, "MyDate", "MyDate operator returned");

		FilterOperatorUtil.removeOperator(oMyOperator);

	});

	QUnit.test("getDynamicDateOptionForOperator", function(assert) {

		let oOperator = FilterOperatorUtil.getOperator(OperatorName.TODAY);
		let sOption = FilterOperatorUtil.getDynamicDateOptionForOperator(oOperator, mLibrary.StandardDynamicDateRangeKeys, BaseType.Date);
		assert.equal(sOption, "TODAY", "TODAY option returned");

		oOperator = FilterOperatorUtil.getOperator(OperatorName.GE);
		sOption = FilterOperatorUtil.getDynamicDateOptionForOperator(oOperator, mLibrary.StandardDynamicDateRangeKeys, BaseType.Date);
		assert.equal(sOption, "FROM", "FROM option returned");

	});

	QUnit.test("getCustomDynamicDateOptionForOperator", function(assert) {

		const oOperator = FilterOperatorUtil.getOperator(OperatorName.LT);
		const sOption = FilterOperatorUtil.getCustomDynamicDateOptionForOperator(oOperator, BaseType.Date);
		assert.equal(sOption, "Date-LT", "custom option returned");

	});

	function fOperatorCheck(assert, aOperators, aFormatTest) {

		//checking all above Operators for validity
		for (let i = 0; i < aOperators.length; i++) {
			const oOperator = aOperators[i];
			const sOperator = oOperator.name;
			assert.ok(true, "--------------------   Checking Operator " + sOperator + "   -----------------------------------------");
			assert.strictEqual(oOperator.longText !== "", true, "Operator " + sOperator + " has a valid longText " + oOperator.longText);
			assert.strictEqual(oOperator.tokenParse !== null, true, "Operator " + sOperator + " has a valid tokenParse " + oOperator.tokenParse);
			assert.strictEqual(oOperator.tokenFormat !== null, true, "Operator " + sOperator + " has a valid tokenFormat " + oOperator.tokenFormat);
			assert.strictEqual(oOperator.tokenParseRegExp !== null && oOperator.tokenParseRegExp instanceof RegExp, true, "Operator " + sOperator + " has a valid tokenParseRegExp " + oOperator.tokenParseRegExp);
			assert.strictEqual(oOperator.group !== null && oOperator.group.id !== null, true, "Operator " + sOperator + " has a valid GroupId " + oOperator.group.id);
			assert.strictEqual(oOperator.group !== null && oOperator.group.text !== null, true, "Operator " + sOperator + " has a valid GroupText " + oOperator.group.text);

			//check formatting and parsing of values
			if (aFormatTest[sOperator]) {
				for (let j = 0; j < aFormatTest[sOperator].length; j++) {
					const oTest = aFormatTest[sOperator][j];

					// EQ-Operator.format(["Test"]) --> "=Test"
					const sFormattedText = oTest.formatArgs ? oOperator.format.apply(oOperator, oTest.formatArgs) : "";
					if (oTest.hasOwnProperty("formatValue")) {
						assert.strictEqual(sFormattedText, oTest.formatValue, "Formatting: Operator " + sOperator + " has formated correctly from " + JSON.stringify(oTest.formatArgs[0]) + " to " + oTest.formatValue);
						if (oTest.formatValueCheckValues) {
							assert.ok(sFormattedText.indexOf(oTest.formatValueCheckValues[0]) >= 0, "Formatting: Text includes value " + oTest.formatValueCheckValues[0]);
							if (oTest.formatValueCheckValues.length > 1) {
								assert.ok(sFormattedText.indexOf(oTest.formatValueCheckValues[1]) >= 0, "Formatting: Text includes value " + oTest.formatValueCheckValues[1]);
							}
						}

						const sTextForCopy = oTest.hasOwnProperty("textForCopy") ? oTest.textForCopy : "\t" + sFormattedText;
						assert.equal(oOperator.getTextForCopy.apply(oOperator, oTest.formatArgs), sTextForCopy, "getTextForCopy");
					}

					// EQ-Operator.parse("=Test") --> ["Test"]
					if (oTest.hasOwnProperty("parsedValue") || oTest.exception) {
						try {
							const aParseText = oOperator.parse.apply(oOperator, oTest.parseArgs || [sFormattedText, oTest.type]);
							const sParseText = Array.isArray(aParseText) ? aParseText.join("") : aParseText; // also test undefined result
							const sTestText = Array.isArray(oTest.parseArgs) ? oTest.parseArgs[0] : sFormattedText;
							assert.strictEqual(sParseText, oTest.parsedValue, "Parsing: Operator " + sOperator + " has parsed correctly from " + sTestText + " to " + oTest.parsedValue);
							if (oTest.hasOwnProperty("exception")) {
								assert.notOk(oTest.exception, "No Exception fired in parsing");
							}
						} catch (oException) {
							assert.ok(oTest.exception, "Exception fired in parsing");
						}
					}

					// EQ-Operator.getCondition("=Test") --> {operator: OperatorName.EQ, values: ["Test"]]}
					let oCondition;
					try {
						oCondition = oOperator.getCondition.apply(oOperator, oTest.parseArgs || [sFormattedText, oTest.type]);
						if (oTest.hasOwnProperty("condition")) {
							assert.deepEqual(oCondition, oTest.condition, "getCondition: Operator " + sOperator + " returns oCondition instance");

							// create the model filter instance of the condition
							//						var oFilter = oOperator.getModelFilter(oCondition);
						}
						if (oTest.hasOwnProperty("exception")) {
							assert.notOk(oTest.exception, "No Exception fired in parsing");
						}
					} catch (oException) {
						assert.ok(oTest.exception, "Exception fired in parsing");
						oCondition = undefined; // to clear if exception occurred.
					}

					if (oCondition) {
						const bIsEmpty = oOperator.isEmpty(oCondition);
						assert.equal(bIsEmpty, oTest.isEmpty, "isEmpty check");

						try {
							oOperator.validate(oCondition.values, oTest.type, oTest.compositeTypes, oTest.compositePart, oTest.additionalType);
							if (oTest.hasOwnProperty("valid")) {
								assert.ok(oTest.valid, "No Exception fired in validation");
							}
						} catch (oException) {
							assert.notOk(oTest.valid, "Exception fired in validation");
							if (oTest.validationMessage) {
								assert.equal(oException.message, oTest.validationMessage, "Validation message");
							}
						}

						if (oTest.filter) {
							const oFilter = oOperator.getModelFilter(oCondition, "test", oTest.oType, oTest.caseSensitive, oTest.baseType);
							assert.ok(oFilter, "Filter returned");
							assert.equal(oFilter.sPath, oTest.filter.path, "Filter path");
							assert.equal(oFilter.sOperator, oTest.filter.operator, "Filter operator");
							assert.deepEqual(oFilter.oValue1, oTest.filter.value1, "Filter value1");
							assert.deepEqual(oFilter.oValue2, oTest.filter.value2, "Filter value2");
						}

						if (oTest.staticText) {
							assert.equal(oOperator.getStaticText(oTest.oType), oTest.staticText, "StaticText");
						}
					}

					if (oTest.hasOwnProperty("isSingleValue")) {
						assert.equal(oOperator.isSingleValue(), oTest.isSingleValue, "isSingleValue");
					}

					if (oTest.hasOwnProperty("longText")) {
						assert.equal(oOperator.getLongText(oTest.baseType || BaseType.String), oTest.longText, "getLongText returns expected longText");
					}

					if (oTest.hasOwnProperty("tokenText")) {
						assert.equal(oOperator.tokenText, oTest.tokenText, "has expected tokenText");
					}

					if (oTest.hasOwnProperty("valueDefaults")) {
						assert.deepEqual(oOperator.valueDefaults, oTest.valueDefaults, "has expected default values");
					}
				}
			}
		}

	}

	QUnit.test("Checks for Default Configuration", function(assert) {

		// get all standard Operators and add custom operator
		FilterOperatorUtil.addOperator(new Operator({
			name: "MyOperator",
			valueTypes: [],
			longText: "Hello World",
			tokenText: "Hello",
			getModelFilter: function(oCondition, sFieldPath, aOperators) {
				return new Filter({ path: sFieldPath, operator: FilterOperator.EQ, value1: "Hello World" });
			}
		}));
		FilterOperatorUtil.addOperator(new Operator({
			name: "MyEQOperator",
			valueTypes: ["sap.ui.model.type.Integer", null],
			filterOperator: FilterOperator.EQ,
			longText: "My Equal",
			tokenText: "key: {0}, description: {1}",
			tokenParse: "#tokenText#"
		}));

		const aOperators = [];
		for (const sName in FilterOperatorUtil._mOperators) {
			aOperators.push(FilterOperatorUtil._mOperators[sName]);
		}

		const oIntType = new IntegerType({}, {maximum: 3});
		const oStringType = new StringType({}, {maxLength: 5});
		const oNUMCType = new StringType({}, {maxLength: 5, isDigitSequence: true, nullable: false});
		const oUnitType = new UnitType({}, {maximum: 100});
		const oDateTimeWithTimezoneType1 = new DateTimeWithTimezoneType({pattern: "yyyy-MM-dd'T'HH:mm:ss", showTimezone: false});
		oDateTimeWithTimezoneType1._aCurrentValue = ["2022-02-24T12:15:30Z", "Europe/Berlin"];
		const oDateTimeWithTimezoneType2 = new DateTimeWithTimezoneType({showTimezone: true, showDate: false, showTime: false});
		oDateTimeWithTimezoneType2._aCurrentValue = ["2022-02-24T12:15:30Z", "Europe/Berlin"];
		const oDateTimeOffsetType = new DateTimeOffsetType({}, {V4: true, nullable: false});
		const sDateTimeFormatted = oDateTimeOffsetType.formatValue("2023-07-31T07:42:30Z", "string");
		const sDateTimeParsed = oDateTimeOffsetType.parseValue(sDateTimeFormatted, "string");

		let sUnitValidationMessage;
		try {
			oUnitType.validateValue([500.123456, "mass-kilogram"]);
		} catch (oException) {
			sUnitValidationMessage = oException.message;
		}

		const aFormatTest = {
				[OperatorName.EQ]: [{
						formatArgs: [Condition.createItemCondition("Test", "desc")],
						formatValue: "desc (Test)",
						textForCopy: "Test	desc",
						parseArgs: ["=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, [undefined, "Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.EQ.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.Value],
						formatValue: "Test",
						textForCopy: "Test	desc",
						parseArgs: ["=Test", undefined, FieldDisplay.Value],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.EQ, value1: "Test"}
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["Test"]), undefined, undefined],
						formatValue: "=Test",
						textForCopy: "	=Test",
						parseArgs: ["Test", undefined, FieldDisplay.Value, true, undefined, undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.EQ, value1: "Test"}
					},
					{
						formatArgs: [Condition.createItemCondition("Test"), undefined, FieldDisplay.Value],
						formatValue: "=Test",
						textForCopy: "	=Test",
						parseArgs: ["Test", undefined, FieldDisplay.Value, false, undefined, undefined, undefined, false],
						parsedValue: "Test",
						condition: null, // condition only created without operator symbol if operator is hidden ot it is the default operator
						isEmpty: false,
						exception: false,
						valid: false,
						filter: {path: "test", operator: FilterOperator.EQ, value1: "Test"}
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.Description],
						formatValue: "desc",
						textForCopy: "Test	desc",
						parseArgs: ["==desc", undefined, FieldDisplay.Description],
						parsedValue: "=desc",
						condition: Condition.createCondition(OperatorName.EQ, [undefined, "=desc"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test (desc)",
						textForCopy: "Test	desc",
						parseArgs: ["=Test", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition(5, "desc"), oIntType, FieldDisplay.ValueDescription],
						formatValue: "5 (desc)",
						textForCopy: "5	desc",
						parseArgs: ["=5", oIntType, FieldDisplay.ValueDescription],
						parsedValue: "5",
						condition: Condition.createCondition(OperatorName.EQ, [5, undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition(5, "desc"), oIntType, FieldDisplay.DescriptionValue],
						formatValue: "desc (5)",
						textForCopy: "5	desc",
						parseArgs: ["=desc (5)", oIntType, FieldDisplay.DescriptionValue],
						parsedValue: "5desc",
						condition: Condition.createCondition(OperatorName.EQ, [5, "desc"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition(1, "desc"), oIntType, FieldDisplay.ValueDescription],
						formatValue: "1 (desc)",
						textForCopy: "1	desc",
						parseArgs: ["=A", oIntType, FieldDisplay.ValueDescription],
						parsedValue: "",
						condition: Condition.createCondition(OperatorName.EQ, [undefined, undefined], undefined, undefined, ConditionValidated.NotValidated),
						exception: true,
						isEmpty: true,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test (desc)",
						textForCopy: "Test	desc",
						parseArgs: ["=Test (desc)", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Testdesc",
						condition: Condition.createCondition(OperatorName.EQ, ["Test", "desc"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition(null, "desc"), undefined, FieldDisplay.ValueDescription],
						formatValue: " (desc)",
						textForCopy: "null	desc", // null as no Type given
						parseArgs: ["=", undefined, FieldDisplay.ValueDescription],
						parsedValue: undefined,
						condition: null,
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["Test", undefined], undefined, undefined, ConditionValidated.Validated), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test",
						textForCopy: "Test	",
						parseArgs: ["=Test", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						textForCopy: "	Test",
						parseArgs: ["=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, [undefined, "Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["="])],
						formatValue: "==",
						textForCopy: "	==",
						parsedValue: "=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["a", "b"])],
						formatValue: "b (a)",
						textForCopy: "	b (a)",
						parseArgs: ["b (a)", undefined, undefined, true],
						parsedValue: "ab",
						condition: Condition.createCondition(OperatorName.EQ, ["a", "b"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["a", "b (c)"])],
						formatValue: "b (c) (a)",
						textForCopy: "	b (c) (a)",
						parseArgs: ["b (c) (a)", undefined, undefined, true],
						parsedValue: "ab (c)",
						condition: Condition.createCondition(OperatorName.EQ, ["a", "b (c)"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["a", "b (c)"]), undefined, FieldDisplay.ValueDescription],
						formatValue: "a (b (c))",
						textForCopy: "	a (b (c))",
						parseArgs: ["a (b (c))", undefined, FieldDisplay.ValueDescription, true],
						parsedValue: "ab (c)",
						condition: Condition.createCondition(OperatorName.EQ, ["a", "b (c)"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, [null, "Text"]), oStringType, FieldDisplay.DescriptionValue, true],
						formatValue: "Text ()",
						textForCopy: "	Text ()",
						parseArgs: ["Text", oStringType, FieldDisplay.DescriptionValue, true],
						parsedValue: "Text",
						condition: Condition.createCondition(OperatorName.EQ, ["Text"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{ // DateTime with Timezone
						formatArgs: [Condition.createCondition(OperatorName.EQ, [["2022-02-24T12:15:30Z", "Europe/Berlin"]]), oDateTimeWithTimezoneType1, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						formatValue: "2022-02-24T13:15:30",
						textForCopy: "	2022-02-24T13:15:30",
						parseArgs: ["2022-02-24T14:15:30", oDateTimeWithTimezoneType1, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						parsedValue: "2022-02-24T14:15:30+01:00,Europe/Berlin",
						condition: Condition.createCondition(OperatorName.EQ, [["2022-02-24T14:15:30+01:00", "Europe/Berlin"]], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true, // validation only against dateTime part
						type: oDateTimeWithTimezoneType1,
						baseType: BaseType.DateTime,
						compositeTypes: [oDateTimeOffsetType, oStringType],
						compositePart: 0,
						longText: mdcMessageBundle.getText("operators.EQ.longText")
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, [["2022-02-24T12:15:30Z", "Europe/Berlin"]]), oDateTimeWithTimezoneType2, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						formatValue: "Europe, Berlin",
						textForCopy: "	Europe, Berlin",
						parseArgs: ["America/New_York", oDateTimeWithTimezoneType2, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						parsedValue: "2022-02-24T12:15:30Z,America/New_York",
						condition: Condition.createCondition(OperatorName.EQ, [["2022-02-24T12:15:30Z", "America/New_York"]], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false, // as String (for timezone) allows only 5 characters -> test for usage of this type
						type: oDateTimeWithTimezoneType2,
						baseType: BaseType.DateTime,
						compositeTypes: [oDateTimeOffsetType, oStringType],
						compositePart: 1
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["@@$$"]), undefined, FieldDisplay.Value, false],
						formatValue: "=@@$$",
						textForCopy: "	=@@$$",
						parseArgs: ["=@@$$", undefined, FieldDisplay.Value],
						parsedValue: "@@$$",
						condition: Condition.createCondition(OperatorName.EQ, ["@@$$"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createItemCondition(5, "2023-07-31T07:42:30Z"), oIntType, FieldDisplay.ValueDescription, true, undefined, oDateTimeOffsetType, undefined],
						formatValue: "5 (" + sDateTimeFormatted + ")",
						textForCopy: "5	" + sDateTimeFormatted,
						parseArgs: ["5 (" + sDateTimeFormatted + ")", oIntType, FieldDisplay.ValueDescription, true, undefined, oDateTimeOffsetType, undefined],
						parsedValue: "5" + sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.EQ, [5, sDateTimeParsed], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: false,
						type: oIntType,
						baseType: BaseType.Number,
						additionalType : oDateTimeOffsetType
					},
					{
						formatArgs: [Condition.createItemCondition(5, "2023-07-31T07:42:30Z"), oIntType, FieldDisplay.Description, true, undefined, oDateTimeOffsetType, undefined],
						formatValue: sDateTimeFormatted,
						textForCopy: "5	" + sDateTimeFormatted,
						parseArgs: ["1 (X)", oIntType, FieldDisplay.ValueDescription, true, undefined, oDateTimeOffsetType, undefined],
						exception: true,
						valid: false,
						type: oIntType,
						baseType: BaseType.Number,
						additionalType : oDateTimeOffsetType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, [5]), oIntType, FieldDisplay.Description, true, undefined, oDateTimeOffsetType, undefined],
						formatValue: "5",
						textForCopy: "	5",
						parseArgs: ["1", oIntType, FieldDisplay.Value, true, undefined, oDateTimeOffsetType, undefined],
						parsedValue: "1",
						condition: Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						exception: false,
						valid: true,
						type: oIntType,
						baseType: BaseType.Number,
						additionalType : oDateTimeOffsetType
					},
					{	// Unit
						formatArgs: [Condition.createCondition(OperatorName.EQ, [[5, "mass-kilogram"]]), oUnitType, FieldDisplay.Value, true, [oIntType, oStringType], undefined, undefined],
						formatValue: "5.000 kg",
						textForCopy: "	5.000 kg",
						parseArgs: ["5.000 kg", oUnitType, FieldDisplay.Value, true, undefined, undefined, undefined],
						parsedValue: "5,mass-kilogram",
						condition: Condition.createCondition(OperatorName.EQ, [[5, "mass-kilogram"]], undefined, undefined, ConditionValidated.NotValidated),
						type: oUnitType,
						baseType: BaseType.Unit,
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, [[5, "mass-kilogram"]]), oUnitType, FieldDisplay.Value, true, [oIntType, oStringType], undefined, undefined],
						formatValue: "5.000 kg",
						textForCopy: "	5.000 kg",
						parseArgs: ["500.123456 kg", oUnitType, FieldDisplay.Value, true, [oIntType, oStringType], undefined, undefined],
						parsedValue: "500.123456,mass-kilogram",
						condition: Condition.createCondition(OperatorName.EQ, [[500.123456, "mass-kilogram"]], undefined, undefined, ConditionValidated.NotValidated),
						type: oUnitType,
						baseType: BaseType.Unit,
						compositeTypes: [oIntType, oStringType],
						compositePart: 0,
						isEmpty: false,
						valid: false,
						validationMessage: sUnitValidationMessage
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, [[null, "mass-kilogram"]]), oUnitType, FieldDisplay.Value, true, [oIntType, oStringType], undefined, undefined],
						formatValue: null,
						textForCopy: "	null", // TODO: ist this is OK?
						parseArgs: ["", oUnitType, FieldDisplay.Value, true, undefined, undefined, undefined],
						parsedValue: undefined,
						condition: null,
						type: oUnitType,
						baseType: BaseType.Unit,
						isEmpty: false,
						valid: true
					}
				],
				[OperatorName.NE]: [{
						formatArgs: [Condition.createCondition(OperatorName.NE, ["Test"])],
						formatValue: "!(=Test)",
						parseArgs: ["!=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.NE.longText"),
						tokenText: "",
						filter: {path: "test", operator: FilterOperator.NE, value1: "Test"}
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NE, ["Test"])],
						formatValue: "!(=Test)",
						parseArgs: ["!(=Test)"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NE, ["="])],
						formatValue: "!(==)",
						parseArgs: ["!=="],
						parsedValue: "=",
						condition: Condition.createCondition(OperatorName.NE, ["="], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NE, ["a", "b"])],
						formatValue: "!(=a)",
						parseArgs: ["!=a"],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NE, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NE, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				[OperatorName.LT]: [{
						formatArgs: [Condition.createCondition(OperatorName.LT, ["Test"])],
						formatValue: "<Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.LT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.LT, value1: "Test"},
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.LT.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LT, ["<"])],
						formatValue: "<<",
						parsedValue: "<",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LT, ["a", "b"])],
						formatValue: "<a",
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.LT, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LT, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.LT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LT, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: "<" + sDateTimeFormatted,
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.LT, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.LT, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.LT.longText.date")
					}
				],
				[OperatorName.NOTLT]: [{
						formatArgs: [Condition.createCondition(OperatorName.NOTLT, ["Test"])],
						formatValue: "!(<Test)",
						parseArgs: ["!<Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTLT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.GE, value1: "Test"},
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.NOTLT.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLT, ["Test"])],
						formatValue: "!(<Test)",
						parseArgs: ["!(<Test)"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTLT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.GE, value1: "Test"},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLT, ["<"])],
						formatValue: "!(<<)",
						parseArgs: ["!<<"],
						parsedValue: "<",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLT, ["a", "b"])],
						formatValue: "!(<a)",
						parseArgs: ["!<a"],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NOTLT, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLT, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTLT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLT, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: "!(<" + sDateTimeFormatted + ")",
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.NOTLT, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.GE, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.NOTLT.longText.date")
					}
				],
				[OperatorName.GT]: [{
						formatArgs: [Condition.createCondition(OperatorName.GT, ["Test"])],
						formatValue: ">Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.GT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.GT.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GT, [">"])],
						formatValue: ">>",
						parsedValue: ">",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GT, ["a", "b"])],
						formatValue: ">a",
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.GT, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GT, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.GT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GT, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: ">" + sDateTimeFormatted,
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.GT, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.GT, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.GT.longText.date")
					}
				],
				[OperatorName.NOTGT]: [{
						formatArgs: [Condition.createCondition(OperatorName.NOTGT, ["Test"])],
						formatValue: "!(>Test)",
						parseArgs: ["!>Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTGT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.LE, value1: "Test"},
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.NOTGT.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGT, ["Test"])],
						formatValue: "!(>Test)",
						parseArgs: ["!(>Test)"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTGT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.LE, value1: "Test"},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGT, [">"])],
						formatValue: "!(>>)",
						parseArgs: ["!>>"],
						parsedValue: ">",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGT, ["a", "b"])],
						formatValue: "!(>a)",
						parseArgs: ["!>a"],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NOTGT, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGT, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTGT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGT, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: "!(>" + sDateTimeFormatted + ")",
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.NOTGT, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.LE, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.NOTGT.longText.date")
					}
				],
				[OperatorName.LE]: [{
						formatArgs: [Condition.createCondition(OperatorName.LE, ["Test"])],
						formatValue: "<=Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.LE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.LE.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LE, ["<="])],
						formatValue: "<=<=",
						parsedValue: "<=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LE, ["a", "b"])],
						formatValue: "<=a",
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.LE, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LE, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.LE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.LE, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: "<=" + sDateTimeFormatted,
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.LE, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.LE, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.LE.longText.date")
					}
				],
				[OperatorName.NOTLE]: [{
						formatArgs: [Condition.createCondition(OperatorName.NOTLE, ["Test"])],
						formatValue: "!(<=Test)",
						parseArgs: ["!<=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTLE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.NOTLE.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLE, ["Test"])],
						formatValue: "!(<=Test)",
						parseArgs: ["!(<=Test)"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTLE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLE, ["<="])],
						formatValue: "!(<=<=)",
						parseArgs: ["!<=<="],
						parsedValue: "<=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLE, ["a", "b"])],
						formatValue: "!(<=a)",
						parseArgs: ["!<=a"],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NOTLE, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLE, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTLE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTLE, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: "!(<=" + sDateTimeFormatted + ")",
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.NOTLE, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.GT, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.NOTLE.longText.date")
					}
				],
				[OperatorName.GE]: [{
						formatArgs: [Condition.createCondition(OperatorName.GE, ["Test"])],
						formatValue: ">=Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.GE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.GE.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GE, [">="])],
						formatValue: ">=>=",
						parsedValue: ">=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GE, ["a", "b"])],
						formatValue: ">=a",
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.GE, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GE, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.GE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.GE, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: ">=" + sDateTimeFormatted,
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.GE, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.GE, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.GE.longText.date")
					}
				],
				[OperatorName.NOTGE]: [{
						formatArgs: [Condition.createCondition(OperatorName.NOTGE, ["Test"])],
						formatValue: "!(>=Test)",
						parseArgs: ["!>=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTGE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.NOTGE.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGE, ["Test"])],
						formatValue: "!(>=Test)",
						parseArgs: ["!(>=Test)"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTGE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGE, [">="])],
						formatValue: "!(>=>=)",
						parseArgs: ["!>=>="],
						parsedValue: ">=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGE, ["a", "b"])],
						formatValue: "!(>=a)",
						parseArgs: ["!>=a"],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NOTGE, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGE, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NOTGE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTGE, ["2023-07-31T07:42:30Z"]), oDateTimeOffsetType],
						formatValue: "!(>=" + sDateTimeFormatted + ")",
						parsedValue: sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.NOTGE, [sDateTimeParsed], undefined, undefined, ConditionValidated.NotValidated),
						filter: {path: "test", operator: FilterOperator.LT, value1: sDateTimeParsed},
						type: oDateTimeOffsetType,
						baseType: BaseType.DateTime,
						isEmpty: false,
						valid: true,
						exception: false,
						longText: mdcMessageBundle.getText("operators.NOTGE.longText.date")
					}
				],
				[OperatorName.StartsWith]: [{
						formatArgs: [Condition.createCondition(OperatorName.StartsWith, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "Test*",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.StartsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType,
						longText: mdcMessageBundle.getText("operators.StartsWith.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.StartsWith, ["*"]), oStringType, FieldDisplay.Description],
						formatValue: "**",
						parsedValue: "*",
						condition: null,
						isEmpty: true,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.StartsWith, ["*"]), oStringType, FieldDisplay.Description],
						formatValue: "**",
						parseArgs: ["**", oStringType, FieldDisplay.Description, true, undefined, undefined, undefined, false],
						parsedValue: "*",
						condition: Condition.createCondition(OperatorName.StartsWith, ["*"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.StartsWith, ["*"]), oStringType, FieldDisplay.Description],
						formatValue: "**",
						parseArgs: ["**", oStringType, FieldDisplay.Description, true, undefined, undefined, undefined, true],
						parsedValue: "**",
						condition: Condition.createCondition(OperatorName.StartsWith, ["**"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.StartsWith, ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "a*",
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.StartsWith, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.StartsWith, ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.StartsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				[OperatorName.NotStartsWith]: [{
						formatArgs: [Condition.createCondition(OperatorName.NotStartsWith, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(Test*)",
						parseArgs: ["!Test*", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotStartsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType,
						longText: mdcMessageBundle.getText("operators.NotStartsWith.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotStartsWith, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(Test*)",
						parseArgs: ["!(Test*)", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotStartsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotStartsWith, ["*"]), oStringType, FieldDisplay.Description],
						formatValue: "!(**)",
						parseArgs: ["!**", oStringType, FieldDisplay.Description],
						parsedValue: "*",
						condition: null,
						isEmpty: true,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotStartsWith, ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "!(a*)",
						parseArgs: ["!a*", oStringType, FieldDisplay.Description],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NotStartsWith, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotStartsWith, ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotStartsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				[OperatorName.EndsWith]: [{
						formatArgs: [Condition.createCondition(OperatorName.EndsWith, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "*Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EndsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType,
						longText: mdcMessageBundle.getText("operators.EndsWith.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EndsWith, ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "*a",
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.EndsWith, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EndsWith, ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EndsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				[OperatorName.NotEndsWith]: [{
						formatArgs: [Condition.createCondition(OperatorName.NotEndsWith, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*Test)",
						parseArgs: ["!*Test", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotEndsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType,
						longText: mdcMessageBundle.getText("operators.NotEndsWith.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEndsWith, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*Test)",
						parseArgs: ["!(*Test)", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotEndsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEndsWith, ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*a)",
						parseArgs: ["!*a", oStringType, FieldDisplay.Description],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NotEndsWith, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEndsWith, ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotEndsWith, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				[OperatorName.BT]: [{
						formatArgs: [Condition.createCondition(OperatorName.BT, ["Test1", "Test2"])],
						formatValue: "Test1...Test2",
						parsedValue: "Test1Test2",
						condition: Condition.createCondition(OperatorName.BT, ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.BT, value1: "Test1", value2: "Test2"},
						isSingleValue: false,
						longText: mdcMessageBundle.getText("operators.BT.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.BT, ["a", "b"])],
						formatValue: "a...b",
						parsedValue: "ab",
						condition: Condition.createCondition(OperatorName.BT, ["a", "b"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.BT, ["a", "a"])],
						formatValue: "a...a",
						parsedValue: "aa",
						condition: Condition.createCondition(OperatorName.BT, ["a", "a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.BT, [null, "b"])],
						formatValue: "...b",
						parsedValue: "b",
						condition: null,
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.BT, ["a"])],
						formatValue: "a...",
						parsedValue: "a",
						condition: null,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.BT, ["Test1", "Test2"]), undefined, undefined, true],
						formatValue: "Test1...Test2",
						parseArgs: ["Test1...Test2", undefined, undefined, true],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition(OperatorName.BT, ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: false
					}
				],
				[OperatorName.NOTBT]: [{
						formatArgs: [Condition.createCondition(OperatorName.NOTBT, ["Test1", "Test2"])],
						formatValue: "!(Test1...Test2)",
						parseArgs: ["!Test1...Test2"],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition(OperatorName.NOTBT, ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.NB, value1: "Test1", value2: "Test2"},
						isSingleValue: false,
						longText: mdcMessageBundle.getText("operators.NOTBT.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTBT, ["Test1", "Test2"])],
						formatValue: "!(Test1...Test2)",
						parseArgs: ["!(Test1...Test2)"],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition(OperatorName.NOTBT, ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.NB, value1: "Test1", value2: "Test2"},
						isSingleValue: false
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTBT, ["a", "b"])],
						formatValue: "!(a...b)",
						parseArgs: ["!a...b"],
						parsedValue: "ab",
						condition: Condition.createCondition(OperatorName.NOTBT, ["a", "b"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTBT, ["a", "a"])],
						formatValue: "!(a...a)",
						parseArgs: ["!a...a"],
						parsedValue: "aa",
						condition: Condition.createCondition(OperatorName.NOTBT, ["a", "a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTBT, [null, "b"])],
						formatValue: "!(...b)",
						parseArgs: ["!...b"],
						parsedValue: "b",
						condition: null,
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTBT, ["a"])],
						formatValue: "!(a...)",
						parseArgs: ["!a..."],
						parsedValue: "a",
						condition: null,
						isEmpty: true,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NOTBT, ["Test1", "Test2"]), undefined, undefined, true],
						formatValue: "!(Test1...Test2)",
						parseArgs: ["!Test1...Test2", undefined, undefined, true],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition(OperatorName.NOTBT, ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: false
					}
				],
				[OperatorName.Contains]: [{
						formatArgs: [Condition.createCondition(OperatorName.Contains, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "*Test*",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.Contains, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter:  {path: "test", operator: FilterOperator.Contains, value1: "Test"},
						isSingleValue: true,
						type: oStringType,
						longText: mdcMessageBundle.getText("operators.Contains.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Contains, ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "*a*",
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.Contains, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Contains, ["01"]), oNUMCType, FieldDisplay.Description],
						formatValue: "*01*",
						parseArgs: ["*1*", oNUMCType, FieldDisplay.Description],
						parsedValue: "1",
						condition: Condition.createCondition(OperatorName.Contains, ["1"], undefined, undefined, ConditionValidated.NotValidated),
						exception: false,
						isEmpty: false,
						valid: true,
						type: oNUMCType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Contains, ["1"]), oNUMCType, FieldDisplay.Description],
						formatValue: "*1*",
						parseArgs: ["*A*", oNUMCType, FieldDisplay.Description],
						parsedValue: "A",
						condition: Condition.createCondition(OperatorName.Contains, ["A"], undefined, undefined, ConditionValidated.NotValidated),
						exception: false, // String type don't throw ParseException here
						isEmpty: false,
						valid: false,
						type: oNUMCType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Contains, ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.Contains, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Contains, ["@@$$"]), oStringType, FieldDisplay.Value, false],
						formatValue: "*@@$$*",
						parseArgs: ["*@@$$*", oStringType, FieldDisplay.Value],
						parsedValue: "@@$$",
						condition: Condition.createCondition(OperatorName.Contains, ["@@$$"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				[OperatorName.NotContains]: [{
						formatArgs: [Condition.createCondition(OperatorName.NotContains, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*Test*)",
						parseArgs: ["!*Test*", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotContains, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter:  {path: "test", operator: FilterOperator.NotContains, value1: "Test"},
						isSingleValue: true,
						type: oStringType,
						longText: mdcMessageBundle.getText("operators.NotContains.longText"),
						tokenText: ""
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotContains, ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*Test*)",
						parseArgs: ["!(*Test*)", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotContains, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter:  {path: "test", operator: FilterOperator.NotContains, value1: "Test"},
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotContains, ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*a*)",
						parseArgs: ["!*a*", oStringType, FieldDisplay.Description],
						parsedValue: "a",
						condition: Condition.createCondition(OperatorName.NotContains, ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotContains, ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.NotContains, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				[OperatorName.Empty]: [{
						formatArgs: [Condition.createCondition(OperatorName.Empty, [])],
						formatValue: "<empty>",
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.Empty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: FilterOperator.EQ, value1: ""},
						isSingleValue: true,
						oType: new StringType({}, {nullable: false}),
						baseType: BaseType.String,
						longText: mdcMessageBundle.getText("operators.Empty.longText"),
						tokenText: mdcMessageBundle.getText("operators.Empty.tokenText")
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Empty, [])],
						formatValue: "<empty>",
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.Empty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: undefined, operator: undefined, value1: undefined, value2: undefined},
						isSingleValue: true,
						oType: new StringType({}, {nullable: true}),
						baseType: BaseType.String
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Empty, []), undefined, undefined, true],
						formatValue: "<empty>", // TODO: right result without operator?
						parseArgs: ["<empty>", undefined, undefined, true],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.Empty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new StringType({}, {nullable: false}),
						baseType: BaseType.String
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Empty, [])],
						formatValue: "<empty>", // TODO: right result without operator?
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.Empty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new DateType(),
						baseType: BaseType.Date,
						filter: {path: "test", operator: FilterOperator.EQ, value1: null}
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.Empty, [])],
						formatValue: "<empty>", // TODO: right result without operator?
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.Empty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new DateTimeOffsetType({}, {V4: true, nullable: true}),
						baseType: BaseType.DateTime,
						filter: {path: "test", operator: FilterOperator.EQ, value1: null}
					}
				],
				[OperatorName.NotEmpty]: [{
						formatArgs: [Condition.createCondition(OperatorName.NotEmpty, [])],
						formatValue: "!(<empty>)", // TODO: right text?
						parseArgs: ["!<empty>"],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						oType: new StringType({}, {nullable: false}),
						baseType: BaseType.String,
						filter: {path: "test", operator: FilterOperator.NE, value1: ""},
						isSingleValue: true,
						longText: mdcMessageBundle.getText("operators.NotEmpty.longText"),
						tokenText: mdcMessageBundle.getText("operators.NotEmpty.tokenText")
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEmpty, [])],
						formatValue: "!(<empty>)", // TODO: right text?
						parseArgs: ["!(<empty>)"],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						oType: new StringType({}, {nullable: false}),
						baseType: BaseType.String,
						filter: {path: "test", operator: FilterOperator.NE, value1: ""},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEmpty, [])],
						formatValue: "!(<empty>)",
						parseArgs: ["!<empty>"],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: undefined, operator: undefined, value1: undefined, value2: undefined},
						isSingleValue: true,
						oType: new StringType({}, {nullable: true}),
						baseType: BaseType.String
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEmpty, []), undefined, undefined, true],
						formatValue: "!(<empty>)", // TODO: right result without operator?
						parseArgs: ["!<empty>", undefined, undefined, true],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new StringType({}, {nullable: false}),
						baseType: BaseType.String,
						longText: mdcMessageBundle.getText("operators.NotEmpty.longText"),
						tokenText: mdcMessageBundle.getText("operators.NotEmpty.tokenText")
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEmpty, [])],
						formatValue: "!(<empty>)", // TODO: right text?
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new DateType(),
						baseType: BaseType.Date,
						filter: {path: "test", operator: FilterOperator.NE, value1: null}
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEmpty, [])],
						formatValue: "!(<empty>)", // TODO: right text?
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new DateTimeOffsetType({}, {V4: true, nullable: true}),
						baseType: BaseType.DateTime,
						filter: {path: "test", operator: FilterOperator.NE, value1: null}
					}
				],
				"MyOperator": [{
					formatArgs: [Condition.createCondition("MyOperator", ["MyOperator"])],
					formatValue: "Hello",
					parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
					isEmpty: false,
					valid: true,
					custom: true,
					filter: {path: "test", operator: FilterOperator.EQ, value1: "Hello World"},
					isSingleValue: true,
					longText: "Hello World",
					tokenText: "Hello"
					}
				],
				"MyEQOperator": [{
						formatArgs: [Condition.createCondition("MyEQOperator", [1, "XXX"], undefined, undefined, ConditionValidated.Validated)],
						formatValue: "key: 1, description: XXX",
						parsedValue: "1XXX",
						isEmpty: false,
						valid: true,
						custom: true,
						filter: {path: "test", operator: FilterOperator.EQ, value1: 1},
						isSingleValue: true,
						type: oIntType,
						additionalType: oStringType,
						baseType: BaseType.Number,
						longText: "My Equal",
						tokenText: "key: {0}, description: {1}"
					}
				]
			};
		//checking all above Operators for validity
		fOperatorCheck(assert, aOperators, aFormatTest);

		oIntType.destroy();
		oStringType.destroy();
		oNUMCType.destroy();
		oUnitType.destroy();
		oDateTimeOffsetType.destroy();
		oDateTimeWithTimezoneType1.destroy();
		oDateTimeWithTimezoneType2.destroy();
		FilterOperatorUtil.removeOperator("MyOperator");
		FilterOperatorUtil.removeOperator("MyEQOperator");

	});

	QUnit.test("Checks for Range Configuration", function(assert) {

		FilterOperatorUtil.addOperator(new RangeOperator({
			name: "MyToToday",
			longText: "to Today",
			tokenText: "to Today ({0})",
			valueTypes: [OperatorValueType.Static],
			filterOperator: FilterOperator.LE,
			calcRange: function() {
				// the second entry in the returned is the end of the day (for time containing data types)
				return [UniversalDateUtils.ranges.today()[1]];
			}
		}));

		// get all standard Operators
		const aOperators = [];
		for (const sName in FilterOperatorUtil._mOperators) {
			aOperators.push(FilterOperatorUtil._mOperators[sName]);
		}

		const oCurrentDate = new UniversalDate();
		// stub date creation to return fix dates
		sinon.stub(UI5Date, "getInstance").withArgs().callsFake(function() {
			if (arguments.length === 0) {
				return UI5Date.getInstance.wrappedMethod.apply(this, [2024, 9, 18, 10, 22, 30]);
			} else {
				return UI5Date.getInstance.wrappedMethod.apply(this, arguments);
			}
		});

		const oDateTimeOffsetType = new DateTimeOffsetType({pattern: "yyyyMMdd-HHmmssSSS"}, {V4: true, precision: 3});
		const oDateType = new DateType({pattern: "yyyyMMdd"}, {});
		const sTodayEnd = oDateTimeOffsetType.parseValue("20241018-235959999", "string"); // Today end

		const oFormatTest = {
			[OperatorName.TODAYFROMTO]: [{
				formatArgs: [Condition.createCondition(OperatorName.TODAYFROMTO, [4, 6])],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", ["-4", "+6"]),
				formatValueCheckValues: ["4", "6"],
				parsedValue: "46",
				condition: Condition.createCondition(OperatorName.TODAYFROMTO, [4, 6], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				longText: mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_TITLE"),
				tokenText: mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT"),
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue("20241014-000000000", "string"), value2 : oDateTimeOffsetType.parseValue("20241024-235959999", "string")}
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.TODAYFROMTO, [-4, 6]), undefined, undefined, true],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", ["+4", "+6"]),
				parseArgs: [mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", ["+4", "+6"]), undefined, undefined, true],
				parsedValue: "-46",
				condition: Condition.createCondition(OperatorName.TODAYFROMTO, [-4, 6], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue("20241022-000000000", "string"), value2 : oDateTimeOffsetType.parseValue("20241024-235959999", "string")}
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.TODAYFROMTO, [4, -6]), undefined, undefined, true],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", ["-6", "-4"]),
				parseArgs: [mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", ["-4", "-6"]), undefined, undefined, true],
				parsedValue: "6-4",
				condition: Condition.createCondition(OperatorName.TODAYFROMTO, [6, -4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue("20241012-000000000", "string"), value2 : oDateTimeOffsetType.parseValue("20241014-235959999", "string")}
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.TODAYFROMTO, [-4, -6])],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", ["-6", "+4"]),
				parseArgs: [mMessageBundle.getText("DYNAMIC_DATE_TODAYFROMTO_FORMAT", ["+4", "-6"])],
				parsedValue: "64",
				condition: Condition.createCondition(OperatorName.TODAYFROMTO, [6, 4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue("20241012-000000000", "string"), value2 : oDateTimeOffsetType.parseValue("20241022-235959999", "string")}
			}],

			[OperatorName.SPECIFICMONTH]: [{
				formatArgs: [Condition.createCondition(OperatorName.SPECIFICMONTH, [4])],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_SPECIFICMONTH_FORMAT", ["May"]),
				parsedValue: "4",
				condition: Condition.createCondition(OperatorName.SPECIFICMONTH, [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mMessageBundle.getText("DYNAMIC_DATE_SPECIFICMONTH_TITLE"),
				tokenText: mMessageBundle.getText("DYNAMIC_DATE_SPECIFICMONTH_FORMAT"),
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue("20240501-000000000", "string"), value2 : oDateTimeOffsetType.parseValue("20240531-235959999", "string")},
				valueDefaults: [oCurrentDate.getMonth()]
			},
			{// only real valid if tokenText contains more that month
				formatArgs: [Condition.createCondition(OperatorName.SPECIFICMONTH, [4]), undefined, undefined, true],
				formatValue: "May",
				parseArgs: ["5", undefined, undefined, true], // also numbers needs to be parsed
				parsedValue: "4",
				condition: Condition.createCondition(OperatorName.SPECIFICMONTH, [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			},
			{// check wrong input
				parseArgs: ["XXX", undefined, undefined, false], // also numbers needs to be parsed
				parsedValue: "-1", // as parsing don't check validity
				condition: null,
				isEmpty: false,
				valid: false,
				exception: false
			}],
			[OperatorName.SPECIFICMONTHINYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.SPECIFICMONTHINYEAR, [4, 2000])],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_SPECIFICMONTHINYEAR_FORMAT", ["May", 2000]),
				parsedValue: "42000",
				condition: Condition.createCondition(OperatorName.SPECIFICMONTHINYEAR, [4, 2000], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				longText: mMessageBundle.getText("DYNAMIC_DATE_SPECIFICMONTHINYEAR_TITLE"),
				tokenText: mMessageBundle.getText("DYNAMIC_DATE_SPECIFICMONTHINYEAR_FORMAT"),
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue("20000501-000000000", "string"), value2 : oDateTimeOffsetType.parseValue("20000531-235959999", "string")},
				valueDefaults: [oCurrentDate.getMonth(), oCurrentDate.getFullYear()]
			},
			{// only real valid if tokenText contains more that month and year
				formatArgs: [Condition.createCondition(OperatorName.SPECIFICMONTHINYEAR, [4, 2000]), undefined, undefined, true],
				formatValue: "May 2000",
				parseArgs: ["5 2000", undefined, undefined, true], // also numbers needs to be parsed
				parsedValue: "42000",
				condition: Condition.createCondition(OperatorName.SPECIFICMONTHINYEAR, [4, 2000], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true
			}],

			"MyToToday": [{
				formatArgs: [Condition.createCondition("MyToToday", [undefined]), oDateTimeOffsetType],
				formatValue: "to Today (" + oDateTimeOffsetType.formatValue(sTodayEnd, "string") + ")",
				parseArgs: ["to Today"],
				parsedValue: "",
				condition: Condition.createCondition("MyToToday", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.LE, value1 : sTodayEnd}
			}]

		};

		// static operators
		let aDateTimeOperators = [
			{name: OperatorName.YESTERDAY, dateTime: {start: "20241017-000000000", end: "20241017-235959999"}, date: {start: "20241017", end: "20241017"}, staticText: "start"},
			{name: OperatorName.TODAY, dateTime: {start: "20241018-000000000", end: "20241018-235959999"}, date: {start: "20241018", end: "20241018"}, staticText: "start"},
			{name: OperatorName.TOMORROW, dateTime: {start: "20241019-000000000", end: "20241019-235959999"}, date: {start: "20241019", end: "20241019"}, staticText: "start"},
			{name: OperatorName.FIRSTDAYWEEK, dateTime: {start: "20241013-000000000", end: "20241013-235959999"}, date: {start: "20241013", end: "20241013"}, staticText: "start"},
			{name: OperatorName.LASTDAYWEEK, dateTime: {start: "20241019-000000000", end: "20241019-235959999"}, date: {start: "20241019", end: "20241019"}, staticText: "start"},
			{name: OperatorName.FIRSTDAYMONTH, dateTime: {start: "20241001-000000000", end: "20241001-235959999"}, date: {start: "20241001", end: "20241001"}, staticText: "start"},
			{name: OperatorName.LASTDAYMONTH, dateTime: {start: "20241031-000000000", end: "20241031-235959999"}, date: {start: "20241031", end: "20241031"}, staticText: "start"},
			{name: OperatorName.FIRSTDAYQUARTER, dateTime: {start: "20241001-000000000", end: "20241001-235959999"}, date: {start: "20241001", end: "20241001"}, staticText: "start"},
			{name: OperatorName.LASTDAYQUARTER, dateTime: {start: "20241231-000000000", end: "20241231-235959999"}, date: {start: "20241231", end: "20241231"}, staticText: "start"},
			{name: OperatorName.FIRSTDAYYEAR, dateTime: {start: "20240101-000000000", end: "20240101-235959999"}, date: {start: "20240101", end: "20240101"}, staticText: "start"},
			{name: OperatorName.LASTDAYYEAR, dateTime: {start: "20241231-000000000", end: "20241231-235959999"}, date: {start: "20241231", end: "20241231"}, staticText: "start"},
			{name: OperatorName.LASTWEEK, dateTime: {start: "20241006-000000000", end: "20241012-235959999"}, date: {start: "20241006", end: "20241012"}},
			{name: OperatorName.THISWEEK, dateTime: {start: "20241013-000000000", end: "20241019-235959999"}, date: {start: "20241013", end: "20241019"}},
			{name: OperatorName.NEXTWEEK, dateTime: {start: "20241020-000000000", end: "20241026-235959999"}, date: {start: "20241020", end: "20241026"}},
			{name: OperatorName.LASTMONTH, dateTime: {start: "20240901-000000000", end: "20240930-235959999"}, date: {start: "20240901", end: "20240930"}},
			{name: OperatorName.THISMONTH, dateTime: {start: "20241001-000000000", end: "20241031-235959999"}, date: {start: "20241001", end: "20241031"}},
			{name: OperatorName.NEXTMONTH, dateTime: {start: "20241101-000000000", end: "20241130-235959999"}, date: {start: "20241101", end: "20241130"}},
			{name: OperatorName.LASTQUARTER, dateTime: {start: "20240701-000000000", end: "20240930-235959999"}, date: {start: "20240701", end: "20240930"}},
			{name: OperatorName.THISQUARTER, dateTime: {start: "20241001-000000000", end: "20241231-235959999"}, date: {start: "20241001", end: "20241231"}},
			{name: OperatorName.NEXTQUARTER, dateTime: {start: "20250101-000000000", end: "20250331-235959999"}, date: {start: "20250101", end: "20250331"}},
			{name: OperatorName.LASTYEAR, dateTime: {start: "20230101-000000000", end: "20231231-235959999"}, date: {start: "20230101", end: "20231231"}},
			{name: OperatorName.THISYEAR, dateTime: {start: "20240101-000000000", end: "20241231-235959999"}, date: {start: "20240101", end: "20241231"}},
			{name: OperatorName.NEXTYEAR, dateTime: {start: "20250101-000000000", end: "20251231-235959999"}, date: {start: "20250101", end: "20251231"}},
			{name: OperatorName.QUARTER1, dateTime: {start: "20240101-000000000", end: "20240331-235959999"}, date: {start: "20240101", end: "20240331"}},
			{name: OperatorName.QUARTER2, dateTime: {start: "20240401-000000000", end: "20240630-235959999"}, date: {start: "20240401", end: "20240630"}},
			{name: OperatorName.QUARTER3, dateTime: {start: "20240701-000000000", end: "20240930-235959999"}, date: {start: "20240701", end: "20240930"}},
			{name: OperatorName.QUARTER4, dateTime: {start: "20241001-000000000", end: "20241231-235959999"}, date: {start: "20241001", end: "20241231"}},
			{name: OperatorName.YEARTODATE, dateTime: {start: "20240101-000000000", end: "20241018-235959999"}, date: {start: "20240101", end: "20241018"}},
			{name: OperatorName.DATETOYEAR, dateTime: {start: "20241018-000000000", end: "20241231-235959999"}, date: {start: "20241018", end: "20241231"}}
		];
		for (let i = 0; i < aDateTimeOperators.length; i++) {
			const sName = aDateTimeOperators[i].name;
			if (!oFormatTest.hasOwnProperty(sName)) {
				oFormatTest[sName] = [];
			}
			oFormatTest[sName].push({
				formatArgs: [Condition.createCondition(sName, [undefined])],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_" + sName + "_FORMAT"),
				parseArgs: [mMessageBundle.getText("DYNAMIC_DATE_" + sName + "_FORMAT")],
				parsedValue: "",
				condition: Condition.createCondition(sName, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mMessageBundle.getText("DYNAMIC_DATE_" + sName + "_TITLE"),
				tokenText: mMessageBundle.getText("DYNAMIC_DATE_" + sName + "_FORMAT"),
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue(aDateTimeOperators[i].dateTime.start, "string"), value2 : oDateTimeOffsetType.parseValue(aDateTimeOperators[i].dateTime.end, "string")},
				staticText: aDateTimeOperators[i].staticText === "start" ? aDateTimeOperators[i].dateTime.start : aDateTimeOperators[i].dateTime.start + " - " + aDateTimeOperators[i].dateTime.end
			});
			if (aDateTimeOperators[i].date) { // check filter for Date
				oFormatTest[sName].push({
					formatArgs: [Condition.createCondition(sName, [])],
					isEmpty: false,
					oType: oDateType,
					baseType: BaseType.Date,
					filter: {path: "test", operator: FilterOperator.BT, value1 : oDateType.parseValue(aDateTimeOperators[i].date.start, "string"), value2 : oDateType.parseValue(aDateTimeOperators[i].date.end, "string")},
					staticText: aDateTimeOperators[i].staticText === "start" ? aDateTimeOperators[i].date.start : aDateTimeOperators[i].date.start + " - " + aDateTimeOperators[i].date.end
				});
			}
		}
		// operators with one integer
		aDateTimeOperators = [
			{name: OperatorName.LASTMINUTES, dateTime: {start: "20241018-101930000", end: "20241018-102230000"}},
			{name: OperatorName.LASTMINUTESINCLUDED, dateTime: {start: "20241018-102000000", end: "20241018-102230000"}},
			{name: OperatorName.NEXTMINUTES, dateTime: {start: "20241018-102230000", end: "20241018-102530000"}},
			{name: OperatorName.NEXTMINUTESINCLUDED, dateTime: {start: "20241018-102230000", end: "20241018-102459000"}},
			{name: OperatorName.LASTHOURS, dateTime: {start: "20241018-07223000", end: "20241018-102230000"}},
			{name: OperatorName.LASTHOURSINCLUDED, dateTime: {start: "20241018-080000000", end: "20241018-102230000"}},
			{name: OperatorName.NEXTHOURS, dateTime: {start: "20241018-102230000", end: "20241018-132230000"}},
			{name: OperatorName.NEXTHOURSINCLUDED, dateTime: {start: "20241018-102230000", end: "20241018-125959000"}},
			{name: OperatorName.LASTDAYS, dateTime: {start: "20241015-000000000", end: "20241017-235959999"}, date: {start: "20241015", end: "20241017"}},
			{name: OperatorName.LASTDAYSINCLUDED, dateTime: {start: "20241016-000000000", end: "20241018-102230000"}, date: {start: "20241016", end: "20241018"}},
			{name: OperatorName.NEXTDAYS, dateTime: {start: "20241019-000000000", end: "20241021-235959999"}, date: {start: "20241019", end: "20241021"}},
			{name: OperatorName.NEXTDAYSINCLUDED, dateTime: {start: "20241018-102230000", end: "20241020-235959999"}, date: {start: "20241018", end: "20241020"}},
			{name: OperatorName.LASTWEEKS, dateTime: {start: "20240922-000000000", end: "20241012-235959999"}, date: {start: "20240922", end: "20241012"}},
			{name: OperatorName.LASTWEEKSINCLUDED, dateTime: {start: "20240929-000000000", end: "20241018-102230000"}, date: {start: "20240929", end: "20241018"}},
			{name: OperatorName.NEXTWEEKS, dateTime: {start: "20241020-000000000", end: "20241109-235959999"}, date: {start: "20241020", end: "20241109"}},
			{name: OperatorName.NEXTWEEKSINCLUDED, dateTime: {start: "20241018-102230000", end: "20241102-235959999"}, date: {start: "20241018", end: "20241102"}},
			{name: OperatorName.LASTMONTHS, dateTime: {start: "20240701-000000000", end: "20240930-235959999"}, date: {start: "20240701", end: "20240930"}},
			{name: OperatorName.LASTMONTHSINCLUDED, dateTime: {start: "20240801-000000000", end: "20241018-102230000"}, date: {start: "20240801", end: "20241018"}},
			{name: OperatorName.NEXTMONTHS, dateTime: {start: "20241101-000000000", end: "20250131-235959999"}, date: {start: "20241101", end: "20250131"}},
			{name: OperatorName.NEXTMONTHSINCLUDED, dateTime: {start: "20241018-102230000", end: "20241231-235959999"}, date: {start: "20241018", end: "20241231"}},
			{name: OperatorName.LASTQUARTERS, dateTime: {start: "20240101-000000000", end: "20240930-235959999"}, date: {start: "20240101", end: "20240930"}},
			{name: OperatorName.LASTQUARTERSINCLUDED, dateTime: {start: "20240401-000000000", end: "20241018-102230000"}, date: {start: "20240401", end: "20241018"}},
			{name: OperatorName.NEXTQUARTERS, dateTime: {start: "20250101-000000000", end: "20250930-235959999"}, date: {start: "20250101", end: "20250930"}},
			{name: OperatorName.NEXTQUARTERSINCLUDED, dateTime: {start: "20241018-102230000", end: "20250630-235959999"}, date: {start: "20241018", end: "20250630"}},
			{name: OperatorName.LASTYEARS, dateTime: {start: "20210101-000000000", end: "20231231-235959999"}, date: {start: "20210101", end: "20231231"}},
			{name: OperatorName.LASTYEARSINCLUDED, dateTime: {start: "20220101-000000000", end: "20241018-102230000"}, date: {start: "20220101", end: "20241018"}},
			{name: OperatorName.NEXTYEARS, dateTime: {start: "20250101-000000000", end: "20271231-235959999"}, date: {start: "20250101", end: "20271231"}},
			{name: OperatorName.NEXTYEARSINCLUDED, dateTime: {start: "20241018-102230000", end: "20261231-235959999"}, date: {start: "20241018", end: "20261231"}}
		];
		for (let i = 0; i < aDateTimeOperators.length; i++) {
			const sName = aDateTimeOperators[i].name;
			const iValue = 3;
			if (!oFormatTest.hasOwnProperty(sName)) {
				oFormatTest[sName] = [];
			}
			oFormatTest[sName].push({
				formatArgs: [Condition.createCondition(sName, [iValue])],
				formatValue: mMessageBundle.getText("DYNAMIC_DATE_" + sName + "_FORMAT", [iValue]),
				formatValueCheckValues: [iValue.toString()],
				parsedValue: iValue.toString(),
				condition: Condition.createCondition(sName, [iValue], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mMessageBundle.getText("DYNAMIC_DATE_" + sName + "_FORMAT").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mMessageBundle.getText("DYNAMIC_DATE_" + sName + "_FORMAT"),
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : oDateTimeOffsetType.parseValue(aDateTimeOperators[i].dateTime.start, "string"), value2 : oDateTimeOffsetType.parseValue(aDateTimeOperators[i].dateTime.end, "string")}
			});
			if (aDateTimeOperators[i].date) { // check filter for Date
				oFormatTest[sName].push({
					formatArgs: [Condition.createCondition(sName, [iValue])],
					isEmpty: false,
					oType: oDateType,
					baseType: BaseType.Date,
					filter: {path: "test", operator: FilterOperator.BT, value1 : oDateType.parseValue(aDateTimeOperators[i].date.start, "string"), value2 : oDateType.parseValue(aDateTimeOperators[i].date.end, "string")}
				});
			}
			oFormatTest[sName].push({ // single-operator case -> only number shown
				formatArgs: [Condition.createCondition(sName, [iValue]), undefined, undefined, true],
				formatValue: iValue.toString(),
				parseArgs: [iValue.toString(), undefined, undefined, true],
				parsedValue: iValue.toString(),
				condition: Condition.createCondition(sName, [iValue], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			});
		}
		//checking all above Operators for validity
		fOperatorCheck(assert, aOperators, oFormatTest);
		UI5Date.getInstance.restore();
		FilterOperatorUtil.removeOperator("MyToToday");


	});

	QUnit.test("getMatchingOperators", function(assert) {

		const aAllOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String);
		let aOperators = FilterOperatorUtil.getMatchingOperators(["X", "Y"]);
		assert.strictEqual(aOperators.length, 0, "invalid operators should not result in anything");

		aOperators = FilterOperatorUtil.getMatchingOperators(aAllOperators, "=true");
		let oExpected = FilterOperatorUtil.getOperator(OperatorName.EQ, aAllOperators);
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'=true' should match the EQ operator");

		aOperators = FilterOperatorUtil.getMatchingOperators(aAllOperators, "=5");
		oExpected = FilterOperatorUtil.getOperator(OperatorName.EQ, aAllOperators);
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'=5' should match the EQ operator");

		aOperators = FilterOperatorUtil.getMatchingOperators(aAllOperators, "*middle*");
		oExpected = FilterOperatorUtil.getOperator(OperatorName.Contains, aAllOperators);
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'*middle*' should match the Contains operator");

	});

	QUnit.test("getDefaultOperatorForType", function(assert) {

		let oOperator = FilterOperatorUtil.getDefaultOperator(BaseType.String);
		assert.strictEqual(oOperator.name, OperatorName.EQ, "EQ should be default operator for string type");

		oOperator = FilterOperatorUtil.getDefaultOperator(BaseType.DateTime);
		assert.strictEqual(oOperator.name, OperatorName.EQ, "EQ should be default operator for sap.ui.model.odata.type.TimeOfDay type");

	});

	QUnit.test("checkConditionsEmpty", function(assert) {

		const aConditions = [
						   Condition.createCondition(OperatorName.EQ, ["X"]),
						   Condition.createCondition(OperatorName.EQ, []),
						   Condition.createCondition(OperatorName.BT, ["X", "Y"]),
						   Condition.createCondition(OperatorName.BT, [])
						   ];

		FilterOperatorUtil.checkConditionsEmpty(aConditions);

		assert.equal(aConditions.length, 4, "number of conditions not changed");
		assert.notOk(aConditions[0].isEmpty, "Condition 0 is not empty");
		assert.ok(aConditions[1].isEmpty, "Condition 1 is empty");
		assert.notOk(aConditions[2].isEmpty, "Condition 2 is not empty");
		assert.ok(aConditions[3].isEmpty, "Condition 3 is empty");

		//test single Condition
		const oCondition = Condition.createCondition(OperatorName.EQ, []);
		FilterOperatorUtil.checkConditionsEmpty(oCondition);

		assert.ok(oCondition.isEmpty, "Condition 1 is empty");

	});

	QUnit.test("updateConditionsValues", function(assert) {

		const aConditions = [
						   Condition.createCondition(OperatorName.EQ, ["X"]),
						   Condition.createCondition(OperatorName.EQ, []),
						   Condition.createCondition(OperatorName.EQ, ["X", undefined]),
						   Condition.createCondition(OperatorName.EQ, ["X", "Y"]),
						   Condition.createCondition(OperatorName.EQ, ["X", "Y"], undefined, undefined, ConditionValidated.Validated), // validated
						   Condition.createCondition(OperatorName.EQ, ["X", undefined], undefined, undefined, ConditionValidated.Validated), // validated
						   Condition.createCondition(OperatorName.BT, ["X", "Y"]),
						   Condition.createCondition(OperatorName.BT, []),
						   Condition.createCondition(OperatorName.BT, ["X"]),
						   Condition.createCondition(OperatorName.TODAY, [null])
						   ];

		FilterOperatorUtil.updateConditionsValues(aConditions);

		assert.equal(aConditions.length, 10, "number of conditions not changed");
		assert.equal(aConditions[0].values.length, 1, "Condition 0 values length");
		assert.equal(aConditions[1].values.length, 1, "Condition 1 values length");
		assert.equal(aConditions[2].values.length, 1, "Condition 2 values length");
		assert.equal(aConditions[3].values.length, 2, "Condition 3 values length");
		assert.equal(aConditions[4].values.length, 2, "Condition 4 values length");
		assert.equal(aConditions[5].values.length, 2, "Condition 5 values length");
		assert.equal(aConditions[6].values.length, 2, "Condition 6 values length");
		assert.equal(aConditions[7].values.length, 2, "Condition 7 values length");
		assert.equal(aConditions[8].values.length, 2, "Condition 8 values length");
		assert.equal(aConditions[9].values.length, 0, "Condition 9 values length");

		//test single Condition
		const oCondition = Condition.createCondition(OperatorName.EQ, ["X", undefined]);
		FilterOperatorUtil.updateConditionsValues(oCondition);

		assert.equal(oCondition.values.length, 1, "Condition values length");

	});

	QUnit.test("indexOfCondition", function(assert) {

		const aConditions = [
						   Condition.createCondition(OperatorName.EQ, ["X", "Y"], undefined, undefined, ConditionValidated.Validated),
						   Condition.createCondition(OperatorName.EQ, ["Y"], undefined, undefined, ConditionValidated.NotValidated),
						   Condition.createCondition(OperatorName.EQ, ["Z"]),
						   Condition.createCondition(OperatorName.BT, ["X", "Y"]),
						   Condition.createCondition(OperatorName.TODAY, [null])
						   ];

		// same validated condition
		let oCondition = Condition.createCondition(OperatorName.EQ, ["X", "Z"], undefined, undefined, ConditionValidated.Validated);
		let iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 0, "same validated condition: Index of Condition");

		// same key, but not validated
		oCondition = Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "same key, but not validated: Index of Condition");

		// same key, but not known if validated
		oCondition = Condition.createCondition(OperatorName.EQ, ["X"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 0, "same key, but not known if validated: Index of Condition");

		// same not-validated condition
		oCondition = Condition.createCondition(OperatorName.EQ, ["Y"], undefined, undefined, ConditionValidated.NotValidated);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 1, "same not-validated condition: Index of Condition");

		// same key but validated
		oCondition = Condition.createCondition(OperatorName.EQ, ["Y"], undefined, undefined, ConditionValidated.Validated);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "same key but validated: Index of Condition");

		// same key, but not known if validated
		oCondition = Condition.createCondition(OperatorName.EQ, ["Y"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 1, "same key, but not known if validated: Index of Condition");

		// not existing condition
		oCondition = Condition.createCondition(OperatorName.EQ, ["A"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "not existing condition: Index of Condition");

		// existing between condition
		oCondition = Condition.createCondition(OperatorName.BT, ["X", "Y"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 3, "existing between condition: Index of Condition");

		// not existing between condition
		oCondition = Condition.createCondition(OperatorName.BT, ["X", "Z"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "not existing between condition: Index of Condition");

		// existing static condition
		oCondition = Condition.createCondition(OperatorName.TODAY, [null]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 4, "existing static condition: Index of Condition");

		// existing static condition without value
		oCondition = Condition.createCondition(OperatorName.TODAY, []);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 4, "existing static condition without value: Index of Condition");

	});

	QUnit.test("compareConditionsArray", function(assert) {

		let aConditions1 = [];
		let aConditions2 = [];

		let bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.ok(bEqual, "2 empty arrays of conditions are equal");

		aConditions1.push(Condition.createItemCondition("X", "Y"));
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "2 arrays with different length are not equal");

		aConditions2.push(Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.Validated));
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.ok(bEqual, "2 arrays with same length but different description are equal"); // description don't matter for compare

		aConditions1.push(Condition.createCondition(OperatorName.BT, ["X", "Y"]));
		aConditions2.push(Condition.createCondition(OperatorName.BT, ["X", "Z"]));
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "2 arrays with different conditions are not equal");

		// check In/OutParameter
		aConditions1 = [Condition.createItemCondition("X", "Y", {in1: "X"}, {out1: "Y"})];
		aConditions2 = [Condition.createItemCondition("X", "Y")];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.ok(bEqual, "2 Conditions, one with in/out one withot are equal");

		aConditions1 = [Condition.createItemCondition("X", "Y", {in1: "X"}, {out1: "Y"})];
		aConditions2 = [Condition.createItemCondition("X", "Y", {in1: "X"}, {out1: "Y"})];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.ok(bEqual, "2 Conditions, with same in/out are equal");

		aConditions1 = [Condition.createItemCondition("X", "Y", {in1: "X"}, {out1: "Y"})];
		aConditions2 = [Condition.createItemCondition("X", "Y", {in1: "A"}, {out1: "B"})];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "2 Conditions, with different in/out are not equal");

		// check payload
		aConditions1 = [Condition.createItemCondition("X", "Y", undefined, undefined, {in1: "X", out1: "Y"})];
		aConditions2 = [Condition.createItemCondition("X", "Y")];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "2 Conditions, one with payload one withot are not equal");

		aConditions1 = [Condition.createItemCondition("X", "Y", undefined, undefined, {in1: "X", out1: "Y"})];
		aConditions2 = [Condition.createItemCondition("X", "Y", undefined, undefined, {in1: "X", out1: "Y"})];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.ok(bEqual, "2 Conditions, with same payload are equal");

		aConditions1 = [Condition.createItemCondition("X", "Y", undefined, undefined, {in1: "X", out1: "Y"})];
		aConditions2 = [Condition.createItemCondition("X", "Y", undefined, undefined, {in2: "A", out2: "B"})];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "2 Conditions, with different payload are not equal");

		aConditions1 = [Condition.createCondition(OperatorName.BT, ["X", "Y", undefined])];
		aConditions2 = [Condition.createCondition(OperatorName.BT, ["X", "Y", null])];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "Comparison discerns null from undefined");

		aConditions1 = [Condition.createCondition(OperatorName.BT, ["X", "Y"], undefined, undefined, {in1: "X", out1: undefined})];
		aConditions2 = [Condition.createCondition(OperatorName.BT, ["X", "Y"], undefined, undefined, {in1: "X", out1: null})];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "Comparison discerns nested null from undefined");

	});

	QUnit.test("checkConditionValidated", function(assert) {

		let oCondition = Condition.createCondition(OperatorName.EQ, ["X"]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "Condition not validated");

		oCondition = Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.Validated);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition validated");

		oCondition = Condition.createCondition(OperatorName.EQ, ["X", undefined]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "Condition not validated");

		oCondition = Condition.createCondition(OperatorName.EQ, ["X", null]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "Condition not validated");

		oCondition = Condition.createCondition(OperatorName.EQ, ["X", "Y"]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition validated");

		oCondition = Condition.createCondition(OperatorName.BT, ["X", "Y"]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "Condition not validated");

	});

	QUnit.test("operator with special characters", function(assert) {
		const operatorWithSpecialCharacters = new RangeOperator({
			name: "OPT",
			tokenText: "+foo {0} operator",
			valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
			paramTypes: ["(\\d+)"],
			additionalInfo: "",
			calcRange: function(iDuration) {
				return UniversalDateUtils.ranges.nextYears(iDuration);
			},
			defaultValues: [1]
		});

		assert.equal(operatorWithSpecialCharacters.tokenTest, "^\\+foo (\\d+) operator$", "tokenTest has the expected format \+foo");
		assert.equal(operatorWithSpecialCharacters.tokenParse, "^\\+foo (\\d+) operator$|^(.+)?$", "tokenParse has the expected format \+foo");
		assert.equal(operatorWithSpecialCharacters.tokenFormat, "+foo {0} operator", "tokenFormat has the expected format +foo");
		assert.deepEqual(operatorWithSpecialCharacters.valueDefaults, [1], "valueDefaults");
		operatorWithSpecialCharacters.destroy();
	});

	QUnit.test("testing placeholder", function(assert) {
		let operatorWithPlaceholder = new RangeOperator({
			name: "OPT",
			tokenText: "foo $0 operator",
			valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
			paramTypes: ["(\\d+)"],
			additionalInfo: "",
			calcRange: function(iDuration) {
				return UniversalDateUtils.ranges.nextYears(iDuration);
			}
		});

		assert.equal(operatorWithPlaceholder.tokenTest, "^foo (\\d+) operator$", "tokenTest has the expected format for the placeholder");
		assert.equal(operatorWithPlaceholder.tokenParse, "^foo (\\d+) operator$|^(.+)?$", "tokenParse has the expected format for the placeholder");
		assert.equal(operatorWithPlaceholder.tokenFormat, "foo $0 operator", "tokenFormat has the expected format for the placeholder");
		operatorWithPlaceholder.destroy();

		operatorWithPlaceholder = new RangeOperator({
			name: "OPT",
			tokenText: "foo 0$ operator",
			valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
			paramTypes: ["(\\d+)"],
			additionalInfo: "",
			calcRange: function(iDuration) {
				return UniversalDateUtils.ranges.nextYears(iDuration);
			}
		});

		assert.equal(operatorWithPlaceholder.tokenTest, "^foo (\\d+) operator$", "tokenTest has the expected format for the placeholder");
		assert.equal(operatorWithPlaceholder.tokenParse, "^foo (\\d+) operator$|^(.+)?$", "tokenParse has the expected format for the placeholder");
		assert.equal(operatorWithPlaceholder.tokenFormat, "foo 0$ operator", "tokenFormat has the expected format for the placeholder");
		operatorWithPlaceholder.destroy();

		operatorWithPlaceholder = new RangeOperator({
			name: "OPT",
			tokenText: "foo {0} operator",
			valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
			paramTypes: ["(\\d+)"],
			additionalInfo: "",
			calcRange: function(iDuration) {
				return UniversalDateUtils.ranges.nextYears(iDuration);
			}
		});

		assert.equal(operatorWithPlaceholder.tokenTest, "^foo (\\d+) operator$", "tokenTest has the expected format for the placeholder");
		assert.equal(operatorWithPlaceholder.tokenParse, "^foo (\\d+) operator$|^(.+)?$", "tokenParse has the expected format for the placeholder");
		assert.equal(operatorWithPlaceholder.tokenFormat, "foo {0} operator", "tokenFormat has the expected format for the placeholder");
		operatorWithPlaceholder.destroy();
	});

	QUnit.test("testing OperatorsForType", function(assert) {

		const oMyEQ = new Operator({
			name: "MYEQ",
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});

		const oLowerThan = new Operator({
			name: "MYLT",
			filterOperator: FilterOperator.LT,
			tokenParse: "^<([^=].*)$",
			tokenFormat: "<{0}",
			valueTypes: [OperatorValueType.Self]
		});
		FilterOperatorUtil.addOperators([oMyEQ, oLowerThan]); // to have it in global operator list

		FilterOperatorUtil.setOperatorsForType("myType", [oMyEQ, oLowerThan], oMyEQ);

		let aOperators = FilterOperatorUtil.getOperatorsForType("myType");
		assert.equal(aOperators[0], "MYEQ", "Name set");
		assert.equal(aOperators[1], "MYLT", "Name set");

		let oDefaultOperator = FilterOperatorUtil.getDefaultOperator("myType");
		assert.equal(oDefaultOperator.name, "MYEQ", "Name set");

		FilterOperatorUtil.removeOperatorForType("myType", oMyEQ);

		aOperators = FilterOperatorUtil.getOperatorsForType("myType");
		assert.equal(aOperators.length, 1, "only one operator exist");
		assert.equal(aOperators[0], "MYLT", "Name set");

		// Should return null or one of the existng operators for this type, because the operator has been removed.
		oDefaultOperator = FilterOperatorUtil.getDefaultOperator("myType");
		assert.equal(oDefaultOperator.name, "MYEQ", "Name set");

		FilterOperatorUtil.removeOperatorForType("myType", "MYLT");

		aOperators = FilterOperatorUtil.getOperatorsForType("myType");
		assert.equal(aOperators.length, 0, "no operator exist");

		FilterOperatorUtil.setOperatorsForType("myType", oLowerThan, "MYLT");

		aOperators = FilterOperatorUtil.getOperatorsForType("myType");
		assert.equal(aOperators.length, 1, "only one operator exist");
		assert.equal(aOperators[0], "MYLT", "Name set");
		oDefaultOperator = FilterOperatorUtil.getDefaultOperator("myType");
		assert.equal(oDefaultOperator.name, "MYLT", "Name set");

		delete FilterOperatorUtil._mDefaultOpsForType["myType"]; // just to initialize
		FilterOperatorUtil.insertOperatorForType("myType", "MYLT", 0);
		FilterOperatorUtil.insertOperatorForType("myType", oMyEQ, 0);

		aOperators = FilterOperatorUtil.getOperatorsForType("myType");
		assert.equal(aOperators.length, 2, "two operators exist");
		assert.equal(aOperators[0], "MYEQ", "Name set");
		assert.equal(aOperators[1], "MYLT", "Name set");

		oMyEQ.destroy();
		oLowerThan.destroy();

	});

	QUnit.test("testing set/add/removeOperator", function(assert) {

		const oMyOperator = new Operator({
			name: "MyEqual",
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		const oMyOperator2 = new Operator({
			name: "MyEqual2",
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});

		// add one Operator and remove it
		FilterOperatorUtil.addOperator(oMyOperator);

		let oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.ok(oOperator, "Operator exist");

		FilterOperatorUtil.removeOperator(oMyOperator);

		oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.notOk(oOperator, "Operator should NOT exist");

		// add one Operator and remove it
		FilterOperatorUtil.addOperators(oMyOperator);

		oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.ok(oOperator, "Operator exist");

		FilterOperatorUtil.removeOperators(oMyOperator);

		oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.notOk(oOperator, "Operator should NOT exist");

		// Set one or multiple Operators
		FilterOperatorUtil.addOperators([oMyOperator, oMyOperator2]);

		oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.ok(oOperator, "Operator exist");
		oOperator = FilterOperatorUtil.getOperator("MyEqual2");
		assert.ok(oOperator, "Operator exist");

		// remove all new added operators
		FilterOperatorUtil.removeOperators([oMyOperator, "MyEqual2"]);

		oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.notOk(oOperator, "Operator should NOT exist");
		oOperator = FilterOperatorUtil.getOperator("MyEqual2");
		assert.notOk(oOperator, "Operator should NOT exist");

		oMyOperator.destroy();
		oMyOperator2.destroy();

	});

	QUnit.test("testing overwrite", function(assert) {

		let oOperator = FilterOperatorUtil.getOperator(OperatorName.Empty);
		assert.ok(oOperator, "Operator exist");
		assert.ok(oOperator.getLongText(BaseType.String) === "empty", "Operator getLongText returns default text");

		const fCallbackGetLongText = function(sBaseType) {
			if (sBaseType === BaseType.String) {
				return "foo";
			} else {
				return "bar";
			}
		};
		oOperator.overwrite(OperatorOverwrite.getLongText, fCallbackGetLongText);
		assert.equal(oOperator.getLongText, fCallbackGetLongText, "Overwrite function exist");
		assert.ok(oOperator.getLongText(BaseType.String) === "foo", "Operator getLongText returns expected text");
		assert.ok(oOperator.getLongText(BaseType.Number) === "bar", "Operator getLongText returns expected text");

		oOperator = FilterOperatorUtil.getOperator(OperatorName.TODAY);
		assert.ok(oOperator, "Operator exist");

		const fCallbackGetModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			return "foo";
		};
		oOperator.overwrite(OperatorOverwrite.getModelFilter, fCallbackGetModelFilter);
		assert.equal(oOperator.getModelFilter, fCallbackGetModelFilter, "Overwrite function exist");
		assert.equal(oOperator.getModelFilter(), "foo", "Overwrite function returns expected value");

	});

	QUnit.test("testing onlyEQ", function(assert) {

		const aOperators = [OperatorName.EQ];
		assert.ok(FilterOperatorUtil.onlyEQ(aOperators), "Only EQ-Operator");

		aOperators.push(OperatorName.NE);
		assert.notOk(FilterOperatorUtil.onlyEQ(aOperators), "two operators");

		aOperators.splice(0, 1);
		assert.notOk(FilterOperatorUtil.onlyEQ(aOperators), "Only NE-Operator");

	});

	function _checkMonthField(assert, oControl, oType, Field, BindingMode, Element, ValueHelp, Popover, FixedList, FixedListItem) {

		assert.ok(oControl, "Control created");
		assert.ok(oControl instanceof Field, "Control is Field");
		assert.equal(oControl?.getId(), "myId", "Control: id");
		assert.equal(oControl?.getDisplay(), FieldDisplay.Description, "Control: display ");
		assert.equal(oControl?.getWidth(), "100%", "Control: width");
		assert.equal(oControl?.getValueHelp(), "LFHForSpecificMonth", "Control: valueHelp");

		const oBindingInfo = oControl?.getBindingInfo("value");
		assert.equal(oBindingInfo?.path || oBindingInfo.parts?.[0].path, "myPath", "BindingInfo path");
		assert.equal(oBindingInfo?.type || oBindingInfo.parts?.[0].type, oType, "BindingInfo type");
		assert.equal(oBindingInfo?.mode || oBindingInfo.parts?.[0].mode, BindingMode.TwoWay, "BindingInfo path");
		assert.equal(oBindingInfo?.targetType || oBindingInfo.parts?.[0].targetType, "raw", "BindingInfo targetType");

		if (oControl?.getValueHelp()) {
			const oValueHelp = Element.getElementById(oControl.getValueHelp());
			assert.ok(oValueHelp, "ValueHelp created");
			assert.ok(oValueHelp instanceof ValueHelp, "ValueHelp is ValueHelp");

			const oPopver = oValueHelp?.getTypeahead();
			assert.ok(oPopver, "Popover created and assigned as typeahead");
			assert.ok(oPopver instanceof Popover, "Popover is Popover");

			const oFixedList = oPopver?.getContent()?.[0];
			assert.ok(oFixedList, "Content created");
			assert.ok(oFixedList instanceof FixedList, "Content is FixedList");
			assert.notOk(oFixedList?.getFilterList(), "FixedList: filterList");
			assert.ok(oFixedList?.getUseFirstMatch(), "FixedList: useFirstMatch");

			const aItems = oFixedList.getItems();
			assert.equal(aItems?.length, 12, "Number of items");
			for (let i = 0; i < aItems.length; i++) {
				const oItem = aItems[i];
				assert.ok(oItem instanceof FixedListItem, "Item is FixedListItem");
				assert.equal(oItem.getKey(), i, "Item: key");
				// TODO, how to check names without copy _getMonths function?
			}
		}

		oControl.destroy();

	}

	QUnit.test("createControl: SPECIFICMONTH", function(assert) {

		return new Promise((resolve) => {
			sap.ui.require(["sap/ui/mdc/Field",
					"sap/ui/model/BindingMode",
					"sap/ui/core/Element",
					"sap/ui/mdc/valuehelp/content/FixedList",
					"sap/ui/mdc/valuehelp/content/FixedListItem",
					"sap/ui/mdc/ValueHelp",
					"sap/ui/mdc/valuehelp/Popover",
					"sap/ui/core/Control"], (Field, BindingMode, Element, FixedList, FixedListItem, ValueHelp, Popover, Control) => {
				const oOperator = FilterOperatorUtil.getOperator("SPECIFICMONTH");
				const oType = new IntegerType();
				const oControl = oOperator.createControl(oType, "myPath", 0, "myId");

				_checkMonthField(assert, oControl, oType, Field, BindingMode, Element, ValueHelp, Popover, FixedList, FixedListItem);

				resolve();
			});
		});

	});

	QUnit.test("createControl: SPECIFICMONTHINYEAR", function(assert) {

		return new Promise((resolve) => {
			sap.ui.require(["sap/ui/mdc/Field",
					"sap/ui/model/BindingMode",
					"sap/ui/core/Element",
					"sap/ui/mdc/valuehelp/content/FixedList",
					"sap/ui/mdc/valuehelp/content/FixedListItem",
					"sap/ui/mdc/ValueHelp",
					"sap/ui/mdc/valuehelp/Popover",
					"sap/ui/core/Control"], (Field, BindingMode, Element, FixedList, FixedListItem, ValueHelp, Popover, Control) => {
				const oOperator = FilterOperatorUtil.getOperator("SPECIFICMONTHINYEAR");
				const oType = new IntegerType();
				let oControl = oOperator.createControl(oType, "myPath", 0, "myId");

				_checkMonthField(assert, oControl, oType, Field, BindingMode, Element, ValueHelp, Popover, FixedList, FixedListItem);

				oControl = oOperator.createControl(oType, "myPath", 1, "myId");
				assert.ok(oControl, "Control created");
				assert.ok(oControl instanceof Field, "Control is Field");
				assert.equal(oControl?.getId(), "myId", "Control: id");
				assert.equal(oControl?.getDisplay(), FieldDisplay.Value, "Control: display ");
				assert.equal(oControl?.getWidth(), "100%", "Control: width");
				assert.notOk(oControl?.getValueHelp(), "Control: valueHelp");

				const oBindingInfo = oControl?.getBindingInfo("value");
				assert.equal(oBindingInfo?.path || oBindingInfo.parts?.[0].path, "myPath", "BindingInfo path");
				assert.equal(oBindingInfo?.type || oBindingInfo.parts?.[0].type, oType, "BindingInfo type");
				assert.equal(oBindingInfo?.mode || oBindingInfo.parts?.[0].mode, BindingMode.TwoWay, "BindingInfo path");
				assert.equal(oBindingInfo?.targetType || oBindingInfo.parts?.[0].targetType, "raw", "BindingInfo targetType");

				resolve();
			});
		});

	});

	QUnit.test("getModelFilter: Unit", function(assert) { // just a POC

		const oUnitType = new UnitType({}, {});
		let oOperator = FilterOperatorUtil.getOperator(OperatorName.EQ);
		let oCondition = Condition.createCondition(OperatorName.EQ, [[5, "mass-kilogram"]], undefined, undefined, ConditionValidated.NotValidated);
		let oFilter = oOperator.getModelFilter(oCondition, "number,unit", oUnitType, false, BaseType.Unit);
		let aFilters = oFilter?.getFilters();

		assert.ok(oFilter, "Filter returned");
		assert.equal(aFilters?.length, 2, "2 Filters included");
		assert.equal(aFilters?.[0]?.getPath(), "number", "Filter0 path");
		assert.equal(aFilters?.[0]?.getOperator(), FilterOperator.EQ, "Filter0 operator");
		assert.equal(aFilters?.[0]?.getValue1(), 5, "Filter0 value1");
		assert.equal(aFilters?.[0]?.getValue2(), undefined, "Filter0 value2");
		assert.equal(aFilters?.[1]?.getPath(), "unit", "Filter1 path");
		assert.equal(aFilters?.[1]?.getOperator(), FilterOperator.EQ, "Filter1 operator");
		assert.equal(aFilters?.[1]?.getValue1(), "mass-kilogram", "Filter1 value1");
		assert.equal(aFilters?.[1]?.getValue2(), undefined, "Filter1 value2");

		oOperator = FilterOperatorUtil.getOperator(OperatorName.BT);
		oCondition = Condition.createCondition(OperatorName.BT, [[5, "mass-kilogram"], [10, "mass-kilogram"]], undefined, undefined, ConditionValidated.NotValidated);
		oFilter = oOperator.getModelFilter(oCondition, "number,unit", oUnitType, false, BaseType.Unit);
		aFilters = oFilter?.getFilters();

		assert.ok(oFilter, "Filter returned");
		assert.equal(aFilters?.length, 2, "2 Filters included");
		assert.equal(aFilters?.[0]?.getPath(), "number", "Filter0 path");
		assert.equal(aFilters?.[0]?.getOperator(), FilterOperator.BT, "Filter0 operator");
		assert.equal(aFilters?.[0]?.getValue1(), 5, "Filter0 value1");
		assert.equal(aFilters?.[0]?.getValue2(), 10, "Filter0 value2");
		assert.equal(aFilters?.[1]?.getPath(), "unit", "Filter1 path");
		assert.equal(aFilters?.[1]?.getOperator(), FilterOperator.EQ, "Filter1 operator");
		assert.equal(aFilters?.[1]?.getValue1(), "mass-kilogram", "Filter1 value1");
		assert.equal(aFilters?.[1]?.getValue2(), undefined, "Filter1 value2");


		oOperator = FilterOperatorUtil.getOperator(OperatorName.BT);
		oCondition = Condition.createCondition(OperatorName.EQ, [[undefined, "mass-kilogram"]], undefined, undefined, ConditionValidated.NotValidated);
		oFilter = oOperator.getModelFilter(oCondition, "number,unit", oUnitType, false, BaseType.Unit);
		aFilters = oFilter?.getFilters();

		assert.ok(oFilter, "Filter returned");
		assert.notOk(aFilters, "No Filters included");
		assert.equal(oFilter?.getPath(), "unit", "Filter1 path");
		assert.equal(oFilter?.getOperator(), FilterOperator.EQ, "Filter1 operator");
		assert.equal(oFilter?.getValue1(), "mass-kilogram", "Filter1 value1");
		assert.equal(oFilter?.getValue2(), undefined, "Filter1 value2");

	});

	QUnit.test("getModelFilter: inParameter", function(assert) { // could only happen for old variants

		const oType = new StringType({}, {});
		const oOperator = FilterOperatorUtil.getOperator(OperatorName.EQ);
		const oCondition = Condition.createCondition(OperatorName.EQ, ["X", "Text"], {"conditions/in1": "A", "conditions/in2": "B"}, undefined, ConditionValidated.Validated);
		const oFilter = oOperator.getModelFilter(oCondition, "myPath", oType, false, BaseType.String);
		const aFilters = oFilter?.getFilters();

		assert.ok(oFilter, "Filter returned");
		assert.equal(aFilters?.length, 3, "3 Filters included");
		assert.equal(aFilters?.[0]?.getPath(), "myPath", "Filter0 path");
		assert.equal(aFilters?.[0]?.getOperator(), FilterOperator.EQ, "Filter0 operator");
		assert.equal(aFilters?.[0]?.getValue1(), "X", "Filter0 value1");
		assert.equal(aFilters?.[0]?.getValue2(), undefined, "Filter0 value2");
		assert.equal(aFilters?.[1]?.getPath(), "in1", "Filter1 path");
		assert.equal(aFilters?.[1]?.getOperator(), FilterOperator.EQ, "Filter1 operator");
		assert.equal(aFilters?.[1]?.getValue1(), "A", "Filter1 value1");
		assert.equal(aFilters?.[1]?.getValue2(), undefined, "Filter1 value2");
		assert.equal(aFilters?.[2]?.getPath(), "in2", "Filter2 path");
		assert.equal(aFilters?.[2]?.getOperator(), FilterOperator.EQ, "Filter2 operator");
		assert.equal(aFilters?.[2]?.getValue1(), "B", "Filter2 value1");
		assert.equal(aFilters?.[2]?.getValue2(), undefined, "Filter2 value2");

	});

});
