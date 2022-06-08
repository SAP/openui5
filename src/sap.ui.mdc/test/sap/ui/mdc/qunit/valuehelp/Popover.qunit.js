// Use this test page to test the API and features of the Popver container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/Popover",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Input",
	"sap/ui/core/Core"
], function (
		ValueHelpDelegate,
		Popover,
		Content,
		Condition,
		SelectType,
		Icon,
		JSONModel,
		mLibrary,
		Toolbar,
		Input,
		oCore
	) {
	"use strict";

	var oPopover;
	var iPopoverDuration = 355;

	var _fPressHandler = function(oEvent) {}; // just dummy handler to make Icon focusable
	var oField;
	var oContentField;
	var oContent;
	var oValueHelp = { //to fake ValueHelp
		getControl: function() {
			return oField;
		},
		_handleClosed: function () {

		},
		_handleOpened: function () {

		},
		getTypeahead: function () {
			return oPopover;
		},
		getDialog: function () {
			return null;
		},
		getControlDelegate: function () {
			return ValueHelpDelegate;
		},
		awaitControlDelegate: function () {
			return Promise.resolve();
		},
		bDelegateInitialized: true
	};
	var oValueHelpConfig;
	var oModel; // to fake ManagedObjectModel of ValueHelp

	/* use dummy control to simulate Field */

//	var oClock;

	var _teardown = function() {
//		if (oClock) {
//			oClock.restore();
//			oClock = undefined;
//		}
		oContent = undefined;
		oPopover.destroy();
		oPopover = undefined;
		oValueHelpConfig = undefined;
		if (oModel) {
			oModel.destroy();
			oModel = undefined;
		}
		if (oField) {
			oField.destroy();
			oField = undefined;
		}
		if (oContentField) {
			oContentField.destroy();
			oContentField = undefined;
		}
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oPopover = new Popover("P1", {
			});
		},
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.equal(oPopover.getMaxConditions(), undefined, "getMaxConditions");
		assert.notOk(oPopover.isMultiSelect(), "isMultiSelect");
		assert.notOk(oPopover._isSingleSelect(), "_isSingleSelect");
		assert.notOk(oPopover.getUseAsValueHelp(), "getUseAsValueHelp");
		assert.notOk(oPopover.shouldOpenOnClick(), "shouldOpenOnClick");
		assert.notOk(oPopover.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.notOk(oPopover.isFocusInHelp(), "isFocusInHelp");

	});

	QUnit.test("_getContainer", function(assert) {

		oPopover.setTitle("Test");

		var oContainer = oPopover._getContainer();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			var fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.ok(oContainer, "Container returned");
				assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
				assert.equal(oContainer.getContentHeight(), "auto", "contentHeight");
				assert.equal(oContainer.getPlacement(), mLibrary.PlacementType.VerticalPreferredBottom, "placement");
				assert.notOk(oContainer.getShowHeader(), "showHeader");
				assert.notOk(oContainer.getShowArrow(), "showArrow");
				assert.notOk(oContainer.getResizable(), "resizable");
				assert.equal(oContainer.getTitle(), "Test", "title");
				assert.equal(oContainer.getTitleAlignment(), mLibrary.TitleAlignment.Center, "titleAlignment");

				// call again
				oContainer = oPopover._getContainer();
				assert.ok(oContainer.isA("sap.m.Popover"), "sap.m.Popover directly returned on second call");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("providesScrolling", function(assert) {

		var bScrolling = oPopover.providesScrolling();
		assert.ok(bScrolling, "provides scrolling");

	});

	QUnit.module("assigned to ValueHelp", {
		beforeEach: function() {
			oValueHelpConfig = {maxConditions: 1};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				filterValue: "X",
				conditions: [Condition.createItemCondition("X", "Text")]
			});

			oContentField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oContent = new Content("Content1");
			sinon.stub(oContent, "getContent").returns(oContentField);

			oPopover = new Popover("P1", {
				content: oContent
			}).setModel(oModel, "$valueHelp");
			sinon.stub(oPopover, "getParent").returns(oValueHelp);
			oField = new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oField.getFocusElementForValueHelp = function(bTypeahed) { // fake
				return oField;
			};
			oField.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: _teardown
	});

	QUnit.test("_getContainer with content configuration", function(assert) {

		oContent.getContainerConfig = function () {
			return {
				'sap.ui.mdc.valuehelp.Popover': {
					showArrow: true,
					showHeader: true,
					resizable: true
				}
			};
		};
		oPopover.setTitle("Test");
		var oContainer = oPopover._getContainer();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			var fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.ok(oContainer, "Container returned");
				assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
				assert.equal(oContainer.getContentHeight(), "auto", "contentHeight");
				assert.equal(oContainer.getPlacement(), mLibrary.PlacementType.VerticalPreferredBottom, "placement");
				assert.ok(oContainer.getShowHeader(), "showHeader");
				assert.ok(oContainer.getShowArrow(), "showArrow");
				assert.ok(oContainer.getResizable(), "resizable");
				assert.equal(oContainer.getTitle(), "Test", "title");
				assert.equal(oContainer.getTitleAlignment(), mLibrary.TitleAlignment.Center, "titleAlignment");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});


	QUnit.test("open / close", function(assert) {

		var iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		var iClosed = 0;
		oPopover.attachEvent("closed", function(oEvent) {
			iClosed++;
		});

		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onHide");
		oContent.getContentHeight = function () {
			return 100;
		};

		var oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					var oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.equal(oContainer._getAllContent()[0], oContentField, "Content of sap.m.Popover");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oContainer.getContentHeight(), "auto", "contentHeight"); // TODO: Is this is right???
					assert.equal(oContainer.getInitialFocus(), oField.getId(), "initialFocus");
					assert.notOk(oContainer.getFooter(), "no footer");
					assert.equal(oPopover.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Popover returned");
					assert.equal(oPopover._getUIAreaForContent(), oContainer.getUIArea(), "_getUIAreaForContent returns UiArea of sap.m.Popover");

					oPopover.close();
					setTimeout(function() { // wait until closed
						assert.equal(iClosed, 1, "Closed event fired once");
						assert.notOk(oContainer.isOpen(), "sap.m.Popover is not open");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");

						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("open with footer toolbar", function(assert) {

		sinon.stub(oContent, "isFocusInHelp").returns(true); // test if initial focus is not set to field
		var oToolbar = new Toolbar("TB1");
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter : function () { return oToolbar; }
			}
		});

		var iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		var oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					var oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.notOk(oContainer.getInitialFocus(), "initialFocus not set");
					assert.equal(oContainer._getAllContent()[0], oContentField, "Content of sap.m.Popover");
					assert.equal(oContainer.getFooter(), oToolbar, "footer");

					oPopover.close();
					setTimeout(function() { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				oToolbar.destroy();
				fnDone();
			});
		}

	});

	QUnit.test("open with footer content", function(assert) {

		var oIcon = new Icon("Icon1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter : function () { return oIcon; }
			}
		});

		var iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		var oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					var oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.equal(oContainer._getAllContent()[0], oContentField, "Content of sap.m.Popover");
					var oFooter = oContainer.getFooter();
					assert.ok(oFooter, "footer exists");
					assert.ok(oFooter.isA("sap.m.Toolbar"), "Footer is sap.m.Toolbar");
					assert.equal(oFooter.getContent().length, 2, "Toolbar content length");
					assert.ok(oFooter.getContent()[0].isA("sap.m.ToolbarSpacer"), "ToolbarSpacer is first content");
					assert.equal(oFooter.getContent()[1], oIcon, "Icon is second content");

					oPopover.close();
					setTimeout(function() { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				oIcon.destroy();
				fnDone();
			});
		}

	});

	QUnit.test("removeFocus", function(assert) {

		sinon.spy(oContent, "removeFocus");
		oPopover.removeFocus();
		assert.ok(oContent.removeFocus.called, "removeFocus of Content called");

	});

	QUnit.test("navigate", function(assert) {

		sinon.spy(oContent, "navigate");

		var oPromise = oPopover.navigate(1);
		assert.ok(oPromise instanceof Promise, "navigate returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				assert.ok(oContent.navigate.calledOnce, "navigate on Content called");
				assert.ok(oContent.navigate.calledWith(1), "navigate  on Content called with 1");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("getItemForValue", function(assert) {

		sinon.spy(oContent, "getItemForValue");

		var oConfig = {test: "x"};

		oPopover.getItemForValue(oConfig);
		assert.ok(oContent.getItemForValue.called, "getItemForValue of Content called");
		assert.ok(oContent.getItemForValue.calledWith(oConfig), "getItemForValue of Content called with configuration");

	});

	QUnit.test("isValidationSupported", function(assert) {

		sinon.stub(oContent, "isValidationSupported").returns(true);
		assert.ok(oPopover.isValidationSupported(), "isValidationSupported");
		assert.ok(oContent.isValidationSupported.called, "isValidationSupported of Content called");

	});

	QUnit.test("isTypeaheadSupported", function(assert) {

		var bSupported = oPopover.isTypeaheadSupported();
		assert.notOk(bSupported, "not supported if content not supports search");

		sinon.stub(oContent, "isSearchSupported").returns(true);
		bSupported = oPopover.isTypeaheadSupported();
		assert.ok(bSupported, "supported if content supports search");

	});

	QUnit.test("getUseAsValueHelp", function(assert) {

		oContent.getUseAsValueHelp = function () {
			return true;
		};
		sinon.spy(oContent, "getUseAsValueHelp");

		assert.ok(oPopover.getUseAsValueHelp(), "getUseAsValueHelp");
		assert.ok(oContent.getUseAsValueHelp.called, "getUseAsValueHelp of Content called");

	});

	QUnit.test("getValueHelpIcon", function(assert) {

		sinon.stub(oContent, "getValueHelpIcon").returns("sap-icon://sap-ui5");
		assert.equal(oPopover.getValueHelpIcon(), "sap-icon://sap-ui5", "icon");
		assert.ok(oContent.getValueHelpIcon.called, "getValueHelpIcon of Content called");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		sinon.stub(oContent, "getAriaAttributes").returns({
			contentId: "X",
			ariaHasPopup: "dialog",
			roleDescription: "X"
		});

		var oCheckAttributes = {
			contentId: "X",
			ariaHasPopup: "dialog",
			role: null,
			roleDescription: "X"
		};
		var oAttributes = oPopover.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

		oContent.getUseAsValueHelp = function () {
			return true;
		};

		oCheckAttributes.role = "combobox";
		oAttributes = oPopover.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("shouldOpenOnClick", function(assert) {

		sinon.stub(oContent, "shouldOpenOnClick").returns(true);
		assert.ok(oPopover.shouldOpenOnClick(), "shouldOpenOnClick");
		assert.ok(oContent.shouldOpenOnClick.called, "shouldOpenOnClick of Content called");

	});

	QUnit.test("shouldOpenOnNavigate", function(assert) {

		sinon.stub(oContent, "shouldOpenOnNavigate").returns(true);
		assert.ok(oPopover.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.ok(oContent.shouldOpenOnNavigate.called, "shouldOpenOnNavigate of Content called");

	});

	QUnit.test("isFocusInHelp", function(assert) {

		sinon.stub(oContent, "isFocusInHelp").returns(true);
		assert.ok(oPopover.isFocusInHelp(), "isFocusInHelp");
		assert.ok(oContent.isFocusInHelp.called, "isFocusInHelp of Content called");

	});

	QUnit.test("isMultiSelect", function(assert) {

		sinon.stub(oContent, "isMultiSelect").returns(true);
		assert.ok(oPopover.isMultiSelect(), "isMultiSelect");
		assert.ok(oContent.isMultiSelect.called, "isMultiSelect of Content called");

	});

	QUnit.test("confirmed event", function(assert) {

		sinon.stub(oPopover, "_isSingleSelect").returns(true);
		var iConfirm = 0;
		var bClose = false;
		oPopover.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		var oPromise = oPopover.open(Promise.resolve());
		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					oContent.fireConfirm();
					assert.equal(iConfirm, 1, "Confirm event fired");
					assert.ok(bClose, "close parameter");

					fnDone();
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});


	QUnit.module("popover valuehelp assigned to Input ", {
		beforeEach: function() {
			oValueHelpConfig = {maxConditions: 1};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				filterValue: "X",
				conditions: [Condition.createItemCondition("X", "Text")]
			});

			oContentField = new Input("I1");
			oContent = new Content("Content1");
			sinon.stub(oContent, "getContent").returns(oContentField);

			oPopover = new Popover("P1", {
				content: oContent
			}).setModel(oModel, "$valueHelp");
			sinon.stub(oPopover, "getParent").returns(oValueHelp);

			oField = new Input("I2");
			oField.placeAt("content");
			oCore.applyChanges();

		},
		afterEach: _teardown
	});

	QUnit.test("open without ValueState", function(assert) {

		var iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		var oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					var oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.ok(oContainer.getCustomHeader().isA("sap.m.ValueStateHeader"), "custom header content is sap.m.ValueStateHeader");

					assert.notOk(oContainer.getCustomHeader().getVisible(), "CustomHeader ValueStateHeader is NOT visible");

					oPopover.close();
					setTimeout(function() { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("open with ValueState", function(assert) {
		oField.setValueState("Error");
		oField.setValueStateText("My Error message");

		var iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		var oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					var oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.ok(oContainer.getCustomHeader().isA("sap.m.ValueStateHeader"), "custom header content is sap.m.ValueStateHeader");

					assert.equal(oContainer.getCustomHeader().getValueState(), "Error", "CustomHeader ValueState correct");
					assert.equal(oContainer.getCustomHeader().getText(), "My Error message", "CustomHeader Text correct");
					assert.ok(oContainer.getCustomHeader().getVisible(), "CustomHeader ValueStateHeader is visible");

					oPopover.close();
					setTimeout(function() { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	// TODO: Test Operator determination on Content
	// TODO: Test condition creation on Content

});
