// Use this test page to test the API and features of the Popver container.
// The interaction with the Field is tested on the field test page.

/* global QUnit */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName"
], function (
		ValueHelpDelegate,
		FieldDisplay,
		Condition,
		ConditionValidated,
		OperatorName
	) {
	"use strict";

	let aRelevantContexts = [];
	let sKeyPath, sDescriptionPath, sDisplay;

	const oConfig = {
		value: "",
		checkDescription: true,
		caseSensitive: false
	};
	let aConditions = [];

	const oFakeValueHelp = {
		getDisplay: () => sDisplay
	};

	const oFakeContent = {
		isA: () => true,
		getKeyPath: () => sKeyPath,
		getDescriptionPath: () => sDescriptionPath,
		getListBinding: () => ({
			getCurrentContexts: () => aRelevantContexts
		}),
		getConditions: () => aConditions,
		getItemFromContext: (oBindingContext, oOptions) => {
			return {key: oBindingContext.getProperty("key"), description: oBindingContext.getProperty("text")};
		},
		createCondition: (vKey, sDescription, oPayload) => {
			return Condition.createItemCondition(vKey, sDescription, undefined, undefined, oPayload);
		}
	};

	const FakeContext = function (oData) {
		const {message, ...data} = oData;
		this._data = data;
		this.message = message;
		this.getProperty = (sKey) => this._data[sKey];
	};

	const _testOrder = (assert) => {
		while (aRelevantContexts.length) {
			const oExpectedContext = aRelevantContexts[0];
			assert.equal(ValueHelpDelegate.getFirstMatch(oFakeValueHelp, oFakeContent, oConfig), oExpectedContext, oExpectedContext.message);
			aRelevantContexts.shift();
		}
	};

	const _testIndex = (assert, aIndex, oOverrides) => {
		for (const iIndex of aIndex) {
			const oExpectedContext = aRelevantContexts[iIndex];
			assert.equal(ValueHelpDelegate.getFirstMatch(oFakeValueHelp, oFakeContent, oOverrides ? {...oConfig, ...oOverrides} : oConfig), oExpectedContext, oExpectedContext.message);
			aRelevantContexts.splice(iIndex, 1);
		}
	};

	QUnit.module("getFirstMatch", {beforeEach: function () {
		sKeyPath = "key";
		sDescriptionPath = "text";
		oConfig.value = "a";
		oConfig.checkDescription = true;
		sDisplay = FieldDisplay.Value;
	},
	afterEach: function () {
		oConfig.value = "";
		aConditions = [];
	}});

	QUnit.test("FieldDisplay.Value", function(assert) {
		aRelevantContexts = [
			new FakeContext({key: "A", text: "", message: "ci match"}), // key match ci
			new FakeContext({key: "a", text: "", message: "match"}), // key match
			new FakeContext({key: "AA", text: "", message: "ci startsWith"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith"}) // startsWith key
		];

		_testOrder(assert);

		aRelevantContexts = [
			new FakeContext({key: "A", text: "", message: "ci match"}), // key match ci
			new FakeContext({key: "a", text: "", message: "match"}), // key match
			new FakeContext({key: "AA", text: "", message: "ci startsWith"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith"}) // startsWith key
		];

		_testIndex(assert, [1, 2], {caseSensitive: true});

		aRelevantContexts = [
			new FakeContext({key: "A", text: "", message: "ci match"}), // key match ci
			new FakeContext({key: "a", text: "", message: "match"}), // key match
			new FakeContext({key: "AA", text: "", message: "ci startsWith"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith"}) // startsWith key
		];
		aConditions.push(oFakeContent.createCondition("A", "", undefined));

		_testIndex(assert, [1, 1, 1], undefined); // selected item must be ignored

	});


	QUnit.test("FieldDisplay.ValueDescription", function(assert) {
		sDisplay = FieldDisplay.ValueDescription;

		aRelevantContexts = [
			new FakeContext({key: "A", text: "", message: "key match ci"}), // key match ci
			new FakeContext({key: "a", text: "", message: "key match"}), // key match
			new FakeContext({key: "AA", text: "", message: "startsWith key ci"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith key"}), // startsWith key

			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}) // startsWith description
		];

		_testOrder(assert);

		aRelevantContexts = [
			new FakeContext({key: "A", text: "", message: "key match ci"}), // key match ci
			new FakeContext({key: "a", text: "", message: "key match"}), // key match
			new FakeContext({key: "AA", text: "", message: "startsWith key ci"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith key"}), // startsWith key

			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}) // startsWith description
		];

		_testIndex(assert, [1, 2, 3, 4], {caseSensitive: true});

		aRelevantContexts = [
			new FakeContext({key: "A", text: "", message: "key match ci"}), // key match ci
			new FakeContext({key: "a", text: "", message: "key match"}), // key match
			new FakeContext({key: "AA", text: "", message: "startsWith key ci"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith key"}), // startsWith key

			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}) // startsWith description
		];
		aConditions.push(oFakeContent.createCondition("A", "", undefined));
		aConditions.push(oFakeContent.createCondition("B", "A", undefined));

		_testIndex(assert, [1, 1, 1, 2, 2, 2], undefined); // selected item must be ignored

	});

	QUnit.test("FieldDisplay.Description", function(assert) {
		sDisplay = FieldDisplay.Description;

		aRelevantContexts = [
			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}) // startsWith description
		];

		_testOrder(assert);

		aRelevantContexts = [
			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}) // startsWith description
		];

		_testIndex(assert, [1, 2], {caseSensitive: true});

		aRelevantContexts = [
			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}) // startsWith description
		];
		aConditions.push(oFakeContent.createCondition("B", "A", undefined));

		_testIndex(assert, [1, 1, 1], undefined); // selected item must be ignored

	});

	QUnit.test("FieldDisplay.DescriptionValue", function(assert) {
		sDisplay = FieldDisplay.DescriptionValue;

		aRelevantContexts = [
			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}), // startsWith description

			new FakeContext({key: "A", text: "", message: "key match ci"}), // key match ci
			new FakeContext({key: "a", text: "", message: "key match"}), // key match
			new FakeContext({key: "AA", text: "", message: "startsWith key ci"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith key"}) // startsWith key
		];

		_testOrder(assert);


		aRelevantContexts = [
			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}), // startsWith description

			new FakeContext({key: "A", text: "", message: "key match ci"}), // key match ci
			new FakeContext({key: "a", text: "", message: "key match"}), // key match
			new FakeContext({key: "AA", text: "", message: "startsWith key ci"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith key"}) // startsWith key
		];

		_testIndex(assert, [1, 2, 3, 4], {caseSensitive: true});

		aRelevantContexts = [
			new FakeContext({key: "B", text: "A", message: "description match ci"}), // description match ci
			new FakeContext({key: "b", text: "a", message: "description match"}), // description match
			new FakeContext({key: "BB", text: "AA", message: "startsWith description ci"}), // startsWith description ci
			new FakeContext({key: "bb", text: "aa", message: "startsWith description"}), // startsWith description

			new FakeContext({key: "A", text: "", message: "key match ci"}), // key match ci
			new FakeContext({key: "a", text: "", message: "key match"}), // key match
			new FakeContext({key: "AA", text: "", message: "startsWith key ci"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith key"}) // startsWith key
		];
		aConditions.push(oFakeContent.createCondition("A", "", undefined));
		aConditions.push(oFakeContent.createCondition("B", "A", undefined));

		_testIndex(assert, [1, 1, 1, 2, 2, 2], undefined); // selected item must be ignored

	});

	QUnit.test("compareConditions", function(assert) {

		let oConditionA, oConditionB;

		oConditionA = Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.Validated);
		oConditionB = Condition.createCondition(OperatorName.Contains, [1], undefined, undefined, ConditionValidated.Validated);
		assert.notOk(ValueHelpDelegate.compareConditions(oFakeValueHelp, oConditionA, oConditionB), "Failure with mismatching operators on validated conditions");

		oConditionA = Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated);
		oConditionB = Condition.createCondition(OperatorName.Contains, [1], undefined, undefined, ConditionValidated.NotValidated);
		assert.notOk(ValueHelpDelegate.compareConditions(oFakeValueHelp, oConditionA, oConditionB), "Failure with mismatching operators on non-validated conditions");

		oConditionA = Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.Validated);
		oConditionB = Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.Validated, {payload: true});
		assert.ok(ValueHelpDelegate.compareConditions(oFakeValueHelp, oConditionA, oConditionB), "Success with matching operators, but mismatching payloads on validated conditions");

		oConditionA = Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated);
		oConditionB = Condition.createCondition(OperatorName.EQ, [1], undefined, undefined, ConditionValidated.NotValidated, {payload: true});
		assert.notOk(ValueHelpDelegate.compareConditions(oFakeValueHelp, oConditionA, oConditionB), "Failure with matching operators, but mismatching payloads on non-validated conditions");
	});

});
