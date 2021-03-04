/*!
 * ${copyright}
 */

/* global QUnit */
/*eslint no-warning-comments: 0 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/condition/RangeOperator",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/BaseType",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/model/Filter",
	"sap/ui/model/type/Integer",
	"sap/ui/model/odata/type/String",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UniversalDateUtils"
], function(
	jQuery,
	FilterOperatorUtil,
	Operator,
	RangeOperator,
	Condition,
	BaseType,
	ConditionValidated,
	Filter,
	IntegerType,
	StringType,
	UniversalDate,
	UniversalDateUtils
) {
	"use strict";

	QUnit.module("Operator", {
		beforeEach: function() {

		},

		afterEach: function() {}
	});

	QUnit.test("createOperator", function(assert) {

		var _getModelFilter = function(oCondition, sFieldPath, aOperators) {
			return new Filter({ path: sFieldPath, operator: "EQ", value1: new Date().getFullYear() });
		};
		var oOperator = new Operator({
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
		var oError;
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

		var _getModelFilter = function(oCondition, sFieldPath, aOperators) {
			return new Filter({ path: sFieldPath, operator: "EQ", value1: new Date().getFullYear() });
		};

		var oOperator = new RangeOperator({
			name: "TODAY",
			valueTypes: [Operator.ValueType.Static],
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
		assert.ok(FilterOperatorUtil._mOperators.lowerThan, "standard LT operator created");
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
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Date).length, 44, "Default operators for date");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.DateTime).length, 12, "Default operators for datetime");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Time).length, 12, "Default operators for time");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Numeric).length, 12, "Default operators for numeric");
		assert.equal(FilterOperatorUtil.getOperatorsForType(BaseType.Boolean).length, 2, "Default operators for boolean");

		// TODO, test what operators are returned

	});

	QUnit.test("getOperator", function(assert) {

		var oOperator = FilterOperatorUtil.getOperator("EQ");
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, "EQ", "EQ operator returned");

	});

	QUnit.test("getEQOperator", function(assert) {

		var oMyOperator = new Operator({
			name: "MyEqual",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oMyOperator);

		var oOperator = FilterOperatorUtil.getEQOperator();
		assert.equal(oOperator && oOperator.name, "EQ", "EQ operator returned");

		oOperator = FilterOperatorUtil.getEQOperator(["GT", oMyOperator.name, "LT"]);
		assert.equal(oOperator && oOperator.name, oMyOperator.name, "custom operator returned");

		oOperator = FilterOperatorUtil.getEQOperator(["GT", "LT"]);
		assert.equal(oOperator && oOperator.name, "EQ", "EQ operator returned");

		delete FilterOperatorUtil._mOperators[oMyOperator.name]; // TODO API to remove operator

	});

	QUnit.test("getOperator via alias", function(assert) {

		var oOperator = FilterOperatorUtil.getOperator("FIRSTQUARTER");
		assert.ok(oOperator, "Operator returned");
		assert.equal(oOperator.name, "QUARTER1", "QUARTER1 operator returned");

	});

	function fOperatorCheck(assert, aOperators, aFormatTest) {

		//checking all above Operators for validity
		for (var i = 0; i < aOperators.length; i++) {
			var oOperator = aOperators[i];
			var sOperator = oOperator.name;
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
				for (var j = 0; j < aFormatTest[sOperator].length; j++) {
					var oTest = aFormatTest[sOperator][j];

					// EQ-Operator.format(["Test"]) --> "=Test"
					var sFormattedText = oOperator.format.apply(oOperator, oTest.formatArgs);
					assert.strictEqual(sFormattedText, oTest.formatValue, "Formatting: Operator " + sOperator + " has formated correctly from " + oTest.formatArgs.join() + " to " + oTest.formatValue);

					// EQ-Operator.parse("=Test") --> ["Test"]
					try {
						var aParseText = oOperator.parse.apply(oOperator, oTest.parseArgs || [sFormattedText, oTest.type]);
						var sParseText = Array.isArray(aParseText) ? aParseText.join("") : aParseText; // also test undefined result
						var sTestText = Array.isArray(oTest.parseArgs) ? oTest.parseArgs[0] : sFormattedText;
						assert.strictEqual(sParseText, oTest.parsedValue, "Parsing: Operator " + sOperator + " has parsed correctly from " + sTestText + " to " + sParseText);
					} catch (oException) {
						assert.ok(oTest.exception, "Exception fired in parsing");
					}

					// EQ-Operator.getCondition("=Test") --> {operator: "EQ", values: ["Test"]]}
					var oCondition;
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
						var bIsEmpty = oOperator.isEmpty(oCondition);
						assert.equal(bIsEmpty, oTest.isEmpty, "isEmpty check");

						try {
							oOperator.validate(oCondition.values, oTest.type);
						} catch (oException) {
							assert.ok(!oTest.valid, "Exception fired in validation");
						}

						if (oTest.filter) {
							var oFilter = oOperator.getModelFilter(oCondition, "test", oTest.oType);
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

		var aOperators = [];
		for (var sName in FilterOperatorUtil._mOperators) {
			aOperators.push(FilterOperatorUtil._mOperators[sName]);
		}

		var oIntType = new IntegerType({}, {maximum: 3});
		var oStringType = new StringType({}, {maxLength: 5});
		var oNUMCType = new StringType({}, {maxLength: 5, isDigitSequence: true, nullable: false});

		var aFormatTest = {
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
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, "Value"],
						formatValue: "Test",
						parseArgs: ["=Test", undefined, "Value"],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "EQ", value1: "Test"}
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["Test"]), undefined, undefined, "Value"],
						formatValue: "=Test",
						parseArgs: ["Test", undefined, "Value", true],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "EQ", value1: "Test"}
					},
					{
						formatArgs: [Condition.createItemCondition("Test"), undefined, "Value"],
						formatValue: "=Test",
						parseArgs: ["Test", undefined, "Value", true],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter: {path: "test", operator: "EQ", value1: "Test"}
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, "Description"],
						formatValue: "desc",
						parseArgs: ["=desc", undefined, "Description"],
						parsedValue: "desc",
						condition: Condition.createCondition("EQ", [undefined, "desc"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, "ValueDescription"],
						formatValue: "Test (desc)",
						parseArgs: ["=Test", undefined, "ValueDescription"],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition(5, "desc"), oIntType, "ValueDescription"],
						formatValue: "5 (desc)",
						parseArgs: ["=5", oIntType, "ValueDescription"],
						parsedValue: "5",
						condition: Condition.createCondition("EQ", [5, undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition(5, "desc"), oIntType, "DescriptionValue"],
						formatValue: "desc (5)",
						parseArgs: ["=desc (5)", oIntType, "DescriptionValue"],
						parsedValue: "5desc",
						condition: Condition.createCondition("EQ", [5, "desc"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition(1, "desc"), oIntType, "ValueDescription"],
						formatValue: "1 (desc)",
						parseArgs: ["=A", oIntType, "ValueDescription"],
						parsedValue: "",
						condition: Condition.createCondition("EQ", [undefined, undefined], undefined, undefined, ConditionValidated.NotValidated),
						exception: true,
						isEmpty: true,
						valid: false,
						type: oIntType
					},
					{
						formatArgs: [Condition.createItemCondition("Test", "desc"), undefined, "ValueDescription"],
						formatValue: "Test (desc)",
						parseArgs: ["=Test (desc)", undefined, "ValueDescription"],
						parsedValue: "Testdesc",
						condition: Condition.createCondition("EQ", ["Test", "desc"], undefined, undefined, ConditionValidated.Validated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createItemCondition(null, "desc"), undefined, "ValueDescription"],
						formatValue: " (desc)",
						parseArgs: ["=", undefined, "ValueDescription"],
						parsedValue: undefined,
						condition: null,
						isEmpty: true,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["Test", undefined], undefined, undefined, ConditionValidated.Validated), undefined, "ValueDescription"],
						formatValue: "Test",
						parseArgs: ["=Test", undefined, "ValueDescription"],
						parsedValue: "Test",
						condition: Condition.createCondition("EQ", ["Test", undefined], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true
					},
					{
						formatArgs: [Condition.createCondition("EQ", ["Test"])],
						formatValue: "=Test",
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
					}
				],
				"StartsWith": [{
						formatArgs: [Condition.createCondition("StartsWith", ["Test"]), oStringType, "Description"],
						formatValue: "Test*",
						parsedValue: "Test",
						condition: Condition.createCondition("StartsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("StartsWith", ["*"]), oStringType, "Description"],
						formatValue: "**",
						parsedValue: undefined,
						isEmpty: true,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("StartsWith", ["a", "b"]), oStringType, "Description"],
						formatValue: "a*",
						parsedValue: "a",
						condition: Condition.createCondition("StartsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					}
				],
				"NotStartsWith": [{
						formatArgs: [Condition.createCondition("NotStartsWith", ["Test"]), oStringType, "Description"],
						formatValue: "!(Test*)",
						parseArgs: ["!Test*", oStringType, "Description"],
						parsedValue: "Test",
						condition: Condition.createCondition("NotStartsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotStartsWith", ["*"]), oStringType, "Description"],
						formatValue: "!(**)",
						parsedValue: undefined,
						isEmpty: true,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotStartsWith", ["a", "b"]), oStringType, "Description"],
						formatValue: "!(a*)",
						parseArgs: ["!a*", oStringType, "Description"],
						parsedValue: "a",
						condition: Condition.createCondition("NotStartsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					}
				],
				"EndsWith": [{
						formatArgs: [Condition.createCondition("EndsWith", ["Test"]), oStringType, "Description"],
						formatValue: "*Test",
						parsedValue: "Test",
						condition: Condition.createCondition("EndsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("EndsWith", ["a", "b"]), oStringType, "Description"],
						formatValue: "*a",
						parsedValue: "a",
						condition: Condition.createCondition("EndsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					}
				],
				"NotEndsWith": [{
						formatArgs: [Condition.createCondition("NotEndsWith", ["Test"]), oStringType, "Description"],
						formatValue: "!(*Test)",
						parseArgs: ["!*Test", oStringType, "Description"],
						parsedValue: "Test",
						condition: Condition.createCondition("NotEndsWith", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotEndsWith", ["a", "b"]), oStringType, "Description"],
						formatValue: "!(*a)",
						parseArgs: ["!*a", oStringType, "Description"],
						parsedValue: "a",
						condition: Condition.createCondition("NotEndsWith", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
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
					}
				],
				"BTEX": [{
						formatArgs: [Condition.createCondition("BTEX", ["Test1", "Test2"])],
						formatValue: "Test1..Test2",
						parsedValue: "Test1Test2",
						condition: Condition.createCondition("BTEX", ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						//filter: {path: "test", operator: "BT", value1: "Test1", value2: "Test2"}
						isSingleValue: false
					}
				],
				"NOTBTEX": [{
						formatArgs: [Condition.createCondition("BTEX", ["Test1", "Test2"])],
						formatValue: "!(Test1..Test2)",
						parseArgs: ["!Test1..Test2"],
						parsedValue: "Test1Test2",
						condition: Condition.createCondition("NOTBTEX", ["Test1", "Test2"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						//filter: {path: "test", operator: "BT", value1: "Test1", value2: "Test2"}
						isSingleValue: false
					}
				],
				"Contains": [{
						formatArgs: [Condition.createCondition("Contains", ["Test"]), oStringType, "Description"],
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
						formatArgs: [Condition.createCondition("Contains", ["a", "b"]), oStringType, "Description"],
						formatValue: "*a*",
						parsedValue: "a",
						condition: Condition.createCondition("Contains", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("Contains", ["01"]), oNUMCType, "Description"],
						formatValue: "*01*",
						parseArgs: ["*1*", oNUMCType, "Description"],
						parsedValue: "1",
						condition: Condition.createCondition("Contains", ["1"], undefined, undefined, ConditionValidated.NotValidated),
						exception: false,
						isEmpty: false,
						valid: true,
						type: oNUMCType
					},
					{
						formatArgs: [Condition.createCondition("Contains", ["1"]), oNUMCType, "Description"],
						formatValue: "*1*",
						parseArgs: ["*A*", oNUMCType, "Description"],
						parsedValue: "A",
						condition: Condition.createCondition("Contains", ["A"], undefined, undefined, ConditionValidated.NotValidated),
						exception: true,
						isEmpty: false,
						valid: false,
						type: oNUMCType
					}
				],
				"NotContains": [{
						formatArgs: [Condition.createCondition("NotContains", ["Test"]), oStringType, "Description"],
						formatValue: "!(*Test*)",
						parseArgs: ["!*Test*", oStringType, "Description"],
						parsedValue: "Test",
						condition: Condition.createCondition("NotContains", ["Test"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
						filter:  {path: "test", operator: "NotContains", value1: "Test"},
						isSingleValue: true,
						type: oStringType
					},
					{
						formatArgs: [Condition.createCondition("NotContains", ["a", "b"]), oStringType, "Description"],
						formatValue: "!(*a*)",
						parseArgs: ["!*a*", oStringType, "Description"],
						parsedValue: "a",
						condition: Condition.createCondition("NotContains", ["a"], undefined, undefined, ConditionValidated.NotValidated),
						isEmpty: false,
						valid: true,
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
		var aOperators = [];
		for (var sName in FilterOperatorUtil._mOperators) {
			aOperators.push(FilterOperatorUtil._mOperators[sName]);
		}

		var aFormatTest = {
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
				isSingleValue: true
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
				tokenText: "Last {0} days"
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
			}],
			"SPECIFICMONTHS": [{
				formatArgs: [Condition.createCondition("SPECIFICMONTHS", [4])],
				formatValue: "Month (May)",
				parsedValue: "4",
				condition: Condition.createCondition("SPECIFICMONTHS", [4], undefined, undefined, ConditionValidated.NotValidated),
				isEmpty: false,
				valid: true,
				isSingleValue: true,
				longText: "Month (X)",
				tokenText: "Month ({0})"
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
			}]

		};
		//checking all above Operators for validity
		fOperatorCheck(assert, aOperators, aFormatTest);

	});

	QUnit.test("getMatchingOperators", function(assert) {

		var aAllOperators = FilterOperatorUtil.getOperatorsForType(BaseType.String);
		var aOperators = FilterOperatorUtil.getMatchingOperators(["X", "Y"]);
		assert.strictEqual(aOperators.length, 0, "invalid operators should not result in anything");

		aOperators = FilterOperatorUtil.getMatchingOperators(aAllOperators, "=true");
		var oExpected = FilterOperatorUtil.getOperator("EQ", aAllOperators);
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

		var oOperator = FilterOperatorUtil.getDefaultOperator(BaseType.String);
		assert.strictEqual(oOperator.name, "EQ", "EQ should be default operator for string type");

		oOperator = FilterOperatorUtil.getDefaultOperator(BaseType.DateTime);
		assert.strictEqual(oOperator.name, "EQ", "EQ should be default operator for sap.ui.model.odata.type.TimeOfDay type");

	});

	QUnit.test("checkConditionsEmpty", function(assert) {

		var aConditions = [
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
		var oCondition = Condition.createCondition("EQ", []);
		FilterOperatorUtil.checkConditionsEmpty(oCondition);

		assert.ok(oCondition.isEmpty, "Condition 1 is empty");

	});

	QUnit.test("updateConditionsValues", function(assert) {

		var aConditions = [
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
		var oCondition = Condition.createCondition("EQ", ["X", undefined]);
		FilterOperatorUtil.updateConditionsValues(oCondition);

		assert.equal(oCondition.values.length, 1, "Condition values length");

	});

	QUnit.test("indexOfCondition", function(assert) {

		var aConditions = [
						   Condition.createCondition("EQ", ["X", "Y"], undefined, undefined, ConditionValidated.Validated),
						   Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated),
						   Condition.createCondition("EQ", ["Z"]),
						   Condition.createCondition("BT", ["X", "Y"]),
						   Condition.createCondition("TODAY", [null])
						   ];

		// same validated condition
		var oCondition = Condition.createCondition("EQ", ["X", "Z"], undefined, undefined, ConditionValidated.Validated);
		var iIndex = FilterOperatorUtil.indexOfCondition(oCondition, aConditions);
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

		var aConditions1 = [];
		var aConditions2 = [];

		var bEqual = FilterOperatorUtil.compareConditionsArray(aConditions1, aConditions2);
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

	});

	QUnit.test("checkConditionValidated", function(assert) {

		var oCondition = Condition.createCondition("EQ", ["X"]);
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
		var operatorWithSpecialCharacters = new RangeOperator({
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
		var operatorWithSpecialCharacters = new RangeOperator({
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

		var oMyEQ = new Operator({
			name: "MYEQ",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});

		var oLowerThan = new Operator({
			name: "MYLT",
			filterOperator: "LT",
			tokenParse: "^<([^=].*)$",
			tokenFormat: "<{0}",
			valueTypes: [Operator.ValueType.Self]
		});

		FilterOperatorUtil.setOperatorsForType("myType", [oMyEQ, oLowerThan], oMyEQ);

		var aOperators = FilterOperatorUtil.getOperatorsForType("myType");

		assert.equal(aOperators[0], "MYEQ", "Name set");
		assert.equal(aOperators[1], "MYLT", "Name set");

		var oDefaultOperator = FilterOperatorUtil.getDefaultOperator("myType");

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

		var oMyOperator = new Operator({
			name: "MyEqual",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});
		var oMyOperator2 = new Operator({
			name: "MyEqual2",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});

		// add one Operator and remove it
		FilterOperatorUtil.addOperator(oMyOperator);

		var oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.ok(oOperator, "Operator exist");

		FilterOperatorUtil.removeOperators(oMyOperator);

		oOperator = FilterOperatorUtil.getOperator("MyEqual");
		assert.notOk(oOperator, "Operator should NOT exist");

		// Set one or multiple Operators
		FilterOperatorUtil.setOperators([oMyOperator, oMyOperator2]);

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

});
