/*!
 * ${copyright}
 */

/* global QUnit */
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
	"sap/ui/model/Filter",
	"sap/ui/model/type/Integer",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UniversalDateUtils",
	"sap/ui/core/date/UI5Date",
	"sap/m/library",
	"sap/ui/mdc/enums/OperatorOverwrite"
], function(
	FilterOperatorUtil,
	Operator,
	RangeOperator,
	Condition,
	BaseType,
	ConditionValidated,
	FieldDisplay,
	OperatorValueType,
	Filter,
	IntegerType,
	StringType,
	DateType,
	DateTimeWithTimezoneType,
	DateTimeOffsetType,
	UniversalDate,
	UniversalDateUtils,
	UI5Date,
	mLibrary,
	OperatorOverwrite
) {
	"use strict";

	QUnit.module("Operator", {
		beforeEach: function() {

		},

		afterEach: function() {}
	});

	QUnit.test("createOperator", function(assert) {

		const _getModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			return new Filter({ path: sFieldPath, operator: "EQ", value1: new Date().getFullYear() });
		};
		let oOperator = new Operator({
			name: "THISYEAR",
			valueTypes: [],
			getModelFilter: _getModelFilter
		});

		assert.equal(oOperator.name, "THISYEAR", "Name set");
		assert.ok(oOperator.format, "Format function set by default");
		assert.ok(oOperator.parse, "Parse function set by default");
		assert.ok(oOperator.validate, "Validate function set by default");
		assert.equal(oOperator.getModelFilter, _getModelFilter, "GetModelFilter not default");

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

	});

	QUnit.test("createRangeOperator", function(assert) {

		const _getModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			return new Filter({ path: sFieldPath, operator: "EQ", value1: new Date().getFullYear() });
		};

		const oOperator = new RangeOperator({
			name: "TODAY",
			valueTypes: [OperatorValueType.Static],
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

		assert.ok(oOperator.calcRange, "calcRange function set");
		assert.ok(oOperator.formatRange, "formatRange function set");
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
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Date).length, 54, "Default operators for date");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.DateTime).length, 58, "Default operators for datetime");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Time).length, 12, "Default operators for time");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Numeric).length, 12, "Default operators for numeric");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Boolean).length, 2, "Default operators for boolean");

		// TODO, test what operators are returned

	});

	QUnit.test("getOperator", function(assert) {

		const oOperator = FilterOperatorUtil.getOperator("EQ");
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, "EQ", "EQ operator returned");

	});

	QUnit.test("getEQOperator", function(assert) {

		const oMyOperator = new Operator({
			name: "MyEqual",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oMyOperator);

		let oOperator = FilterOperatorUtil.getEQOperator();
		assert.equal(oOperator && oOperator.name, "EQ", "EQ operator returned");

		oOperator = FilterOperatorUtil.getEQOperator(["GT", oMyOperator.name, "LT"]);
		assert.equal(oOperator && oOperator.name, oMyOperator.name, "custom operator returned");

		oOperator = FilterOperatorUtil.getEQOperator(["GT", "LT"]);
		assert.equal(oOperator && oOperator.name, "EQ", "EQ operator returned");

		delete FilterOperatorUtil._mOperators[oMyOperator.name]; // TODO API to remove operator

	});

	QUnit.test("getOperatorForDynamicDateOption", function(assert) {

		let oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("FROM", BaseType.Date);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, "GE", "GE operator returned");

		oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("Date-EQ", BaseType.Date);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, "EQ", "EQ operator returned");

	});

	QUnit.test("getDynamicDateOptionForOperator", function(assert) {

		let oOperator = FilterOperatorUtil.getOperator("TODAY");
		let sOption = FilterOperatorUtil.getDynamicDateOptionForOperator(oOperator, mLibrary.StandardDynamicDateRangeKeys, BaseType.Date);
		assert.equal(sOption, "TODAY", "TODAY option returned");

		oOperator = FilterOperatorUtil.getOperator("GE");
		sOption = FilterOperatorUtil.getDynamicDateOptionForOperator(oOperator, mLibrary.StandardDynamicDateRangeKeys, BaseType.Date);
		assert.equal(sOption, "FROM", "FROM option returned");

	});

	QUnit.test("getCustomDynamicDateOptionForOperator", function(assert) {

		const oOperator = FilterOperatorUtil.getOperator("LT");
		const sOption = FilterOperatorUtil.getCustomDynamicDateOptionForOperator(oOperator, BaseType.Date);
		assert.equal(sOption, "Date-LT", "custom option returned");

	});

	function fOperatorCheck(assert, aOperators, aFormatTest) {

		//checking all above Operators for validity
		for (let i = 0; i < aOperators.length; i++) {
			const oOperator = aOperators[i];
			const sOperator = oOperator.name;
			assert.ok(true, "--------------------   Checking Operator " + sOperator + "   -----------------------------------------");
			assert.strictEqual(oOperator.shortText !== "", true, "Operator " + sOperator + " has a valid shortText " + oOperator.shortText);
			assert.strictEqual(oOperator.longText !== "", true, "Operator " + sOperator + " has a valid longText " + oOperator.longText);
			assert.strictEqual(oOperator.tokenText !== "", true, "Operator " + sOperator + " has a valid tokenText " + oOperator.tokenText);
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
					const sFormattedText = oOperator.format.apply(oOperator, oTest.formatArgs);
					assert.strictEqual(sFormattedText, oTest.formatValue, "Formatting: Operator " + sOperator + " has formated correctly from " + oTest.formatArgs.join() + " to " + oTest.formatValue);

					// EQ-Operator.parse("=Test") --> ["Test"]
					try {
						const aParseText = oOperator.parse.apply(oOperator, oTest.parseArgs || [sFormattedText, oTest.type]);
						const sParseText = Array.isArray(aParseText) ? aParseText.join("") : aParseText; // also test undefined result
						const sTestText = Array.isArray(oTest.parseArgs) ? oTest.parseArgs[0] : sFormattedText;
						assert.strictEqual(sParseText, oTest.parsedValue, "Parsing: Operator " + sOperator + " has parsed correctly from " + sTestText + " to " + sParseText);
					} catch (oException) {
						assert.ok(oTest.exception, "Exception fired in parsing");
					}

					// EQ-Operator.getCondition("=Test") --> {operator: "EQ", values: ["Test"]]}
					let oCondition;
					try {
						oCondition = oOperator.getCondition.apply(oOperator, oTest.parseArgs || [sFormattedText, oTest.type]);
						if (oTest.condition) {
							assert.deepEqual(oCondition, oTest.condition, "getCondition: Operator " + sOperator + " returns oCondition instance");

							// create the model filter instance of the condition
							//						var oFilter = oOperator.getModelFilter(oCondition);
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
						} catch (oException) {
							assert.ok(!oTest.valid, "Exception fired in validation");
						}

						if (oTest.filter) {
							const oFilter = oOperator.getModelFilter(oCondition, "test", oTest.oType, oTest.caseSensitive, oTest.baseType);
							assert.ok(oFilter, "Filter returned");
							assert.equal(oFilter.sPath, oTest.filter.path, "Filter path");
							assert.equal(oFilter.sOperator, oTest.filter.operator, "Filter operator");
							assert.equal(oFilter.oValue1, oTest.filter.value1, "Filter value1");
							assert.equal(oFilter.oValue2, oTest.filter.value2, "Filter value2");
						}
					}

					if (oTest.hasOwnProperty("isSingleValue")) {
						assert.equal(oOperator.isSingleValue(), oTest.isSingleValue, "isSingleValue");
					}

					if (oTest.hasOwnProperty("longText")) {
						assert.equal(oOperator.longText, oTest.longText, "has expected longText");
					}

					if (oTest.hasOwnProperty("tokenText")) {
						assert.equal(oOperator.tokenText, oTest.tokenText, "has expected tokenText");
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
				return new Filter({ path: sFieldPath, operator: "EQ", value1: "Hello World" });
			}
		}));

		const aOperators = [];
		for (const sName in FilterOperatorUtil._mOperators) {
			aOperators.push(FilterOperatorUtil._mOperators[sName]);
		}

		const oIntType = new IntegerType({}, {maximum: 3});
		const oStringType = new StringType({}, {maxLength: 5});
		const oNUMCType = new StringType({}, {maxLength: 5, isDigitSequence: true, nullable: false});
		const oDateTimeWithTimezoneType1 = new DateTimeWithTimezoneType({pattern: "yyyy-MM-dd'T'HH:mm:ss", showTimezone: false});
		oDateTimeWithTimezoneType1._aCurrentValue = ["2022-02-24T12:15:30Z", "Europe/Berlin"];
		const oDateTimeWithTimezoneType2 = new DateTimeWithTimezoneType({showTimezone: true, showDate: false, showTime: false});
		oDateTimeWithTimezoneType2._aCurrentValue = ["2022-02-24T12:15:30Z", "Europe/Berlin"];
		const oDateTimeOffsetType = new DateTimeOffsetType({}, {V4: true, nullable: false});
		const sDateTimeFormatted = oDateTimeOffsetType.formatValue("2023-07-31T07:42:30Z", "string");
		const sDateTimeParsed = oDateTimeOffsetType.parseValue(sDateTimeFormatted, "string");

		const aFormatTest = {
				"EQ": [{
						formatArgs: [Condition.createItemCondition("Test", "desc")],
						formatValue: "desc (Test)",
						parseArgs: ["=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", [undefined, "Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.Value],
						formatValue: "Test",
						parseArgs: ["=Test", undefined, FieldDisplay.Value],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "EQ", value1: "Test"}
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["Test"]), undefined, undefined],
						formatValue: "=Test",
						parseArgs: ["Test", undefined, FieldDisplay.Value, true],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "EQ", value1: "Test"}
					},
					{
						formatArgs: [Condition.createItemCondition("Test"), undefined, FieldDisplay.Value],
						formatValue: "=Test",
						parseArgs: ["Test", undefined, FieldDisplay.Value, true],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "EQ", value1: "Test"}
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.Description],
						formatValue: "desc",
						parseArgs: ["=desc", undefined, FieldDisplay.Description],
						parsedValue: "desc",
						condition: Condition.createCondition("EQ", [undefined, "desc"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test (desc)",
						parseArgs: ["=Test", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition(5, "desc"), oIntType, FieldDisplay.ValueDescription],
						formatValue: "5 (desc)",
						parseArgs: ["=5", oIntType, FieldDisplay.ValueDescription],
						parsedValue: "5",
						condition: Condition.createCondition("EQ", [5, undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition(5, "desc"), oIntType, FieldDisplay.DescriptionValue],
						formatValue: "desc (5)",
						parseArgs: ["=desc (5)", oIntType, FieldDisplay.DescriptionValue],
						parsedValue: "5desc",
						condition: Condition.createCondition("EQ", [5, "desc"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition(1, "desc"), oIntType, FieldDisplay.ValueDescription],
						formatValue: "1 (desc)",
						parseArgs: ["=A", oIntType, FieldDisplay.ValueDescription],
						parsedValue: "",
						condition: Condition.createCondition("EQ", [undefined, undefined], undefined, undefined, ConditionValidated.NotValidated),
						exception: true,
						isEmpty: true,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test (desc)",
						parseArgs: ["=Test (desc)", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Testdesc",
						condition: Condition.createCondition("EQ", ["Test", "desc"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition(null, "desc"), undefined, FieldDisplay.ValueDescription],
						formatValue: " (desc)",
						parseArgs: ["=", undefined, FieldDisplay.ValueDescription],
						parsedValue: undefined,
						condition: null,
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["Test", undefined], undefined, undefined, ConditionValidated.Validated), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test",
						parseArgs: ["=Test", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", [undefined, "Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["="])],
						formatValue: "==",
						parsedValue: undefined,
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["a", "b"])],
						formatValue: "b (a)",
						parseArgs: ["b (a)", undefined, undefined, true],
						parsedValue: "ab",
						condition: Condition.createCondition("EQ", ["a", "b"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{ // DateTime with Timezone
						formatArgs: [Condition.createCondition("EQ", [["2022-02-24T12:15:30Z", "Europe/Berlin"]]), oDateTimeWithTimezoneType1, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						formatValue: "2022-02-24T13:15:30",
						parseArgs: ["2022-02-24T14:15:30", oDateTimeWithTimezoneType1, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						parsedValue: "2022-02-24T14:15:30+01:00,Europe/Berlin",
						condition: Condition.createCondition("EQ", [["2022-02-24T14:15:30+01:00", "Europe/Berlin"]], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false, // as String (for timezone) allows only 5 characters -> test for usage of this type
						type: oDateTimeWithTimezoneType1,
						compositeTypes: [oDateTimeOffsetType, oStringType],
						compositePart: 0
					},
					{
						formatArgs: [Condition.createCondition("EQ", [["2022-02-24T12:15:30Z", "Europe/Berlin"]]), oDateTimeWithTimezoneType2, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						formatValue: "Europe, Berlin",
						parseArgs: ["America/New_York", oDateTimeWithTimezoneType2, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						parsedValue: "2022-02-24T12:15:30Z,America/New_York",
						condition: Condition.createCondition("EQ", [["2022-02-24T12:15:30Z", "America/New_York"]], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false, // as String (for timezone) allows only 5 characters -> test for usage of this type
						type: oDateTimeWithTimezoneType2,
						compositeTypes: [oDateTimeOffsetType, oStringType],
						compositePart: 1
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["@@$$"]), undefined, FieldDisplay.Value, false],
						formatValue: "=@@$$",
						parseArgs: ["=@@$$", undefined, FieldDisplay.Value],
						parsedValue: "@@$$",
						condition: Condition.createCondition("EQ", ["@@$$"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createItemCondition(5, "2023-07-31T07:42:30Z"), oIntType, FieldDisplay.ValueDescription, true, undefined, oDateTimeOffsetType, undefined],
						formatValue: "5 (" + sDateTimeFormatted + ")",
						parseArgs: ["5 (" + sDateTimeFormatted + ")", oIntType, FieldDisplay.ValueDescription, true, undefined, oDateTimeOffsetType, undefined],
						parsedValue: "5" + sDateTimeParsed,
						condition: Condition.createCondition("EQ", [5, sDateTimeParsed], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: false,
						type: oIntType,
						additionalType : oDateTimeOffsetType
					},
					{
						formatArgs: [Condition.createItemCondition(5, "2023-07-31T07:42:30Z"), oIntType, FieldDisplay.Description, true, undefined, oDateTimeOffsetType, undefined],
						formatValue: sDateTimeFormatted,
						parseArgs: ["1 (X)", oIntType, FieldDisplay.ValueDescription, true, undefined, oDateTimeOffsetType, undefined],
						exception: true,
						valid: false,
						type: oIntType,
						additionalType : oDateTimeOffsetType
					},
					{
						formatArgs: [Condition.createCondition("EQ", [5]), oIntType, FieldDisplay.Description, true, undefined, oDateTimeOffsetType, undefined],
						formatValue: "5",
						parseArgs: ["1", oIntType, FieldDisplay.Value, true, undefined, oDateTimeOffsetType, undefined],
						parsedValue: "1",
						condition: Condition.createCondition("EQ", [1], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						exception: false,
						valid: true,
						type: oIntType,
						additionalType : oDateTimeOffsetType
					}
				],
				"NE": [{
						formatArgs: [Condition.createCondition("NE", ["Test"])],
						formatValue: "!(=Test)",
						parseArgs: ["!=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition("NE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("NE", ["="])],
						formatValue: "!(==)",
						parsedValue: undefined,
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NE", ["a", "b"])],
						formatValue: "!(=a)",
						parseArgs: ["!=a"],
						parsedValue: "a",
						condition: Condition.createCondition("NE", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NE", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"LT": [{
						formatArgs: [Condition.createCondition("LT", ["Test"])],
						formatValue: "<Test",
						parsedValue: "Test",
						condition: Condition.createCondition("LT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "LT", value1: "Test"},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("LT", ["<"])],
						formatValue: "<<",
						parsedValue: "<",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("LT", ["a", "b"])],
						formatValue: "<a",
						parsedValue: "a",
						condition: Condition.createCondition("LT", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("LT", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("LT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"NOTLT": [{
						formatArgs: [Condition.createCondition("NOTLT", ["Test"])],
						formatValue: "!(<Test)",
						parseArgs: ["!<Test"],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTLT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "GE", value1: "Test"},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("NOTLT", ["<"])],
						formatValue: "!(<<)",
						parseArgs: ["!<<"],
						parsedValue: "<",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTLT", ["a", "b"])],
						formatValue: "!(<a)",
						parseArgs: ["!<a"],
						parsedValue: "a",
						condition: Condition.createCondition("NOTLT", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTLT", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTLT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"GT": [{
						formatArgs: [Condition.createCondition("GT", ["Test"])],
						formatValue: ">Test",
						parsedValue: "Test",
						condition: Condition.createCondition("GT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("GT", [">"])],
						formatValue: ">>",
						parsedValue: ">",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("GT", ["a", "b"])],
						formatValue: ">a",
						parsedValue: "a",
						condition: Condition.createCondition("GT", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("GT", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("GT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"NOTGT": [{
						formatArgs: [Condition.createCondition("NOTGT", ["Test"])],
						formatValue: "!(>Test)",
						parseArgs: ["!>Test"],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTGT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "LE", value1: "Test"},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("NOTGT", [">"])],
						formatValue: "!(>>)",
						parseArgs: ["!>>"],
						parsedValue: ">",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTGT", ["a", "b"])],
						formatValue: "!(>a)",
						parseArgs: ["!>a"],
						parsedValue: "a",
						condition: Condition.createCondition("NOTGT", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTGT", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTGT", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"LE": [{
						formatArgs: [Condition.createCondition("LE", ["Test"])],
						formatValue: "<=Test",
						parsedValue: "Test",
						condition: Condition.createCondition("LE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("LE", ["<="])],
						formatValue: "<=<=",
						parsedValue: "<=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("LE", ["a", "b"])],
						formatValue: "<=a",
						parsedValue: "a",
						condition: Condition.createCondition("LE", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("LE", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("LE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"NOTLE": [{
						formatArgs: [Condition.createCondition("NOTLE", ["Test"])],
						formatValue: "!(<=Test)",
						parseArgs: ["!<=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTLE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("NOTLE", ["<="])],
						formatValue: "!(<=<=)",
						parseArgs: ["!<=<="],
						parsedValue: "<=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTLE", ["a", "b"])],
						formatValue: "!(<=a)",
						parseArgs: ["!<=a"],
						parsedValue: "a",
						condition: Condition.createCondition("NOTLE", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTLE", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTLE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"GE": [{
						formatArgs: [Condition.createCondition("GE", ["Test"])],
						formatValue: ">=Test",
						parsedValue: "Test",
						condition: Condition.createCondition("GE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("GE", [">="])],
						formatValue: ">=>=",
						parsedValue: ">=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("GE", ["a", "b"])],
						formatValue: ">=a",
						parsedValue: "a",
						condition: Condition.createCondition("GE", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("GE", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("GE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"NOTGE": [{
						formatArgs: [Condition.createCondition("NOTGE", ["Test"])],
						formatValue: "!(>=Test)",
						parseArgs: ["!>=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTGE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("NOTGE", [">="])],
						formatValue: "!(>=>=)",
						parseArgs: ["!>=>="],
						parsedValue: ">=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTGE", ["a", "b"])],
						formatValue: "!(>=a)",
						parseArgs: ["!>=a"],
						parsedValue: "a",
						condition: Condition.createCondition("NOTGE", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTGE", ["Test"]), undefined, undefined, true],
						formatValue: "Test",
						parseArgs: ["Test", undefined, undefined, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NOTGE", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					}
				],
				"StartsWith": [{
						formatArgs: [Condition.createCondition("StartsWith", ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "Test*",
						parsedValue: "Test",
						condition: Condition.createCondition("StartsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("StartsWith", ["*"]), oStringType, FieldDisplay.Description],
						formatValue: "**",
						parsedValue: undefined,
						isEmpty: true,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("StartsWith", ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "a*",
						parsedValue: "a",
						condition: Condition.createCondition("StartsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("StartsWith", ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition("StartsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				"NotStartsWith": [{
						formatArgs: [Condition.createCondition("NotStartsWith", ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(Test*)",
						parseArgs: ["!Test*", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition("NotStartsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotStartsWith", ["*"]), oStringType, FieldDisplay.Description],
						formatValue: "!(**)",
						parsedValue: undefined,
						isEmpty: true,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotStartsWith", ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "!(a*)",
						parseArgs: ["!a*", oStringType, FieldDisplay.Description],
						parsedValue: "a",
						condition: Condition.createCondition("NotStartsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotStartsWith", ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NotStartsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				"EndsWith": [{
						formatArgs: [Condition.createCondition("EndsWith", ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "*Test",
						parsedValue: "Test",
						condition: Condition.createCondition("EndsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("EndsWith", ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "*a",
						parsedValue: "a",
						condition: Condition.createCondition("EndsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("EndsWith", ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition("EndsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				"NotEndsWith": [{
						formatArgs: [Condition.createCondition("NotEndsWith", ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*Test)",
						parseArgs: ["!*Test", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition("NotEndsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotEndsWith", ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*a)",
						parseArgs: ["!*a", oStringType, FieldDisplay.Description],
						parsedValue: "a",
						condition: Condition.createCondition("NotEndsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotEndsWith", ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NotEndsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				"BT": [{
						formatArgs: [Condition.createCondition("BT", ["Test1", "Test2"])],
						formatValue: "Test1...Test2",
						parsedValue: "Test1Test2",
						condition: Condition.createCondition("BT", ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "BT", value1: "Test1", value2: "Test2"},
						isSingleValue: false
					},
					{
						formatArgs: [Condition.createCondition("BT", ["a", "b"])],
						formatValue: "a...b",
						parsedValue: "ab",
						condition: Condition.createCondition("BT", ["a", "b"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("BT", ["a", "a"])],
						formatValue: "a...a",
						parsedValue: "aa",
						condition: Condition.createCondition("BT", ["a", "a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition("BT", [null, "b"])],
						formatValue: "...b",
						parsedValue: undefined, //TODO: parse what can be formatted
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("BT", ["a"])],
						formatValue: "a...",
						parsedValue: undefined, //TODO: parse what can be formatted
						isEmpty: true,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition("BT", ["Test1", "Test2"]), undefined, undefined, true],
						formatValue: "Test1...Test2",
						parseArgs: ["Test1...Test2", undefined, undefined, true],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition("BT", ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: false
					}
				],
				"NOTBT": [{
						formatArgs: [Condition.createCondition("NOTBT", ["Test1", "Test2"])],
						formatValue: "!(Test1...Test2)",
						parseArgs: ["!Test1...Test2"],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition("NOTBT", ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "NB", value1: "Test1", value2: "Test2"},
						isSingleValue: false
					},
					{
						formatArgs: [Condition.createCondition("NOTBT", ["a", "b"])],
						formatValue: "!(a...b)",
						parseArgs: ["!a...b"],
						parsedValue: "ab",
						condition: Condition.createCondition("NOTBT", ["a", "b"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTBT", ["a", "a"])],
						formatValue: "!(a...a)",
						parseArgs: ["!a...a"],
						parsedValue: "aa",
						condition: Condition.createCondition("NOTBT", ["a", "a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition("NOTBT", [null, "b"])],
						formatValue: "!(...b)",
						parseArgs: ["!...b"],
						parsedValue: undefined, //TODO: parse what can be formatted
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("NOTBT", ["a"])],
						formatValue: "!(a...)",
						parseArgs: ["!a..."],
						parsedValue: undefined, //TODO: parse what can be formatted
						isEmpty: true,
						valid: false
					},
					{
						formatArgs: [Condition.createCondition("NOTBT", ["Test1", "Test2"]), undefined, undefined, true],
						formatValue: "!(Test1...Test2)",
						parseArgs: ["!Test1...Test2", undefined, undefined, true],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition("NOTBT", ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: false
					}
				],
				"Contains": [{
						formatArgs: [Condition.createCondition("Contains", ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "*Test*",
						parsedValue: "Test",
						condition: Condition.createCondition("Contains", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter:  {path: "test", operator: "Contains", value1: "Test"},
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("Contains", ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "*a*",
						parsedValue: "a",
						condition: Condition.createCondition("Contains", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("Contains", ["01"]), oNUMCType, FieldDisplay.Description],
						formatValue: "*01*",
						parseArgs: ["*1*", oNUMCType, FieldDisplay.Description],
						parsedValue: "1",
						condition: Condition.createCondition("Contains", ["1"], undefined, undefined, ConditionValidated.NotValidated),
						exception: false,
						isEmpty: false,
						valid: true,
						type: oNUMCType
					},
					{
						formatArgs: [Condition.createCondition("Contains", ["1"]), oNUMCType, FieldDisplay.Description],
						formatValue: "*1*",
						parseArgs: ["*A*", oNUMCType, FieldDisplay.Description],
						parsedValue: "A",
						condition: Condition.createCondition("Contains", ["A"], undefined, undefined, ConditionValidated.NotValidated),
						exception: true,
						isEmpty: false,
						valid: false,
						type: oNUMCType
					},
					{
						formatArgs: [Condition.createCondition("Contains", ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition("Contains", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("Contains", ["@@$$"]), oStringType, FieldDisplay.Value, false],
						formatValue: "*@@$$*",
						parseArgs: ["*@@$$*", oStringType, FieldDisplay.Value],
						parsedValue: "@@$$",
						condition: Condition.createCondition("Contains", ["@@$$"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				"NotContains": [{
						formatArgs: [Condition.createCondition("NotContains", ["Test"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*Test*)",
						parseArgs: ["!*Test*", oStringType, FieldDisplay.Description],
						parsedValue: "Test",
						condition: Condition.createCondition("NotContains", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter:  {path: "test", operator: "NotContains", value1: "Test"},
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotContains", ["a", "b"]), oStringType, FieldDisplay.Description],
						formatValue: "!(*a*)",
						parseArgs: ["!*a*", oStringType, FieldDisplay.Description],
						parsedValue: "a",
						condition: Condition.createCondition("NotContains", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotContains", ["Test"]), oStringType, FieldDisplay.Description, true],
						formatValue: "Test",
						parseArgs: ["Test", oStringType, FieldDisplay.Description, true],
						parsedValue: "Test",
						condition: Condition.createCondition("NotContains", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					}
				],
				"Empty": [{
						formatArgs: [Condition.createCondition("Empty", [])],
						formatValue: "<empty>",
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition("Empty", [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "EQ", value1: ""},
						isSingleValue: true,
						oType: new StringType({}, {nullable: false})
					},
					{
						formatArgs: [Condition.createCondition("Empty", [])],
						formatValue: "<empty>",
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition("Empty", [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: undefined, operator: undefined, value1: undefined, value2: undefined},
						isSingleValue: true,
						oType: new StringType({}, {nullable: true})
					},
					{
						formatArgs: [Condition.createCondition("Empty", []), undefined, undefined, true],
						formatValue: "<empty>", // TODO: right result without operator?
						parseArgs: ["<empty>", undefined, undefined, true],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition("Empty", [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new StringType({}, {nullable: false})
					}
				],
				"NotEmpty": [{
						formatArgs: [Condition.createCondition("NotEmpty", [])],
						formatValue: "!(<empty>)", // TODO: right text?
						parseArgs: ["!<empty>"],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition("NotEmpty", [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "NE", value1: ""},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition("NotEmpty", [])],
						formatValue: "!(<empty>)",
						parseArgs: ["!<empty>"],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition("NotEmpty", [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: undefined, operator: undefined, value1: undefined, value2: undefined},
						isSingleValue: true,
						oType: new StringType({}, {nullable: true})
					},
					{
						formatArgs: [Condition.createCondition("NotEmpty", []), undefined, undefined, true],
						formatValue: "!(<empty>)", // TODO: right result without operator?
						parseArgs: ["!<empty>", undefined, undefined, true],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition("NotEmpty", [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						oType: new StringType({}, {nullable: false})
					}
				],
				"MyOperator": [{
					formatArgs: [Condition.createCondition("MyOperator", ["MyOperator"])],
					formatValue: "Hello",
					parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
					isEmpty: false,
					valid: true,
					custom: true,
					filter: {path: "test", operator: "EQ", value1: "Hello World"},
					isSingleValue: true
				}
				]
			};
		//checking all above Operators for validity
		fOperatorCheck(assert, aOperators, aFormatTest);

		oIntType.destroy();
		oStringType.destroy();
		oNUMCType.destroy();

	});

	QUnit.test("Checks for Range Configuration", function(assert) {

		// get all standard Operators
		const aOperators = [];
		for (const sName in FilterOperatorUtil._mOperators) {
			aOperators.push(FilterOperatorUtil._mOperators[sName]);
		}

		const oDateTimeOffsetType = new DateTimeOffsetType({pattern: "yyyyMMdd-HHmmssSSS"}, {V4: true});
		const oDateType = new DateType({pattern: "yyyyMMdd"}, {});
		const oDate = UI5Date.getInstance(); // Today (filter-test for one range should be enough)
		let sYear = oDate.getFullYear().toString();
		let iMonth = oDate.getMonth() + 1;
		let sMonth = iMonth < 10 ? "0" + iMonth : iMonth.toString();
		let iDate = oDate.getDate();
		let sDate = iDate < 10 ? "0" + iDate : iDate.toString();
		const sTodayStart = oDateTimeOffsetType.parseValue(sYear + sMonth + sDate + "-000000000", "string"); // Today start
		const sTodayEnd = oDateTimeOffsetType.parseValue(sYear + sMonth + sDate + "-235959999", "string"); // Today end
		oDate.setDate(iDate - 1);
		sYear = oDate.getFullYear().toString();
		iMonth = oDate.getMonth() + 1;
		sMonth = iMonth < 10 ? "0" + iMonth : iMonth.toString();
		iDate = oDate.getDate();
		sDate = iDate < 10 ? "0" + iDate : iDate.toString();
		const sLastDaysEnd = oDateType.parseValue(sYear + sMonth + sDate, "string"); // LastDays end
		oDate.setDate(iDate - 3);
		sYear = oDate.getFullYear().toString();
		iMonth = oDate.getMonth() + 1;
		sMonth = iMonth < 10 ? "0" + iMonth : iMonth.toString();
		iDate = oDate.getDate();
		sDate = iDate < 10 ? "0" + iDate : iDate.toString();
		const sLastDaysStart = oDateType.parseValue(sYear + sMonth + sDate, "string"); // LastDays start

		const aFormatTest = {
			"YESTERDAY": [{
				formatArgs: [Condition.createCondition("YESTERDAY", [undefined])],
				formatValue: "Yesterday",
				//parseArgs: ["Yesterday"],
				parsedValue: "",
				condition: Condition.createCondition("YESTERDAY", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"TODAY": [{
				formatArgs: [Condition.createCondition("TODAY", [undefined])],
				formatValue: "Today",
				//parseArgs: ["Today"],
				parsedValue: "",
				condition: Condition.createCondition("TODAY", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: "BT", value1 : sTodayStart, value2: sTodayEnd}
			}],
			"TOMORROW": [{
				formatArgs: [Condition.createCondition("TOMORROW", [undefined])],
				formatValue: "Tomorrow",
				//parseArgs: ["Tomorrow"],
				parsedValue: "",
				condition: Condition.createCondition("TOMORROW", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				tokenText: "Tomorrow"
			}],
			"LASTDAYS": [{
				formatArgs: [Condition.createCondition("LASTDAYS", [4])],
				formatValue: "Last 4 days",
				//parseArgs: ["Last 4 days"],
				parsedValue: "4",
				condition: Condition.createCondition("LASTDAYS", [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Last X days",
				tokenText: "Last {0} days",
				oType: oDateType,
				baseType: BaseType.Date,
				filter: {path: "test", operator: "BT", value1 : sLastDaysStart, value2: sLastDaysEnd}
			},
			{
				formatArgs: [Condition.createCondition("LASTDAYS", [4]), undefined, undefined, true],
				formatValue: "4",
				parseArgs: ["4", undefined, undefined, true],
				parsedValue: "4",
				condition: Condition.createCondition("LASTDAYS", [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"FIRSTDAYWEEK": [{
				formatArgs: [Condition.createCondition("FIRSTDAYWEEK", [undefined])],
				formatValue: "First Date in This Week",
				parseArgs: ["First Date in This Week"],
				parsedValue: "",
				condition: Condition.createCondition("FIRSTDAYWEEK", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTTDAYWEEK": [{
				formatArgs: [Condition.createCondition("LASTTDAYWEEK", [undefined])],
				formatValue: "Last Date in This Week",
				parseArgs: ["Last Date in This Week"],
				parsedValue: "",
				condition: Condition.createCondition("LASTTDAYWEEK", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"FIRSTDAYMONTH": [{
				formatArgs: [Condition.createCondition("FIRSTDAYMONTH", [undefined])],
				formatValue: "First Date in This Month",
				parseArgs: ["First Date in This Month"],
				parsedValue: "",
				condition: Condition.createCondition("FIRSTDAYMONTH", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTTDAYMONTH": [{
				formatArgs: [Condition.createCondition("LASTTDAYMONTH", [undefined])],
				formatValue: "Last Date in This Month",
				parseArgs: ["Last Date in This Month"],
				parsedValue: "",
				condition: Condition.createCondition("LASTTDAYMONTH", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"FIRSTDAYQUARTER": [{
				formatArgs: [Condition.createCondition("FIRSTDAYQUARTER", [undefined])],
				formatValue: "First Date in This Quarter",
				parseArgs: ["First Date in This Quarter"],
				parsedValue: "",
				condition: Condition.createCondition("FIRSTDAYQUARTER", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTTDAYQUARTER": [{
				formatArgs: [Condition.createCondition("LASTTDAYQUARTER", [undefined])],
				formatValue: "Last Date in This Quarter",
				parseArgs: ["Last Date in This Quarter"],
				parsedValue: "",
				condition: Condition.createCondition("LASTTDAYQUARTER", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"FIRSTDAYYEAR": [{
				formatArgs: [Condition.createCondition("FIRSTDAYYEAR", [undefined])],
				formatValue: "First Date in This Year",
				parseArgs: ["First Date in This Year"],
				parsedValue: "",
				condition: Condition.createCondition("FIRSTDAYYEAR", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTTDAYYEAR": [{
				formatArgs: [Condition.createCondition("LASTTDAYYEAR", [undefined])],
				formatValue: "Last Date in This Year",
				parseArgs: ["Last Date in This Year"],
				parsedValue: "",
				condition: Condition.createCondition("LASTTDAYYEAR", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"TODAYFROMTO": [{
				formatArgs: [Condition.createCondition("TODAYFROMTO", [4, 6])],
				formatValue: "Today -4 / +6 days",
				//parseArgs: ["Last 4 days"],
				parsedValue: "46",
				condition: Condition.createCondition("TODAYFROMTO", [4, 6], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				longText: "Today -X / +Y days",
				tokenText: "Today -{0} / +{1} days"
			},
			{
				formatArgs: [Condition.createCondition("TODAYFROMTO", [4, 6]), undefined, undefined, true],
				formatValue: "Today -4 / +6 days",
				parseArgs: ["Today -4 / +6 days", undefined, undefined, true],
				parsedValue: "46",
				condition: Condition.createCondition("TODAYFROMTO", [4, 6], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false
			}],
			"NEXTDAYS": [{
				formatArgs: [Condition.createCondition("NEXTDAYS", [3])],
				formatValue: "Next 3 days",
				//parseArgs: ["Next 3 days"],
				parsedValue: "3",
				condition: Condition.createCondition("NEXTDAYS", [3], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Next X days",
				tokenText: "Next {0} days"
			},
			{
				formatArgs: [Condition.createCondition("NEXTDAYS", [3]), undefined, undefined, true],
				formatValue: "3",
				parseArgs: ["3", undefined, undefined, true],
				parsedValue: "3",
				condition: Condition.createCondition("NEXTDAYS", [3], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTHOURS": [{
				formatArgs: [Condition.createCondition("NEXTHOURS", [2])],
				formatValue: "Next 2 hours",
				parsedValue: "2",
				condition: Condition.createCondition("NEXTHOURS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Next X hours",
				tokenText: "Next {0} hours"
			}],
			"LASTHOURS": [{
				formatArgs: [Condition.createCondition("LASTHOURS", [2])],
				formatValue: "Last 2 hours",
				parsedValue: "2",
				condition: Condition.createCondition("LASTHOURS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Last X hours",
				tokenText: "Last {0} hours"
			}],
			"NEXTMINUTES": [{
				formatArgs: [Condition.createCondition("NEXTMINUTES", [2])],
				formatValue: "Next 2 minutes",
				parsedValue: "2",
				condition: Condition.createCondition("NEXTMINUTES", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Next X minutes",
				tokenText: "Next {0} minutes"
			}],
			"LASTMINUTES": [{
				formatArgs: [Condition.createCondition("LASTMINUTES", [2])],
				formatValue: "Last 2 minutes",
				parsedValue: "2",
				condition: Condition.createCondition("LASTMINUTES", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Last X minutes",
				tokenText: "Last {0} minutes"
			}],
			"LASTWEEK": [{
				formatArgs: [Condition.createCondition("LASTWEEK", [undefined])],
				formatValue: "Last week",
				parsedValue: "",
				condition: Condition.createCondition("LASTWEEK", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"THISWEEK": [{
				formatArgs: [Condition.createCondition("THISWEEK", [undefined])],
				formatValue: "This week",
				parsedValue: "",
				condition: Condition.createCondition("THISWEEK", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTWEEK": [{
				formatArgs: [Condition.createCondition("NEXTWEEK", [undefined])],
				formatValue: "Next week",
				parsedValue: "",
				condition: Condition.createCondition("NEXTWEEK", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTWEEKS": [{
				formatArgs: [Condition.createCondition("LASTWEEKS", [2])],
				formatValue: "Last 2 weeks",
				parsedValue: "2",
				condition: Condition.createCondition("LASTWEEKS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Last X weeks",
				tokenText: "Last {0} weeks"
			},
			{
				formatArgs: [Condition.createCondition("LASTWEEKS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("LASTWEEKS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTWEEKS": [{
				formatArgs: [Condition.createCondition("NEXTWEEKS", [13])],
				formatValue: "Next 13 weeks",
				parsedValue: "13",
				condition: Condition.createCondition("NEXTWEEKS", [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Next X weeks",
				tokenText: "Next {0} weeks"
			},
			{
				formatArgs: [Condition.createCondition("NEXTWEEKS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("NEXTWEEKS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			"LASTMONTH": [{
				formatArgs: [Condition.createCondition("LASTMONTH", [undefined])],
				formatValue: "Last month",
				parsedValue: "",
				condition: Condition.createCondition("LASTMONTH", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"THISMONTH": [{
				formatArgs: [Condition.createCondition("THISMONTH", [undefined])],
				formatValue: "This month",
				parsedValue: "",
				condition: Condition.createCondition("THISMONTH", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTMONTH": [{
				formatArgs: [Condition.createCondition("NEXTMONTH", [undefined])],
				formatValue: "Next month",
				parsedValue: "",
				condition: Condition.createCondition("NEXTMONTH", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTMONTHS": [{
				formatArgs: [Condition.createCondition("LASTMONTHS", [2])],
				formatValue: "Last 2 months",
				parsedValue: "2",
				condition: Condition.createCondition("LASTMONTHS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Last X months",
				tokenText: "Last {0} months"
			},
			{
				formatArgs: [Condition.createCondition("LASMONTHS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("LASTMONTHS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTMONTHS": [{
				formatArgs: [Condition.createCondition("NEXTMONTHS", [13])],
				formatValue: "Next 13 months",
				parsedValue: "13",
				condition: Condition.createCondition("NEXTMONTHS", [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Next X months",
				tokenText: "Next {0} months"
			},
			{
				formatArgs: [Condition.createCondition("NEXTMONTHS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("NEXTMONTHS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"SPECIFICMONTH": [{
				formatArgs: [Condition.createCondition("SPECIFICMONTH", [4])],
				formatValue: "Month (May)",
				parsedValue: "4",
				condition: Condition.createCondition("SPECIFICMONTH", [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Month",
				tokenText: "Month ({0})"
			},
			{
				formatArgs: [Condition.createCondition("SPECIFICMONTH", [4]), undefined, undefined, true],
				formatValue: "May",
				parseArgs: ["May", undefined, undefined, true],
				parsedValue: "4",
				condition: Condition.createCondition("SPECIFICMONTH", [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"SPECIFICMONTHINYEAR": [{
				formatArgs: [Condition.createCondition("SPECIFICMONTHINYEAR", [4, 2000])],
				formatValue: "Month in Year (May,2000)",
				parsedValue: "42000",
				condition: Condition.createCondition("SPECIFICMONTHINYEAR", [4, 2000], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				longText: "Month in Year",
				tokenText: "Month in Year ({0},{1})"
			}],
			"LASTQUARTER": [{
				formatArgs: [Condition.createCondition("LASTQUARTER", [undefined])],
				formatValue: "Last quarter",
				parsedValue: "",
				condition: Condition.createCondition("LASTQUARTER", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"THISQUARTER": [{
				formatArgs: [Condition.createCondition("THISQUARTER", [undefined])],
				formatValue: "This quarter",
				parsedValue: "",
				condition: Condition.createCondition("THISQUARTER", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTQUARTER": [{
				formatArgs: [Condition.createCondition("NEXTQUARTER", [undefined])],
				formatValue: "Next quarter",
				parsedValue: "",
				condition: Condition.createCondition("NEXTQUARTER", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTQUARTERS": [{
				formatArgs: [Condition.createCondition("LASTQUARTERS", [2])],
				formatValue: "Last 2 quarters",
				parsedValue: "2",
				condition: Condition.createCondition("LASTQUARTERS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Last X quarters",
				tokenText: "Last {0} quarters"
			},
			{
				formatArgs: [Condition.createCondition("LASTQUARTERS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("LASTQUARTERS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTQUARTERS": [{
				formatArgs: [Condition.createCondition("NEXTQUARTERS", [13])],
				formatValue: "Next 13 quarters",
				parsedValue: "13",
				condition: Condition.createCondition("NEXTQUARTERS", [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Next X quarters",
				tokenText: "Next {0} quarters"
			},
			{
				formatArgs: [Condition.createCondition("NEXTQUARTERS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("NEXTQUARTERS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			"LASTYEAR": [{
				formatArgs: [Condition.createCondition("LASTYEAR", [undefined])],
				formatValue: "Last year",
				parsedValue: "",
				condition: Condition.createCondition("LASTYEAR", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"THISYEAR": [{
				formatArgs: [Condition.createCondition("THISYEAR", [undefined])],
				formatValue: "This year",
				parsedValue: "",
				condition: Condition.createCondition("THISYEAR", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTYEAR": [{
				formatArgs: [Condition.createCondition("NEXTYEAR", [undefined])],
				formatValue: "Next year",
				parsedValue: "",
				condition: Condition.createCondition("NEXTYEAR", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"LASTYEARS": [{
				formatArgs: [Condition.createCondition("LASTYEARS", [2])],
				formatValue: "Last 2 years",
				parsedValue: "2",
				condition: Condition.createCondition("LASTYEARS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Last X years",
				tokenText: "Last {0} years"
			},
			{
				formatArgs: [Condition.createCondition("LASTYEARS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("LASTYEARS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"NEXTYEARS": [{
				formatArgs: [Condition.createCondition("NEXTYEARS", [13])],
				formatValue: "Next 13 years",
				parsedValue: "13",
				condition: Condition.createCondition("NEXTYEARS", [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Next X years",
				tokenText: "Next {0} years"
			},
			{
				formatArgs: [Condition.createCondition("NEXTYEARS", [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition("NEXTYEARS", [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			"QUARTER1": [{
				formatArgs: [Condition.createCondition("QUARTER1", [undefined])],
				formatValue: "First quarter",
				parsedValue: "",
				condition: Condition.createCondition("QUARTER1", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"QUARTER2": [{
				formatArgs: [Condition.createCondition("QUARTER2", [undefined])],
				formatValue: "Second quarter",
				parsedValue: "",
				condition: Condition.createCondition("QUARTER2", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"QUARTER3": [{
				formatArgs: [Condition.createCondition("QUARTER3", [undefined])],
				formatValue: "Third quarter",
				parsedValue: "",
				condition: Condition.createCondition("QUARTER3", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"FORTHQUARTER": [{
				formatArgs: [Condition.createCondition("FORTHQUARTER", [undefined])],
				formatValue: "Forth quarter",
				parsedValue: "",
				condition: Condition.createCondition("FORTHQUARTER", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			"QUARTER4": [{
				formatArgs: [Condition.createCondition("QUARTER4", [undefined])],
				formatValue: "Forth quarter",
				parsedValue: "",
				condition: Condition.createCondition("QUARTER4", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			"YEARTODATE": [{
				formatArgs: [Condition.createCondition("YEARTODATE", [undefined])],
				formatValue: "Year to date",
				parsedValue: "",
				condition: Condition.createCondition("YEARTODATE", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			"DATETOYEAR": [{
				formatArgs: [Condition.createCondition("DATETOYEAR", [undefined])],
				formatValue: "Date to year",
				parsedValue: "",
				condition: Condition.createCondition("DATETOYEAR", [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}]

		};
		//checking all above Operators for validity
		fOperatorCheck(assert, aOperators, aFormatTest);

	});

	QUnit.test("getMatchingOperators", function(assert) {

		const aAllOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String);
		let aOperators = FilterOperatorUtil.getMatchingOperators(["X", "Y"]);
		assert.strictEqual(aOperators.length, 0, "invalid operators should not result in anything");

		aOperators = FilterOperatorUtil.getMatchingOperators(aAllOperators, "=true");
		let oExpected = FilterOperatorUtil.getOperator("EQ", aAllOperators);
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'=true' should match the EQ operator");

		aOperators = FilterOperatorUtil.getMatchingOperators(aAllOperators, "=5");
		oExpected = FilterOperatorUtil.getOperator("EQ", aAllOperators);
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'=5' should match the EQ operator");

		aOperators = FilterOperatorUtil.getMatchingOperators(aAllOperators, "*middle*");
		oExpected = FilterOperatorUtil.getOperator("Contains", aAllOperators);
		assert.strictEqual(aOperators.length, 1, "there should be one matching operator");
		assert.deepEqual(aOperators[0], oExpected, "'*middle*' should match the Contains operator");

	});

	QUnit.test("getDefaultOperatorForType", function(assert) {

		let oOperator = FilterOperatorUtil.getDefaultOperator(BaseType.String);
		assert.strictEqual(oOperator.name, "EQ", "EQ should be default operator for string type");

		oOperator = FilterOperatorUtil.getDefaultOperator(BaseType.DateTime);
		assert.strictEqual(oOperator.name, "EQ", "EQ should be default operator for sap.ui.model.odata.type.TimeOfDay type");

	});

	QUnit.test("checkConditionsEmpty", function(assert) {

		const aConditions = [
						   Condition.createCondition("EQ", ["X"]),
						   Condition.createCondition("EQ", []),
						   Condition.createCondition("BT", ["X", "Y"]),
						   Condition.createCondition("BT", [])
						   ];

		FilterOperatorUtil.checkConditionsEmpty(aConditions);

		assert.equal(aConditions.length, 4, "number of conditions not changed");
		assert.notOk(aConditions[0].isEmpty, "Condition 0 is not empty");
		assert.ok(aConditions[1].isEmpty, "Condition 1 is empty");
		assert.notOk(aConditions[2].isEmpty, "Condition 2 is not empty");
		assert.ok(aConditions[3].isEmpty, "Condition 3 is empty");

		//test single Condition
		const oCondition = Condition.createCondition("EQ", []);
		FilterOperatorUtil.checkConditionsEmpty(oCondition);

		assert.ok(oCondition.isEmpty, "Condition 1 is empty");

	});

	QUnit.test("updateConditionsValues", function(assert) {

		const aConditions = [
						   Condition.createCondition("EQ", ["X"]),
						   Condition.createCondition("EQ", []),
						   Condition.createCondition("EQ", ["X", undefined]),
						   Condition.createCondition("EQ", ["X", "Y"]),
						   Condition.createCondition("EQ", ["X", "Y"], undefined, undefined, ConditionValidated.Validated), // validated
						   Condition.createCondition("EQ", ["X", undefined], undefined, undefined, ConditionValidated.Validated), // validated
						   Condition.createCondition("BT", ["X", "Y"]),
						   Condition.createCondition("BT", []),
						   Condition.createCondition("BT", ["X"]),
						   Condition.createCondition("TODAY", [null])
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
		const oCondition = Condition.createCondition("EQ", ["X", undefined]);
		FilterOperatorUtil.updateConditionsValues(oCondition);

		assert.equal(oCondition.values.length, 1, "Condition values length");

	});

	QUnit.test("indexOfCondition", function(assert) {

		const aConditions = [
						   Condition.createCondition("EQ", ["X", "Y"], undefined, undefined, ConditionValidated.Validated),
						   Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated),
						   Condition.createCondition("EQ", ["Z"]),
						   Condition.createCondition("BT", ["X", "Y"]),
						   Condition.createCondition("TODAY", [null])
						   ];

		// same validated condition
		let oCondition = Condition.createCondition("EQ", ["X", "Z"], undefined, undefined, ConditionValidated.Validated);
		let iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 0, "same validated condition: Index of Condition");

		// same key, but not validated
		oCondition = Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.NotValidated);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "same key, but not validated: Index of Condition");

		// same key, but not known if validated
		oCondition = Condition.createCondition("EQ", ["X"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 0, "same key, but not known if validated: Index of Condition");

		// same not-validated condition
		oCondition = Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 1, "same not-validated condition: Index of Condition");

		// same key but validated
		oCondition = Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.Validated);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "same key but validated: Index of Condition");

		// same key, but not known if validated
		oCondition = Condition.createCondition("EQ", ["Y"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 1, "same key, but not known if validated: Index of Condition");

		// not existing condition
		oCondition = Condition.createCondition("EQ", ["A"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "not existing condition: Index of Condition");

		// existing between condition
		oCondition = Condition.createCondition("BT", ["X", "Y"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 3, "existing between condition: Index of Condition");

		// not existing between condition
		oCondition = Condition.createCondition("BT", ["X", "Z"]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, -1, "not existing between condition: Index of Condition");

		// existing static condition
		oCondition = Condition.createCondition("TODAY", [null]);
		iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
		assert.equal(iIndex, 4, "existing static condition: Index of Condition");

		// existing static condition without value
		oCondition = Condition.createCondition("TODAY", []);
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

		aConditions2.push(Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.Validated));
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.ok(bEqual, "2 arrays with same length but different description are equal"); // description don't matter for compare

		aConditions1.push(Condition.createCondition("BT", ["X", "Y"]));
		aConditions2.push(Condition.createCondition("BT", ["X", "Z"]));
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

		aConditions1 = [Condition.createCondition("BT", ["X", "Y", undefined])];
		aConditions2 = [Condition.createCondition("BT", ["X", "Y", null])];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "Comparison discerns null from undefined");

		aConditions1 = [Condition.createCondition("BT", ["X", "Y"], undefined, undefined, {in1: "X", out1: undefined})];
		aConditions2 = [Condition.createCondition("BT", ["X", "Y"], undefined, undefined, {in1: "X", out1: null})];
		bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
		assert.notOk(bEqual, "Comparison discerns nested null from undefined");

	});

	QUnit.test("checkConditionValidated", function(assert) {

		let oCondition = Condition.createCondition("EQ", ["X"]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "Condition not validated");

		oCondition = Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.Validated);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition validated");

		oCondition = Condition.createCondition("EQ", ["X", undefined]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "Condition not validated");

		oCondition = Condition.createCondition("EQ", ["X", null]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.NotValidated, "Condition not validated");

		oCondition = Condition.createCondition("EQ", ["X", "Y"]);
		FilterOperatorUtil.checkConditionValidated(oCondition);
		assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition validated");

		oCondition = Condition.createCondition("BT", ["X", "Y"]);
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
			}
		});

		assert.equal(operatorWithSpecialCharacters.tokenParse, "^\\+foo (\\d+) operator$", "tokenParse has the expected format \+foo");
		assert.equal(operatorWithSpecialCharacters.tokenFormat, "+foo {0} operator", "tokenFormat has the expected format +foo");
	});

	QUnit.test("testing placeholder", function(assert) {
		let operatorWithSpecialCharacters = new RangeOperator({
			name: "OPT",
			tokenText: "foo $0 operator",
			valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
			paramTypes: ["(\\d+)"],
			additionalInfo: "",
			calcRange: function(iDuration) {
				return UniversalDateUtils.ranges.nextYears(iDuration);
			}
		});

		assert.equal(operatorWithSpecialCharacters.tokenParse, "^foo (\\d+) operator$", "tokenParse has the expected format for the placeholder");
		assert.equal(operatorWithSpecialCharacters.tokenFormat, "foo $0 operator", "tokenFormat has the expected format for the placeholder");

		operatorWithSpecialCharacters = new RangeOperator({
			name: "OPT",
			tokenText: "foo 0$ operator",
			valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
			paramTypes: ["(\\d+)"],
			additionalInfo: "",
			calcRange: function(iDuration) {
				return UniversalDateUtils.ranges.nextYears(iDuration);
			}
		});

		assert.equal(operatorWithSpecialCharacters.tokenParse, "^foo (\\d+) operator$", "tokenParse has the expected format for the placeholder");
		assert.equal(operatorWithSpecialCharacters.tokenFormat, "foo 0$ operator", "tokenFormat has the expected format for the placeholder");

		operatorWithSpecialCharacters = new RangeOperator({
			name: "OPT",
			tokenText: "foo {0} operator",
			valueTypes: [{name: "sap.ui.model.type.Integer", formatOptions: {emptyString: null}}],
			paramTypes: ["(\\d+)"],
			additionalInfo: "",
			calcRange: function(iDuration) {
				return UniversalDateUtils.ranges.nextYears(iDuration);
			}
		});

		assert.equal(operatorWithSpecialCharacters.tokenParse, "^foo (\\d+) operator$", "tokenParse has the expected format for the placeholder");
		assert.equal(operatorWithSpecialCharacters.tokenFormat, "foo {0} operator", "tokenFormat has the expected format for the placeholder");
	});

	QUnit.test("testing OperatorsForType", function(assert) {

		const oMyEQ = new Operator({
			name: "MYEQ",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});

		const oLowerThan = new Operator({
			name: "MYLT",
			filterOperator: "LT",
			tokenParse: "^<([^=].*)$",
			tokenFormat: "<{0}",
			valueTypes: [OperatorValueType.Self]
		});

		FilterOperatorUtil.setOperatorsForType("myType", [oMyEQ, oLowerThan], oMyEQ);

		let aOperators = FilterOperatorUtil.getOperatorsForType("myType");

		assert.equal(aOperators[0], "MYEQ", "Name set");
		assert.equal(aOperators[1], "MYLT", "Name set");

		let oDefaultOperator = FilterOperatorUtil.getDefaultOperator("myType");

		assert.equal(oDefaultOperator.name, "MYEQ", "Name set");

		FilterOperatorUtil.removeOperatorForType("myType", oMyEQ);

		aOperators = FilterOperatorUtil.getOperatorsForType("myType");

		assert.equal(aOperators.length, 1, "onle one operator exist");
		assert.equal(aOperators[0], "MYLT", "Name set");

		// Should return null or one of the existng operators for this type, because the operator has been removed.
		oDefaultOperator = FilterOperatorUtil.getDefaultOperator("myType");

		assert.equal(oDefaultOperator.name, "MYEQ", "Name set");

	});

	QUnit.test("testing set/add/removeOperator", function(assert) {

		const oMyOperator = new Operator({
			name: "MyEqual",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		const oMyOperator2 = new Operator({
			name: "MyEqual2",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});

		// add one Operator and remove it
		FilterOperatorUtil.addOperator(oMyOperator);

		let oOperator = FilterOperatorUtil.getOperator("MyEqual");
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
		FilterOperatorUtil.removeOperators([oMyOperator, oMyOperator2]);

		oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.notOk(oOperator, "Operator should NOT exist");
		oOperator = FilterOperatorUtil.getOperator("MyEqual2");
		assert.notOk(oOperator, "Operator should NOT exist");

	});

	QUnit.test("testing overwrite", function(assert) {

		let oOperator = FilterOperatorUtil.getOperator("Empty");
		assert.ok(oOperator, "Operator exist");
		assert.ok(oOperator.getLongText("String") === "empty", "Operator getLongText returns default text");

		const fCallbackGetLongText = function(sBaseType) {
			if (sBaseType === "String") {
				return "foo";
			} else {
				return "bar";
			}
		};
		oOperator.overwrite(OperatorOverwrite.getLongText, fCallbackGetLongText);
		assert.equal(oOperator.getLongText, fCallbackGetLongText, "Overwrite function exist");
		assert.ok(oOperator.getLongText("String") === "foo", "Operator getLongText returns expected text");
		assert.ok(oOperator.getLongText("others") === "bar", "Operator getLongText returns expected text");

		oOperator = FilterOperatorUtil.getOperator("TODAY");
		assert.ok(oOperator, "Operator exist");

		const fCallbackGetModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			return "foo";
		};
		oOperator.overwrite(OperatorOverwrite.getModelFilter, fCallbackGetModelFilter);
		assert.equal(oOperator.getModelFilter, fCallbackGetModelFilter, "Overwrite function exist");
		assert.equal(oOperator.getModelFilter(), "foo", "Overwrite function returns expected value");

	});

});
