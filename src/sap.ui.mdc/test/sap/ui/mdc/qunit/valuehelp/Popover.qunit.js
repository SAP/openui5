// Use this test page to test the API and features of the Popver container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/Popover",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/Toolbar",
	"sap/m/Input",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/Device",
	"sap/ui/core/IconPool",
	"sap/ui/model/ParseException"
], function (
		ValueHelpDelegate,
		Popover,
		Content,
		Condition,
		ConditionValidated,
		OperatorName,
		ValueHelpSelectionType,
		Icon,
		JSONModel,
		mLibrary,
		Toolbar,
		Input,
		nextUIUpdate,
		Device,
		IconPool,
		ParseException
	) {
	"use strict";

	let oPopover;
	const iPopoverDuration = 355;

	const _fPressHandler = function(oEvent) {}; // just dummy handler to make Icon focusable
	let oField;
	let oContentField;
	let oContent;
	const oValueHelp = { //to fake ValueHelp
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
		getPayload: function () {
			return undefined;
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
		getId: function () {
			return "VH1";
		},
		sFilterValue: "",
		setFilterValue: function(sFilterValue) {
			oValueHelp.filterValue = sFilterValue;
		},
		getFilterValue: function() {
			return oValueHelp.filterValue;
		},
		bDelegateInitialized: true
	};
	let oValueHelpConfig;
	let oModel; // to fake ManagedObjectModel of ValueHelp

	/* use dummy control to simulate Field */

//	var oClock;

	const _teardown = function() {
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

	QUnit.test("default values", async function(assert) {

		assert.equal(oPopover.getMaxConditions(), undefined, "getMaxConditions");
		assert.notOk(oPopover.isMultiSelect(), "isMultiSelect");
		assert.notOk(oPopover.isSingleSelect(), "isSingleSelect");
		assert.notOk(oPopover.getUseAsValueHelp(), "getUseAsValueHelp");
		let bShouldOpen = await oPopover.shouldOpenOnClick();
		assert.notOk(bShouldOpen, "shouldOpenOnClick");
		bShouldOpen = await oPopover.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "shouldOpenOnFocus");
		assert.notOk(oPopover.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.notOk(oPopover.isNavigationEnabled(1), "isNavigationEnabled");
		assert.notOk(oPopover.isFocusInHelp(), "isFocusInHelp");

	});

	QUnit.test("getContainerControl", function(assert) {

		oPopover.setTitle("Test");

		const oContainer = oPopover.getContainerControl();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			const fnDone = assert.async();
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
				oContainer = oPopover.getContainerControl();
				assert.ok(oContainer.isA("sap.m.Popover"), "sap.m.Popover directly returned on second call");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("providesScrolling", function(assert) {

		const bScrolling = oPopover.providesScrolling();
		assert.ok(bScrolling, "provides scrolling");

	});

	QUnit.module("assigned to ValueHelp", {
		beforeEach: async function() {
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
			await nextUIUpdate();
		},
		afterEach: _teardown
	});

	QUnit.test("getContainerControl with content configuration", function(assert) {

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
		const oContainer = oPopover.getContainerControl();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			const fnDone = assert.async();
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

		let iOpened = 0;
		let sItemId;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
			sItemId = oEvent.getParameter("itemId");
		});
		let iClosed = 0;
		oPopover.attachEvent("closed", function(oEvent) {
			iClosed++;
		});

		sinon.stub(oContent, "onShow").returns("MyItem");
		sinon.spy(oContent, "onHide");
		sinon.spy(oPopover, "_openContainerByTarget");
		oContent.getContentHeight = function () {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve(), true, true);
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					assert.equal(sItemId, "MyItem", "Opened event returns itemId");
					const oContainer = oPopover.getAggregation("_container");
					assert.ok(oPopover._openContainerByTarget.called, "_openContainerByTarget was called.");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.equal(oContainer._getAllContent()[0], oContentField, "Content of sap.m.Popover");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oContainer.getContentHeight(), "auto", "contentHeight"); // TODO: Is this is right???
					assert.equal(oContainer.getInitialFocus(), oField.getId(), "initialFocus");
					assert.notOk(oContainer.getFooter(), "no footer");
					assert.equal(oPopover.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Popover returned");
					assert.equal(oPopover.getUIAreaForContent(), oContainer.getUIArea(), "getUIAreaForContent returns UiArea of sap.m.Popover");

					oPopover.close();
					setTimeout(function() { // wait until closed
						assert.equal(iClosed, 1, "Closed event fired once");
						assert.notOk(oContainer.isOpen(), "sap.m.Popover is not open");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");
						oContent.onShow.restore();
						oContent.onHide.restore();
						oPopover._openContainerByTarget.restore();
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				oContent.onShow.restore();
				oContent.onHide.restore();
				oPopover._openContainerByTarget.restore();
				fnDone();
			});
		}

	});

	QUnit.test("open with footer toolbar", function(assert) {

		sinon.stub(oContent, "isFocusInHelp").returns(true); // test if initial focus is not set to field
		const oToolbar = new Toolbar("TB1");
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter : function () { return oToolbar; }
			}
		});

		let iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oPopover.getAggregation("_container");
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

		const oIcon = new Icon("Icon1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter : function () { return oIcon; }
			}
		});

		let iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.equal(oContainer._getAllContent()[0], oContentField, "Content of sap.m.Popover");
					const oFooter = oContainer.getFooter();
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

	QUnit.test("Consider canceled opening promise with async showTypeahead", function(assert) {

		const oIcon = new Icon("Icon1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter : function () { return oIcon; }
			}
		});
		sinon.spy(oPopover, "_openContainerByTarget");


		sinon.stub(ValueHelpDelegate, "showTypeahead").callsFake(function () {
			return new Promise((resolve) => {
				oPopover._cancelPromise("open");
				resolve(true);
			});
		});
		const oPromise = oPopover.open(Promise.resolve(), true);
		const fnDone = assert.async();
		assert.ok(oPromise instanceof Promise, "open returns promise");
		setTimeout(function() { // wait until open
			assert.notOk(oPopover._openContainerByTarget.called, "Popover will not be opened as promise was cancelled during showTypeahead");
			oPopover._openContainerByTarget.restore();
			ValueHelpDelegate.showTypeahead.restore();
			oIcon.destroy();
			fnDone();
		}, iPopoverDuration);
	});

	QUnit.test("removeVisualFocus", function(assert) {

		sinon.spy(oContent, "removeVisualFocus");
		oPopover.removeVisualFocus();
		assert.ok(oContent.removeVisualFocus.called, "removeVisualFocus of Content called");

	});

	QUnit.test("setVisualFocus", function(assert) {

		sinon.spy(oContent, "setVisualFocus");
		oPopover.setVisualFocus();
		assert.ok(oContent.setVisualFocus.called, "setVisualFocus of Content called");

	});

	QUnit.test("navigate", function(assert) {

		sinon.spy(oContent, "navigate");

		const oPromise = oPopover.navigate(1);
		assert.ok(oPromise instanceof Promise, "navigate returns promise");

		if (oPromise) {
			const fnDone = assert.async();
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

		const oConfig = {test: "x"};

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

		let bSupported = oPopover.isTypeaheadSupported();
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
			roleDescription: "X",
			valueHelpEnabled: true,
			autocomplete: "none"
		});

		const oCheckAttributes = {
			contentId: "X",
			ariaHasPopup: "dialog",
			role: null,
			roleDescription: "X",
			valueHelpEnabled: true,
			autocomplete: "none"
		};
		let oAttributes = oPopover.getAriaAttributes();
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

	QUnit.test("shouldOpenOnFocus", async function(assert) {

		oPopover.setOpensOnFocus(true);
		let bShouldOpen = await oPopover.shouldOpenOnFocus();
		assert.ok(bShouldOpen, "shouldOpenOnFocus enabled by container property");

		oPopover.setOpensOnFocus(false);
		bShouldOpen = await oPopover.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "shouldOpenOnFocus disabled by container property");

	});

	QUnit.test("shouldOpenOnClick", async function(assert) {

		sinon.stub(oContent, "shouldOpenOnClick").returns(true);

		let bShouldOpen = await oPopover.shouldOpenOnClick();
		assert.ok(bShouldOpen, "shouldOpenOnClick enabled by content");
		assert.ok(oContent.shouldOpenOnClick.called, "shouldOpenOnClick of Content called");
		oContent.shouldOpenOnClick.reset();

		oPopover.setOpensOnClick(true);
		bShouldOpen = await oPopover.shouldOpenOnClick();
		assert.ok(bShouldOpen, "shouldOpenOnClick enabled by container property");
		assert.notOk(oContent.shouldOpenOnClick.called, "shouldOpenOnClick of Content not called, when opensOnClick is set");

		oPopover.setOpensOnClick(false);
		bShouldOpen = await oPopover.shouldOpenOnClick();
		assert.notOk(bShouldOpen, "shouldOpenOnClick disabled by container property");
		assert.notOk(oContent.shouldOpenOnClick.called, "shouldOpenOnClick of Content not called, when opensOnClick is set");

	});

	QUnit.test("shouldOpenOnNavigate", function(assert) {

		sinon.stub(oContent, "shouldOpenOnNavigate").returns(true);
		assert.ok(oPopover.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.ok(oContent.shouldOpenOnNavigate.called, "shouldOpenOnNavigate of Content called");

	});

	QUnit.test("isNavigationEnabled", function(assert) {

		sinon.stub(oContent, "isNavigationEnabled").returns("X"); // "X" - just for testing return value
		assert.notOk(oPopover.isNavigationEnabled(1), "Navigation if closed and not used as value help: disabled");
		assert.notOk(oContent.isNavigationEnabled.calledWith(1), "isNavigationEnabled of Content not called with step");
		sinon.stub(oPopover, "isOpen").returns(true);
		assert.equal(oPopover.isNavigationEnabled(2), "X", "Navigation if open and not used as value help: Result of Content returned");
		assert.ok(oContent.isNavigationEnabled.calledWith(2), "isNavigationEnabled of Content called with step");
		sinon.stub(oPopover, "getUseAsValueHelp").returns(true);
		assert.equal(oPopover.isNavigationEnabled(3), "X", "Navigation if open and used as value help: Result of Content returned");
		assert.ok(oContent.isNavigationEnabled.calledWith(3), "isNavigationEnabled of Content called with step");
		oPopover.isOpen.returns(false);
		assert.equal(oPopover.isNavigationEnabled(4), "X", "Navigation if closed and used as value help: Result of Content returned");
		assert.ok(oContent.isNavigationEnabled.calledWith(4), "isNavigationEnabled of Content called with step");

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

		sinon.stub(oPopover, "isSingleSelect").returns(true);
		let iConfirm = 0;
		let bClose = false;
		oPopover.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		const oPromise = oPopover.open(Promise.resolve());
		if (oPromise) {
			const fnDone = assert.async();
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

	QUnit.test("setHighlightId", function(assert) {
		sinon.spy(oContent, "setHighlightId");
		oPopover.setHighlightId("x");
		assert.ok(oContent.setHighlightId.calledWith("x"), "Container setHighlightId calls Content.setHighlightId with argument");
	});


	QUnit.module("popover valuehelp assigned to Input ", {
		beforeEach: async function() {
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
			await nextUIUpdate();

		},
		afterEach: _teardown
	});

	QUnit.test("open without ValueState", function(assert) {

		let iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oPopover.getAggregation("_container");
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

		let iOpened = 0;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oPopover.getAggregation("_container");
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

	QUnit.test("_disableFollowOfTemporarily", function(assert) {
		const fnDone = assert.async();
		sinon.spy(oPopover, "_disableFollowOfTemporarily");

		return oPopover.open(Promise.resolve()).then(function() {
			setTimeout(function() { // wait until open
				const oMPopover = oPopover.getAggregation("_container");
				sinon.spy(oMPopover, "setFollowOf");

				oContent.fireConfirm();
				assert.ok(oPopover._disableFollowOfTemporarily.called, "Popover disables the followOf feature temporarily on selection");
				assert.ok(oMPopover.setFollowOf.calledWith(false), "MPopover followOf was disabled");

				oContent.fireConfirm({close: true});
				assert.notOk(oPopover._disableFollowOfTemporarily.calledTwice, "Popover does not disable the followOf feature temporarily");

				setTimeout(function () {
					assert.ok(oMPopover.setFollowOf.calledWith(true), "MPopover followOf was enabled again");
					oPopover.close();
					setTimeout(function() { // wait until closed
						fnDone();
					}, iPopoverDuration);
				},300);
			}, iPopoverDuration);
		}).catch(function(oError) {
			assert.notOk(true, "Promise Catch called");
			fnDone();
		});
	});

	// TODO: Test Operator determination on Content
	// TODO: Test condition creation on Content

	let oDeviceStub;
	QUnit.module("Phone support", {
		beforeEach: async function() {
			const oSystem = {
				desktop: false,
				phone: true,
				tablet: false
			};

			oDeviceStub = sinon.stub(Device, "system").value(oSystem);

			oValueHelpConfig = {maxConditions: -1};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				// filterValue: "X",
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
			await nextUIUpdate();
		},
		afterEach: function () {
			_teardown();
			oDeviceStub.restore();
		}
	});

	QUnit.test("getContainerControl (multi-select)", function(assert) {

		oPopover.setTitle("Test");

		const oContainer = oPopover.getContainerControl();

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.ok(oContainer, "Container returned");
				assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
				assert.equal(oContainer.getStretch(), true, "stretch");
				assert.equal(oContainer.getHorizontalScrolling(), false, "horizontalScrolling");

				const oCloseButton = oContainer.getBeginButton();
				assert.ok(oCloseButton, "close-button exist");
				assert.ok(oCloseButton && oCloseButton.isA("sap.m.Button"), "close-button is Button");

				const oCustomHeaderBar = oContainer.getCustomHeader();
				assert.ok(oCustomHeaderBar, "header-bar exist");
				assert.ok(oCustomHeaderBar && oCustomHeaderBar.isA("sap.m.Bar"), "header-bar is Bar");
				const aContentMiddle = oCustomHeaderBar.getContentMiddle();
				assert.equal(aContentMiddle && aContentMiddle.length, 1, "ContentMiddle returned");
				const oTitle = aContentMiddle && aContentMiddle[0];
				assert.ok(oTitle, "title exist");
				assert.ok(oTitle && oTitle.isA("sap.m.Title"), "title is Title");
				assert.equal(oTitle && oTitle.getText(), "Test", "Title text");
				assert.equal(oTitle && oTitle.getLevel(), "H1", "Title level");
				const aContentRight = oCustomHeaderBar.getContentRight();
				assert.equal(aContentRight && aContentRight.length, 1, "ContentRight returned");
				const oCancelButton = aContentRight && aContentRight[0];
				assert.ok(oCancelButton, "cancel-button exist");
				assert.ok(oCancelButton && oCancelButton.isA("sap.m.Button"), "cancel-button is Button");
				assert.equal(oCancelButton && oCancelButton.getIcon(), IconPool.getIconURI("decline"), "cancel-button is Icon");

				const oSubHeaderBar = oContainer.getSubHeader();
				assert.ok(oSubHeaderBar, "subHeader-bar exist");
				assert.ok(oSubHeaderBar && oSubHeaderBar.isA("sap.m.Toolbar"), "subHeader-bar is Toolbar");
				const aSubHeaderContent = oSubHeaderBar.getContent();
				assert.equal(aSubHeaderContent && aSubHeaderContent.length, 2, "SubHeaderContent returned");
				const oInput = aSubHeaderContent[0];
				assert.ok(oInput, "Input exist");
				assert.ok(oInput && oInput.isA("sap.m.Input"), "Input is Input");
				assert.notOk(oInput && oInput.getValue(), "Input value");
				assert.equal(oInput && oInput.getWidth(), "100%", "Input width");
				assert.equal(oInput && oInput.getShowValueStateMessage(), false, "Input showValueStateMessage");
				assert.equal(oInput && oInput.getShowValueHelp(), false, "Input showValueHelp");
				assert.equal(oContainer.getInitialFocus(), oInput && oInput.getId(), "initial focus");
				const oShowConditionsButton = aSubHeaderContent[1];
				assert.ok(oShowConditionsButton, "show-conditions-button exist");
				assert.ok(oShowConditionsButton && oShowConditionsButton.isA("sap.m.ToggleButton"), "show-conditions-button is ToggleButton");
				assert.equal(oShowConditionsButton && oShowConditionsButton.getIcon(), IconPool.getIconURI("multiselect-all"), "show-conditions-button Icon");

				const aDialogContent = oContainer.getContent();
				assert.equal(aDialogContent && aDialogContent.length, 2, "Dialog content");
				const oValueStateHeader = aDialogContent && aDialogContent[0];
				assert.ok(oValueStateHeader && oValueStateHeader.isA("sap.m.ValueStateHeader"), "ValueStateHeader is first content");
				const oScrollContainer = aDialogContent && aDialogContent[1];
				assert.ok(oScrollContainer && oScrollContainer.isA("sap.m.ScrollContainer"), "ScrollContainer is second content");

				// call again
				oContainer = oPopover.getContainerControl();
				assert.ok(oContainer.isA("sap.m.Dialog"), "sap.m.Dialog directly returned on second call");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("getContainerControl (single-select)", function(assert) {

		oValueHelpConfig.maxConditions = 1;
		oPopover.setTitle("Test");

		sinon.stub(oPopover, "hasDialog").returns(true); // to enable valueHelp icon

		const oContainer = oPopover.getContainerControl();

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				setTimeout(function() { // as setting value on input might be async
					assert.ok(oContainer, "Container returned");
					assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
					assert.equal(oContainer.getStretch(), true, "stretch");
					assert.equal(oContainer.getHorizontalScrolling(), false, "horizontalScrolling");

					const oCloseButton = oContainer.getBeginButton();
					assert.ok(oCloseButton && oCloseButton.isA("sap.m.Button"), "close-button is Button");

					const oCustomHeaderBar = oContainer.getCustomHeader();
					assert.ok(oCustomHeaderBar && oCustomHeaderBar.isA("sap.m.Bar"), "header-bar is Bar");
					const aContentMiddle = oCustomHeaderBar.getContentMiddle();
					assert.equal(aContentMiddle && aContentMiddle.length, 1, "ContentMiddle returned");
					const oTitle = aContentMiddle && aContentMiddle[0];
					assert.ok(oTitle && oTitle.isA("sap.m.Title"), "title is Title");
					assert.equal(oTitle && oTitle.getText(), "Test", "Title text");
					assert.equal(oTitle && oTitle.getLevel(), "H1", "Title level");
					const aContentRight = oCustomHeaderBar.getContentRight();
					assert.equal(aContentRight && aContentRight.length, 1, "ContentRight returned");
					const oCancelButton = aContentRight && aContentRight[0];
					assert.ok(oCancelButton && oCancelButton.isA("sap.m.Button"), "cancel-button is Button");
					assert.equal(oCancelButton && oCancelButton.getIcon(), IconPool.getIconURI("decline"), "cancel-button is Icon");

					const oSubHeaderBar = oContainer.getSubHeader();
					assert.ok(oSubHeaderBar && oSubHeaderBar.isA("sap.m.Toolbar"), "subHeader-bar is Toolbar");
					const aSubHeaderContent = oSubHeaderBar.getContent();
					assert.equal(aSubHeaderContent && aSubHeaderContent.length, 1, "SubHeaderContent returned");
					const oInput = aSubHeaderContent[0];
					assert.ok(oInput, "Input exist");
					assert.ok(oInput && oInput.isA("sap.m.Input"), "Input is Input");
					assert.equal(oInput && oInput.getValue(), "X", "Input value");
					assert.equal(oInput && oInput.getWidth(), "100%", "Input width");
					assert.equal(oInput && oInput.getShowValueStateMessage(), false, "Input showValueStateMessage");
					assert.equal(oInput && oInput.getShowValueHelp(), true, "Input showValueHelp");
					assert.equal(oContainer.getInitialFocus(), oInput && oInput.getId(), "initial focus");

					const aDialogContent = oContainer.getContent();
					assert.equal(aDialogContent && aDialogContent.length, 2, "Dialog content");
					const oValueStateHeader = aDialogContent && aDialogContent[0];
					assert.ok(oValueStateHeader && oValueStateHeader.isA("sap.m.ValueStateHeader"), "ValueStateHeader is first content");
					assert.notOk(oValueStateHeader.getVisible(), "ValueStateHeader not visible");
					const oScrollContainer = aDialogContent && aDialogContent[1];
					assert.ok(oScrollContainer && oScrollContainer.isA("sap.m.ScrollContainer"), "ScrollContainer is second content");

					fnDone();
				}, 0);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("open / close", function(assert) {

		let iOpened = 0;
		let sItemId;
		oPopover.attachEvent("opened", function(oEvent) {
			iOpened++;
			sItemId = oEvent.getParameter("itemId");
		});
		let iClosed = 0;
		oPopover.attachEvent("closed", function(oEvent) {
			iClosed++;
		});

		sinon.stub(oContent, "onShow").returns("MyItem");
		sinon.spy(oContent, "onHide");
		sinon.spy(oPopover, "_openContainerByTarget");
		oContent.getContentHeight = function () {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					assert.equal(sItemId, "MyItem", "Opened event returns itemId");
					const oContainer = oPopover.getAggregation("_container");
					assert.notOk(oPopover._openContainerByTarget.called, "_openContainerByTarget was not called.");
					assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
					assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
					const aDialogContent = oContainer.getContent();
					const oScrollContainer = aDialogContent && aDialogContent[1];
					const oShownContent = oScrollContainer.getContent()[0];
					assert.ok(oShownContent.isA("sap.m.List"), "Tokenlist shown");
					assert.equal(oShownContent.getMode(), "Delete", "List mode");
					const aItems = oShownContent.getItems();
					assert.equal(aItems.length, 1, "one item");
					assert.equal(aItems[0].getTitle(), "X", "Text of item");
					// assert.ok(aItems[0].getSelected(), "Item is selected");
					assert.equal(aItems[0].getType(), "Active", "Type of item");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oPopover.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Dialog returned");
					assert.equal(oPopover.getUIAreaForContent(), oContainer.getUIArea(), "getUIAreaForContent returns UiArea of sap.m.Dialog");

					oPopover.close();
					setTimeout(function() { // wait until closed
						assert.equal(iClosed, 1, "Closed event fired once");
						assert.notOk(oContainer.isOpen(), "sap.m.Dialog is not open");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");
						oContent.onShow.restore();
						oContent.onHide.restore();
						oPopover._openContainerByTarget.restore();
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				oContent.onShow.restore();
				oContent.onHide.restore();
				oPopover._openContainerByTarget.restore();
				fnDone();
			});
		}

	});

	QUnit.test("Cancel Button", function(assert) {

		let iCancel = 0;
		oPopover.attachEvent("cancel", function(oEvent) {
			iCancel++;
		});

		oContent.getContentHeight = function () {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oCustomHeaderBar = oContainer.getCustomHeader();
					const aContentRight = oCustomHeaderBar.getContentRight();
					const oCancelButton = aContentRight && aContentRight[0];
					oCancelButton.firePress(); // simulate press
					assert.equal(iCancel, 1, "Cancel event fired once");

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

	QUnit.test("Input interaction (multi-select)", function(assert) {

		let iSelect = 0;
		let sSelectType;
		let aSelectConditions;
		oPopover.attachEvent("select", function(oEvent) {
			iSelect++;
			sSelectType = oEvent.getParameter("type");
			aSelectConditions = oEvent.getParameter("conditions");
		});
		let iConfirm = 0;
		let bConfirmClose;
		oPopover.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bConfirmClose = oEvent.getParameter("close");
		});

		oContent.getContentHeight = function () {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oSubHeaderBar = oContainer.getSubHeader();
					const aSubHeaderContent = oSubHeaderBar.getContent();
					const oInput = aSubHeaderContent[0];
					const aDialogContent = oContainer.getContent();
					const oValueStateHeader = aDialogContent && aDialogContent[0];

					oInput._$input.val("A");
					oInput.fireLiveChange({value: "A"});
					assert.equal(oValueHelp.getFilterValue(), "A", "FilterValue set");
					assert.equal(iSelect, 0, "Select event not fired");

					oInput.fireSubmit({value: "A"});
					setTimeout(function() { // as parsing might be async
						assert.equal(iSelect, 1, "Select event fired");
						assert.equal(sSelectType, ValueHelpSelectionType.Add, "Select type");
						const oCondition = Condition.createCondition(OperatorName.EQ, ["A"], undefined, undefined, ConditionValidated.NotValidated);
						assert.deepEqual(aSelectConditions, [oCondition], "Selected condition");
						assert.equal(iConfirm, 1, "Confirm event fired once");
						assert.ok(bConfirmClose, "Close on confirm event set");

						iSelect = 0;
						iConfirm = 0;
						oInput._$input.val("");
						oInput.fireSubmit({value: ""});
						assert.equal(iSelect, 0, "Select event not fired");
						assert.equal(iConfirm, 1, "Confirm event fired once");
						assert.ok(bConfirmClose, "Close on confirm event set");

						iSelect = 0;
						iConfirm = 0;
						sinon.stub(oPopover._oInputConditionType, "parseValue").throws(new ParseException("MyError"));
						oInput._$input.val("Y");
						oInput.fireSubmit({value: "Y"});
						setTimeout(function() { // as parsing might be async
							assert.equal(iSelect, 0, "Select event not fired");
							assert.equal(iConfirm, 0, "Confirm event not fired");
							assert.equal(oInput.getValueState(), "Error", "ValueState on Input");
							assert.equal(oInput.getValueStateText(), "MyError", "ValueStateText on Input");
							assert.equal(oValueStateHeader.getValueState(), "Error", "ValueState on ValueStateHeader");
							assert.equal(oValueStateHeader.getText(), "MyError", "Text on ValueStateHeader");
							assert.ok(oValueStateHeader.getVisible(), "ValueStateHeader visible");

							oPopover.close();
							setTimeout(function() { // wait until closed
								fnDone();
							}, iPopoverDuration);
						}, 0);
					}, 0);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("Input interaction (single-select)", function(assert) {

		oValueHelpConfig.maxConditions = 1;
		sinon.stub(oPopover, "hasDialog").returns(true); // to enable valueHelp icon

		let iSelect = 0;
		let sSelectType;
		let aSelectConditions;
		oPopover.attachEvent("select", function(oEvent) {
			iSelect++;
			sSelectType = oEvent.getParameter("type");
			aSelectConditions = oEvent.getParameter("conditions");
		});
		let iConfirm = 0;
		let bConfirmClose;
		oPopover.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bConfirmClose = oEvent.getParameter("close");
		});
		let iRequestSwitchToDialog = 0;
		oPopover.attachEvent("requestSwitchToDialog", function(oEvent) {
			iRequestSwitchToDialog++;
		});

		oContent.getContentHeight = function () {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oSubHeaderBar = oContainer.getSubHeader();
					const aSubHeaderContent = oSubHeaderBar.getContent();
					const oInput = aSubHeaderContent[0];
					oInput._$input.val("A");
					oInput.fireSubmit({value: "A"});
					setTimeout(function() { // as parsing might be async
						assert.equal(iSelect, 1, "Select event fired");
						assert.equal(sSelectType, ValueHelpSelectionType.Set, "Select type");
						const oCondition = Condition.createCondition(OperatorName.EQ, ["A"], undefined, undefined, ConditionValidated.NotValidated);
						assert.deepEqual(aSelectConditions, [oCondition], "Selected condition");
						assert.equal(iConfirm, 1, "Confirm event fired once");
						assert.ok(bConfirmClose, "Close on confirm event set");

						iSelect = 0;
						iConfirm = 0;
						oInput._$input.val("");
						oInput.fireSubmit({value: ""});
						assert.equal(iSelect, 1, "Select event fired");
						assert.equal(sSelectType, ValueHelpSelectionType.Set, "Select type");
						assert.deepEqual(aSelectConditions, [], "Selected condition");
						assert.equal(iConfirm, 1, "Confirm event fired once");
						assert.ok(bConfirmClose, "Close on confirm event set");

						oInput.fireValueHelpRequest();
						assert.equal(iRequestSwitchToDialog, 1, "RequestSwitchToDialog event fired");

						oPopover.close();
						setTimeout(function() { // wait until closed
							fnDone();
						}, iPopoverDuration);
					}, 0);
				}, iPopoverDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("OK Button", function(assert) {

		oContent.getContentHeight = function () {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oSubHeaderBar = oContainer.getSubHeader();
					const aSubHeaderContent = oSubHeaderBar.getContent();
					const oInput = aSubHeaderContent[0];
					oInput.setValue("A");
					sinon.spy(oInput, "fireSubmit");
					const oCloseButton = oContainer.getBeginButton();
					oCloseButton.firePress(); // simulate press

					assert.ok(oInput.fireSubmit.calledOnce, "Input submit called"); // as OK shoulf behave similar to Input Enter-Press
					assert.equal(oInput.fireSubmit.args[0][0].value, "A", "Input submit called with value");

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

	QUnit.test("Token List", function(assert) {

		let iSelect = 0;
		let sSelectType;
		let aSelectConditions;
		oPopover.attachEvent("select", function(oEvent) {
			iSelect++;
			sSelectType = oEvent.getParameter("type");
			aSelectConditions = oEvent.getParameter("conditions");
		});

		oContent.getContentHeight = function () {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oSubHeaderBar = oContainer.getSubHeader();
					const aSubHeaderContent = oSubHeaderBar.getContent();
					const oShowConditionsButton = aSubHeaderContent[1];
					const aDialogContent = oContainer.getContent();
					const oScrollContainer = aDialogContent && aDialogContent[1];

					oShowConditionsButton.firePress({pressed: false});
					let oShownContent = oScrollContainer.getContent()[0];
					assert.equal(oShownContent, oContentField, "Content of ScrollContainer");

					oShowConditionsButton.firePress({pressed: true});
					oShownContent = oScrollContainer.getContent()[0];
					assert.ok(oShownContent.isA("sap.m.List"), "Tokenlist shown");
					assert.equal(oShownContent.getMode(), "Delete", "List mode");
					const aItems = oShownContent.getItems();
					assert.equal(aItems.length, 1, "one item");
					assert.equal(aItems[0].getTitle(), "X", "Text of item");
					// assert.ok(aItems[0].getSelected(), "Item is selected");
					assert.equal(aItems[0].getType(), "Active", "Type of item");

					aItems[0].getDeleteControl(true).firePress(); // simulate delete
					assert.equal(iSelect, 1, "Select event fired");
					assert.equal(sSelectType, ValueHelpSelectionType.Remove, "Select type");
					const oCondition = Condition.createItemCondition("X", "Text");
					assert.deepEqual(aSelectConditions, [oCondition], "Selected condition");

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

	QUnit.test("shouldOpenOnClick", async function(assert) {

		sinon.stub(oContent, "shouldOpenOnClick").returns(false);
		let bShouldOpen = await oPopover.shouldOpenOnClick();
		assert.ok(bShouldOpen, "shouldOpenOnClick always enabled for Multi-Select");
		assert.notOk(oContent.shouldOpenOnClick.called, "shouldOpenOnClick of Content not called");

		oValueHelpConfig.maxConditions = 1;
		sinon.stub(oPopover, "isDialog").returns(false);
		bShouldOpen = await oPopover.shouldOpenOnClick();
		assert.ok(bShouldOpen, "shouldOpenOnClick always enabled for Single-Select if not used as Dialog");
		assert.notOk(oContent.shouldOpenOnClick.called, "shouldOpenOnClick of Content not called");

		oPopover.isDialog.returns(true);
		bShouldOpen = await oPopover.shouldOpenOnClick();
		assert.notOk(bShouldOpen, "shouldOpenOnClick used value of content");
		assert.ok(oContent.shouldOpenOnClick.called, "shouldOpenOnClick of Content called");

	});

	QUnit.test("isTypeaheadSupported", function(assert) {

		sinon.stub(oContent, "isSearchSupported").returns(true);
		sinon.stub(oPopover, "isDialog").returns(false);

		assert.ok(oPopover.isTypeaheadSupported(), "for Multi-selection take configuration of content");

		oPopover.isDialog.returns(true);
		assert.notOk(oPopover.isTypeaheadSupported(), "for Multi-selection not supported if used as Dialog");

		oValueHelpConfig.maxConditions = 1;
		assert.notOk(oPopover.isTypeaheadSupported(), "for Single-selection not supported");

	});
});
