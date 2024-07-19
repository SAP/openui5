// Use this test page to test the API and features of the ValueHelp container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/Container",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/m/library"
], function (
		ValueHelpDelegate,
		Container,
		Content,
		Condition,
		ValueHelpSelectionType,
		Icon,
		JSONModel,
		mLibrary
	) {
	"use strict";

	let oContainer;

	const _fPressHandler = function(oEvent) {}; // just dummy handler to make Icon focusable
	let oField;
	const oValueHelp = { //to fake ValueHelp
		getControl: function() {
			return oField;
		},
		_handleClosed: function () {

		},
		_handleOpened: function () {

		},
		getTypeahead: function () {
			return oContainer;
		},
		getDialog: function () {
			return null;
		},
		getControlDelegate: function () {
			return ValueHelpDelegate;
		},
		getPayload: function () {
			return {x: "X"};
		},
		awaitControlDelegate: function () {
			return Promise.resolve();
		},
		bDelegateInitialized: true
	};
	let oValueHelpConfig;
	let oModel; // to fake ManagedObjectModel of ValueHelp

	/* use dummy control to simulate Field */


	const _teardown = function() {
		if (oField) {
			oField.destroy();
			oField = undefined;
		}
		oContainer.destroy();
		oContainer = undefined;
		oValueHelpConfig = undefined;
		if (oModel) {
			oModel.destroy();
			oModel = undefined;
		}
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oContainer = new Container("C1", {
			});
		},
		afterEach: _teardown
	});

	QUnit.test("default values", async function(assert) {

		assert.equal(oContainer.getMaxConditions(), undefined, "getMaxConditions");
		assert.notOk(oContainer.isMultiSelect(), "isMultiSelect");
		assert.notOk(oContainer.isSingleSelect(), "isSingleSelect");
		assert.notOk(oContainer.getUseAsValueHelp(), "getUseAsValueHelp");
		let bShouldOpen = await oContainer.shouldOpenOnClick();
		assert.notOk(bShouldOpen, "shouldOpenOnClick");
		bShouldOpen = await oContainer.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "shouldOpenOnFocus");
		assert.notOk(oContainer.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.notOk(oContainer.isNavigationEnabled(1), "isNavigationEnabled");
		assert.ok(oContainer.isFocusInHelp(), "isFocusInHelp");
		assert.notOk(oContainer.isValidationSupported(), "isValidationSupported");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		const oCheckAttributes = {
			contentId: null,
			ariaHasPopup: "listbox",
			role: "combobox",
			roleDescription: null,
			valueHelpEnabled: false,
			autocomplete: "none"
		};
		const oAttributes = oContainer.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("getScrollDelegate", function(assert) {

		oField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		oField.getScrollDelegate = function() {
			return "X"; // just fake
		};
		oContainer.setAggregation("_container", oField, true);

		assert.equal(oContainer.getScrollDelegate(), "X", "ScrollDelegate of Content returned");

	});

	QUnit.test("onConnectionChange", function(assert) {

		const oContent = new Content("Content1");
		sinon.spy(oContent, "onConnectionChange");
		sinon.spy(oContainer, "unbindContentFromContainer");
		oContainer.addContent(oContent);
		oContainer.onConnectionChange();
		assert.ok(oContainer.unbindContentFromContainer.calledWith(oContent), "unbindContentFromContainer called for Content");
		assert.ok(oContent.onConnectionChange.calledOnce, "onConnectionChange called on Content");

	});

	QUnit.module("assigned to ValueHelp", {
		beforeEach: function() {
			oValueHelpConfig = {maxConditions: 1};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				filterValue: "X",
				conditions: [Condition.createItemCondition("X", "Text")]
			});

			oContainer = new Container("C1", {
			}).setModel(oModel, "$valueHelp");
			sinon.stub(oContainer, "getParent").returns(oValueHelp);
			oField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oField.placeAt("content");
		},
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.equal(oContainer.getMaxConditions(), 1, "getMaxConditions");
		assert.notOk(oContainer.isMultiSelect(), "isMultiSelect"); // as needs to be defined by Popover or Dialog
		assert.ok(oContainer.isSingleSelect(), "isSingleSelect");

	});

	QUnit.test("open", function(assert) {

		sinon.stub(oContainer, "openContainer").callsFake(function(oContainer, bTypeahead) {
			this.handleOpened();
		});
		sinon.stub(oContainer, "getContainerControl").returns(oField);

		let iOpened = 0;
		oContainer.attachEvent("opened", function(oEvent) {
			iOpened++;
		});

		const oPromise = oContainer.open(Promise.resolve(), true, true);
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const oPromise2 = oContainer.open(Promise.resolve()); // to test double call
			assert.ok(oPromise2 instanceof Promise, "open returns promise");

			const fnDone = assert.async();
			oPromise.then(function() {
				assert.ok(oContainer.openContainer.calledWith(oField, true), "openContainer called");
				assert.equal(iOpened, 1, "Opened event fired once");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("close", function(assert) {

		sinon.stub(oContainer, "closeContainer").callsFake(function(oContainer) {
			this.handleClosed();
		});

		let iClosed = 0;
		oContainer.attachEvent("closed", function(oEvent) {
			iClosed++;
		});

		oContainer.close();
		assert.notOk(oContainer.closeContainer.called, "closeContainer not called if not open");

		sinon.stub(oContainer, "openContainer").callsFake(function(oContainer) {
			this.handleOpened();
		});
		sinon.stub(oContainer, "getContainerControl").returns(oField);

		const oPromise = oContainer.open(Promise.resolve());
		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				oContainer.close();
				assert.ok(oContainer.closeContainer.called, "closeContainer called if not open");
				assert.equal(iClosed, 1, "Closed event fired");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("close while opening", function(assert) {

		sinon.stub(oContainer, "closeContainer").callsFake(function(oContainer) {
			this.handleClosed();
		});

//		var iClosed = 0;
//		oContainer.attachEvent("closed", function(oEvent) {
//			iClosed++;
//		});
//		var iOpened = 0;
//		oContainer.attachEvent("opened", function(oEvent) {
//			iOpened++;
//		});

		sinon.stub(oContainer, "openContainer").callsFake(function(oContainer) {
			this.handleOpened();
		});
		sinon.stub(oContainer, "getContainerControl").returns(oField);
		sinon.spy(oContainer, "_cancelPromise"); // TODO: better way to test

		const oPromise = oContainer.open(Promise.resolve());
		if (oPromise) {
			oContainer.close();
			assert.ok(oContainer._cancelPromise.called, "Open promise cancelled");

//			var fnDone = assert.async();
//			oPromise.then(function() {
//				assert.ok(oContainer.closeContainer.called, "closeContainer called if not open");
//				assert.equal(iClosed, 1, "Closed event fired");
//				fnDone();
//			}).catch(function(oError) {
//				assert.notOk(true, "Promise Catch called");
//				fnDone();
//			});
		}

	});

	QUnit.test("isOpen / isOpening", function(assert) {

		assert.notOk(oContainer.isOpen(), "Container not open");
		assert.notOk(oContainer.isOpening(), "Container not opening");

		sinon.stub(oContainer, "openContainer").callsFake(function(oContainer) {
			this.handleOpened();
		});
		sinon.stub(oContainer, "getContainerControl").returns(oField);

		const oPromise = oContainer.open(Promise.resolve());
		assert.notOk(oContainer.isOpen(), "Container not open while opening");
		assert.ok(oContainer.isOpening(), "Container opening");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				assert.ok(oContainer.isOpen(), "Container open");
				assert.notOk(oContainer.isOpening(), "Container not opening");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}
	});

	QUnit.test("content", function(assert) {

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open

		assert.equal(oContent.getFilterValue(), "X", "filterValue from ValueHelp");
		assert.deepEqual(oContent.getConfig(), oValueHelpConfig, "_config from ValueHelp");
		assert.deepEqual(oContent.getConditions(), [Condition.createItemCondition("X", "Text")], "conditions from ValueHelp");

		// remove
		oContent.destroy();
		// assert.equal(oContent.getFilterValue(), "", "filterValue initialized"); -> no reset on unbind anymore
		// assert.deepEqual(oContent.getConfig(), {}, "_config initialized");
		// assert.deepEqual(oContent.getConditions(), [], "conditions initialized");

	});

	QUnit.test("confirm event", function(assert) {

		let iConfirm = 0;
		oContainer.attachEvent("confirm", function(oEvent) {
			iConfirm++;
		});

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open
		oContent.fireConfirm();
		assert.equal(iConfirm, 1, "Confirm event fired");

	});

	QUnit.test("cancel event", function(assert) {

		let iCancel = 0;
		oContainer.attachEvent("cancel", function(oEvent) {
			iCancel++;
		});

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open
		oContent.fireCancel();
		assert.equal(iCancel, 1, "Cancel event fired");

	});

	QUnit.test("requestSwitchToDialog event", function(assert) {

		let iRequestSwitchToDialog = 0;
		let oEventContainer;
		oContainer.attachEvent("requestSwitchToDialog", function(oEvent) {
			iRequestSwitchToDialog++;
			oEventContainer = oEvent.getParameter("container");
		});

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open
		oContent.fireRequestSwitchToDialog();
		assert.equal(iRequestSwitchToDialog, 1, "RequestSwitchToDialog event fired");
		assert.equal(oEventContainer, oContainer, "RequestSwitchToDialog event container");

	});

	QUnit.test("select event", function(assert) {

		let iSelect = 0;
		let aConditions;
		let sType;
		oContainer.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open
		oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Set});
		assert.equal(iSelect, 1, "select event fired");
		assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
		assert.equal(sType, ValueHelpSelectionType.Set, "select event type");

	});

	QUnit.test("navigated event", function(assert) {

		let iNavigated = 0;
		let oCondition;
		let bLeaveFocus;
		let sItemId;
		let bCaseSensitive;
		oContainer.attachEvent("navigated", function(oEvent) {
			iNavigated++;
			oCondition = oEvent.getParameter("condition");
			bLeaveFocus = oEvent.getParameter("leaveFocus");
			sItemId = oEvent.getParameter("itemId");
			bCaseSensitive = oEvent.getParameter("caseSensitive");
		});

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open
		oContent.fireNavigated({condition: Condition.createItemCondition("X", "Text"), leaveFocus: true, itemId:"X", caseSensitive: true});
		assert.equal(iNavigated, 1, "navigated event fired");
		assert.deepEqual(oCondition, Condition.createItemCondition("X", "Text"), "navigated event condition");
		assert.equal(bLeaveFocus, true, "navigated event leaveFocus");
		assert.equal(sItemId, "X", "navigated event itemId");
		assert.equal(bCaseSensitive, true, "navigated event caseSensitive");

	});

	QUnit.test("navigate", function(assert) {

		sinon.stub(oContainer, "getContainerControl").returns(oField);
		sinon.spy(oContainer, "navigateInContent");

		const oPromise = oContainer.navigate(1);
		assert.ok(oPromise instanceof Promise, "navigate returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				assert.ok(oContainer.navigateInContent.calledOnce, "navigateInContent called");
				assert.ok(oContainer.navigateInContent.calledWith(1), "navigateInContent called with 1");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("typeaheadSuggested event", function(assert) {

		let iTypeaheadSuggested = 0;
		let oCondition;
		let sFilterValue;
		let sItemId;
		let iItems;
		let bTypeaheadCaseSensitive;
		oContainer.attachEvent("typeaheadSuggested", function(oEvent) {
			iTypeaheadSuggested++;
			oCondition = oEvent.getParameter("condition");
			sFilterValue = oEvent.getParameter("filterValue");
			sItemId = oEvent.getParameter("itemId");
			iItems = oEvent.getParameter("items");
			bTypeaheadCaseSensitive = oEvent.getParameter("caseSensitive");
		});

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open
		oContent.fireTypeaheadSuggested({condition: Condition.createItemCondition("X", "Text"), filterValue: "T", itemId:"X", items: 3, caseSensitive: true});
		assert.equal(iTypeaheadSuggested, 1, "typeaheadSuggested event fired");
		assert.deepEqual(oCondition, Condition.createItemCondition("X", "Text"), "typeaheadSuggested event condition");
		assert.equal(sFilterValue, "T", "typeaheadSuggested event filterValue");
		assert.equal(sItemId, "X", "typeaheadSuggested event itemId");
		assert.equal(iItems, 3, "typeaheadSuggested event items");
		assert.equal(bTypeaheadCaseSensitive, true, "Typeahead caseSensitive");

	});

	QUnit.test("visualFocusSet event", function(assert) {

		let iVisualFocusSet = 0;
		oContainer.attachEvent("visualFocusSet", function(oEvent) {
			iVisualFocusSet++;
		});

		// add
		const oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer.openContainer(); // just fake opening as only bound if open
		oContent.fireVisualFocusSet();
		assert.equal(iVisualFocusSet, 1, "visualFocusSet event fired");

	});

	QUnit.test("getControl", function(assert) {

		const oControl = oContainer.getControl();
		assert.equal(oControl, oField, "Control returned from ValueHelp");

	});

	QUnit.test("isTypeahead", function(assert) {

		const bTypeahead = oContainer.isTypeahead();
		assert.ok(bTypeahead, "Is used as typeahead");
		assert.notOk(oContainer.isFocusInHelp(), "isFocusInHelp");

	});

	QUnit.test("isTypeaheadSupported", function(assert) {

		const bSupported = oContainer.isTypeaheadSupported();
		assert.notOk(bSupported, "not supported as default");

	});

	QUnit.test("isDialog", function(assert) {

		let bDialog = oContainer.isDialog();
		assert.notOk(bDialog, "Is not used as dialog");

		sinon.stub(oValueHelp, "getDialog").returns(oContainer);
		bDialog = oContainer.isDialog();
		assert.ok(bDialog, "Is used as dialog");
		oValueHelp.getDialog.restore();

		sinon.stub(oContainer, "getUseAsValueHelp").returns(true);
		bDialog = oContainer.isDialog();
		assert.ok(bDialog, "Is used as dialog");
		oContainer.getUseAsValueHelp.restore();

	});

	QUnit.test("hasDialog", function(assert) {

		let bDialog = oContainer.hasDialog();
		assert.notOk(bDialog, "container value help does not have a dialog");

		sinon.stub(oValueHelp, "getDialog").returns(oContainer);
		bDialog = oContainer.isDialog();
		assert.ok(bDialog, "has a dialog");
		oValueHelp.getDialog.restore();

	});

	QUnit.test("providesScrolling", function(assert) {

		const bScrolling = oContainer.providesScrolling();
		assert.notOk(bScrolling, "provides no scrolling");

	});

	QUnit.test("getValueHelpDelegate", function(assert) {

		const oDelegate = oContainer.getValueHelpDelegate();
		assert.equal(oDelegate, ValueHelpDelegate, "Delegate returned");

	});

	QUnit.test("getValueHelpDelegatePayload", function(assert) {

		const oPayload = oContainer.getValueHelpDelegatePayload();
		assert.deepEqual(oPayload, {x: "X"}, "Payload returned");

	});

	QUnit.test("awaitValueHelpDelegate", function(assert) {

		const oPromise = oContainer.awaitValueHelpDelegate();
		assert.ok(oPromise instanceof Promise, "Promise returned");

	});

	QUnit.test("isValueHelpDelegateInitialized", function(assert) {

		const bDelegateInitialized = oContainer.isValueHelpDelegateInitialized();
		assert.ok(bDelegateInitialized, "Delegate initialized");

	});

	QUnit.test("getContainerConfig", function(assert) {

		const oParentConfig = {
			showHeader: true
		};

		const oChildConfig = {
			showHeader: false
		};

		const oContainerConfig = {
			"sap.ui.mdc.qunit.valuehelp.ParentContainer": oParentConfig
		};

		const oContent = new Content("Content2");
		sinon.stub(oContent, "getContainerConfig").returns(oContainerConfig);

		const ParentContainer = Container.extend("sap.ui.mdc.qunit.valuehelp.ParentContainer");
		const ChildContainer = ParentContainer.extend("sap.ui.mdc.qunit.valuehelp.ChildContainer");

		const oParentContainer = new ParentContainer();
		const oChildContainer = new ChildContainer();

		assert.equal(oParentContainer.getContainerConfig(oContent), oParentConfig, "Configuration found");
		assert.equal(oChildContainer.getContainerConfig(oContent), oParentConfig, "Configuration for inherited type found");

		oContainerConfig["sap.ui.mdc.qunit.valuehelp.ChildContainer"] = oChildConfig;

		assert.equal(oChildContainer.getContainerConfig(oContent), oChildConfig, "Specific configuration found and prefered");

		oContent.getContainerConfig.restore();
		oContent.destroy();
		oParentContainer.destroy();
		oChildContainer.destroy();
	});

	QUnit.test("shouldOpenOnFocus", async function(assert) {

		sinon.stub(ValueHelpDelegate, "shouldOpenOnFocus").returns(Promise.resolve(true));
		let bShouldOpen = await oContainer.shouldOpenOnFocus();
		assert.ok(bShouldOpen, "value taken from delegate");

		ValueHelpDelegate.shouldOpenOnFocus.returns(Promise.resolve(false));
		bShouldOpen = await oContainer.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "value taken from delegate");

		ValueHelpDelegate.shouldOpenOnFocus.restore();

	});

	QUnit.test("shouldOpenOnClick", async function(assert) {

		sinon.stub(ValueHelpDelegate, "shouldOpenOnClick").returns(Promise.resolve(true));
		let bShouldOpen = await oContainer.shouldOpenOnClick();
		assert.ok(bShouldOpen, "value taken from delegate");

		ValueHelpDelegate.shouldOpenOnClick.returns(Promise.resolve(false));
		bShouldOpen = await oContainer.shouldOpenOnClick();
		assert.notOk(bShouldOpen, "value taken from delegate");

		ValueHelpDelegate.shouldOpenOnClick.restore();

	});

	// TODO: Test Operator determination on Content
	// TODO: Test condition creation on Content

});
