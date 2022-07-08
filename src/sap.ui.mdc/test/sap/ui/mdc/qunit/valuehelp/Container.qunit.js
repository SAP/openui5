// Use this test page to test the API and features of the ValueHelp container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/base/Container",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/m/library"
], function (
		ValueHelpDelegate,
		Container,
		Content,
		Condition,
		SelectType,
		Icon,
		JSONModel,
		mLibrary
	) {
	"use strict";

	var oContainer;

	var _fPressHandler = function(oEvent) {}; // just dummy handler to make Icon focusable
	var oField;
	var oValueHelp = { //to fake ValueHelp
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
	var oValueHelpConfig;
	var oModel; // to fake ManagedObjectModel of ValueHelp

	/* use dummy control to simulate Field */


	var _teardown = function() {
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

	QUnit.test("default values", function(assert) {

		assert.equal(oContainer.getMaxConditions(), undefined, "getMaxConditions");
		assert.notOk(oContainer.isMultiSelect(), "isMultiSelect");
		assert.notOk(oContainer._isSingleSelect(), "_isSingleSelect");
		assert.notOk(oContainer.getUseAsValueHelp(), "getUseAsValueHelp");
		assert.notOk(oContainer.shouldOpenOnClick(), "shouldOpenOnClick");
		assert.notOk(oContainer.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.ok(oContainer.isFocusInHelp(), "isFocusInHelp");
		assert.notOk(oContainer.isValidationSupported(), "isValidationSupported");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		var oCheckAttributes = {
			contentId: null,
			ariaHasPopup: "listbox",
			role: "combobox",
			roleDescription: null
		};
		var oAttributes = oContainer.getAriaAttributes();
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
		assert.ok(oContainer._isSingleSelect(), "_isSingleSelect");

	});

	QUnit.test("open", function(assert) {

		sinon.stub(oContainer, "_open").callsFake(function(oContainer) {
			this._handleOpened();
		});
		sinon.stub(oContainer, "_getContainer").returns(oField);

		var iOpened = 0;
		oContainer.attachEvent("opened", function(oEvent) {
			iOpened++;
		});

		var oPromise = oContainer.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			var oPromise2 = oContainer.open(Promise.resolve()); // to test double call
			assert.ok(oPromise2 instanceof Promise, "open returns promise");

			var fnDone = assert.async();
			oPromise.then(function() {
				assert.ok(oContainer._open.calledWith(oField), "_open called");
				assert.equal(iOpened, 1, "Opened event fired once");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("close", function(assert) {

		sinon.stub(oContainer, "_close").callsFake(function(oContainer) {
			this._handleClosed();
		});

		var iClosed = 0;
		oContainer.attachEvent("closed", function(oEvent) {
			iClosed++;
		});

		oContainer.close();
		assert.notOk(oContainer._close.called, "_close not called if not open");

		sinon.stub(oContainer, "_open").callsFake(function(oContainer) {
			this._handleOpened();
		});
		sinon.stub(oContainer, "_getContainer").returns(oField);

		var oPromise = oContainer.open(Promise.resolve());
		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				oContainer.close();
				assert.ok(oContainer._close.called, "_close called if not open");
				assert.equal(iClosed, 1, "Closed event fired");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("close while opening", function(assert) {

		sinon.stub(oContainer, "_close").callsFake(function(oContainer) {
			this._handleClosed();
		});

//		var iClosed = 0;
//		oContainer.attachEvent("closed", function(oEvent) {
//			iClosed++;
//		});
//		var iOpened = 0;
//		oContainer.attachEvent("opened", function(oEvent) {
//			iOpened++;
//		});

		sinon.stub(oContainer, "_open").callsFake(function(oContainer) {
			this._handleOpened();
		});
		sinon.stub(oContainer, "_getContainer").returns(oField);
		sinon.spy(oContainer, "_cancelPromise"); // TODO: better way to test

		var oPromise = oContainer.open(Promise.resolve());
		if (oPromise) {
			oContainer.close();
			assert.ok(oContainer._cancelPromise.called, "Open promise cancelled");

//			var fnDone = assert.async();
//			oPromise.then(function() {
//				assert.ok(oContainer._close.called, "_close called if not open");
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

		sinon.stub(oContainer, "_open").callsFake(function(oContainer) {
			this._handleOpened();
		});
		sinon.stub(oContainer, "_getContainer").returns(oField);

		var oPromise = oContainer.open(Promise.resolve());
		assert.notOk(oContainer.isOpen(), "Container not open while opening");
		assert.ok(oContainer.isOpening(), "Container opening");

		if (oPromise) {
			var fnDone = assert.async();
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
		var oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer._open(); // just fake opening as only bound if open

		assert.equal(oContent.getFilterValue(), "X", "filterValue from ValueHelp");
		assert.deepEqual(oContent.getConfig(), oValueHelpConfig, "_config from ValueHelp");
		assert.deepEqual(oContent.getConditions(), [Condition.createItemCondition("X", "Text")], "conditions from ValueHelp");

		// remove
		oContent.destroy();
		// assert.equal(oContent.getFilterValue(), "", "filterValue initialized"); -> no reset on unbind anymore
		assert.deepEqual(oContent.getConfig(), {}, "_config initialized");
		assert.deepEqual(oContent.getConditions(), [], "conditions initialized");

	});

	QUnit.test("confirm event", function(assert) {

		var iConfirm = 0;
		oContainer.attachEvent("confirm", function(oEvent) {
			iConfirm++;
		});

		// add
		var oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer._open(); // just fake opening as only bound if open
		oContent.fireConfirm();
		assert.equal(iConfirm, 1, "Confirm event fired");

	});

	QUnit.test("cancel event", function(assert) {

		var iCancel = 0;
		oContainer.attachEvent("cancel", function(oEvent) {
			iCancel++;
		});

		// add
		var oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer._open(); // just fake opening as only bound if open
		oContent.fireCancel();
		assert.equal(iCancel, 1, "Cancel event fired");

	});

	QUnit.test("requestSwitchToDialog event", function(assert) {

		var iRequestSwitchToDialog = 0;
		var oEventContainer;
		oContainer.attachEvent("requestSwitchToDialog", function(oEvent) {
			iRequestSwitchToDialog++;
			oEventContainer = oEvent.getParameter("container");
		});

		// add
		var oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer._open(); // just fake opening as only bound if open
		oContent.fireRequestSwitchToDialog();
		assert.equal(iRequestSwitchToDialog, 1, "RequestSwitchToDialog event fired");
		assert.equal(oEventContainer, oContainer, "RequestSwitchToDialog event container");

	});

	QUnit.test("select event", function(assert) {

		var iSelect = 0;
		var aConditions;
		var sType;
		oContainer.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		// add
		var oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer._open(); // just fake opening as only bound if open
		oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: SelectType.Set});
		assert.equal(iSelect, 1, "select event fired");
		assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
		assert.equal(sType, SelectType.Set, "select event type");

	});

	QUnit.test("navigated event", function(assert) {

		var iNavigated = 0;
		var oCondition;
		var bLeaveFocus;
		var sItemId;
		oContainer.attachEvent("navigated", function(oEvent) {
			iNavigated++;
			oCondition = oEvent.getParameter("condition");
			bLeaveFocus = oEvent.getParameter("leaveFocus");
			sItemId = oEvent.getParameter("itemId");
		});

		// add
		var oContent = new Content("Content1");
		oContainer.addContent(oContent);
		oContainer._open(); // just fake opening as only bound if open
		oContent.fireNavigated({condition: Condition.createItemCondition("X", "Text"), leaveFocus: true, itemId:"X"});
		assert.equal(iNavigated, 1, "navigated event fired");
		assert.deepEqual(oCondition, Condition.createItemCondition("X", "Text"), "navigated event condition");
		assert.equal(bLeaveFocus, true, "navigated event leaveFocus");
		assert.equal(sItemId, "X", "navigated event itemId");

	});

	QUnit.test("navigate", function(assert) {

		sinon.stub(oContainer, "_getContainer").returns(oField);
		sinon.spy(oContainer, "_navigate");

		var oPromise = oContainer.navigate(1);
		assert.ok(oPromise instanceof Promise, "navigate returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				assert.ok(oContainer._navigate.calledOnce, "_navigate called");
				assert.ok(oContainer._navigate.calledWith(1), "_navigate called with 1");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("_getControl", function(assert) {

		var oControl = oContainer._getControl();
		assert.equal(oControl, oField, "Control returned from ValueHelp");

	});

	QUnit.test("isTypeahead", function(assert) {

		var bTypeahead = oContainer.isTypeahead();
		assert.ok(bTypeahead, "Is used as typeahead");
		assert.notOk(oContainer.isFocusInHelp(), "isFocusInHelp");

	});

	QUnit.test("isTypeaheadSupported", function(assert) {

		var bSupported = oContainer.isTypeaheadSupported();
		assert.notOk(bSupported, "not supported as default");

	});

	QUnit.test("isDialog", function(assert) {

		var bDialog = oContainer.isDialog();
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

	QUnit.test("providesScrolling", function(assert) {

		var bScrolling = oContainer.providesScrolling();
		assert.notOk(bScrolling, "provides no scrolling");

	});

	QUnit.test("getValueHelpDelegate", function(assert) {

		var oDelegate = oContainer.getValueHelpDelegate();
		assert.equal(oDelegate, ValueHelpDelegate, "Delegate returned");

	});

	QUnit.test("getValueHelpDelegatePayload", function(assert) {

		var oPayload = oContainer.getValueHelpDelegatePayload();
		assert.deepEqual(oPayload, {x: "X"}, "Payload returned");

	});

	QUnit.test("awaitValueHelpDelegate", function(assert) {

		var oPromise = oContainer.awaitValueHelpDelegate();
		assert.ok(oPromise instanceof Promise, "Promise returned");

	});

	QUnit.test("isValueHelpDelegateInitialized", function(assert) {

		var bDelegateInitialized = oContainer.isValueHelpDelegateInitialized();
		assert.ok(bDelegateInitialized, "Delegate initialized");

	});

	QUnit.test("_getContainerConfig", function(assert) {

		var oParentConfig = {
			showHeader: true
		};

		var oChildConfig = {
			showHeader: false
		};

		var oContainerConfig = {
			"sap.ui.mdc.qunit.valuehelp.ParentContainer": oParentConfig
		};

		var oContent = new Content("Content2");
		sinon.stub(oContent, "getContainerConfig").returns(oContainerConfig);

		var ParentContainer = Container.extend("sap.ui.mdc.qunit.valuehelp.ParentContainer");
		var ChildContainer = ParentContainer.extend("sap.ui.mdc.qunit.valuehelp.ChildContainer");

		var oParentContainer = new ParentContainer();
		var oChildContainer = new ChildContainer();

		assert.equal(oParentContainer._getContainerConfig(oContent), oParentConfig, "Configuration found");
		assert.equal(oChildContainer._getContainerConfig(oContent), oParentConfig, "Configuration for inherited type found");

		oContainerConfig["sap.ui.mdc.qunit.valuehelp.ChildContainer"] = oChildConfig;

		assert.equal(oChildContainer._getContainerConfig(oContent), oChildConfig, "Specific configuration found and prefered");

		oContent.getContainerConfig.restore();
		oContent.destroy();
		oParentContainer.destroy();
		oChildContainer.destroy();
	});

	// TODO: Test Operator determination on Content
	// TODO: Test condition creation on Content

});
