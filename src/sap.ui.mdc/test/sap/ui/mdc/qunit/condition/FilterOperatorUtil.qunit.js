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
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/type/Integer",
	"sap/ui/model/odata/type/String",
	"sap/ui/model/odata/type/Date",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UniversalDateUtils",
	"sap/ui/core/date/UI5Date",
	"sap/m/library",
	"sap/ui/mdc/enums/OperatorOverwrite",
	"sap/ui/core/Lib"
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
	StringType,
	DateType,
	DateTimeWithTimezoneType,
	DateTimeOffsetType,
	UniversalDate,
	UniversalDateUtils,
	UI5Date,
	mLibrary,
	OperatorOverwrite,
	Library
) {
	"use strict";

	const mdcMessageBundle = Library.getResourceBundleFor("sap.ui.mdc");

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
			return new Filter({ path: sFieldPath, operator: FilterOperator.EQ, value1: new Date().getFullYear() });
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

	});

	QUnit.test("getOperatorForDynamicDateOption", function(assert) {

		let oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("FROM", BaseType.Date);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, OperatorName.GE, "GE operator returned");

		oOperator = FilterOperatorUtil.getOperatorForDynamicDateOption("Date-EQ", BaseType.Date);
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, OperatorName.EQ, "EQ operator returned");

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
						assert.strictEqual(sParseText, oTest.parsedValue, "Parsing: Operator " + sOperator + " has parsed correctly from " + sTestText + " to " + oTest.parsedValue);
					} catch (oException) {
						assert.ok(oTest.exception, "Exception fired in parsing");
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
				return new Filter({ path: sFieldPath, operator: FilterOperator.EQ, value1: "Hello World" });
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
				[OperatorName.EQ]: [{
						formatArgs: [Condition.createItemCondition("Test", "desc")],
						formatValue: "desc (Test)",
						parseArgs: ["=Test"],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, [undefined, "Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.Value],
						formatValue: "Test",
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
						parseArgs: ["Test", undefined, FieldDisplay.Value, false, undefined, undefined, undefined, false],
						parsedValue: "Test",
						condition: null, // condition only created without operator symbol if operator is hidden ot it is the default operator
						isEmpty: false,
						exception: true,
						valid: false,
						filter: {path: "test", operator: FilterOperator.EQ, value1: "Test"}
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.Description],
						formatValue: "desc",
						parseArgs: ["==desc", undefined, FieldDisplay.Description],
						parsedValue: "=desc",
						condition: Condition.createCondition(OperatorName.EQ, [undefined, "=desc"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test (desc)",
						parseArgs: ["=Test", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition(5, "desc"), oIntType, FieldDisplay.ValueDescription],
						formatValue: "5 (desc)",
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
						parseArgs: ["=Test (desc)", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Testdesc",
						condition: Condition.createCondition(OperatorName.EQ, ["Test", "desc"], undefined, undefined, ConditionValidated.Validated),
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
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["Test", undefined], undefined, undefined, ConditionValidated.Validated), undefined, FieldDisplay.ValueDescription],
						formatValue: "Test",
						parseArgs: ["=Test", undefined, FieldDisplay.ValueDescription],
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.EQ, ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["Test"]), undefined, undefined, true],
						formatValue: "Test",
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
						parsedValue: "=",
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["a", "b"])],
						formatValue: "b (a)",
						parseArgs: ["b (a)", undefined, undefined, true],
						parsedValue: "ab",
						condition: Condition.createCondition(OperatorName.EQ, ["a", "b"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["a", "b (c)"])],
						formatValue: "b (c) (a)",
						parseArgs: ["b (c) (a)", undefined, undefined, true],
						parsedValue: "ab (c)",
						condition: Condition.createCondition(OperatorName.EQ, ["a", "b (c)"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["a", "b (c)"]), undefined, FieldDisplay.ValueDescription],
						formatValue: "a (b (c))",
						parseArgs: ["a (b (c))", undefined, FieldDisplay.ValueDescription, true],
						parsedValue: "ab (c)",
						condition: Condition.createCondition(OperatorName.EQ, ["a", "b (c)"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{ // DateTime with Timezone
						formatArgs: [Condition.createCondition(OperatorName.EQ, [["2022-02-24T12:15:30Z", "Europe/Berlin"]]), oDateTimeWithTimezoneType1, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						formatValue: "2022-02-24T13:15:30",
						parseArgs: ["2022-02-24T14:15:30", oDateTimeWithTimezoneType1, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						parsedValue: "2022-02-24T14:15:30+01:00,Europe/Berlin",
						condition: Condition.createCondition(OperatorName.EQ, [["2022-02-24T14:15:30+01:00", "Europe/Berlin"]], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false, // as String (for timezone) allows only 5 characters -> test for usage of this type
						type: oDateTimeWithTimezoneType1,
						compositeTypes: [oDateTimeOffsetType, oStringType],
						compositePart: 0
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, [["2022-02-24T12:15:30Z", "Europe/Berlin"]]), oDateTimeWithTimezoneType2, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						formatValue: "Europe, Berlin",
						parseArgs: ["America/New_York", oDateTimeWithTimezoneType2, FieldDisplay.Value, true, [oDateTimeOffsetType, oStringType]],
						parsedValue: "2022-02-24T12:15:30Z,America/New_York",
						condition: Condition.createCondition(OperatorName.EQ, [["2022-02-24T12:15:30Z", "America/New_York"]], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false, // as String (for timezone) allows only 5 characters -> test for usage of this type
						type: oDateTimeWithTimezoneType2,
						compositeTypes: [oDateTimeOffsetType, oStringType],
						compositePart: 1
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.EQ, ["@@$$"]), undefined, FieldDisplay.Value, false],
						formatValue: "=@@$$",
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
						parseArgs: ["5 (" + sDateTimeFormatted + ")", oIntType, FieldDisplay.ValueDescription, true, undefined, oDateTimeOffsetType, undefined],
						parsedValue: "5" + sDateTimeParsed,
						condition: Condition.createCondition(OperatorName.EQ, [5, sDateTimeParsed], undefined, undefined, ConditionValidated.Validated),
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
						formatArgs: [Condition.createCondition(OperatorName.EQ, [5]), oIntType, FieldDisplay.Description, true, undefined, oDateTimeOffsetType, undefined],
						formatValue: "5",
						parseArgs: ["1", oIntType, FieldDisplay.Value, true, undefined, oDateTimeOffsetType, undefined],
						parsedValue: "1",
						condition: Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						exception: false,
						valid: true,
						type: oIntType,
						additionalType : oDateTimeOffsetType
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
						isSingleValue: true
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
						isSingleValue: true
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
						isSingleValue: true
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
					}
				],
				[OperatorName.GT]: [{
						formatArgs: [Condition.createCondition(OperatorName.GT, ["Test"])],
						formatValue: ">Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.GT, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
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
						isSingleValue: true
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
					}
				],
				[OperatorName.LE]: [{
						formatArgs: [Condition.createCondition(OperatorName.LE, ["Test"])],
						formatValue: "<=Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.LE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
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
						isSingleValue: true
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
					}
				],
				[OperatorName.GE]: [{
						formatArgs: [Condition.createCondition(OperatorName.GE, ["Test"])],
						formatValue: ">=Test",
						parsedValue: "Test",
						condition: Condition.createCondition(OperatorName.GE, ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true
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
						isSingleValue: true
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
						type: oStringType
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
						type: oStringType
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
						type: oStringType
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
						type: oStringType
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
						isSingleValue: false
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
						isSingleValue: false
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
						type: oStringType
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
						exception: true,
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
						type: oStringType
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
						oType: new StringType({}, {nullable: false})
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
						oType: new StringType({}, {nullable: true})
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
						oType: new StringType({}, {nullable: false})
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
						filter: {path: "test", operator: FilterOperator.NE, value1: ""},
						isSingleValue: true
					},
					{
						formatArgs: [Condition.createCondition(OperatorName.NotEmpty, [])],
						formatValue: "!(<empty>)", // TODO: right text?
						parseArgs: ["!(<empty>)"],
						parsedValue: "", // empty array (which is the current return value), joined with space. Better check whether it matches  TODO
						condition: Condition.createCondition(OperatorName.NotEmpty, [], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
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
						oType: new StringType({}, {nullable: true})
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
					filter: {path: "test", operator: FilterOperator.EQ, value1: "Hello World"},
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

		FilterOperatorUtil.addOperator(new RangeOperator({
			name: "MyToToday",
			longText: "to Today",
			tokenText: "to Today ({0})",
			valueTypes: [OperatorValueType.Static],
			filterOperator: FilterOperator.LE,
			calcRange: function() {
				// the second entry in the returned is the end of the dsy (for time containing data types)
				return [UniversalDateUtils.ranges.today()[1]];
			}
		}));

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
			[OperatorName.YESTERDAY]: [{
				formatArgs: [Condition.createCondition(OperatorName.YESTERDAY, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.YESTERDAY.longText"),
				//parseArgs: ["Yesterday"],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.YESTERDAY, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.TODAY]: [{
				formatArgs: [Condition.createCondition(OperatorName.TODAY, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.TODAY.longText"),
				//parseArgs: ["Today"],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.TODAY, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				oType: oDateTimeOffsetType,
				baseType: BaseType.DateTime,
				filter: {path: "test", operator: FilterOperator.BT, value1 : sTodayStart, value2: sTodayEnd}
			}],
			[OperatorName.TOMORROW]: [{
				formatArgs: [Condition.createCondition(OperatorName.TOMORROW, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.TOMORROW.longText"),
				//parseArgs: ["Tomorrow"],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.TOMORROW, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				tokenText: mdcMessageBundle.getText("operators.TOMORROW.longText")
			}],
			[OperatorName.LASTDAYS]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTDAYS, [4])],
				formatValue: mdcMessageBundle.getText("operators.LASTDAYS.tokenText", [4]),
				//parseArgs: ["Last 4 days"],
				parsedValue: "4",
				condition: Condition.createCondition(OperatorName.LASTDAYS, [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.LASTDAYS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.LASTDAYS.tokenText"),
				oType: oDateType,
				baseType: BaseType.Date,
				filter: {path: "test", operator: FilterOperator.BT, value1 : sLastDaysStart, value2: sLastDaysEnd}
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.LASTDAYS, [4]), undefined, undefined, true],
				formatValue: "4",
				parseArgs: ["4", undefined, undefined, true],
				parsedValue: "4",
				condition: Condition.createCondition(OperatorName.LASTDAYS, [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.FIRSTDAYWEEK]: [{
				formatArgs: [Condition.createCondition(OperatorName.FIRSTDAYWEEK, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.FIRSTDAYWEEK.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.FIRSTDAYWEEK.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.FIRSTDAYWEEK, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTTDAYWEEK]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTTDAYWEEK, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTDAYWEEK.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.LASTDAYWEEK.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTTDAYWEEK, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.FIRSTDAYMONTH]: [{
				formatArgs: [Condition.createCondition(OperatorName.FIRSTDAYMONTH, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.FIRSTDAYMONTH.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.FIRSTDAYMONTH.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.FIRSTDAYMONTH, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTTDAYMONTH]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTTDAYMONTH, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTDAYMONTH.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.LASTDAYMONTH.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTTDAYMONTH, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.FIRSTDAYQUARTER]: [{
				formatArgs: [Condition.createCondition(OperatorName.FIRSTDAYQUARTER, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.FIRSTDAYQUARTER.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.FIRSTDAYQUARTER.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.FIRSTDAYQUARTER, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTTDAYQUARTER]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTTDAYQUARTER, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTDAYQUARTER.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.LASTDAYQUARTER.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTTDAYQUARTER, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.FIRSTDAYYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.FIRSTDAYYEAR, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.FIRSTDAYYEAR.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.FIRSTDAYYEAR.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.FIRSTDAYYEAR, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTTDAYYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTTDAYYEAR, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTDAYYEAR.longText"),
				parseArgs: [mdcMessageBundle.getText("operators.LASTDAYYEAR.longText")],
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTTDAYYEAR, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.TODAYFROMTO]: [{
				formatArgs: [Condition.createCondition(OperatorName.TODAYFROMTO, [4, 6])],
				formatValue: mdcMessageBundle.getText("operators.TODAYFROMTO.tokenText", [4, 6]),
				//parseArgs: ["Last 4 days"],
				parsedValue: "46",
				condition: Condition.createCondition(OperatorName.TODAYFROMTO, [4, 6], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				longText: mdcMessageBundle.getText("operators.TODAYFROMTO.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.TODAYFROMTO.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.TODAYFROMTO, [4, 6]), undefined, undefined, true],
				formatValue: mdcMessageBundle.getText("operators.TODAYFROMTO.tokenText", [4, 6]),
				parseArgs: [mdcMessageBundle.getText("operators.TODAYFROMTO.tokenText", [4, 6]), undefined, undefined, true],
				parsedValue: "46",
				condition: Condition.createCondition(OperatorName.TODAYFROMTO, [4, 6], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false
			}],
			[OperatorName.NEXTDAYS]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTDAYS, [3])],
				formatValue: mdcMessageBundle.getText("operators.NEXTDAYS.tokenText", [3]),
				//parseArgs: ["Next 3 days"],
				parsedValue: "3",
				condition: Condition.createCondition(OperatorName.NEXTDAYS, [3], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.NEXTDAYS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.NEXTDAYS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.NEXTDAYS, [3]), undefined, undefined, true],
				formatValue: "3",
				parseArgs: ["3", undefined, undefined, true],
				parsedValue: "3",
				condition: Condition.createCondition(OperatorName.NEXTDAYS, [3], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTHOURS]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTHOURS, [2])],
				formatValue: mdcMessageBundle.getText("operators.NEXTHOURS.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.NEXTHOURS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.NEXTHOURS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.NEXTHOURS.tokenText")
			}],
			[OperatorName.LASTHOURS]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTHOURS, [2])],
				formatValue: mdcMessageBundle.getText("operators.LASTHOURS.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTHOURS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.LASTHOURS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.LASTHOURS.tokenText")
			}],
			[OperatorName.NEXTMINUTES]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTMINUTES, [2])],
				formatValue: mdcMessageBundle.getText("operators.NEXTMINUTES.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.NEXTMINUTES, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.NEXTMINUTES.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.NEXTMINUTES.tokenText")
			}],
			[OperatorName.LASTMINUTES]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTMINUTES, [2])],
				formatValue: mdcMessageBundle.getText("operators.LASTMINUTES.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTMINUTES, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.LASTMINUTES.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.LASTMINUTES.tokenText")
			}],
			[OperatorName.LASTWEEK]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTWEEK, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTWEEK.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTWEEK, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.THISWEEK]: [{
				formatArgs: [Condition.createCondition(OperatorName.THISWEEK, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.THISWEEK.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.THISWEEK, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTWEEK]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTWEEK, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.NEXTWEEK.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.NEXTWEEK, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTWEEKS]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTWEEKS, [2])],
				formatValue: mdcMessageBundle.getText("operators.LASTWEEKS.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTWEEKS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.LASTWEEKS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.LASTWEEKS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.LASTWEEKS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTWEEKS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTWEEKS]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTWEEKS, [13])],
				formatValue: mdcMessageBundle.getText("operators.NEXTWEEKS.tokenText", [13]),
				parsedValue: "13",
				condition: Condition.createCondition(OperatorName.NEXTWEEKS, [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.NEXTWEEKS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.NEXTWEEKS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.NEXTWEEKS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.NEXTWEEKS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			[OperatorName.LASTMONTH]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTMONTH, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTMONTH.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTMONTH, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.THISMONTH]: [{
				formatArgs: [Condition.createCondition(OperatorName.THISMONTH, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.THISMONTH.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.THISMONTH, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTMONTH]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTMONTH, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.NEXTMONTH.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.NEXTMONTH, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTMONTHS]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTMONTHS, [2])],
				formatValue: mdcMessageBundle.getText("operators.LASTMONTHS.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTMONTHS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.LASTMONTHS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.LASTMONTHS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.LASMONTHS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTMONTHS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTMONTHS]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTMONTHS, [13])],
				formatValue: mdcMessageBundle.getText("operators.NEXTMONTHS.tokenText", [13]),
				parsedValue: "13",
				condition: Condition.createCondition(OperatorName.NEXTMONTHS, [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.NEXTMONTHS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.NEXTMONTHS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.NEXTMONTHS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.NEXTMONTHS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.SPECIFICMONTH]: [{
				formatArgs: [Condition.createCondition(OperatorName.SPECIFICMONTH, [4])],
				formatValue: mdcMessageBundle.getText("operators.SPECIFICMONTH.tokenText", "May"),
				parsedValue: "4",
				condition: Condition.createCondition(OperatorName.SPECIFICMONTH, [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.SPECIFICMONTH.longText"),
				tokenText: mdcMessageBundle.getText("operators.SPECIFICMONTH.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.SPECIFICMONTH, [4]), undefined, undefined, true],
				formatValue: "May",
				parseArgs: ["May", undefined, undefined, true],
				parsedValue: "4",
				condition: Condition.createCondition(OperatorName.SPECIFICMONTH, [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.SPECIFICMONTHINYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.SPECIFICMONTHINYEAR, [4, 2000])],
				formatValue: mdcMessageBundle.getText("operators.SPECIFICMONTHINYEAR.tokenText", ["May", 2000]),
				parsedValue: "42000",
				condition: Condition.createCondition(OperatorName.SPECIFICMONTHINYEAR, [4, 2000], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: false,
				longText: mdcMessageBundle.getText("operators.SPECIFICMONTHINYEAR.longText"),
				tokenText: mdcMessageBundle.getText("operators.SPECIFICMONTHINYEAR.tokenText")
			}],
			[OperatorName.LASTQUARTER]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTQUARTER, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTQUARTER.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTQUARTER, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.THISQUARTER]: [{
				formatArgs: [Condition.createCondition(OperatorName.THISQUARTER, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.THISQUARTER.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.THISQUARTER, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTQUARTER]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTQUARTER, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.NEXTQUARTER.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.NEXTQUARTER, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTQUARTERS]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTQUARTERS, [2])],
				formatValue: mdcMessageBundle.getText("operators.LASTQUARTERS.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTQUARTERS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.LASTQUARTERS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.LASTQUARTERS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.LASTQUARTERS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTQUARTERS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTQUARTERS]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTQUARTERS, [13])],
				formatValue: mdcMessageBundle.getText("operators.NEXTQUARTERS.tokenText", [13]),
				parsedValue: "13",
				condition: Condition.createCondition(OperatorName.NEXTQUARTERS, [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.NEXTQUARTERS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.NEXTQUARTERS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.NEXTQUARTERS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.NEXTQUARTERS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			[OperatorName.LASTYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTYEAR, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.LASTYEAR.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.LASTYEAR, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.THISYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.THISYEAR, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.THISYEAR.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.THISYEAR, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTYEAR, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.NEXTYEAR.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.NEXTYEAR, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.LASTYEARS]: [{
				formatArgs: [Condition.createCondition(OperatorName.LASTYEARS, [2])],
				formatValue: mdcMessageBundle.getText("operators.LASTYEARS.tokenText", [2]),
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTYEARS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.LASTYEARS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.LASTYEARS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.LASTYEARS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.LASTYEARS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.NEXTYEARS]: [{
				formatArgs: [Condition.createCondition(OperatorName.NEXTYEARS, [13])],
				formatValue: mdcMessageBundle.getText("operators.NEXTYEARS.tokenText", [13]),
				parsedValue: "13",
				condition: Condition.createCondition(OperatorName.NEXTYEARS, [13], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: mdcMessageBundle.getText("operators.NEXTYEARS.tokenText").replace(/\{0\}/g, "X").replace(/\{1\}/g, "Y"),
				tokenText: mdcMessageBundle.getText("operators.NEXTYEARS.tokenText")
			},
			{
				formatArgs: [Condition.createCondition(OperatorName.NEXTYEARS, [2]), undefined, undefined, true],
				formatValue: "2",
				parseArgs: ["2", undefined, undefined, true],
				parsedValue: "2",
				condition: Condition.createCondition(OperatorName.NEXTYEARS, [2], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			[OperatorName.QUARTER1]: [{
				formatArgs: [Condition.createCondition(OperatorName.QUARTER1, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.QUARTER1.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.QUARTER1, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.QUARTER2]: [{
				formatArgs: [Condition.createCondition(OperatorName.QUARTER2, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.QUARTER2.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.QUARTER2, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.QUARTER3]: [{
				formatArgs: [Condition.createCondition(OperatorName.QUARTER3, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.QUARTER3.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.QUARTER3, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],
			[OperatorName.QUARTER4]: [{
				formatArgs: [Condition.createCondition(OperatorName.QUARTER4, [undefined])],
				formatValue: mdcMessageBundle.getText("operators.QUARTER4.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.QUARTER4, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			[OperatorName.YEARTODATE]: [{
				formatArgs: [Condition.createCondition(OperatorName.YEARTODATE, [undefined])],
				formatValue:  mdcMessageBundle.getText("operators.YEARTODATE.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.YEARTODATE, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
			}],

			[OperatorName.DATETOYEAR]: [{
				formatArgs: [Condition.createCondition(OperatorName.DATETOYEAR, [undefined])],
				formatValue:  mdcMessageBundle.getText("operators.DATETOYEAR.longText"),
				parsedValue: "",
				condition: Condition.createCondition(OperatorName.DATETOYEAR, [], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true
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
		//checking all above Operators for validity
		fOperatorCheck(assert, aOperators, aFormatTest);

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
			}
		});

		assert.equal(operatorWithSpecialCharacters.tokenTest, "^\\+foo (\\d+) operator$", "tokenTest has the expected format \+foo");
		assert.equal(operatorWithSpecialCharacters.tokenParse, "^\\+foo (\\d+) operator$|^(.+)?$", "tokenParse has the expected format \+foo");
		assert.equal(operatorWithSpecialCharacters.tokenFormat, "+foo {0} operator", "tokenFormat has the expected format +foo");
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

		let oOperator = FilterOperatorUtil.getOperator(OperatorName.Empty);
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

		oOperator = FilterOperatorUtil.getOperator(OperatorName.TODAY);
		assert.ok(oOperator, "Operator exist");

		const fCallbackGetModelFilter = function(oCondition, sFieldPath, oType, bCaseSensitive, sBaseType) {
			return "foo";
		};
		oOperator.overwrite(OperatorOverwrite.getModelFilter, fCallbackGetModelFilter);
		assert.equal(oOperator.getModelFilter, fCallbackGetModelFilter, "Overwrite function exist");
		assert.equal(oOperator.getModelFilter(), "foo", "Overwrite function returns expected value");

	});

});
