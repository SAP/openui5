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
	"sap/ui/mdc/enum/ConditionValidated"
], function (
		ValueHelpDelegate,
		Content,
		Condition,
		FilterOperatorUtil,
		Operator,
		ConditionValidated
		) {
	"use strict";

	var oContent;
	var bIsTypeahead = false;
	var bIsOpen = false;
	var bIsOpening = false;

	var oContainer = { //to fake Container
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
		_getControl: function () {
			return "Control"; // just to test forwarding
		}
	};

	var _teardown = function() {
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
		sinon.spy(oContent, "_handleConditionsUpdate");
		var aConditions = [Condition.createItemCondition("X", "Text")];
		oContent.setConditions(aConditions);
		assert.ok(oContent.invalidate.notCalled, "Content not invalidated");
		assert.ok(oContent._handleConditionsUpdate.calledOnce, "_handleConditionsUpdate called");

	});

	QUnit.test("filterValue update", function(assert) {

		sinon.spy(oContent, "invalidate");
		sinon.spy(oContent, "_handleFilterValueUpdate");
		oContent.setFilterValue("X");
		assert.ok(oContent.invalidate.notCalled, "Content not invalidated");
		assert.ok(oContent._handleFilterValueUpdate.calledOnce, "_handleFilterValueUpdate called");

	});

	QUnit.test("onShow", function(assert) {

		sinon.spy(oContent, "_handleConditionsUpdate");
		oContent.onShow();
		assert.ok(oContent._handleConditionsUpdate.calledOnce, "_handleConditionsUpdate called");
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
		var oOperator = new Operator({
			name: "MyTest",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		sinon.spy(oContent, "invalidate");
		oContent.setConfig({operators: ["GT", "LT", oOperator.name]});
		assert.ok(oContent._oOperator.isA("sap.ui.mdc.condition.Operator"), "Operator was created.");
		assert.ok(oContent._oOperator.name === "MyTest", "Operator was set via configuration");
		assert.ok(oContent.invalidate.notCalled, "Content not invalidated");
	});

	QUnit.test("_createCondition", function(assert) {

		var oOperator = new Operator({
			name: "MyTest",
			filterOperator: "EQ",
			tokenParse: "^=([^=].*)$",
			tokenFormat: "={0}",
			valueTypes: [Operator.ValueType.Self],
			validateInput: true
		});
		FilterOperatorUtil.addOperator(oOperator);

		oContent.setConfig({operators: ["GT", "LT", oOperator.name]});

		var oCondition = oContent._createCondition("1", "Text1", {myPayload: true});
		assert.ok(oCondition, "Condition created");
		if (oCondition) {
			assert.equal(oCondition && oCondition.operator, "MyTest", "Condition Operator");
			assert.equal(oCondition.values.length, 1, "Condition values length");
			assert.equal(oCondition.values[0], "1", "Condition values[0]");
			assert.deepEqual(oCondition.payload, {myPayload: true}, "Condition payload");
			assert.equal(oCondition.validated, ConditionValidated.Validated, "Condition is validated");
		}

		oContent.setConfig({operators: []}); // use all

		oCondition = oContent._createCondition("1", "Text1");
		assert.ok(oCondition, "Condition created");
		if (oCondition) {
			assert.equal(oCondition && oCondition.operator, "EQ", "Condition Operator");
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

		oContainer._getUIAreaForContent = function () {
			return "X"; // just test call
		};
		assert.equal(oContent.getUIArea(), "X", "UIArea from _getUIAreaForContent od Container returned");
		assert.ok(oContainer.getUIArea.notCalled, "getUIArea of Container not called");

	});

	QUnit.test("isTypeahead", function(assert) {

		assert.notOk(oContent.isTypeahead(), "not typeahead");
		bIsTypeahead = true;
		assert.ok(oContent.isTypeahead(), "is typeahead");

	});

	QUnit.test("isSearchSupported", function(assert) {

		var bSupported = oContent.isSearchSupported();
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

	QUnit.test("_getValueHelpDelegate", function(assert) {

		var oDelegate = oContent._getValueHelpDelegate();
		assert.equal(oDelegate, ValueHelpDelegate, "Delegate returned");

	});

	QUnit.test("_getValueHelpDelegatePayload", function(assert) {

		var oPayload = oContent._getValueHelpDelegatePayload();
		assert.deepEqual(oPayload, {x: "X"}, "Payload returned");

	});

	QUnit.test("_awaitValueHelpDelegate", function(assert) {

		var oPromise = oContent._awaitValueHelpDelegate();
		assert.ok(oPromise instanceof Promise, "Promise returned");

	});

	QUnit.test("_isValueHelpDelegateInitialized", function(assert) {

		var bDelegateInitialized = oContent._isValueHelpDelegateInitialized();
		assert.ok(bDelegateInitialized, "Delegate initialized");

	});

	QUnit.test("getCount", function(assert) {

		assert.equal(oContent.getCount(), 0, "getCount");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		var oCheckAttributes = {
			contentId: null,
			ariaHasPopup: "listbox",
			roleDescription: null
		};
		var oAttributes = oContent.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("_isSingleSelect", function(assert) {
		oContent.setConfig({maxConditions: -1});
		assert.equal(oContent._isSingleSelect(), false, "multi-select correctly determined from maxConditions");
		oContent.setConfig({maxConditions: 1});
		assert.equal(oContent._isSingleSelect(), true, "single-select correctly determined from maxConditions");
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

	QUnit.test("_getMaxConditions", function(assert) {
		oContent.setConfig({maxConditions: -1});
		assert.equal(oContent._getMaxConditions(), -1, "maxConditions taken from config");
		oContent.setConfig({maxConditions: 1});
		assert.equal(oContent._getMaxConditions(), 1, "maxConditions updated from config");
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

	QUnit.test("_getControl", function(assert) {

		var oControl = oContent._getControl();
		assert.equal(oControl, "Control", "Delegate returned");

	});

	QUnit.test("isQuickSelectSupported", function(assert) {

		var bSupported = oContent.isQuickSelectSupported();
		assert.notOk(bSupported, "not supported as default");

	});

});
