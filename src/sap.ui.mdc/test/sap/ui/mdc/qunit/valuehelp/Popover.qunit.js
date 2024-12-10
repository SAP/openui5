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
], (
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
	) => {
	"use strict";

	let oPopover;
	const iPopoverDuration = 355;

	const _fPressHandler = (oEvent) => {}; // just dummy handler to make Icon focusable
	let oField;
	let oContentField;
	let oContent;
	const oValueHelp = { //to fake ValueHelp
		getControl() {
			return oField;
		},
		_handleClosed() {

		},
		_handleOpened() {

		},
		getTypeahead() {
			return oPopover;
		},
		getPayload() {
			return undefined;
		},
		getDialog() {
			return null;
		},
		getControlDelegate() {
			return ValueHelpDelegate;
		},
		awaitControlDelegate() {
			return Promise.resolve();
		},
		getId() {
			return "VH1";
		},
		sFilterValue: "",
		setFilterValue(sFilterValue) {
			oValueHelp.filterValue = sFilterValue;
		},
		getFilterValue() {
			return oValueHelp.filterValue;
		},
		bDelegateInitialized: true
	};
	let oValueHelpConfig;
	let oModel; // to fake ManagedObjectModel of ValueHelp

	/* use dummy control to simulate Field */

	const _teardown = () => {
		oContent = undefined;
		oPopover.destroy();
		oPopover = undefined;
		oValueHelpConfig = undefined;
		oModel?.destroy();
		oModel = undefined;
		oField?.destroy();
		oField = undefined;
		oContentField?.destroy();
		oContentField = undefined;
	};

	QUnit.module("basic features", {
		beforeEach() {
			oPopover = new Popover("P1", {
			});
		},
		afterEach: _teardown
	});

	QUnit.test("default values", async (assert) => {

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

	QUnit.test("getContainerControl", (assert) => {

		oPopover.setTitle("Test");

		const oContainer = oPopover.getContainerControl();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		return oContainer?.then((oContainer) => {
			assert.ok(oContainer, "Container returned");
			assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
			assert.equal(oContainer.getContentHeight(), "auto", "contentHeight");
			assert.equal(oContainer.getPlacement(), mLibrary.PlacementType.VerticalPreferredBottom, "placement");
			assert.notOk(oContainer.getShowHeader(), "showHeader");
			assert.notOk(oContainer.getShowArrow(), "showArrow");
			assert.notOk(oContainer.getResizable(), "resizable");
			assert.equal(oContainer.getTitle(), "Test", "title");
			assert.equal(oContainer.getTitleAlignment(), mLibrary.TitleAlignment.Center, "titleAlignment");
			assert.notOk(oContainer.isPopupAdaptationAllowed(), "isPopupAdaptationAllowed");

			sinon.stub(oContainer, "getScrollDelegate").returns("ScrollDelegate");
			assert.equal(oPopover.getScrollDelegate(), "ScrollDelegate", "ScrollDelegate of Container returned");
			oContainer.getScrollDelegate.restore();

			// call again
			oContainer = oPopover.getContainerControl();
			assert.ok(oContainer.isA("sap.m.Popover"), "sap.m.Popover directly returned on second call");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("providesScrolling", (assert) => {

		const bScrolling = oPopover.providesScrolling();
		assert.ok(bScrolling, "provides scrolling");

	});

	QUnit.test("getUIAreaForContent", (assert) => {

		assert.equal(oPopover.getUIAreaForContent(), null, "getUIAreaForContent returns no UIArea as long as no Popover created");

	});

	QUnit.module("assigned to ValueHelp", {
		beforeEach: async () => {
			oValueHelpConfig = {maxConditions: 1};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				filterValue: "X",
				conditions: [Condition.createItemCondition("X", "Text")]
			});

			oContentField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oContent = new Content("Content1", {displayContent: oContentField});
			sinon.stub(oContent, "getContent").returns(oContentField);

			oPopover = new Popover("P1", {
				content: oContent
			}).setModel(oModel, "$valueHelp");
			sinon.stub(oPopover, "getParent").returns(oValueHelp);
			oField = new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oField.getFocusElementForValueHelp = (bTypeahed) => { // fake
				return oField;
			};
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: _teardown
	});

	QUnit.test("getContainerControl with content configuration", (assert) => {

		oContent.getContainerConfig = () => {
			return {
				'sap.ui.mdc.valuehelp.Popover': {
					showArrow: true,
					showHeader: true,
					resizable: true,
					getContentWidth: () => "99%"
				}
			};
		};
		oPopover.setTitle("Test");
		const oContainer = oPopover.getContainerControl();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		return oContainer.then((oContainer) => {
			assert.ok(oContainer, "Container returned");
			assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
			assert.equal(oContainer.getContentHeight(), "auto", "contentHeight");
			assert.equal(oContainer.getPlacement(), mLibrary.PlacementType.VerticalPreferredBottom, "placement");
			assert.ok(oContainer.getShowHeader(), "showHeader");
			assert.ok(oContainer.getShowArrow(), "showArrow");
			assert.ok(oContainer.getResizable(), "resizable");
			assert.equal(oContainer.getContentWidth(), "99%", "contentWidth");
			assert.equal(oContainer.getTitle(), "Test", "title");
			assert.equal(oContainer.getTitleAlignment(), mLibrary.TitleAlignment.Center, "titleAlignment");

		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});


	QUnit.test("open / close", (assert) => {

		let iOpened = 0;
		let sItemId;
		let iItems;
		oPopover.attachEvent("opened", (oEvent) => {
			iOpened++;
			sItemId = oEvent.getParameter("itemId");
			iItems = oEvent.getParameter("items");
		});
		let iClosed = 0;
		oPopover.attachEvent("closed", (oEvent) => {
			iClosed++;
		});

		sinon.stub(oContent, "onShow").returns({itemId: "MyItem", items: 3});
		sinon.spy(oContent, "onHide");
		sinon.spy(oPopover, "handleClose");
		sinon.spy(oPopover, "_openContainerByTarget");
		oContent.getContentHeight = () => {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve(), true, true);
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					assert.equal(sItemId, "MyItem", "Opened event returns itemId");
					assert.equal(iItems, 3, "Opened event returns items");
					const oContainer = oPopover.getAggregation("_container");
					assert.ok(oPopover._openContainerByTarget.calledOnce, "_openContainerByTarget was called.");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.equal(oContainer._getAllContent()[0], oContentField, "Content of sap.m.Popover");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oContainer.getContentHeight(), "auto", "contentHeight"); // TODO: Is this is right???
					assert.equal(oContainer.getInitialFocus(), oField.getId(), "initialFocus");
					assert.notOk(oContainer.getFooter(), "no footer");
					assert.equal(oPopover.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Popover returned");
					assert.equal(oPopover.getUIAreaForContent(), oContainer.getUIArea(), "getUIAreaForContent returns UiArea of sap.m.Popover");

					// just check opening again without Promise
					oPopover._openContainerByTarget.reset();
					oPopover.openContainer(oContainer, true);
					assert.notOk(oPopover._openContainerByTarget.called, "_openContainerByTarget was not called.");

					oPopover.close();
					assert.ok(oPopover.handleClose.calledOnce, "handleClose called");
					oPopover.handleClose.restore();

					setTimeout(() => { // wait until closed
						assert.equal(iClosed, 1, "Closed event fired once");
						assert.notOk(oContainer.isOpen(), "sap.m.Popover is not open");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");
						oContent.onShow.restore();
						oContent.onHide.restore();
						oPopover._openContainerByTarget.restore();
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				oContent.onShow.restore();
				oContent.onHide.restore();
				oPopover._openContainerByTarget.restore();
				fnDone();
			});
		}

	});

	QUnit.test("open with footer toolbar", (assert) => {

		sinon.stub(oContent, "isFocusInHelp").returns(true); // test if initial focus is not set to field
		const oToolbar = new Toolbar("TB1");
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter() { return oToolbar; }
			}
		});

		let iOpened = 0;
		oPopover.attachEvent("opened", (oEvent) => {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.notOk(oContainer.getInitialFocus(), "initialFocus not set");
					assert.equal(oContainer._getAllContent()[0], oContentField, "Content of sap.m.Popover");
					assert.equal(oContainer.getFooter(), oToolbar, "footer");

					oPopover.close();
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				oToolbar.destroy();
				fnDone();
			});
		}

	});

	QUnit.test("open with footer content", (assert) => {

		const oIcon = new Icon("Icon1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter() { return oIcon; }
			}
		});

		let iOpened = 0;
		oPopover.attachEvent("opened", (oEvent) => {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
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
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				oIcon.destroy();
				fnDone();
			});
		}

	});

	QUnit.test("Consider canceled opening promise with async showTypeahead", (assert) => {

		const oIcon = new Icon("Icon1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		sinon.stub(oContent, "getContainerConfig").returns({
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter() { return oIcon; }
			}
		});
		sinon.spy(oPopover, "_openContainerByTarget");


		sinon.stub(ValueHelpDelegate, "showTypeahead").callsFake(() => {
			return new Promise((resolve) => {
				oPopover._cancelPromise("open");
				resolve(true);
			});
		});
		const oPromise = oPopover.open(Promise.resolve(), true);
		const fnDone = assert.async();
		assert.ok(oPromise instanceof Promise, "open returns promise");
		setTimeout(() => { // wait until open
			assert.notOk(oPopover._openContainerByTarget.called, "Popover will not be opened as promise was cancelled during showTypeahead");
			oPopover._openContainerByTarget.restore();
			ValueHelpDelegate.showTypeahead.restore();
			oIcon.destroy();
			fnDone();
		}, iPopoverDuration);
	});

	QUnit.test("removeVisualFocus", (assert) => {

		sinon.spy(oContent, "removeVisualFocus");
		oPopover.removeVisualFocus();
		assert.ok(oContent.removeVisualFocus.called, "removeVisualFocus of Content called");

	});

	QUnit.test("setVisualFocus", (assert) => {

		sinon.spy(oContent, "setVisualFocus");
		oPopover.setVisualFocus();
		assert.ok(oContent.setVisualFocus.called, "setVisualFocus of Content called");

	});

	QUnit.test("navigate", (assert) => {

		sinon.spy(oContent, "navigate");

		const oPromise = oPopover.navigate(1);
		assert.ok(oPromise instanceof Promise, "navigate returns promise");

		return oPromise?.then(() => {
			assert.ok(oContent.navigate.calledOnce, "navigate on Content called");
			assert.ok(oContent.navigate.calledWith(1), "navigate  on Content called with 1");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("getItemForValue", (assert) => {

		sinon.spy(oContent, "getItemForValue");

		const oConfig = {test: "x"};

		oPopover.getItemForValue(oConfig);
		assert.ok(oContent.getItemForValue.called, "getItemForValue of Content called");
		assert.ok(oContent.getItemForValue.calledWith(oConfig), "getItemForValue of Content called with configuration");

	});

	QUnit.test("isValidationSupported", (assert) => {

		sinon.stub(oContent, "isValidationSupported").returns(true);
		assert.ok(oPopover.isValidationSupported(), "isValidationSupported");
		assert.ok(oContent.isValidationSupported.called, "isValidationSupported of Content called");

	});

	QUnit.test("isTypeaheadSupported", (assert) => {

		let bSupported = oPopover.isTypeaheadSupported();
		assert.notOk(bSupported, "not supported if content not supports search");

		sinon.stub(oContent, "isSearchSupported").returns(true);
		bSupported = oPopover.isTypeaheadSupported();
		assert.ok(bSupported, "supported if content supports search");

	});

	QUnit.test("getUseAsValueHelp", (assert) => {

		oContent.getUseAsValueHelp = () => {
			return true;
		};
		sinon.spy(oContent, "getUseAsValueHelp");

		assert.ok(oPopover.getUseAsValueHelp(), "getUseAsValueHelp");
		assert.ok(oContent.getUseAsValueHelp.called, "getUseAsValueHelp of Content called");

	});

	QUnit.test("getValueHelpIcon", (assert) => {

		sinon.stub(oContent, "getValueHelpIcon").returns("sap-icon://sap-ui5");
		assert.equal(oPopover.getValueHelpIcon(), "sap-icon://sap-ui5", "icon");
		assert.ok(oContent.getValueHelpIcon.called, "getValueHelpIcon of Content called");

	});

	QUnit.test("getAriaAttributes", (assert) => {

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

		oContent.getUseAsValueHelp = () => {
			return true;
		};

		oCheckAttributes.role = "combobox";
		oAttributes = oPopover.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("shouldOpenOnFocus", async (assert) => {

		oPopover.setOpensOnFocus(true);
		let bShouldOpen = await oPopover.shouldOpenOnFocus();
		assert.ok(bShouldOpen, "shouldOpenOnFocus enabled by container property");

		oPopover.setOpensOnFocus(false);
		bShouldOpen = await oPopover.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "shouldOpenOnFocus disabled by container property");

	});

	QUnit.test("shouldOpenOnClick", async (assert) => {

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

	QUnit.test("shouldOpenOnNavigate", (assert) => {

		sinon.stub(oContent, "shouldOpenOnNavigate").returns(true);
		assert.ok(oPopover.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.ok(oContent.shouldOpenOnNavigate.called, "shouldOpenOnNavigate of Content called");

	});

	QUnit.test("isNavigationEnabled", (assert) => {

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

	QUnit.test("isFocusInHelp", (assert) => {

		sinon.stub(oContent, "isFocusInHelp").returns(true);
		assert.ok(oPopover.isFocusInHelp(), "isFocusInHelp");
		assert.ok(oContent.isFocusInHelp.called, "isFocusInHelp of Content called");

	});

	QUnit.test("isMultiSelect", (assert) => {

		sinon.stub(oContent, "isMultiSelect").returns(true);
		assert.ok(oPopover.isMultiSelect(), "isMultiSelect");
		assert.ok(oContent.isMultiSelect.called, "isMultiSelect of Content called");

	});

	QUnit.test("confirmed event", (assert) => {

		sinon.stub(oPopover, "isSingleSelect").returns(true);
		let iConfirm = 0;
		let bClose = false;
		oPopover.attachEvent("confirm", (oEvent) => {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		const oPromise = oPopover.open(Promise.resolve());
		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					oContent.fireConfirm();
					assert.equal(iConfirm, 1, "Confirm event fired");
					assert.ok(bClose, "close parameter");

					fnDone();
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("cancel event", (assert) => {

		sinon.stub(oPopover, "isSingleSelect").returns(true);
		let iCancel = 0;
		oPopover.attachEvent("cancel", (oEvent) => {
			iCancel++;
		});

		const oPromise = oPopover.open(Promise.resolve());
		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					oContent.fireCancel();
					assert.equal(iCancel, 1, "Cancel event fired if content cancelled");

					fnDone();
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("setHighlightId", (assert) => {
		sinon.spy(oContent, "setHighlightId");
		oPopover.setHighlightId("x");
		assert.ok(oContent.setHighlightId.calledWith("x"), "Container setHighlightId calls Content.setHighlightId with argument");
	});


	QUnit.module("popover valuehelp assigned to Input ", {
		beforeEach: async () => {
			oValueHelpConfig = {maxConditions: 1};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				filterValue: "X",
				conditions: [Condition.createItemCondition("X", "Text")]
			});

			oContentField = new Input("I1");
			oContent = new Content("Content1", {displayContent: oContentField});
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

	QUnit.test("open without ValueState", (assert) => {

		let iOpened = 0;
		oPopover.attachEvent("opened", (oEvent) => {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.ok(oContainer.getCustomHeader().isA("sap.m.ValueStateHeader"), "custom header content is sap.m.ValueStateHeader");

					assert.notOk(oContainer.getCustomHeader().getVisible(), "CustomHeader ValueStateHeader is NOT visible");

					oPopover.close();
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("open with ValueState", (assert) => {
		oField.setValueState("Error");
		oField.setValueStateText("My Error message");

		let iOpened = 0;
		oPopover.attachEvent("opened", (oEvent) => {
			iOpened++;
		});
		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oPopover.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Popover"), "Container is sap.m.Popover");
					assert.ok(oContainer.isOpen(), "sap.m.Popover is open");
					assert.ok(oContainer.getCustomHeader().isA("sap.m.ValueStateHeader"), "custom header content is sap.m.ValueStateHeader");

					assert.equal(oContainer.getCustomHeader().getValueState(), "Error", "CustomHeader ValueState correct");
					assert.equal(oContainer.getCustomHeader().getText(), "My Error message", "CustomHeader Text correct");
					assert.ok(oContainer.getCustomHeader().getVisible(), "CustomHeader ValueStateHeader is visible");

					oPopover.close();
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("_disableFollowOfTemporarily", (assert) => {
		const fnDone = assert.async();
		sinon.spy(oPopover, "_disableFollowOfTemporarily");

		return oPopover.open(Promise.resolve()).then(() => {
			setTimeout(() => { // wait until open
				const oMPopover = oPopover.getAggregation("_container");
				sinon.spy(oMPopover, "setFollowOf");

				oContent.fireConfirm();
				assert.ok(oPopover._disableFollowOfTemporarily.calledOnce, "Popover disables the followOf feature temporarily on selection");
				assert.ok(oMPopover.setFollowOf.calledWith(false), "MPopover followOf was disabled");

				oPopover._disableFollowOfTemporarily.reset();
				oMPopover.setFollowOf.reset();
				oContent.fireConfirm(); // second try to test it is enabled only once again
				assert.ok(oPopover._disableFollowOfTemporarily.calledOnce, "Popover disables the followOf feature temporarily on selection");
				assert.ok(oMPopover.setFollowOf.calledWith(false), "MPopover followOf was disabled");

				oPopover._disableFollowOfTemporarily.reset();
				oMPopover.setFollowOf.reset();
				oContent.fireConfirm({close: true});
				assert.notOk(oPopover._disableFollowOfTemporarily.called, "Popover does not disable the followOf feature temporarily");

				setTimeout(() => {
					assert.ok(oMPopover.setFollowOf.calledOnceWith(true), "MPopover followOf was enabled again");
					oPopover.close();
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				},300);
			}, iPopoverDuration);
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
			fnDone();
		});
	});

	// TODO: Test Operator determination on Content
	// TODO: Test condition creation on Content

	let oDeviceStub;
	QUnit.module("Phone support", {
		beforeEach: async () => {
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
			oContent = new Content("Content1", {displayContent: oContentField});
			sinon.stub(oContent, "getContent").returns(oContentField);

			oPopover = new Popover("P1", {
				content: oContent
			}).setModel(oModel, "$valueHelp");
			sinon.stub(oPopover, "getParent").returns(oValueHelp);
			oField = new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oField.getFocusElementForValueHelp = (bTypeahed) => { // fake
				return oField;
			};
			oField.getPlaceholder = () => "my Placeholder"; // fake Placeholder
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach() {
			_teardown();
			oDeviceStub.restore();
		}
	});

	QUnit.test("getContainerControl (multi-select)", (assert) => {

		oPopover.setTitle("Test");

		const oContainer = oPopover.getContainerControl();

		return oContainer?.then((oContainer) => {
			assert.ok(oContainer, "Container returned");
			assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
			assert.equal(oContainer.getStretch(), true, "stretch");
			assert.equal(oContainer.getHorizontalScrolling(), false, "horizontalScrolling");

			const oCloseButton = oContainer.getBeginButton();
			assert.ok(oCloseButton, "close-button exist");
			assert.ok(oCloseButton?.isA("sap.m.Button"), "close-button is Button");

			const oCustomHeaderBar = oContainer.getCustomHeader();
			assert.ok(oCustomHeaderBar, "header-bar exist");
			assert.ok(oCustomHeaderBar?.isA("sap.m.Bar"), "header-bar is Bar");
			const aContentMiddle = oCustomHeaderBar.getContentMiddle();
			assert.equal(aContentMiddle?.length, 1, "ContentMiddle returned");
			const oTitle = aContentMiddle?.[0];
			assert.ok(oTitle, "title exist");
			assert.ok(oTitle?.isA("sap.m.Title"), "title is Title");
			assert.equal(oTitle?.getText(), "Test", "Title text");
			assert.equal(oTitle?.getLevel(), "H1", "Title level");
			const aContentRight = oCustomHeaderBar.getContentRight();
			assert.equal(aContentRight?.length, 1, "ContentRight returned");
			const oCancelButton = aContentRight?.[0];
			assert.ok(oCancelButton, "cancel-button exist");
			assert.ok(oCancelButton?.isA("sap.m.Button"), "cancel-button is Button");
			assert.equal(oCancelButton?.getIcon(), IconPool.getIconURI("decline"), "cancel-button is Icon");

			const oSubHeaderBar = oContainer.getSubHeader();
			assert.ok(oSubHeaderBar, "subHeader-bar exist");
			assert.ok(oSubHeaderBar?.isA("sap.m.Toolbar"), "subHeader-bar is Toolbar");
			const aSubHeaderContent = oSubHeaderBar?.getContent();
			assert.equal(aSubHeaderContent?.length, 2, "SubHeaderContent returned");
			const oInput = aSubHeaderContent?.[0];
			assert.ok(oInput, "Input exist");
			assert.ok(oInput?.isA("sap.m.Input"), "Input is Input");
			assert.notOk(oInput?.getValue(), "Input value");
			assert.equal(oInput?.getWidth(), "100%", "Input width");
			assert.equal(oInput?.getPlaceholder(), "my Placeholder", "Input Placeholder");
			assert.equal(oInput?.getShowValueStateMessage(), false, "Input showValueStateMessage");
			assert.equal(oInput?.getShowValueHelp(), false, "Input showValueHelp");
			assert.equal(oContainer.getInitialFocus(), oInput?.getId(), "initial focus");
			const oShowConditionsButton = aSubHeaderContent?.[1];
			assert.ok(oShowConditionsButton, "show-conditions-button exist");
			assert.ok(oShowConditionsButton?.isA("sap.m.ToggleButton"), "show-conditions-button is ToggleButton");
			assert.equal(oShowConditionsButton?.getIcon(), IconPool.getIconURI("multiselect-all"), "show-conditions-button Icon");

			const aDialogContent = oContainer.getContent();
			assert.equal(aDialogContent?.length, 2, "Dialog content");
			const oValueStateHeader = aDialogContent?.[0];
			assert.ok(oValueStateHeader?.isA("sap.m.ValueStateHeader"), "ValueStateHeader is first content");
			const oScrollContainer = aDialogContent?.[1];
			assert.ok(oScrollContainer?.isA("sap.m.ScrollContainer"), "ScrollContainer is second content");
			assert.equal(oPopover.getScrollDelegate(), oScrollContainer?.getScrollDelegate(), "ScrollDelegate of ScrollContainer returned");

			// call again
			oContainer = oPopover.getContainerControl();
			assert.ok(oContainer.isA("sap.m.Dialog"), "sap.m.Dialog directly returned on second call");
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
		});

	});

	QUnit.test("getContainerControl (single-select)", (assert) => {

		oValueHelpConfig.maxConditions = 1;
		oPopover.setTitle("Test");

		sinon.stub(oPopover, "hasDialog").returns(true); // to enable valueHelp icon

		const oContainer = oPopover.getContainerControl();

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then((oContainer) => {
				setTimeout(() => { // as setting value on input might be async
					assert.ok(oContainer, "Container returned");
					assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
					assert.equal(oContainer.getStretch(), true, "stretch");
					assert.equal(oContainer.getHorizontalScrolling(), false, "horizontalScrolling");

					const oCloseButton = oContainer.getBeginButton();
					assert.ok(oCloseButton?.isA("sap.m.Button"), "close-button is Button");

					const oCustomHeaderBar = oContainer.getCustomHeader();
					assert.ok(oCustomHeaderBar?.isA("sap.m.Bar"), "header-bar is Bar");
					const aContentMiddle = oCustomHeaderBar?.getContentMiddle();
					assert.equal(aContentMiddle?.length, 1, "ContentMiddle returned");
					const oTitle = aContentMiddle?.[0];
					assert.ok(oTitle?.isA("sap.m.Title"), "title is Title");
					assert.equal(oTitle?.getText(), "Test", "Title text");
					assert.equal(oTitle?.getLevel(), "H1", "Title level");
					const aContentRight = oCustomHeaderBar?.getContentRight();
					assert.equal(aContentRight?.length, 1, "ContentRight returned");
					const oCancelButton = aContentRight?.[0];
					assert.ok(oCancelButton?.isA("sap.m.Button"), "cancel-button is Button");
					assert.equal(oCancelButton?.getIcon(), IconPool.getIconURI("decline"), "cancel-button is Icon");

					const oSubHeaderBar = oContainer.getSubHeader();
					assert.ok(oSubHeaderBar?.isA("sap.m.Toolbar"), "subHeader-bar is Toolbar");
					const aSubHeaderContent = oSubHeaderBar?.getContent();
					assert.equal(aSubHeaderContent?.length, 1, "SubHeaderContent returned");
					const oInput = aSubHeaderContent?.[0];
					assert.ok(oInput, "Input exist");
					assert.ok(oInput?.isA("sap.m.Input"), "Input is Input");
					assert.equal(oInput?.getValue(), "X", "Input value");
					assert.equal(oInput?.getWidth(), "100%", "Input width");
					assert.equal(oInput?.getPlaceholder(), "my Placeholder", "Input Placeholder");
					assert.equal(oInput?.getShowValueStateMessage(), false, "Input showValueStateMessage");
					assert.equal(oInput?.getShowValueHelp(), true, "Input showValueHelp");
					assert.equal(oContainer.getInitialFocus(), oInput?.getId(), "initial focus");

					const aDialogContent = oContainer.getContent();
					assert.equal(aDialogContent?.length, 2, "Dialog content");
					const oValueStateHeader = aDialogContent?.[0];
					assert.ok(oValueStateHeader?.isA("sap.m.ValueStateHeader"), "ValueStateHeader is first content");
					assert.notOk(oValueStateHeader?.getVisible(), "ValueStateHeader not visible");
					const oScrollContainer = aDialogContent?.[1];
					assert.ok(oScrollContainer?.isA("sap.m.ScrollContainer"), "ScrollContainer is second content");

					fnDone();
				}, 0);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("open / close", (assert) => {

		let iOpened = 0;
		let sItemId;
		let iItems;
		oPopover.attachEvent("opened", (oEvent) => {
			iOpened++;
			sItemId = oEvent.getParameter("itemId");
			iItems = oEvent.getParameter("items");
		});
		let iClosed = 0;
		oPopover.attachEvent("closed", (oEvent) => {
			iClosed++;
		});

		sinon.stub(oContent, "onShow").returns({itemId: "MyItem", items: 3});
		sinon.spy(oContent, "onHide");
		sinon.spy(oPopover, "_openContainerByTarget");
		oContent.getContentHeight = () => {
			return 100;
		};
		const oToolbar = new Toolbar("TB1");
		sinon.stub(oContent, "getContainerConfig").returns({ // test Footer too
			'sap.ui.mdc.valuehelp.Popover': {
				getFooter() { return oToolbar; }
			}
		});

		const oPromise = oPopover.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					assert.equal(sItemId, "MyItem", "Opened event returns itemId");
					assert.equal(iItems, 3, "Opened event returns items");
					const oContainer = oPopover.getAggregation("_container");
					assert.notOk(oPopover._openContainerByTarget.called, "_openContainerByTarget was not called.");
					assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
					assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
					const aDialogContent = oContainer.getContent();
					const oScrollContainer = aDialogContent?.[1];
					const oShownContent = oScrollContainer?.getContent()[0];
					assert.ok(oShownContent?.isA("sap.m.List"), "Tokenlist shown");
					assert.equal(oShownContent?.getMode(), "Delete", "List mode");
					const aItems = oShownContent?.getItems();
					assert.equal(aItems?.length, 1, "one item");
					assert.equal(aItems?.[0].getTitle(), "X", "Text of item");
					// assert.ok(aItems?.[0].getSelected(), "Item is selected");
					assert.equal(aItems?.[0].getType(), "Active", "Type of item");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oPopover.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Dialog returned");
					assert.equal(oPopover.getUIAreaForContent(), oContainer.getUIArea(), "getUIAreaForContent returns UiArea of sap.m.Dialog");
					const oCloseButton = oContainer.getBeginButton();
					assert.notOk(oCloseButton, "close-button is not assigned as beginButton");
					assert.equal(oContainer.getFooter(), oToolbar, "footer");
					const aFooterContent = oToolbar.getContent();
					assert.equal(aFooterContent.length, 1, "One control inside Toolbar");
					assert.ok(aFooterContent[0].isA("sap.m.Button"), "Toolbar content is close-button");

					oPopover.close();
					setTimeout(() => { // wait until closed
						assert.equal(iClosed, 1, "Closed event fired once");
						assert.notOk(oContainer.isOpen(), "sap.m.Dialog is not open");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");
						oContent.onShow.restore();
						oContent.onHide.restore();
						oPopover._openContainerByTarget.restore();
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				oContent.onShow.restore();
				oContent.onHide.restore();
				oPopover._openContainerByTarget.restore();
				fnDone();
			});
		}

	});

	QUnit.test("Cancel Button", (assert) => {

		let iCancel = 0;
		oPopover.attachEvent("cancel", (oEvent) => {
			iCancel++;
		});
		sinon.spy(oPopover, "handleCanceled"); // add spy before attaching event to content

		oContent.getContentHeight = () => {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oCustomHeaderBar = oContainer.getCustomHeader();
					const aContentRight = oCustomHeaderBar.getContentRight();
					const oCancelButton = aContentRight?.[0];
					oCancelButton.firePress(); // simulate press
					assert.equal(iCancel, 1, "Cancel event fired once");

					iCancel = 0;
					oContent.fireCancel();
					assert.equal(iCancel, 0, "Cancel event not fired if content cancelled");
					assert.ok(oPopover.handleCanceled.calledOnce, "Popover handleCanceled called");

					oPopover.close();
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("Input interaction (multi-select)", (assert) => {

		let iSelect = 0;
		let sSelectType;
		let aSelectConditions;
		oPopover.attachEvent("select", (oEvent) => {
			iSelect++;
			sSelectType = oEvent.getParameter("type");
			aSelectConditions = oEvent.getParameter("conditions");
		});
		let iConfirm = 0;
		let bConfirmClose;
		oPopover.attachEvent("confirm", (oEvent) => {
			iConfirm++;
			bConfirmClose = oEvent.getParameter("close");
		});

		oContent.getContentHeight = () => {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oSubHeaderBar = oContainer.getSubHeader();
					const aSubHeaderContent = oSubHeaderBar.getContent();
					const oInput = aSubHeaderContent[0];
					const aDialogContent = oContainer.getContent();
					const oValueStateHeader = aDialogContent?.[0];

					oInput._$input.val("A");
					oInput.fireLiveChange({value: "A"});
					assert.equal(oValueHelp.getFilterValue(), "A", "FilterValue set");
					assert.equal(iSelect, 0, "Select event not fired");

					oInput.fireSubmit({value: "A"});
					setTimeout(() => { // as parsing might be async
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
						setTimeout(() => { // as parsing might be async
							assert.equal(iSelect, 0, "Select event not fired");
							assert.equal(iConfirm, 0, "Confirm event not fired");
							assert.equal(oInput.getValueState(), "Error", "ValueState on Input");
							assert.equal(oInput.getValueStateText(), "MyError", "ValueStateText on Input");
							assert.equal(oValueStateHeader.getValueState(), "Error", "ValueState on ValueStateHeader");
							assert.equal(oValueStateHeader.getText(), "MyError", "Text on ValueStateHeader");
							assert.ok(oValueStateHeader.getVisible(), "ValueStateHeader visible");

							oPopover.close();
							setTimeout(() => { // wait until closed
								fnDone();
							}, iPopoverDuration);
						}, 0);
					}, 0);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("Input interaction (single-select)", (assert) => {

		oValueHelpConfig.maxConditions = 1;
		sinon.stub(oPopover, "hasDialog").returns(true); // to enable valueHelp icon

		let iSelect = 0;
		let sSelectType;
		let aSelectConditions;
		oPopover.attachEvent("select", (oEvent) => {
			iSelect++;
			sSelectType = oEvent.getParameter("type");
			aSelectConditions = oEvent.getParameter("conditions");
		});
		let iConfirm = 0;
		let bConfirmClose;
		oPopover.attachEvent("confirm", (oEvent) => {
			iConfirm++;
			bConfirmClose = oEvent.getParameter("close");
		});
		let iRequestSwitchToDialog = 0;
		oPopover.attachEvent("requestSwitchToDialog", (oEvent) => {
			iRequestSwitchToDialog++;
		});

		oContent.getContentHeight = () => {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oSubHeaderBar = oContainer.getSubHeader();
					const aSubHeaderContent = oSubHeaderBar.getContent();
					const oInput = aSubHeaderContent[0];
					oInput._$input.val("A");
					oInput.fireSubmit({value: "A"});
					setTimeout(() => { // as parsing might be async
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
						setTimeout(() => { // wait until closed
							fnDone();
						}, iPopoverDuration);
					}, 0);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("OK Button", (assert) => {

		oContent.getContentHeight = () => {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
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
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("Token List", (assert) => {

		let iSelect = 0;
		let sSelectType;
		let aSelectConditions;
		oPopover.attachEvent("select", (oEvent) => {
			iSelect++;
			sSelectType = oEvent.getParameter("type");
			aSelectConditions = oEvent.getParameter("conditions");
		});

		oContent.getContentHeight = () => {
			return 100;
		};

		const oPromise = oPopover.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(() => {
				setTimeout(() => { // wait until open
					const oContainer = oPopover.getAggregation("_container");
					const oSubHeaderBar = oContainer.getSubHeader();
					const aSubHeaderContent = oSubHeaderBar.getContent();
					const oShowConditionsButton = aSubHeaderContent[1];
					const aDialogContent = oContainer.getContent();
					const oScrollContainer = aDialogContent?.[1];

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
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				}, iPopoverDuration);
			}).catch((oError) => {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("shouldOpenOnClick", async (assert) => {

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

	QUnit.test("isTypeaheadSupported", (assert) => {

		sinon.stub(oContent, "isSearchSupported").returns(true);
		sinon.stub(oPopover, "isDialog").returns(false);

		assert.ok(oPopover.isTypeaheadSupported(), "for Multi-selection take configuration of content");

		oPopover.isDialog.returns(true);
		assert.notOk(oPopover.isTypeaheadSupported(), "for Multi-selection not supported if used as Dialog");

		oValueHelpConfig.maxConditions = 1;
		assert.notOk(oPopover.isTypeaheadSupported(), "for Single-selection not supported");

	});

	QUnit.test("_disableFollowOfTemporarily", (assert) => { // just to check of doing nothing as Dialog don't has this feature
		const fnDone = assert.async();
		sinon.stub(oPopover, "isSingleSelect").returns(true);
		sinon.spy(oPopover, "_disableFollowOfTemporarily");

		return oPopover.open(Promise.resolve()).then(() => {
			setTimeout(() => { // wait until open
				oContent.fireConfirm();
				assert.ok(oPopover._disableFollowOfTemporarily.called, "Popover disables the followOf feature temporarily on selection");

				setTimeout(() => {
					oPopover.close();
					setTimeout(() => { // wait until closed
						fnDone();
					}, iPopoverDuration);
				},300);
			}, iPopoverDuration);
		}).catch((oError) => {
			assert.notOk(true, "Promise Catch called");
			fnDone();
		});
	});

});
