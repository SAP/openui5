// Use this test page to test the API and features of the Dialog container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Lib",
	"sap/ui/thirdparty/jquery",
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/Dialog",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/ValueHelpSelectionType",
	"sap/ui/mdc/enums/FieldDisplay",
	"sap/ui/mdc/enums/OperatorName",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/json/JSONListBinding",
	"sap/ui/model/type/String",
	"sap/ui/Device",
	"sap/base/strings/formatMessage",
	"sap/base/util/merge",
	"sap/m/library",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	ControlBehavior,
	Library,
	jQuery,
	ValueHelpDelegate,
	Dialog,
	Content,
	Condition,
	ValueHelpSelectionType,
	FieldDisplay,
	OperatorName,
	Icon,
	JSONModel,
	JSONListBinding,
	StringType,
	Device,
	formatMessage,
	merge,
	mLibrary,
	nextUIUpdate
) {
	"use strict";

	const oResourceBundle = Library.getResourceBundleFor("sap.ui.mdc");

	JSONListBinding.prototype.__getContexts = JSONListBinding.prototype._getContexts;
	JSONListBinding.prototype._getContexts = function(iStartIndex, iLength) { // fake ManagedObjectModel functionality
		if (iStartIndex < 0) {
			iStartIndex = 0;
		}
		return this.__getContexts(iStartIndex, iLength);
	};

	let oDialog;
	const iDialogDuration = ControlBehavior.getAnimationMode() === "none" ? 15 : 500;

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
			return null;
		},
		getControlDelegate: function () {
			return ValueHelpDelegate;
		},
		awaitControlDelegate: function () {
			return Promise.resolve();
		},
		bDelegateInitialized: true,
		getParent: function() {
			return null;
		},
		invalidate: function() {
			return null;
		},
		getId: function() {
			return "VH";
		},
		_retrievePromise: function () {
			return Promise.resolve();
		}
	};
	let oValueHelpConfig;
	let oModel; // to fake ManagedObjectModel of ValueHelp
	let oType;
	let oAdditionalType;

	/* use dummy control to simulate Field */

//	var oClock;

	const _teardown = function() {
//		if (oClock) {
//			oClock.restore();
//			oClock = undefined;
//		}
		oContent = undefined;
		oDialog.destroy();
		oDialog = undefined;
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
		if (oType) {
			oType.destroy();
			oType = undefined;
		}
		if (oAdditionalType) {
			oAdditionalType.destroy();
			oAdditionalType = undefined;
		}
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oDialog = new Dialog("D1", {
			});
		},
		afterEach: _teardown
	});

	QUnit.test("default values", async function(assert) {

		assert.equal(oDialog.getMaxConditions(), undefined, "getMaxConditions");
		assert.ok(oDialog.isMultiSelect(), "isMultiSelect");
		assert.notOk(oDialog.isSingleSelect(), "isSingleSelect");
		assert.notOk(oDialog.getUseAsValueHelp(), "getUseAsValueHelp");
		let bShouldOpen = await oDialog.shouldOpenOnClick();
		assert.notOk(bShouldOpen, "shouldOpenOnClick");
		bShouldOpen = await oDialog.shouldOpenOnFocus();
		assert.notOk(bShouldOpen, "shouldOpenOnFocus");
		assert.notOk(oDialog.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.ok(oDialog.isFocusInHelp(), "isFocusInHelp");
		assert.equal(oDialog.getValueHelpIcon(), "sap-icon://value-help", "getValueHelpIcon");
		sinon.stub(oDialog, "getUIArea").returns("X"); // to test result
		assert.equal(oDialog.getUIAreaForContent(), "X", "getUIAreaForContent returns own UiArea");
		oDialog.getUIArea.restore();

	});

	QUnit.test("getContainerControl", function(assert) {

		oDialog.setTitle("Test");
		const oContainer = oDialog.getContainerControl();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.ok(oContainer, "Container returned");
				assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
				assert.equal(oContainer.getContentHeight(), "700px", "contentHeight");
				assert.equal(oContainer.getContentWidth(), "1080px", "contentWidth");
				assert.notOk(oContainer.getHorizontalScrolling(), "horizontalScrolling");
				assert.notOk(oContainer.getVerticalScrolling(), "verticalScrolling");
				assert.equal(oContainer.getTitle(), "Test", "title");
				assert.equal(oContainer.getStretch(), Device.system.phone, "stretch");
				assert.ok(oContainer.getResizable(), "resizable");
				assert.ok(oContainer.getDraggable(), "draggable");
				assert.notOk(oContainer.isPopupAdaptationAllowed(), "isPopupAdaptationAllowed");

				const aButtons = oContainer.getButtons();
				assert.equal(aButtons.length, 2, "Buttons added");
				assert.equal(aButtons[0].getText(), oResourceBundle.getText("valuehelp.OK"), "Button text");
				assert.equal(aButtons[1].getText(), oResourceBundle.getText("valuehelp.CANCEL"), "Button text");

				assert.ok(oContainer.getModel("$help").isA("sap.ui.model.base.ManagedObjectModel"), "ManagedObjectModel assigned");

				const aDialogContent = oContainer.getContent();
				assert.equal(aDialogContent.length, 1, "Dialog content length");
				assert.ok(aDialogContent[0].isA("sap.m.VBox"), "VBox is inside Dialog");

				// call again
				oContainer = oDialog.getContainerControl();
				assert.ok(oContainer.isA("sap.m.Dialog"), "sap.m.Dialog directly returned on second call");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("placeContent", function(assert) {

		oDialog.setTitle("Test");

		const oContainer = oDialog.getContainerControl().then(function (oCont) {
			return oDialog.placeContent(oCont);
		});

		return oContainer.then(function (oContainer) {
			const aDialogContent = oContainer.getContent();
			// No content
			assert.notOk(aDialogContent[0].getItems()[0], "No content wrapper created");


			const oFirstContent = new Content("Content1", {title: "Content title", shortTitle: "ShortTitle", tokenizerTitle: "TokenizerTitle", displayContent: new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false})});
			oDialog.addContent(oFirstContent);

			return oDialog.placeContent(oContainer).then(function () {
				// Singular content
				const oDialogTab = aDialogContent[0].getItems()[0];
				assert.ok(oDialogTab.isA("sap.ui.mdc.valuehelp.base.DialogTab"), "DialogTab is first VBox item");

				const oSecondContent = new Content("Content2", {title: "Content title", shortTitle: "ShortTitle", tokenizerTitle: "TokenizerTitle", displayContent: new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false})});
				oDialog.addContent(oSecondContent);

				return oDialog.placeContent(oContainer).then(function () {
					// Multiple contents
					const oIconTabBar = aDialogContent[0].getItems()[0];
					assert.ok(oIconTabBar.isA("sap.m.IconTabBar"), "IconTabBar is first VBox item");
					assert.notOk(oIconTabBar.getExpandable(), "IconTabBar expandable");
					assert.notOk(oIconTabBar.getUpperCase(), "IconTabBar upperCase");
					assert.ok(oIconTabBar.getStretchContentHeight(), "IconTabBar stretchContentHeight");
					assert.equal(oIconTabBar.getHeaderMode(), mLibrary.IconTabHeaderMode.Inline, "IconTabBar headerMode");
					assert.equal(oIconTabBar.getSelectedKey(), "Content1", "IconTabBar selectedKey");
					assert.ok(oIconTabBar.getModel("$help").isA("sap.ui.model.base.ManagedObjectModel"), "ManagedObjectModel assigned");
					assert.equal(oIconTabBar.getItems().length, 2, "2 items assigned");
				});
			});
		});

	});

	QUnit.test("providesScrolling", function(assert) {

		const bScrolling = oDialog.providesScrolling();
		assert.notOk(bScrolling, "provides no scrolling");

	});

	QUnit.module("assigned to ValueHelp", {
		beforeEach: async function() {
			oType = new StringType();
			oAdditionalType = new StringType();

			oValueHelpConfig = {
				maxConditions: -1,
				dataType: oType,
				additionalDataType: oAdditionalType,
				operators: [OperatorName.EQ, OperatorName.BT],
				display: FieldDisplay.Description
			};
			oModel = new JSONModel({
				_config: oValueHelpConfig,
				filterValue: "X",
				conditions: [Condition.createItemCondition("X", "Text")]
			});

			oContentField = new Icon("I1", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oContent = new Content("Content1", {title: "Content title", shortTitle: "ShortTitle", tokenizerTitle: "TokenizerTitle"});
			sinon.stub(oContent, "getContent").returns(oContentField);
			oContent.setAggregation("displayContent", oContentField);
			sinon.stub(oContent, "getCount").callsFake(function (aConditions) { return aConditions.length;});

			oDialog = new Dialog("D1", {
				content: [oContent]
			}).setModel(oModel, "$valueHelp");
			sinon.stub(oDialog, "getParent").returns(oValueHelp);
			oField = new Icon("I2", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
			oField.getFocusElementForValueHelp = function(bTypeahed) { // fake
				return oField;
			};
			oField.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: _teardown
	});

	QUnit.test("getContainerControl with single content for multi-select", function(assert) {

		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		const oContainer = oDialog.getContainerControl().then(function (oCont) {
			return oDialog.placeContent(oCont);
		});

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
				const aButtons = oContainer.getButtons();
				assert.ok(aButtons[0].getVisible(), "OK-Button visible");

				const aDialogContent = oContainer.getContent();
				let aItems = aDialogContent[0].getItems();
				const oDialogTab = aItems[0];
				const oPanel = aItems[1];
				assert.equal(oDialogTab.getContent(), oContent.getDisplayContent(), "Content control");

				assert.ok(oPanel.isA("sap.m.Panel"), "Panel is second VBox item");
				assert.ok(oPanel.getVisible, "Panel is visible");
				assert.equal(oPanel.getHeaderText(), "TokenizerTitle", "Panel headerText");
				assert.equal(oPanel.getBackgroundDesign(), mLibrary.BackgroundDesign.Transparent, "Panel backgroundDesign");
				assert.ok(oPanel.getExpanded(), "Panel expanded");
				assert.notOk(oPanel.getExpandable(), "Panel expandable");
				const aPanelContent = oPanel.getContent();
				assert.equal(aPanelContent.length, 1, "Panel content length");
				assert.ok(aPanelContent[0].isA("sap.m.HBox"), "HBox is inside Panel");
				aItems = aPanelContent[0].getItems();
				assert.equal(aItems.length, 2, "HBox content length");
				const oTokenMultiInput = aItems[0];
				const oBindingInfo = oTokenMultiInput.getBindingInfo("tokens");
				assert.equal(oBindingInfo.length, 50, "Tokens - Bindinginfo length");
				assert.equal(oBindingInfo.startIndex, -50, "Tokens - Bindinginfo startIndex");
				const aTokens = oTokenMultiInput.getTokens();
				assert.equal(aTokens.length, 1, "number of tokens");
				assert.equal(aTokens[0].getText(), "Text", "Token text");
				const oBinding = aTokens[0].getBinding("text");
				const oBindingType = oBinding.getType();
				assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
				const oFormatOptions = {
					maxConditions: -1, // as for tokens there should not be a limit on type side
					valueType: oType,
					additionalValueType: oAdditionalType,
					operators: [OperatorName.EQ, OperatorName.BT],
					display: FieldDisplay.Description,
					valueHelpID: "VH",
					control: oField,
					delegate: undefined,
					delegateName: undefined,
					payload: undefined,
					convertWhitespaces: true
				};
				assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");
				const oButton = aItems[1];
				assert.ok(oTokenMultiInput.isA("sap.m.MultiInput"), "MultiInput is first HBox item");
				assert.ok(oButton.isA("sap.m.Button"), "Button is second HBox item");
				assert.equal(oButton.getType(), mLibrary.ButtonType.Transparent, "Button type");
				assert.equal(oButton.getIcon(), "sap-icon://decline", "Button icon");
				assert.equal(oButton.getTooltip(), oResourceBundle.getText("valuehelp.REMOVEALLTOKEN"), "Button tooltip");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("getContainerControl with multiple content for multi-select", function(assert) {

		const oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent2 = new Content("Content2", {title: "Content title2", shortTitle: "ShortTitle2", tokenizerTitle: "TokenizerTitle2"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake(function (aConditions) { return aConditions.length;});

		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		sinon.spy(oContent2,"getFormattedTitle");
		oDialog.addContent(oContent2);
		const oContainer = oDialog.getContainerControl().then(function (oCont) {
			return oDialog.placeContent(oCont);
		});

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.equal(oContainer.getTitle(), "Test", "sap.m.Dilaog title");
				const aButtons = oContainer.getButtons();
				assert.ok(aButtons[0].getVisible(), "OK-Button visible");

				const aDialogContent = oContainer.getContent();
				let aItems = aDialogContent[0].getItems();
				const oIconTabBar = aItems[0];
				const oPanel = aItems[1];
				//assert.notOk(oIconTabBar.getSelectedKey(), "IconTabBar selectedKey"); // as only set on opening
				assert.equal(oIconTabBar.getItems().length, 2, "items assigned");
				const oIconTabHeader = oIconTabBar._getIconTabHeader();
				assert.ok(oIconTabHeader.getVisible(), "IconTabHeader visible");
				let oIconTabFilter = oIconTabBar.getItems()[0];
				assert.equal(oIconTabFilter.getKey(), "Content1", "oIconTabFilter key");
				let aIconTabContent = oIconTabFilter.getContent();
				assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
				assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
				assert.equal(aIconTabContent[0].getContent(), oContentField, "Content control");
				assert.equal(oIconTabFilter.getText(), "Content title", "IconTabFilter text");
				assert.ok(oContent.getFormattedTitle.calledWith(1), "Content getFormattedTitle called with Count");

				// second content
				oIconTabFilter = oIconTabBar.getItems()[1];
				assert.equal(oIconTabFilter.getKey(), "Content2", "oIconTabFilter key");
				aIconTabContent = oIconTabFilter.getContent();
				assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
				assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
				assert.equal(aIconTabContent[0].getContent(), oContentField2, "Content control");
				assert.equal(oIconTabFilter.getText(), "Content title2", "IconTabFilter text");
				assert.ok(oContent2.getFormattedTitle.calledWith(1), "Content2 getFormattedTitle called with Count");

				assert.ok(oPanel.isA("sap.m.Panel"), "Panel is second VBox item");
				assert.ok(oPanel.getVisible, "Panel is visible");
				assert.equal(oPanel.getHeaderText(), formatMessage(oResourceBundle.getText("valuehelp.TOKENIZERTITLE"), 1), "Panel headerText");
				assert.equal(oPanel.getBackgroundDesign(), mLibrary.BackgroundDesign.Transparent, "Panel backgroundDesign");
				assert.ok(oPanel.getExpanded(), "Panel expanded");
				assert.notOk(oPanel.getExpandable(), "Panel expandable");
				const aPanelContent = oPanel.getContent();
				assert.equal(aPanelContent.length, 1, "Panel content length");
				assert.ok(aPanelContent[0].isA("sap.m.HBox"), "HBox is inside Panel");
				aItems = aPanelContent[0].getItems();
				assert.equal(aItems.length, 2, "HBox content length");
				const oTokenMultiInput = aItems[0];
				const aTokens = oTokenMultiInput.getTokens();
				assert.equal(aTokens.length, 1, "number of tokens");
				assert.equal(aTokens[0].getText(), "Text", "Token text");
				const oBinding = aTokens[0].getBinding("text");
				const oBindingType = oBinding.getType();
				assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
				const oFormatOptions = {
					maxConditions: -1, // as for tokens there should not be a limit on type side
					valueType: oType,
					additionalValueType: oAdditionalType,
					operators: [OperatorName.EQ, OperatorName.BT],
					display: FieldDisplay.Description,
					valueHelpID: "VH",
					control: oField,
					delegate: undefined,
					delegateName: undefined,
					payload: undefined,
					convertWhitespaces: true
				};
				assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");
				const oButton = aItems[1];
				assert.ok(oTokenMultiInput.isA("sap.m.MultiInput"), "Tokenizer is first HBox item");
				assert.ok(oButton.isA("sap.m.Button"), "Button is first HBox item");
				assert.equal(oButton.getType(), mLibrary.ButtonType.Transparent, "Button type");
				assert.equal(oButton.getIcon(), "sap-icon://decline", "Button icon");
				assert.equal(oButton.getTooltip(), oResourceBundle.getText("valuehelp.REMOVEALLTOKEN"), "Button tooltip");

				// invalidation of content should invalidate IconTabFilter, not ValueHelp
				sinon.spy(oIconTabFilter, "invalidate");
				sinon.spy(oValueHelp, "invalidate");
				oContent2.invalidate();
				assert.ok(oIconTabFilter.invalidate.calledOnce, "invalidate called on IconTabFilter");
				assert.ok(oValueHelp.invalidate.notCalled, "invalidate not called on ValueHelp");
				oValueHelp.invalidate.restore();
				oIconTabFilter.invalidate.restore();

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("getContainerControl with content for single-select", function(assert) {

		oDialog.removeAllContent(); // remove and add again to update quickSelect
		oValueHelpConfig.maxConditions = 1;
		sinon.stub(oContent, "isQuickSelectSupported").returns(true);
		oDialog.addContent(oContent);
		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		const oContainer = oDialog.getContainerControl().then(function (oCont) {
			return oDialog.placeContent(oCont);
		});

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
				const aButtons = oContainer.getButtons();
				assert.notOk(aButtons[0].getVisible(), "OK-Button not visible");

				const aDialogContent = oContainer.getContent();
				const aItems = aDialogContent[0].getItems();

				assert.equal(aItems.length, 1, "No Panel is visible");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("open / close", function(assert) {

		let iOpened = 0;
		oDialog.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		let iClosed = 0;
		oDialog.attachEvent("closed", function(oEvent) {
			iClosed++;
		});
		let iConfirm = 0;
		let bClose = false;
		oDialog.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onHide");

		oDialog.setTitle("Test");
		const oPromise = oDialog.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					const oContainer = oDialog.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
					assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oDialog.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Dialog returned");
					sinon.stub(oContainer, "getUIArea").returns("X"); // to test result
					assert.equal(oDialog.getUIAreaForContent(), "X", "getUIAreaForContent returns UiArea of sap.m.Dialog");
					oContainer.getUIArea.restore();
					assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
					const aDialogContent = oContainer.getContent();
					let aItems = aDialogContent[0].getItems();

					const oPanel = aItems[1];
					const aPanelContent = oPanel.getContent();
					aItems = aPanelContent[0].getItems();
					const oTokenMultiInput = aItems[0];
					let aTokens = oTokenMultiInput.getTokens();
					let oBinding = aTokens[0].getBinding("text");
					let oBindingType = oBinding.getType();
					assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
					let oFormatOptions = {
						maxConditions: -1, // as for tokens there should not be a limit on type side
						valueType: oType,
						additionalValueType: oAdditionalType,
						operators: [OperatorName.EQ, OperatorName.BT],
						display: FieldDisplay.Description,
						valueHelpID: "VH",
						control: oField,
						delegate: undefined,
						delegateName: undefined,
						payload: undefined,
						convertWhitespaces: true
					};
					assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");

					// the inner input element has to been set to transparent.
					assert.ok(oTokenMultiInput.isA("sap.m.MultiInput"), "MultiInput is first HBox item");
					assert.equal(jQuery(oTokenMultiInput.getDomRef("inner")).css("opacity"), "0", "input part of multiInput is not visible");

					// simulate ok-button click
					const aButtons = oContainer.getButtons();
					aButtons[0].firePress();
					assert.equal(iConfirm, 1, "Confirm event fired");
					assert.ok(bClose, "close parameter");

					oDialog.close();
					setTimeout(function() { // wait until closed
						assert.equal(iClosed, 1, "Closed event fired once");
						assert.notOk(oContainer.isOpen(), "sap.m.Dialog is not open");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");

						// open again // config changes needs to be applied
						oType.destroy();
						oType = new StringType(undefined, {maxLength: 10});
						oValueHelpConfig.dataType = oType;
						oValueHelpConfig.operators = [OperatorName.EQ, OperatorName.BT, OperatorName.GT, OperatorName.LT];
						oValueHelpConfig.display = FieldDisplay.ValueDescription;
						const oPromise = oDialog.open(Promise.resolve());
						assert.ok(oPromise instanceof Promise, "open returns promise");

						if (oPromise) {
							oPromise.then(function() {
								setTimeout(function() { // wait until open
									assert.equal(iOpened, 2, "Opened event fired again");
									assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
									aTokens = oTokenMultiInput.getTokens();
									oBinding = aTokens[0].getBinding("text");
									oBindingType = oBinding.getType();
									assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
									oFormatOptions = {
										maxConditions: -1, // as for tokens there should not be a limit on type side
										valueType: oType,
										additionalValueType: oAdditionalType,
										operators: [OperatorName.EQ, OperatorName.BT, OperatorName.GT, OperatorName.LT],
										display: FieldDisplay.ValueDescription,
										valueHelpID: "VH",
										control: oField,
										delegate: undefined,
										delegateName: undefined,
										payload: undefined,
										convertWhitespaces: true
									};
									assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");

									oDialog.close();
									setTimeout(function() { // wait until closed
										assert.equal(iClosed, 2, "Closed event fired again");
										assert.notOk(oContainer.isOpen(), "sap.m.Dialog is not open");
										assert.ok(oContent.onHide.calledTwice, "Content onHide called again");
										fnDone();
									}, iDialogDuration);
								}, iDialogDuration);
							}).catch(function(oError) {
								assert.notOk(true, "Promise Catch called");
								fnDone();
							});
						}
					}, iDialogDuration);
				}, iDialogDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("switch content", function(assert) {

		const oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		const oContent2 = new Content("Content2", {title: "Content2 title"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake(function (aConditions) { return aConditions.length;});
		oDialog.addContent(oContent2);

		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onHide");
		sinon.spy(oContent2, "onShow");
		sinon.spy(oContent2, "onHide");

		oDialog.setTitle("Test");
		const oPromise = oDialog.open(Promise.resolve());

		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function () { // wait until open
					const oContainer = oDialog.getAggregation("_container");
					assert.equal(oContainer.getTitle(), "Test", "sap.m.Dialog title");
					const aDialogContent = oContainer.getContent();
					const aItems = aDialogContent[0].getItems();
					const oIconTabBar = aItems[0];
					const oIconTabHeader = oIconTabBar.getAggregation("_header");
					assert.equal(oIconTabBar.getItems().length, 2, "items assigned");
					oIconTabHeader.setSelectedItem(oIconTabHeader.getItems()[1], false); // simulate swith

					setTimeout(function () { // as _onTabBarSelect is async
						assert.equal(oIconTabBar.getSelectedKey(), "Content2", "IconTabBar selectedKey");
						assert.ok(oContent.onHide.calledOnce, "Content onHide called");
						assert.ok(oContent2.onShow.calledOnce, "Content2 onShow called");
						assert.equal(oContainer.getTitle(), "Test", "sap.m.Dialog title");

						oDialog.close();
						setTimeout(function () { // wait until closed
							assert.ok(oContent2.onHide.calledOnce, "Content2 onHide called");

							fnDone();
						}, iDialogDuration);
					}, 0);
				}, iDialogDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("getAriaAttributes", function(assert) {

		const oCheckAttributes = {
			contentId: null,
			ariaHasPopup: "dialog",
			role: null,
			roleDescription: null,
			valueHelpEnabled: true,
			autocomplete: "none"
		};
		const oAttributes = oDialog.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("isMultiSelect", function(assert) {

		assert.ok(oDialog.isMultiSelect(), "isMultiSelect");

		oValueHelpConfig.maxConditions = 1;
		assert.notOk(oDialog.isMultiSelect(), "isMultiSelect");

	});

	QUnit.test("isTypeaheadSupported", function(assert) {

		const bSupported = oDialog.isTypeaheadSupported();
		assert.notOk(bSupported, "not supported for dialog");

	});

	QUnit.test("select event", function(assert) {

		let iSelect = 0;
		let aConditions;
		let sType;
		oDialog.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		let iConfirm = 0;
		let bClose = false;
		oDialog.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		const oContent2 = new Content("Content2", {title: "Content title 2", shortTitle: "ShortTitle 2"});
		sinon.stub(oContent2, "isQuickSelectSupported").returns(true);
		oDialog.addContent(oContent2);

		const oPromise = oDialog.open(Promise.resolve());
		if (oPromise) {
			const fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Set});
					assert.equal(iSelect, 1, "select event fired");
					assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
					assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
					assert.equal(iConfirm, 0, "ConfirmEvent not fired");

					iSelect = 0;
					iConfirm = 0;
					oContent2.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Set});
					assert.equal(iSelect, 0, "select event not fired for hidden content");

					oValueHelpConfig = merge({}, oValueHelpConfig);
					oValueHelpConfig.maxConditions = 1;
					oModel.setProperty("/_config", oValueHelpConfig); // update Model to use Binding updates
					oDialog._handleContentSelectionChange("Content2"); // fake switch of content
					oDialog.removeContent(oContent); // to enable quick select
					oContent.destroy();

					setTimeout(function() { // wait until switched and model updated
						iSelect = 0;
						iConfirm = 0;
						oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Set});
						assert.equal(iSelect, 0, "select event not fired for hidden content");

						iSelect = 0;
						iConfirm = 0;

						oContent2.fireSelect({conditions: [], type: ValueHelpSelectionType.Set});
						assert.deepEqual(aConditions, [], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
						assert.equal(iConfirm, 0, "ConfirmEvent not fired");
						assert.notOk(bClose, "Close parameter not set");

						oContent2.fireSelect({conditions: [], type: ValueHelpSelectionType.Add});
						assert.deepEqual(aConditions, [], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Add, "select event type");
						assert.equal(iConfirm, 0, "ConfirmEvent not fired");
						assert.notOk(bClose, "Close parameter not set");

						oContent2.fireSelect({conditions: [Condition.createItemCondition("Y", "Text")], type: ValueHelpSelectionType.Set});
						assert.deepEqual(aConditions, [Condition.createItemCondition("Y", "Text")], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Set, "select event type");
						assert.equal(iConfirm, 1, "ConfirmEvent fired");
						assert.ok(bClose, "Close parameter set");

						bClose = false;
						oContent2.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: ValueHelpSelectionType.Add});
						assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
						assert.equal(sType, ValueHelpSelectionType.Add, "select event type");
						assert.equal(iConfirm, 2, "ConfirmEvent fired");
						assert.ok(bClose, "Close parameter set");

						oContent2.destroy();
						fnDone();
					}, iDialogDuration);
				}, iDialogDuration);
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("delete tokens via Tokenizer", function(assert) {

		let iSelect = 0;
		let aConditions;
		let sType;
		oDialog.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		const oContainer = oDialog.getContainerControl().then(function (oCont) {
			return oDialog.placeContent(oCont);
		});

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				const aDialogContent = oContainer.getContent();
				let aItems = aDialogContent[0].getItems();
				const oPanel = aItems[1];
				const aPanelContent = oPanel.getContent();
				aItems = aPanelContent[0].getItems();
				const oTokenMultiInput = aItems[0];
				const aTokens = oTokenMultiInput.getTokens();

				oTokenMultiInput.fireTokenUpdate({removedTokens: aTokens});
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
				assert.equal(sType, ValueHelpSelectionType.Remove, "select event type");

				oModel.setData({
					_config: oValueHelpConfig,
					filterValue: "X",
					conditions: []
				}); // simulate data update
				assert.equal(oPanel.getHeaderText(), "TokenizerTitle", "Panel headerText");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("delete tokens via Button", function(assert) {

		let iSelect = 0;
		let aConditions;
		let sType;
		oDialog.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		const oContainer = oDialog.getContainerControl().then(function (oCont) {
			return oDialog.placeContent(oCont);
		});

		if (oContainer) {
			const fnDone = assert.async();
			oContainer.then(function(oContainer) {
				const aDialogContent = oContainer.getContent();
				let aItems = aDialogContent[0].getItems();
				const oPanel = aItems[1];
				const aPanelContent = oPanel.getContent();
				aItems = aPanelContent[0].getItems();
				const oButton = aItems[1];

				oButton.firePress();
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, [], "select event conditions");
				assert.equal(sType, ValueHelpSelectionType.Set, "select event type");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

});
