/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/BaseType",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpPropagationReason",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	// as basic ListBinding class has not al functions defined, only as JSDoc
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/Integer",
	"sap/ui/model/type/String",
	"sap/ui/mdc/valuehelp/RequestShowContainerDefault",
	"sap/ui/mdc/util/loadModules"
], (
	ValueHelpDelegate,
	FieldDisplay,
	Condition,
	BaseType,
	ConditionValidated,
	OperatorName,
	ValueHelpPropagationReason,
	Filter,
	FilterOperator,
	FilterType,
	ListBinding,
	JSONModel,
	IntegerType,
	StringType,
	RequestShowContainerDefault,
	loadModules
) => {
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

	let oConditions;
	const oFakeFilterBar = {
		getConditions: () => oConditions
	};

	const oModel = new JSONModel({
		items: [
			{key: 1, text: "Item 1"},
			{key: 2, text: "Item 2"}
		]
	});
	let oListBinding;
	let oBindingInfo;
	let bSingleSelect = false;

	const oFakeContent = {
		isA: (sName) => true,
		isPropertyInitial: () => true,
		getKeyPath: () => sKeyPath,
		getDescriptionPath: () => sDescriptionPath,
		getListBinding: () => ({
			getCurrentContexts: () => aRelevantContexts
		}),
		getListBindingInfo: () => oBindingInfo,
		getConditions: () => aConditions,
		getItemFromContext: (oBindingContext, oOptions) => {
			return {key: oBindingContext.getProperty("key"), description: oBindingContext.getProperty("text")};
		},
		createCondition: (vKey, sDescription, oPayload) => {
			return Condition.createItemCondition(vKey, sDescription, undefined, undefined, oPayload);
		},
		getFilterValue: () => "",
		getActiveFilterBar: () => oFakeFilterBar,
		getSearch: () => "",
		getCaseSensitive: () => true,
		shouldOpenOnClick: () => false,
		isSingleSelect: () => bSingleSelect
	};

	const FakeContext = function (oData) {
		const {message, ...data} = oData;
		this._data = data;
		this.message = message;
		this.getProperty = (sKey) => this._data[sKey];
	};

	QUnit.module("Default implementations", {
		beforeEach() {
			oListBinding = new ListBinding(oModel, "/items");
			oBindingInfo = {
				path: "/items",
				model: oModel,
				parameters: {test: "X"},
				filters: undefined
			};
		},
		afterEach() {
			oListBinding.destroy();
			oListBinding = undefined;
			oBindingInfo = undefined;
			oConfig.value = "";
			aConditions = [];
			aRelevantContexts = [];
			oConditions = undefined;
			bSingleSelect = false;
		}
	});

	QUnit.test("retrieveContent", (assert) => {
		return ValueHelpDelegate.retrieveContent(oFakeValueHelp, oFakeContent, "MyContent").then(() => {
			assert.ok(true, "Resolved Promise returned");
		});
	});

	QUnit.test("isSearchSupported", (assert) => {
		assert.notOk(ValueHelpDelegate.isSearchSupported(oFakeValueHelp, oFakeContent, oListBinding), "Search not supported");
	});

	QUnit.test("requestShowContainer", async (assert) => {
		const oFakeContainer = {isA: (sName) => false, getContent: () => []};
		const sFakeReason = "Tap";

		sinon.spy(ValueHelpDelegate, "requestShowContainer");
		sinon.spy(RequestShowContainerDefault, sFakeReason);

		await ValueHelpDelegate.requestShowContainer(oFakeValueHelp,  oFakeContainer, sFakeReason);

		assert.ok(RequestShowContainerDefault[sFakeReason].calledWith(oFakeValueHelp,oFakeContainer), "executes default method");
		RequestShowContainerDefault[sFakeReason].restore();
		ValueHelpDelegate.requestShowContainer.restore();
	});


	QUnit.test("updateBindingInfo", (assert) => {
		ValueHelpDelegate.updateBindingInfo(oFakeValueHelp, oFakeContent, oBindingInfo);
		assert.deepEqual(oBindingInfo.parameters, {}, "oBindingInfo.parameters");
		assert.equal(oBindingInfo.filters?.length, 0, "oBindingInfo initially no filter set");

		oConditions = {
			test: [Condition.createItemCondition("A", "Text A")]
		};

		ValueHelpDelegate.updateBindingInfo(oFakeValueHelp, oFakeContent, oBindingInfo);
		assert.deepEqual(oBindingInfo.parameters, {}, "oBindingInfo.parameters");
		assert.equal(oBindingInfo.filters?.length, 1, "oBindingInfo filter set");
		assert.notOk(oBindingInfo.filters?.[0]?.getFilters(), "oBindingInfo filter no additional Filters");
		assert.equal(oBindingInfo.filters?.[0]?.getPath(), "test", "oBindingInfo filter path");
		assert.equal(oBindingInfo.filters?.[0]?.getOperator(), FilterOperator.EQ, "oBindingInfo filter operator");
		assert.equal(oBindingInfo.filters?.[0]?.getValue1(), "A", "oBindingInfo filter value1");
		assert.equal(oBindingInfo.filters?.[0]?.getValue2(), undefined, "oBindingInfo filter value2");
	});

	QUnit.test("updateBinding", (assert) => {
		const oFilter = new Filter({path: "test", operator: FilterOperator.EQ, value1: "X"});
		oBindingInfo.filters = [oFilter];
		oListBinding.suspend();
		sinon.spy(oListBinding, "resume");

		ValueHelpDelegate.updateBinding(oFakeValueHelp, oListBinding, oBindingInfo, oFakeContent);
		const aFilters = oListBinding.getFilters(FilterType.Application);

		assert.ok(oListBinding.resume.calledOnce, "ListBinding resumed");
		assert.equal(aFilters?.length, 1, "One Filter set to Binding");
		assert.equal(aFilters?.[0], oFilter, "Cotrrect Filter set to Binding");
	});

	QUnit.test("executeFilter", (assert) => {
		return ValueHelpDelegate.executeFilter(oFakeValueHelp, oListBinding, 10).then((oResult) => {
			assert.equal(oResult, oListBinding, "ListBinding just returned");
		});
	});

	QUnit.test("checkListBindingPending", async (assert) => {
		let bPending = ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, null, 10);
		assert.notOk(bPending, "No ListBinding");

		bPending = await ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, oListBinding, 10);
		assert.notOk(bPending, "not all requested Contexts read");

		bPending = await ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, oListBinding, 2);
		assert.notOk(bPending, "All requested Contexts read");

		oListBinding.suspend();
		bPending = ValueHelpDelegate.checkListBindingPending(oFakeValueHelp, oListBinding, 10);
		assert.notOk(bPending, "suspended ListBinding");
	});

	QUnit.test("onConditionPropagation", (assert) => {
		assert.notOk(ValueHelpDelegate.onConditionPropagation(oFakeValueHelp, ValueHelpPropagationReason.ControlChange, {}), "nothing returned"); // how to check empty function?
	});

	QUnit.test("findConditionsForContext", (assert) => {
		const aConditions = [
			Condition.createItemCondition(1, "Item 1"),
			Condition.createItemCondition(2, "Item 2")
		];
		const oContext = new FakeContext({key: 1, text: "Item 1", message: "Message"});
		const aFoundConditions = ValueHelpDelegate.findConditionsForContext(oFakeValueHelp, oFakeContent, oContext, aConditions);

		assert.equal(aFoundConditions?.length, 1, "Found conditions");
		assert.deepEqual(aFoundConditions, [aConditions[0]], "Foend condition");
	});

	QUnit.test("modifySelectionBehaviour", (assert) => {
		assert.deepEqual(ValueHelpDelegate.modifySelectionBehaviour(oFakeValueHelp, oFakeContent, {test: "X"}), {test: "X"}, "Change just returned");
	});

	QUnit.test("createConditionPayload", (assert) => {
		assert.notOk(ValueHelpDelegate.createConditionPayload(oFakeValueHelp, oFakeContent, [1, "Item 1"], {}), "no Paylod");
	});

	QUnit.test("getTypesForConditions", (assert) => {
		const oIntegerType = new IntegerType();
		const oStringType = new StringType();
		const oConditions = {
			key: [Condition.createItemCondition(1, "Item 1")]
		};

		oBindingInfo.template = {
			mAggregations: {
				cells: [
					{mBindingInfos: [{parts: [{path: "key", type: oIntegerType}]}]},
					{mBindingInfos: [{parts: [{path: "text", type: oStringType}]}]},
					{mBindingInfos: [{parts: [{path: "info", type: undefined}]}]}
				]
			}
		};

		const oConditionTypes = ValueHelpDelegate.getTypesForConditions(oFakeValueHelp, oFakeContent, oConditions);
		const oCompare = {
			key: {type: oIntegerType, baseType: BaseType.Numeric},
			text: {type: oStringType, baseType: BaseType.String},
			info: {type: null, baseType: BaseType.String}
		};
		assert.deepEqual(oConditionTypes, oCompare, "CondtitionTypes returned");

		oIntegerType.destroy();
		oStringType.destroy();
	});

	QUnit.test("getFilterConditions", (assert) => {
		assert.deepEqual(ValueHelpDelegate.getFilterConditions(oFakeValueHelp, oFakeContent, {control: {id: "FakeControl"}}), {}, "Empty object returned");
	});

	QUnit.test("isFilteringCaseSensitive", (assert) => {
		assert.ok(ValueHelpDelegate.isFilteringCaseSensitive(oFakeValueHelp, oFakeContent), "Case Sensitive");

		sinon.stub(oFakeContent, "getCaseSensitive").returns(false);
		assert.notOk(ValueHelpDelegate.isFilteringCaseSensitive(oFakeValueHelp, oFakeContent), "Not case Sensitive");
		oFakeContent.getCaseSensitive.restore();
	});

	QUnit.test("compareConditions", (assert) => {

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

	QUnit.module("getFirstMatch", {beforeEach() {
		sKeyPath = "key";
		sDescriptionPath = "text";
		oConfig.value = "a";
		oConfig.checkDescription = true;
		sDisplay = FieldDisplay.Value;
	},
	afterEach() {
		oConfig.value = "";
		aConditions = [];
		aRelevantContexts = [];
		oConditions = undefined;
		bSingleSelect = false;
	}});

	QUnit.test("FieldDisplay.Value", (assert) => {
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

		bSingleSelect = true; // selected condition must not be checked
		aRelevantContexts = [
			new FakeContext({key: "A", text: "", message: "ci match"}), // key match ci
			new FakeContext({key: "a", text: "", message: "match"}), // key match
			new FakeContext({key: "AA", text: "", message: "ci startsWith"}), // startsWith key ci
			new FakeContext({key: "aa", text: "", message: "startsWith"}) // startsWith key
		];

		_testIndex(assert, [0, 0, 0, 0], undefined);

	});


	QUnit.test("FieldDisplay.ValueDescription", (assert) => {
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

	QUnit.test("FieldDisplay.Description", (assert) => {
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

	QUnit.test("FieldDisplay.DescriptionValue", (assert) => {
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
});
