/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/ConditionValidateException",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Currency",
	"sap/ui/model/odata/type/String",
	"sap/ui/core/Core"
], function (
		ConditionsType,
		Condition,
		FilterOperatorUtil,
		ConditionValidateException,
		ConditionValidated,
		IntegerType,
		CurrencyType,
		StringType,
		oCore
	) {
	"use strict";

	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");
	var oConditionsType;
	var oValueType;
	var bAsyncCalled;
	var fnAsync = function(oPromise) {
		bAsyncCalled = true;
		if (!(oPromise instanceof Promise)) {
			throw new Error("needs promise");
		}
	};

	function _checkCondition(assert, oCondition, sOperator, aValues, sValidated) {

		assert.equal(oCondition.operator, sOperator, "Operator");
		assert.ok(Array.isArray(oCondition.values), "values are arry");
		assert.equal(oCondition.values.length, aValues.length, "Values length");
		if (aValues.length > 0) {
			assert.deepEqual(oCondition.values[0], aValues[0], "Values0 entry");
		}
		if (aValues.length > 1) {
			assert.deepEqual(oCondition.values[1], aValues[1], "Values1 entry");
		}
		assert.equal(oCondition.validated, sValidated, "Validated");

	}

	QUnit.module("Default type", {
		beforeEach: function() {
			oConditionsType = new ConditionsType({operators: ["EQ"]});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
			bAsyncCalled = undefined;
		}
	});

	QUnit.test("Formatting: nothing", function(assert) {

		var sResult = oConditionsType.formatValue();
		assert.equal(sResult, null, "Result of formatting");

	});

	QUnit.test("Formatting: simple String", function(assert) {

		var oCondition = Condition.createCondition("EQ", ["Test"], undefined, undefined, ConditionValidated.Validated);
		var sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Formatting: empty array", function(assert) {

		var vResult = oConditionsType.formatValue([]);
		assert.equal(vResult, "", "Result of formatting");

		vResult = oConditionsType.formatValue([], "int");
		assert.equal(vResult, 0, "Result of formatting");

	});

	QUnit.test("Formatting: invalid value", function(assert) {

		var oException;

		try {
			oConditionsType.formatValue("Test");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		var oException;

		try {
			oConditionsType.formatValue([{x: "X"}]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: array of conditions", function(assert) {

		oConditionsType.setFormatOptions({operators: ["EQ"], maxConditions: -1});
		var oCondition1 = Condition.createCondition("EQ", ["Test1"]);
		var oCondition2 = Condition.createCondition("EQ", ["Test2"]);
		var sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "=Test1" + oResourceBundle.getText("field.SEPARATOR") + "=Test2", "Result of formatting");

	});

	QUnit.test("Formatting: array of conditions with noFormatting", function(assert) {

		oConditionsType.setFormatOptions({operators: ["EQ"], maxConditions: -1, noFormatting: true});
		var oCondition1 = Condition.createCondition("EQ", ["Test1"]);
		var oCondition2 = Condition.createCondition("EQ", ["Test2"]);
		var sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "", "Result of formatting");

		oConditionsType.setFormatOptions({operators: ["EQ"], maxConditions: -1, noFormatting: true, keepValue: "A"});
		sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "A", "Result of formatting with keepValue");

	});

	QUnit.test("Parsing: simple String", function(assert) {

		var aConditions = oConditionsType.parseValue("Test");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 1, "1 condition returned");
		_checkCondition(assert, aConditions[0], "EQ", ["Test"], ConditionValidated.NotValidated);

	});

	QUnit.test("Parsing: EQ - empty", function(assert) {

		var aConditions = oConditionsType.parseValue("");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 0, "no conditions returned");
		assert.notOk(bAsyncCalled, "asyncParsing function not called");

	});

	QUnit.test("Formatting: simple Integer", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({operators: ["EQ"], valueType: oValueType});

		var oCondition = Condition.createCondition("EQ", [5], undefined, undefined, ConditionValidated.Validated);
		var sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, "5", "Result of formatting");

		oValueType.destroy();

	});

	QUnit.test("Parsing: simple Integer", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({operators: ["EQ"], valueType: oValueType});

		var aConditions = oConditionsType.parseValue("5");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 1, "1 condition returned");
		_checkCondition(assert, aConditions[0], "EQ", [5], ConditionValidated.NotValidated);

		oValueType.destroy();

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({operators: ["EQ"], valueType: oValueType});
		var oException;

		try {
			oConditionsType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Parsing: maxConditions > 1", function(assert) {

		var aCompareConditions = [Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		var aConditions = [];
		oConditionsType.setFormatOptions({operators: ["EQ"], maxConditions: 2, getConditions: function() {return aConditions;}, noFormatting: true});

		aConditions = oConditionsType.parseValue("X");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		aCompareConditions.push(Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated, undefined));
		aConditions = oConditionsType.parseValue("Y");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		var oException;

		try {
			aConditions = oConditionsType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

		aCompareConditions.push(Condition.createCondition("EQ", ["Z"], undefined, undefined, ConditionValidated.NotValidated, undefined));
		aCompareConditions.splice(0, 1);
		aConditions = oConditionsType.parseValue("Z");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		aConditions = oConditionsType.parseValue(""); // simulate user removes wrong value
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

	});

	QUnit.test("Validating: valid value", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({operators: ["EQ"], valueType: oValueType});
		var oCondition = Condition.createCondition("EQ", [20]);
		var oException;

		try {
			oConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: nothing", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({operators: ["EQ"], valueType: oValueType});
		var oException;

		try {
			oConditionsType.validateValue();
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: empty conditions", function(assert) {

		var oException;

		try {
			oConditionsType.validateValue([]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({operators: ["EQ"], valueType: oValueType});
		var oCondition = Condition.createCondition("EQ", [200]);
		var oException;

		try {
			oConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");
		assert.deepEqual(oException && oException.getCondition(), oCondition, "exception condition");
		assert.deepEqual(oException && oException.getConditions(), [oCondition], "exception conditions");

		oException = undefined;
		try {
			oConditionsType.validateValue("XXX");
		} catch (e) {
			oException = e;
		}
		assert.ok(oException, "exception fired");
		assert.notOk(oException && oException.getCondition(), "exception condition");
		assert.deepEqual(oException && oException.getConditions(), "XXX", "exception conditions");

	});

	QUnit.test("setConstraints", function(assert) {

		oConditionsType.setConstraints({test: "test"});

		assert.equal(oConditionsType._oConditionType.oConstraints.test, "test", "Constraints set on inner ConditionType");

	});

	QUnit.test("Parsing: unsing condition from navigation", function(assert) {

		var oNavigateCondition = Condition.createCondition("EQ", ["I3"], {testIn: "A"}, {testOut: "B"}, ConditionValidated.Validated);
		oConditionsType.setFormatOptions({operators: ["EQ"], navigateCondition: oNavigateCondition});

		var aConditions = oConditionsType.parseValue("I3");
		assert.deepEqual(aConditions, [oNavigateCondition], "navigationCondition returned");

		aConditions = oConditionsType.parseValue("I1");
		assert.notDeepEqual(aConditions, [oNavigateCondition], "navigationCondition not returned");

	});

	QUnit.test("destroyed ConditionsType", function(assert) {

		oConditionsType.destroy();
		var oCondition = Condition.createCondition("EQ", ["Test"]);
		var sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, null, "no formatting");

		oCondition = oConditionsType.parseValue("Test");
		assert.notOk(oCondition, "nothing parsed");

		var oException;

		try {
			oConditionsType.validateValue("X"); // invalid condition
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no validation");

	});

	QUnit.test("Parsing: multiple values from Paste", function(assert) {

		var aConditions = [Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		oConditionsType.setFormatOptions({operators: [], maxConditions: -1, getConditions: function() {return aConditions;}, asyncParsing: fnAsync});
		aConditions = oConditionsType.parseValue("I1\n!=I2\nI3	I5");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 4, "3 condition returned");
		_checkCondition(assert, aConditions[0], "EQ", ["X"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[1], "EQ", ["I1"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[2], "NE", ["I2"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[3], "BT", ["I3", "I5"], ConditionValidated.NotValidated);

	});

	QUnit.module("Async", {
		beforeEach: function() {
			oConditionsType = new ConditionsType({operators: ["EQ"], asyncParsing: fnAsync});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
		}
	});

	QUnit.test("Formatting", function(assert) {

		oConditionsType.setFormatOptions({operators: [], maxConditions: -1});
		var oCondition1 = Condition.createCondition("EQ", ["I1"]);
		var oCondition2 = Condition.createCondition("EQ", ["I2"]);
		var oCondition3 = Condition.createCondition("EQ", ["I3"]);
		var oStub = sinon.stub(oConditionsType._oConditionType, "formatValue");

		oStub.callsFake(function(oCondition) {
			if (oCondition.values[0] == "I2") {
				return "Item2";
			} else {
				var oPromise = new Promise(function(fResolve) {
					setTimeout(function () { // simulate request
						var sText;
						switch (oCondition.values[0]) {
						case "I1":
							sText = "Item1";
							break;

						case "I2":
							sText = "Item2";
							break;

						case "I3":
							sText = "Item3";
							break;

						default:
							break;
						}

						fResolve(sText);
					}, 0);
				});
				return oPromise;
			}
		});

		var sResult = oConditionsType.formatValue([oCondition1, oCondition2, oCondition3]);
		assert.ok(sResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		sResult.then(function(sDescription) {
			assert.equal(sDescription, "Item1" + oResourceBundle.getText("field.SEPARATOR") + "Item2" + oResourceBundle.getText("field.SEPARATOR") + "Item3", "Result of formatting");
			fnDone();
		});

	});

	QUnit.test("Formatting with error", function(assert) {

		oConditionsType.setFormatOptions({operators: [], maxConditions: -1});
		var oCondition1 = Condition.createCondition("EQ", ["I1"]);
		var oCondition2 = Condition.createCondition("EQ", ["I2"]);
		var oCondition3 = Condition.createCondition("EQ", ["I3"]);
		var oStub = sinon.stub(oConditionsType._oConditionType, "formatValue");

		oStub.callsFake(function(oCondition) {
			var oPromise = new Promise(function(fResolve, fReject) {
				setTimeout(function () { // simulate request
					var sText;
					switch (oCondition.values[0]) {
					case "I1":
						sText = "Item1";
						break;

					case "I2":
						try {
							throw new Error("Cannot format value " + oCondition.values[0]);
						} catch (oError) {
							fReject(oError);
						}
						break;

					case "I3":
						sText = "Item3";
						break;

					default:
						break;
					}

					fResolve(sText);
				}, 0);
			});
			return oPromise;
		});

		var sResult = oConditionsType.formatValue([oCondition1, oCondition2, oCondition3]);
		assert.ok(sResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		sResult.catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof Error, "Error is an Error object");
			assert.equal(oError.message, "Cannot format value I2", "Error message");
			fnDone();
		});

	});

	QUnit.test("Parsing", function(assert) {

		var oStub = sinon.stub(oConditionsType._oConditionType, "parseValue");

		oStub.callsFake(function(sText) {
				var oPromise = new Promise(function(fResolve) {
					setTimeout(function () { // simulate request
						var vKey;
						switch (sText) {
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

						fResolve(Condition.createItemCondition(vKey, sText));
					}, 0);
				});
				return oPromise;
		});

		var vResult = oConditionsType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.ok(bAsyncCalled, "asyncParsing function called");

		var fnDone = assert.async();
		vResult.then(function(aConditions) {
			assert.ok(aConditions, "Result returned");
			assert.ok(Array.isArray(aConditions), "Arry returned");
			assert.equal(aConditions.length, 1, "1 condition returned");
			_checkCondition(assert, aConditions[0], "EQ", ["I2", "Item2"], ConditionValidated.Validated);
			fnDone();
		});

	});

	QUnit.test("Parsing with error", function(assert) {

		var oStub = sinon.stub(oConditionsType._oConditionType, "parseValue");

		oStub.callsFake(function(sText) {
				var oPromise = new Promise(function(fResolve, fReject) {
					setTimeout(function () { // simulate request
						try {
							throw new Error("Cannot parse value " + sText);
						} catch (oError) {
							fReject(oError);
						}
					}, 0);
				});
				return oPromise;
		});

		var vResult = oConditionsType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");

		var fnDone = assert.async();
		vResult.catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof Error, "Error is an Error object");
			assert.equal(oError.message, "Cannot parse value Item2", "Error message");
			fnDone();
		});

	});

	QUnit.test("Parsing: maxConditions > 1", function(assert) {

		var aCompareConditions = [Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined),
								  Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		var aConditions = [Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		oConditionsType.setFormatOptions({operators: ["EQ"], maxConditions: -1, getConditions: function() {return aConditions;}, asyncParsing: fnAsync});

		var oStub = sinon.stub(oConditionsType._oConditionType, "parseValue");

		oStub.callsFake(function(sText) {
				var oPromise = new Promise(function(fResolve) {
					setTimeout(function () { // simulate request
						fResolve(Condition.createCondition("EQ", [sText], undefined, undefined, ConditionValidated.NotValidated, undefined));
					}, 0);
				});
				return oPromise;
		});

		var vResult = oConditionsType.parseValue("Y");
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.ok(bAsyncCalled, "asyncParsing function called");

		var fnDone = assert.async();
		vResult.then(function(aConditions) {
			assert.deepEqual(aConditions, aCompareConditions, "Result returned");
			fnDone();
		});

	});

	var oUnitConditionsType;
	var oUnitType;
	var oOriginalType;

	QUnit.module("currency type", {
		beforeEach: function() {
			var oCondition1 = Condition.createCondition("EQ", [[1.23, "EUR"]], undefined, undefined, ConditionValidated.NotValidated);
			var oCondition2 = Condition.createCondition("BT", [[1, "EUR"], [2, "EUR"]], undefined, undefined, ConditionValidated.NotValidated);
			var aConditions = [oCondition1, oCondition2];
			oOriginalType = new CurrencyType();
			oValueType = new CurrencyType({showMeasure: false});
			oUnitType = new CurrencyType({showNumber: false});
			oConditionsType = new ConditionsType({
				valueType: oValueType,
				maxConditions: -1,
				originalDateType: oOriginalType,
				additionalType: oUnitType,
				getConditions: function() {return aConditions;}
			});
			oUnitConditionsType = new ConditionsType({
				valueType: oUnitType,
				operators: ["EQ"],
				hideOperator: true,
				originalDateType: oOriginalType,
				additionalType: oValueType,
				maxConditions: 1,
				getConditions: function() {return aConditions;}
			});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
			oUnitConditionsType.destroy();
			oUnitConditionsType = undefined;
			oValueType.destroy();
			oValueType = undefined;
			oUnitType.destroy();
			oUnitType = undefined;
			oOriginalType.destroy();
			oOriginalType = undefined;
		}
	});

	QUnit.test("Formatting", function(assert) {

		var sValue1 = oValueType.formatValue([1.23, "EUR"], "string"); // because of special whitspace and local dependend
		var sValue2 = oValueType.formatValue([1, "EUR"], "string"); // because of special whitspace and local dependend
		var sValue3 = oValueType.formatValue([2, "EUR"], "string"); // because of special whitspace and local dependend
		var oCondition1 = Condition.createCondition("EQ", [[1.23, "EUR"]], undefined, undefined, ConditionValidated.Validated);
		var oCondition2 = Condition.createCondition("BT", [[1, "EUR"], [2, "EUR"]]);
		var sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, sValue1 + oResourceBundle.getText("field.SEPARATOR") + sValue2 + "..." + sValue3, "Result of number formatting");
		sResult = oUnitConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "EUR", "Result of unit formatting");

	});

	QUnit.test("unit parsing", function(assert) {

		var aConditions = oUnitConditionsType.parseValue("USD");
		assert.equal(aConditions.length, 2, "two conditions");
		_checkCondition(assert, aConditions[0], "EQ", [[1.23, "USD"]], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[1], "BT", [[1, "USD"], [2, "USD"]], ConditionValidated.NotValidated);

//		aConditions = oUnitConditionsType.parseValue("");
//		assert.equal(aConditions.length, 2, "two conditions");
//		assert.equal(aConditions[0].values.length, 1, "Condition 0: Values length");
//		assert.equal(aConditions[0].operator, "EQ", "Condition 0: Operator");
//		assert.ok(isNaN(aConditions[0].values[0][0]), "Condition 0: Values entry 0 number"); // as number is cleared by type if unit is cleared
//		assert.equal(aConditions[0].values[0][1], null, "Condition 0: Values entry 0 unit");
//		assert.equal(aConditions[1].operator, "BT", "Condition 1: Operator");
//		assert.ok(isNaN(aConditions[1].values[0][0]), "Condition 0: Values entry 0 number"); // as number is cleared by type if unit is cleared
//		assert.equal(aConditions[1].values[0][1], null, "Condition 1: Values entry 0 unit");
//		assert.ok(isNaN(aConditions[1].values[1][0]), "Condition 0: Values entry 0 number"); // as number is cleared by type if unit is cleared
//		assert.equal(aConditions[1].values[1][1], null, "Condition 1: Values entry 1 unit");

		oUnitType._aCurrentValue = [1, "USD"]; // fake existing value
		oValueType._aCurrentValue = [1, "USD"]; // fake existing value
		oUnitConditionsType.oFormatOptions.getConditions = function() {return [];};
		aConditions = oUnitConditionsType.parseValue("EUR");
		assert.equal(aConditions.length, 1, "one conditions");
		_checkCondition(assert, aConditions[0], "EQ", [[1, "EUR"]], ConditionValidated.NotValidated);

	});

	QUnit.test("unit Parsing unsing condition from navigation", function(assert) {

		var oNavigateCondition = Condition.createCondition("EQ", [[1, "USD"]], {testIn: "A"}, {testOut: "B"}, ConditionValidated.Validated, {testPayload: "C"});
		var oFormatOptions = oUnitConditionsType.getFormatOptions();
		oFormatOptions.navigateCondition = oNavigateCondition;
		oUnitConditionsType.setFormatOptions(oFormatOptions);

		var aConditions = oUnitConditionsType.parseValue("USD");
		assert.equal(aConditions.length, 2, "two conditions");
		_checkCondition(assert, aConditions[0], "EQ", [[1.23, "USD"]], ConditionValidated.NotValidated);
		assert.deepEqual(aConditions[0].inParameters, oNavigateCondition.inParameters, "Condition 0: inParameters");
		assert.deepEqual(aConditions[0].outParameters, oNavigateCondition.outParameters, "Condition 0: outParameters");
		assert.deepEqual(aConditions[0].payload, oNavigateCondition.payload, "Condition 0: payload");
		_checkCondition(assert, aConditions[1], "BT", [[1, "USD"], [2, "USD"]], ConditionValidated.NotValidated);
		assert.deepEqual(aConditions[1].inParameters, oNavigateCondition.inParameters, "Condition 1: inParameters");
		assert.deepEqual(aConditions[1].outParameters, oNavigateCondition.outParameters, "Condition 1: outParameters");
		assert.deepEqual(aConditions[1].payload, oNavigateCondition.payload, "Condition 1: payload");

	});

	QUnit.test("Parsing: maxConditions > 1", function(assert) {

		oUnitType._aCurrentValue = [1, "USD"]; // fake existing value
		oValueType._aCurrentValue = [1, "USD"]; // fake existing value
		oOriginalType._aCurrentValue = [1, "USD"]; // fake existing value
		var aConditions = oUnitConditionsType.oFormatOptions.getConditions();
		var aCompareConditions = [aConditions[0], aConditions[1], Condition.createCondition("EQ", [[9.99, "USD"]], undefined, undefined, ConditionValidated.NotValidated, undefined)];

		aConditions = oConditionsType.parseValue("9.99");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		oUnitType._aCurrentValue = undefined; // fake initial value
		oValueType._aCurrentValue = undefined; // fake initial value
		oOriginalType._aCurrentValue = undefined; // fake initial value
		oUnitConditionsType.oFormatOptions.getConditions = function() {return [];};
		aCompareConditions = [Condition.createCondition("EQ", [[7.77, "EUR"]], undefined, undefined, ConditionValidated.NotValidated, undefined)];

		aConditions = oUnitConditionsType.parseValue("EUR");
		oConditionsType.oFormatOptions.getConditions = function() {return aConditions;};
		aConditions = oConditionsType.parseValue("7.77");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

	});

	QUnit.module("Not nullable type", {
		beforeEach: function() {
			oValueType = new StringType({}, {nullable: false});
			oConditionsType = new ConditionsType({valueType: oValueType, operators: ["EQ"], maxConditions: 1});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Validating: null", function(assert) {

		var oException;

		try {
			oConditionsType.validateValue([]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired if maxConditions=1 and only EQ operators");
		assert.deepEqual(oException && oException.getCondition(), null, "exception condition");
		assert.deepEqual(oException && oException.getConditions(), [], "exception conditions");

		oConditionsType.setFormatOptions({valueType: oValueType, operators: [], maxConditions: 1});
		oException = undefined;

		try {
			oConditionsType.validateValue([]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "No exception fired if maxConditions=1 and not only EQ operators");

		oConditionsType.setFormatOptions({valueType: oValueType, operators: ["EQ"], maxConditions: -1});
		oException = undefined;

		try {
			oConditionsType.validateValue([]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "No exception fired if maxConditions!=1 and only EQ operators");

	});

});
