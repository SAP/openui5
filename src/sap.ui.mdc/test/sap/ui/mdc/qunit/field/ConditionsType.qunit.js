/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/mdc/field/ConditionsType",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/ConditionValidateException",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/Currency",
	"sap/ui/model/odata/type/String"
], function (
		Library,
		ConditionsType,
		Condition,
		FilterOperatorUtil,
		ConditionValidateException,
		ConditionValidated,
		OperatorName,
		IntegerType,
		CurrencyType,
		StringType
	) {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");
	let oConditionsType;
	let oValueType;
	let bAsyncCalled;
	const fnAsync = function(oPromise) {
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
			oConditionsType = new ConditionsType({operators: [OperatorName.EQ]});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
			bAsyncCalled = undefined;
		}
	});

	QUnit.test("Formatting: nothing", function(assert) {

		const sResult = oConditionsType.formatValue();
		assert.equal(sResult, null, "Result of formatting");

	});

	QUnit.test("Formatting: simple String", function(assert) {

		const oCondition = Condition.createCondition(OperatorName.EQ, ["Test"], undefined, undefined, ConditionValidated.Validated);
		const sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, "Test", "Result of formatting");

	});

	QUnit.test("Formatting: empty array", function(assert) {

		let vResult = oConditionsType.formatValue([]);
		assert.equal(vResult, "", "Result of formatting");

		vResult = oConditionsType.formatValue([], "int");
		assert.equal(vResult, 0, "Result of formatting");

	});

	QUnit.test("Formatting: invalid value", function(assert) {

		let oException;

		try {
			oConditionsType.formatValue("Test");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: invalid condition", function(assert) {

		let oException;

		try {
			oConditionsType.formatValue([{x: "X"}]);
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Formatting: array of conditions", function(assert) {

		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], maxConditions: -1});
		const oCondition1 = Condition.createCondition(OperatorName.EQ, ["Test1"]);
		const oCondition2 = Condition.createCondition(OperatorName.EQ, ["Test2"]);
		let sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "Test1" + oResourceBundle.getText("field.SEPARATOR") + "Test2", "Result of formatting"); // if only one operator, symbol is hidden

		oConditionsType.setFormatOptions({operators: [OperatorName.EQ, OperatorName.GT], maxConditions: -1});
		sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "=Test1" + oResourceBundle.getText("field.SEPARATOR") + "=Test2", "Result of formatting");

	});

	QUnit.test("Formatting: array of conditions with noFormatting", function(assert) {

		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], maxConditions: -1, noFormatting: true});
		const oCondition1 = Condition.createCondition(OperatorName.EQ, ["Test1"]);
		const oCondition2 = Condition.createCondition(OperatorName.EQ, ["Test2"]);
		let sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "", "Result of formatting");

		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], maxConditions: -1, noFormatting: true, keepValue: "A"});
		sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "A", "Result of formatting with keepValue");

	});

	QUnit.test("Parsing: simple String", function(assert) {

		const aConditions = oConditionsType.parseValue("Test");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 1, "1 condition returned");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, ["Test"], ConditionValidated.NotValidated);

	});

	QUnit.test("Parsing: EQ - empty", function(assert) {

		const aConditions = oConditionsType.parseValue("");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 0, "no conditions returned");
		assert.notOk(bAsyncCalled, "asyncParsing function not called");

	});

	QUnit.test("Formatting: simple Integer", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], valueType: oValueType});

		const oCondition = Condition.createCondition(OperatorName.EQ, [5], undefined, undefined, ConditionValidated.Validated);
		const sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, "5", "Result of formatting");

		oValueType.destroy();

	});

	QUnit.test("Parsing: simple Integer", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], valueType: oValueType});

		const aConditions = oConditionsType.parseValue("5");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 1, "1 condition returned");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, [5], ConditionValidated.NotValidated);

		oValueType.destroy();

	});

	QUnit.test("Parsing: invalid value", function(assert) {

		oValueType = new IntegerType();
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], valueType: oValueType});
		let oException;

		try {
			oConditionsType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

	});

	QUnit.test("Parsing: maxConditions > 1", function(assert) {

		const aCompareConditions = [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		let aConditions = [];
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], maxConditions: 2, getConditions: function() {return aConditions;}, noFormatting: true});

		aConditions = oConditionsType.parseValue("X");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		aCompareConditions.push(Condition.createCondition(OperatorName.EQ, ["Y"], undefined, undefined, ConditionValidated.NotValidated, undefined));
		aConditions = oConditionsType.parseValue("Y");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		let oException;

		try {
			aConditions = oConditionsType.parseValue("X");
		} catch (e) {
			oException = e;
		}

		assert.ok(oException, "exception fired");

		aCompareConditions.push(Condition.createCondition(OperatorName.EQ, ["Z"], undefined, undefined, ConditionValidated.NotValidated, undefined));
		aCompareConditions.splice(0, 1);
		aConditions = oConditionsType.parseValue("Z");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		aConditions = oConditionsType.parseValue(""); // simulate user removes wrong value
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

	});

	QUnit.test("Validating: valid value", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], valueType: oValueType});
		const oCondition = Condition.createCondition(OperatorName.EQ, [20]);
		let oException;

		try {
			oConditionsType.validateValue([oCondition]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: nothing", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], valueType: oValueType});
		let oException;

		try {
			oConditionsType.validateValue();
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: empty conditions", function(assert) {

		let oException;

		try {
			oConditionsType.validateValue([]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no exception fired");

	});

	QUnit.test("Validating: invalid value", function(assert) {

		oValueType = new IntegerType({}, {maximum: 100});
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], valueType: oValueType});
		const oCondition = Condition.createCondition(OperatorName.EQ, [200]);
		let oException;

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

		const oNavigateCondition = Condition.createCondition(OperatorName.EQ, ["I3"], {testIn: "A"}, {testOut: "B"}, ConditionValidated.Validated);
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], navigateCondition: oNavigateCondition});

		let aConditions = oConditionsType.parseValue("I3");
		assert.deepEqual(aConditions, [oNavigateCondition], "navigationCondition returned");

		aConditions = oConditionsType.parseValue("I1");
		assert.notDeepEqual(aConditions, [oNavigateCondition], "navigationCondition not returned");

	});

	QUnit.test("destroyed ConditionsType", function(assert) {

		oConditionsType.destroy();
		let oCondition = Condition.createCondition(OperatorName.EQ, ["Test"]);
		const sResult = oConditionsType.formatValue([oCondition]);
		assert.equal(sResult, null, "no formatting");

		oCondition = oConditionsType.parseValue("Test");
		assert.notOk(oCondition, "nothing parsed");

		let oException;

		try {
			oConditionsType.validateValue("X"); // invalid condition
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "no validation");

	});

	QUnit.test("Parsing: multiple values from Paste", async function(assert) {

		let aConditions = [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		oConditionsType.setFormatOptions({operators: [], maxConditions: -1, getConditions: function() {return aConditions;}, asyncParsing: fnAsync});
		aConditions = await oConditionsType.parseValue("I1\n!=I2\nI3\tI5\n\tA*");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 5, "5 condition returned");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, ["X"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[1], OperatorName.EQ, ["I1"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[2], OperatorName.EQ, ["!=I2"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[3], OperatorName.EQ, ["I3"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[4], OperatorName.StartsWith, ["A"], ConditionValidated.NotValidated);

		// for multipleLines allow linebreaks
		aConditions = [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], maxConditions: -1, multipleLines: true, getConditions: function() {return aConditions;}, asyncParsing: fnAsync});
		// eslint-disable-next-line require-atomic-updates
		aConditions = await oConditionsType.parseValue("I1\n!=I2\nI3\tI5");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 2, "2 condition returned");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, ["X"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[1], OperatorName.EQ, ["I1\n!=I2\nI3\tI5"], ConditionValidated.NotValidated);

		// for BT use two values
		aConditions = [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		oConditionsType.setFormatOptions({operators: [OperatorName.BT], maxConditions: -1, multipleLines: false, getConditions: function() {return aConditions;}, asyncParsing: fnAsync});
		// eslint-disable-next-line require-atomic-updates
		aConditions = await oConditionsType.parseValue("I1\tI2\nI3\tI5");
		assert.ok(aConditions, "Result returned");
		assert.ok(Array.isArray(aConditions), "Arry returned");
		assert.equal(aConditions.length, 3, "3 condition returned");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, ["X"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[1], OperatorName.BT, ["I1", "I2"], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[2], OperatorName.BT, ["I3", "I5"], ConditionValidated.NotValidated);

	});

	QUnit.test("Parsing: multiple invalid values from Paste", async function(assert) {

		oValueType = new IntegerType();
		let aConditions = [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], valueType: oValueType, maxConditions: -1, getConditions: function() {return aConditions;}, asyncParsing: fnAsync});

		try {
			aConditions = await oConditionsType.parseValue("1\nA\n3");
		} catch (error) {
			assert.ok(error, "exception fired");
		}

		oValueType.destroy();

	});

	QUnit.module("Async", {
		beforeEach: function() {
			oConditionsType = new ConditionsType({operators: [OperatorName.EQ], asyncParsing: fnAsync});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
		}
	});

	QUnit.test("Formatting", function(assert) {

		oConditionsType.setFormatOptions({operators: [], maxConditions: -1});
		const oCondition1 = Condition.createCondition(OperatorName.EQ, ["I1"]);
		const oCondition2 = Condition.createCondition(OperatorName.EQ, ["I2"]);
		const oCondition3 = Condition.createCondition(OperatorName.EQ, ["I3"]);
		const oStub = sinon.stub(oConditionsType._oConditionType, "formatValue");

		oStub.callsFake(function(oCondition) {
			if (oCondition.values[0] == "I2") {
				return "Item2";
			} else {
				const oPromise = new Promise(function(fResolve) {
					setTimeout(function () { // simulate request
						let sText;
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

		const sResult = oConditionsType.formatValue([oCondition1, oCondition2, oCondition3]);
		assert.ok(sResult instanceof Promise, "Promise returned");

		const fnDone = assert.async();
		sResult.then(function(sDescription) {
			assert.equal(sDescription, "Item1" + oResourceBundle.getText("field.SEPARATOR") + "Item2" + oResourceBundle.getText("field.SEPARATOR") + "Item3", "Result of formatting");
			fnDone();
		});

	});

	QUnit.test("Formatting with error", function(assert) {

		oConditionsType.setFormatOptions({operators: [], maxConditions: -1});
		const oCondition1 = Condition.createCondition(OperatorName.EQ, ["I1"]);
		const oCondition2 = Condition.createCondition(OperatorName.EQ, ["I2"]);
		const oCondition3 = Condition.createCondition(OperatorName.EQ, ["I3"]);
		const oStub = sinon.stub(oConditionsType._oConditionType, "formatValue");

		oStub.callsFake(function(oCondition) {
			const oPromise = new Promise(function(fResolve, fReject) {
				setTimeout(function () { // simulate request
					let sText;
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

		const sResult = oConditionsType.formatValue([oCondition1, oCondition2, oCondition3]);
		assert.ok(sResult instanceof Promise, "Promise returned");

		const fnDone = assert.async();
		sResult.catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof Error, "Error is an Error object");
			assert.equal(oError.message, "Cannot format value I2", "Error message");
			fnDone();
		});

	});

	QUnit.test("Parsing", function(assert) {

		const oStub = sinon.stub(oConditionsType._oConditionType, "parseValue");

		oStub.callsFake(function(sText) {
				const oPromise = new Promise(function(fResolve) {
					setTimeout(function () { // simulate request
						let vKey;
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

		const vResult = oConditionsType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.ok(bAsyncCalled, "asyncParsing function called");

		const fnDone = assert.async();
		vResult.then(function(aConditions) {
			assert.ok(aConditions, "Result returned");
			assert.ok(Array.isArray(aConditions), "Arry returned");
			assert.equal(aConditions.length, 1, "1 condition returned");
			_checkCondition(assert, aConditions[0], OperatorName.EQ, ["I2", "Item2"], ConditionValidated.Validated);
			fnDone();
		});

	});

	QUnit.test("Parsing with error", function(assert) {

		const oStub = sinon.stub(oConditionsType._oConditionType, "parseValue");

		oStub.callsFake(function(sText) {
				const oPromise = new Promise(function(fResolve, fReject) {
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

		const vResult = oConditionsType.parseValue("Item2");
		assert.ok(vResult instanceof Promise, "Promise returned");

		const fnDone = assert.async();
		vResult.catch(function(oError) {
			assert.ok(oError, "Error Fired");
			assert.ok(oError instanceof Error, "Error is an Error object");
			assert.equal(oError.message, "Cannot parse value Item2", "Error message");
			fnDone();
		});

	});

	QUnit.test("Parsing: maxConditions > 1", function(assert) {

		const aCompareConditions = [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined),
								  Condition.createCondition(OperatorName.EQ, ["Y"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		const aConditions = [Condition.createCondition(OperatorName.EQ, ["X"], undefined, undefined, ConditionValidated.NotValidated, undefined)];
		oConditionsType.setFormatOptions({operators: [OperatorName.EQ], maxConditions: -1, getConditions: function() {return aConditions;}, asyncParsing: fnAsync});

		const oStub = sinon.stub(oConditionsType._oConditionType, "parseValue");

		oStub.callsFake(function(sText) {
				const oPromise = new Promise(function(fResolve) {
					setTimeout(function () { // simulate request
						fResolve(Condition.createCondition(OperatorName.EQ, [sText], undefined, undefined, ConditionValidated.NotValidated, undefined));
					}, 0);
				});
				return oPromise;
		});

		const vResult = oConditionsType.parseValue("Y");
		assert.ok(vResult instanceof Promise, "Promise returned");
		assert.ok(bAsyncCalled, "asyncParsing function called");

		const fnDone = assert.async();
		vResult.then(function(aConditions) {
			assert.deepEqual(aConditions, aCompareConditions, "Result returned");
			fnDone();
		});

	});

	let oUnitConditionsType;
	let oUnitType;
	let oOriginalType;

	QUnit.module("currency type", {
		beforeEach: function() {
			const oCondition1 = Condition.createCondition(OperatorName.EQ, [[1.23, "EUR"]], undefined, undefined, ConditionValidated.NotValidated);
			const oCondition2 = Condition.createCondition(OperatorName.BT, [[1, "EUR"], [2, "EUR"]], undefined, undefined, ConditionValidated.NotValidated);
			const aConditions = [oCondition1, oCondition2];
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
				operators: [OperatorName.EQ],
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

		const sValue1 = oValueType.formatValue([1.23, "EUR"], "string"); // because of special whitspace and local dependend
		const sValue2 = oValueType.formatValue([1, "EUR"], "string"); // because of special whitspace and local dependend
		const sValue3 = oValueType.formatValue([2, "EUR"], "string"); // because of special whitspace and local dependend
		const oCondition1 = Condition.createCondition(OperatorName.EQ, [[1.23, "EUR"]], undefined, undefined, ConditionValidated.Validated);
		const oCondition2 = Condition.createCondition(OperatorName.BT, [[1, "EUR"], [2, "EUR"]]);
		let sResult = oConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, sValue1 + oResourceBundle.getText("field.SEPARATOR") + sValue2 + "..." + sValue3, "Result of number formatting");
		sResult = oUnitConditionsType.formatValue([oCondition1, oCondition2]);
		assert.equal(sResult, "EUR", "Result of unit formatting");
		assert.deepEqual(oUnitType._aCurrentValue, [1.23, "EUR"], "CurrentValue stored in unit type");
		assert.deepEqual(oValueType._aCurrentValue, [1.23, "EUR"], "CurrentValue stored in value type");
		assert.deepEqual(oOriginalType._aCurrentValue, [1.23, "EUR"], "CurrentValue stored in original type");

		sResult = oConditionsType.formatValue([]); // after initialization no old value must be shown
		assert.equal(sResult, "", "Result of number formatting");
		sResult = oUnitConditionsType.formatValue([]);
		assert.equal(sResult, "", "Result of unit formatting");
		assert.deepEqual(oUnitType._aCurrentValue, [], "CurrentValue initialized in unit type");
		assert.deepEqual(oValueType._aCurrentValue, [], "CurrentValue initialized in value type");
		assert.deepEqual(oOriginalType._aCurrentValue, [], "CurrentValue initialized in original type");

	});

	QUnit.test("unit parsing", function(assert) {

		let aConditions = oUnitConditionsType.parseValue("USD");
		assert.equal(aConditions.length, 2, "two conditions");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, [[1.23, "USD"]], ConditionValidated.NotValidated);
		_checkCondition(assert, aConditions[1], OperatorName.BT, [[1, "USD"], [2, "USD"]], ConditionValidated.NotValidated);

//		aConditions = oUnitConditionsType.parseValue("");
//		assert.equal(aConditions.length, 2, "two conditions");
//		assert.equal(aConditions[0].values.length, 1, "Condition 0: Values length");
//		assert.equal(aConditions[0].operator, OperatorName.EQ, "Condition 0: Operator");
//		assert.ok(isNaN(aConditions[0].values[0][0]), "Condition 0: Values entry 0 number"); // as number is cleared by type if unit is cleared
//		assert.equal(aConditions[0].values[0][1], null, "Condition 0: Values entry 0 unit");
//		assert.equal(aConditions[1].operator, OperatorName.BT, "Condition 1: Operator");
//		assert.ok(isNaN(aConditions[1].values[0][0]), "Condition 0: Values entry 0 number"); // as number is cleared by type if unit is cleared
//		assert.equal(aConditions[1].values[0][1], null, "Condition 1: Values entry 0 unit");
//		assert.ok(isNaN(aConditions[1].values[1][0]), "Condition 0: Values entry 0 number"); // as number is cleared by type if unit is cleared
//		assert.equal(aConditions[1].values[1][1], null, "Condition 1: Values entry 1 unit");

		oUnitType._aCurrentValue = [1, "USD"]; // fake existing value
		oValueType._aCurrentValue = [1, "USD"]; // fake existing value
		oUnitConditionsType.oFormatOptions.getConditions = function() {return [];};
		aConditions = oUnitConditionsType.parseValue("EUR");
		assert.equal(aConditions.length, 1, "one conditions");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, [[1, "EUR"]], ConditionValidated.NotValidated);

	});

	QUnit.test("unit Parsing unsing condition from navigation", function(assert) {

		const oNavigateCondition = Condition.createCondition(OperatorName.EQ, [[1, "USD"]], {testIn: "A"}, {testOut: "B"}, ConditionValidated.Validated, {testPayload: "C"});
		const oFormatOptions = oUnitConditionsType.getFormatOptions();
		oFormatOptions.navigateCondition = oNavigateCondition;
		oUnitConditionsType.setFormatOptions(oFormatOptions);

		const aConditions = oUnitConditionsType.parseValue("USD");
		assert.equal(aConditions.length, 2, "two conditions");
		_checkCondition(assert, aConditions[0], OperatorName.EQ, [[1.23, "USD"]], ConditionValidated.NotValidated);
		assert.deepEqual(aConditions[0].inParameters, oNavigateCondition.inParameters, "Condition 0: inParameters");
		assert.deepEqual(aConditions[0].outParameters, oNavigateCondition.outParameters, "Condition 0: outParameters");
		assert.deepEqual(aConditions[0].payload, oNavigateCondition.payload, "Condition 0: payload");
		_checkCondition(assert, aConditions[1], OperatorName.BT, [[1, "USD"], [2, "USD"]], ConditionValidated.NotValidated);
		assert.deepEqual(aConditions[1].inParameters, oNavigateCondition.inParameters, "Condition 1: inParameters");
		assert.deepEqual(aConditions[1].outParameters, oNavigateCondition.outParameters, "Condition 1: outParameters");
		assert.deepEqual(aConditions[1].payload, oNavigateCondition.payload, "Condition 1: payload");

	});

	QUnit.test("Parsing: maxConditions > 1", function(assert) {

		oUnitType._aCurrentValue = [1, "USD"]; // fake existing value
		oValueType._aCurrentValue = [1, "USD"]; // fake existing value
		oOriginalType._aCurrentValue = [1, "USD"]; // fake existing value
		let aConditions = oUnitConditionsType.oFormatOptions.getConditions();
		let aCompareConditions = [aConditions[0], aConditions[1], Condition.createCondition(OperatorName.EQ, [[9.99, "USD"]], undefined, undefined, ConditionValidated.NotValidated, undefined)];

		aConditions = oConditionsType.parseValue("9.99");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

		oUnitType._aCurrentValue = undefined; // fake initial value
		oValueType._aCurrentValue = undefined; // fake initial value
		oOriginalType._aCurrentValue = undefined; // fake initial value
		oUnitConditionsType.oFormatOptions.getConditions = function() {return [];};
		aCompareConditions = [Condition.createCondition(OperatorName.EQ, [[7.77, "EUR"]], undefined, undefined, ConditionValidated.NotValidated, undefined)];

		aConditions = oUnitConditionsType.parseValue("EUR");
		oConditionsType.oFormatOptions.getConditions = function() {return aConditions;};
		aConditions = oConditionsType.parseValue("7.77");
		assert.deepEqual(aConditions, aCompareConditions, "Result returned");

	});

	QUnit.module("Not nullable type", {
		beforeEach: function() {
			oValueType = new StringType({}, {nullable: false});
			oConditionsType = new ConditionsType({valueType: oValueType, operators: [OperatorName.EQ], maxConditions: 1});
		},
		afterEach: function() {
			oConditionsType.destroy();
			oConditionsType = undefined;
			oValueType.destroy();
			oValueType = undefined;
		}
	});

	QUnit.test("Validating: null", function(assert) {

		let oException;

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

		oConditionsType.setFormatOptions({valueType: oValueType, operators: [OperatorName.EQ], maxConditions: -1});
		oException = undefined;

		try {
			oConditionsType.validateValue([]);
		} catch (e) {
			oException = e;
		}

		assert.notOk(oException, "No exception fired if maxConditions!=1 and only EQ operators");

	});

});
