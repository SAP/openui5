// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/FilterOperatorUtil",
	"sap/ui/mdc/condition/Operator",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/OperatorValueType",
	"sap/ui/model/FilterOperator"
], function (
		ValueHelpDelegate,
		Content,
		Condition,
		FilterOperatorUtil,
		Operator,
		ConditionValidated,
		OperatorName,
		OperatorValueType,
		FilterOperator
		) {
	"use strict";

	let oContent;
	let bIsTypeahead = false;
	let bIsOpen = false;
	let bIsOpening = false;

	const oContainer = { //to fake Container
		getScrollDelegate: function() {
			return "X"; // just test return value
		},
		getUIArea: function() {
			return null;
		},
		isTypeahead: function() {
			return bIsTypeahead;
		},
		providesScrolling: function() {
			return bIsTypeahead;
		},
		isOpen: function() {
			return bIsOpen;
		},
		isOpening: function() {
			return bIsOpening;
		},
		getValueHelpDelegate: function () {
			return ValueHelpDelegate;
		},
		getValueHelpDelegatePayload: function () {
			return {x: "X"};
		},
		awaitValueHelpDelegate: function () {
			return Promise.resolve();
		},
		isValueHelpDelegateInitialized: function () {
			return true;
		},
		invalidate: function () {},
		getControl: function () {
			return "Control"; // just to test forwarding
		}
	};

	const _teardown = function() {
		oContent.destroy();
		oContent = null;
		bIsTypeahead = false;
		bIsOpen = false;
		bIsOpening = false;
		};

	QUnit.module("basic features", {
		beforeEach: function() {
			oContent = new Content("C1");
			sinon.stub(oContent, "getParent").returns(oContainer);
			oContent.oParent = oContainer; // fake
		},
		afterEach: _teardown
	});

	QUnit.test("condition update", function(assert) {

		sinon.spy(oContent, "invalidate");
		sinon.spy(oContent, "handleConditionsUpdate");
		const aConditions = [Condition.createItemCondition("X", "Text")];
		oContent.setConditions(aConditions);
		assert.ok(oContent.invalidate.notCalled, "Content not invalidated");
		assert.ok(oContent.handleConditionsUpdate.calledOnce, "handleConditionsUpdate called");

	});

	QUnit.test("filterValue update", function(assert) {

		sinon.spy(oContent, "invalidate");
		sinon.spy(oContent, "handleFilterValueUpdate");
		oContent.setFilterValue("X");
		assert.ok(oContent.invalidate.notCalled, "Content not invalidated");
		assert.ok(oContent.handleFilterValueUpdate.calledOnce, "handleFilterValueUpdate called");

	});

	QUnit.test("onShow", function(assert) {

		sinon.spy(oContent, "handleConditionsUpdate");
		oContent.onShow();
		assert.ok(oContent.handleConditionsUpdate.calledOnce, "handleConditionsUpdate called");
		assert.ok(oContent._bVisible, "_bVisible set");

	});

	QUnit.test("onHide", function(assert) {

		oContent._bVisible = true; // fake
		oContent.onHide();
		assert.notOk(oContent._bVisible, "_bVisible not set");

	});

	QUnit.test("getScrollDelegate", function(assert) {

		assert.equal(oContent.getScrollDelegate(), "X", "getScrollDelegate returns value from Container");

	});

	QUnit.test("EQ operator determination", function(assert) {
		const oOperator = new Operator({
			name: "MyTest",
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		sinon.spy(oContent, "invalidate");
		oContent.setConfig({operators: [OperatorName.GT, OperatorName.LT, oOperator.name]});
		assert.ok(oContent._oOperator.isA("sap.ui.mdc.condition.Operator"), "Operator was created.");
		assert.ok(oContent._oOperator.name === "MyTest", "Operator was set via configuration");
		assert.ok(oContent.invalidate.notCalled, "Content not invalidated");
	});

	QUnit.test("createCondition", function(assert) {

		const oOperator = new Operator({
			name: "MyTest",
			filterOperator: FilterOperator.EQ,
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [OperatorValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oContent.setConfig({operators: [OperatorName.GT, OperatorName.LT, oOperator.name]});

		let oCondition = oContent.createCondition("1", "Text1", {myPayload: true});
		assert.ok(oCondition, "Condition created");
		if (oCondition) {
			assert.equal(oCondition && oCondition.operator, "MyTest", "Condition Operator");
			assert.equal(oCondition.values.length, 1, "Condition values length");
			assert.equal(oCondition.values[0], "1", "Condition values[0]");
			assert.deepEqual(oCondition.payload, {myPayload: true}, "Condition payload");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");
		}

		oContent.setConfig({operators: []}); // use all

		oCondition = oContent.createCondition("1", "Text1");
		assert.ok(oCondition, "Condition created");
		if (oCondition) {
			assert.equal(oCondition && oCondition.operator, OperatorName.EQ, "Condition Operator");
			assert.equal(oCondition.values.length, 2, "Condition values length");
			assert.equal(oCondition.values[0], "1", "Condition values[0]");
			assert.equal(oCondition.values[1], "Text1", "Condition values[1]");
			assert.notOk(oCondition.hasOwnProperty("payload"), "Condition has no payload");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");
		}

	});

	QUnit.test("getUIArea", function(assert) {

		sinon.spy(oContainer, "getUIArea");
		assert.notOk(oContent.getUIArea(), "no UIArea returned");
		assert.ok(oContainer.getUIArea.calledOnce, "getUIArea of Container called");
		oContainer.getUIArea.reset();

		oContainer.getUIAreaForContent = function () {
			return "X"; // just test call
		};
		assert.equal(oContent.getUIArea(), "X", "UIArea from getUIAreaForContent od Container returned");
		assert.ok(oContainer.getUIArea.notCalled, "getUIArea of Container not called");

	});

	QUnit.test("isTypeahead", function(assert) {

		assert.notOk(oContent.isTypeahead(), "not typeahead");
		bIsTypeahead = true;
		assert.ok(oContent.isTypeahead(), "is typeahead");

	});

	QUnit.test("isSearchSupported", function(assert) {

		const bSupported = oContent.isSearchSupported();
		assert.notOk(bSupported, "not supported as default");

	});

	QUnit.test("provideScrolling", function(assert) {

		assert.ok(oContent.provideScrolling(), "scrolling needed if not provided by Container");
		bIsTypeahead = true;
		assert.notOk(oContent.provideScrolling(), "scrolling not needed if provided by Container");

	});

	QUnit.test("isContainerOpen", function(assert) {

		assert.notOk(oContent.isContainerOpen(), "not open");
		bIsOpen = true;
		assert.ok(oContent.isContainerOpen(), "open");

	});

	QUnit.test("isContainerOpening", function(assert) {

		assert.notOk(oContent.isContainerOpening(), "not opening");
		bIsOpening = true;
		assert.ok(oContent.isContainerOpening(), "opening");

	});

	QUnit.test("getValueHelpDelegate", function(assert) {

		const oDelegate = oContent.getValueHelpDelegate();
		assert.equal(oDelegate, ValueHelpDelegate, "Delegate returned");

	});

	QUnit.test("_awaitValueHelpDelegate", function(assert) {

		const oPromise = oContent.awaitValueHelpDelegate();
		assert.ok(oPromise instanceof Promise, "Promise returned");

	});

	QUnit.test("isValueHelpDelegateInitialized", function(assert) {

		const bDelegateInitialized = oContent.isValueHelpDelegateInitialized();
		assert.ok(bDelegateInitialized, "Delegate initialized");

	});

	QUnit.test("getCount", function(assert) {

		assert.equal(oContent.getCount(), 0, "getCount");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		const oCheckAttributes = {
			contentId: null,
			ariaHasPopup: "listbox",
			roleDescription: null
		};
		const oAttributes = oContent.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("isSingleSelect", function(assert) {
		oContent.setConfig({maxConditions: -1});
		assert.equal(oContent.isSingleSelect(), false, "multi-select correctly determined from maxConditions");
		oContent.setConfig({maxConditions: 1});
		assert.equal(oContent.isSingleSelect(), true, "single-select correctly determined from maxConditions");
	});

	QUnit.test("shouldOpenOnClick", function(assert) {

		assert.notOk(oContent.shouldOpenOnClick(), "shouldOpenOnClick");

	});

	QUnit.test("shouldOpenOnNavigate", function(assert) {

		oContent.setConfig({maxConditions: -1});
		assert.ok(oContent.shouldOpenOnNavigate(), "correctly determined from maxConditions");
		oContent.setConfig({maxConditions: 1});
		assert.notOk(oContent.shouldOpenOnNavigate(), "correctly determined from maxConditions");
	});

	QUnit.test("isNavigationEnabled", function(assert) {

		assert.notOk(oContent.isNavigationEnabled(1), "isNavigationEnabled");

	});

	QUnit.test("isFocusInHelp", function(assert) {

		assert.ok(oContent.isFocusInHelp(), "correctly determined from typeahead");
		bIsTypeahead = true;
		assert.notOk(oContent.isFocusInHelp(), "correctly determined from typeahead");

	});

	QUnit.test("isMultiSelect", function(assert) {

		oContent.setConfig({maxConditions: -1});
		assert.ok(oContent.isMultiSelect(), "correctly determined from maxConditions");
		oContent.setConfig({maxConditions: 1});
		assert.notOk(oContent.isMultiSelect(), "correctly determined from maxConditions");
	});

	QUnit.test("getMaxConditions", function(assert) {
		oContent.setConfig({maxConditions: -1});
		assert.equal(oContent.getMaxConditions(), -1, "maxConditions taken from config");
		oContent.setConfig({maxConditions: 1});
		assert.equal(oContent.getMaxConditions(), 1, "maxConditions updated from config");
	});

	QUnit.test("getRequiresTokenizer", function(assert) {

		assert.ok(oContent.getRequiresTokenizer(), "getRequiresTokenizer");

	});

	QUnit.test("getFormattedTitle", function(assert) {

		oContent.setTitle("Title");
		assert.equal(oContent.getFormattedTitle(1), "Title", "formatted title");

		oContent.setTitle("Title ({0})");
		assert.equal(oContent.getFormattedTitle(1), "Title (1)", "formatted title");

	});

	QUnit.test("getFormattedShortTitle", function(assert) {

		oContent.setShortTitle("ShortTitle");
		assert.equal(oContent.getFormattedShortTitle(), "ShortTitle", "formatted shortTitle");

	});

	QUnit.test("getFormattedTokenizerTitle", function(assert) {

		assert.equal(oContent.getFormattedTokenizerTitle(), "", "formatted TokenizerTitle is empty");

		oContent.setTokenizerTitle("TokenizerTitle {0}");
		assert.equal(oContent.getFormattedTokenizerTitle(), "TokenizerTitle ", "formatted TokenizerTitle");
		assert.equal(oContent.getFormattedTokenizerTitle(1), "TokenizerTitle 1", "formatted TokenizerTitle");
		assert.equal(oContent.getFormattedTokenizerTitle(0), "TokenizerTitle ", "formatted TokenizerTitle");

	});

	QUnit.test("getControl", function(assert) {

		const oControl = oContent.getControl();
		assert.equal(oControl, "Control", "Delegate returned");

	});

	QUnit.test("isQuickSelectSupported", function(assert) {

		const bSupported = oContent.isQuickSelectSupported();
		assert.notOk(bSupported, "not supported as default");

	});

});
