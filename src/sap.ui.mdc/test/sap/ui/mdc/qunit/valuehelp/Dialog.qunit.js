// Use this test page to test the API and features of the Dialog container.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 10]*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/valuehelp/Dialog",
	"sap/ui/mdc/valuehelp/base/Content",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/core/Icon",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/ui/Device",
	"sap/base/strings/formatMessage",
	"sap/base/util/merge",
	"sap/m/library",
	"sap/ui/core/Core"
], function (
		jQuery,
		ValueHelpDelegate,
		Dialog,
		Content,
		Condition,
		SelectType,
		FieldDisplay,
		Icon,
		JSONModel,
		StringType,
		Device,
		formatMessage,
		merge,
		mLibrary,
		oCore
	) {
	"use strict";

	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

	var oDialog;
	var iDialogDuration = oCore.getConfiguration().getAnimationMode() === "none" ? 15 : 500;

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
	var oValueHelpConfig;
	var oModel; // to fake ManagedObjectModel of ValueHelp
	var oType;

	/* use dummy control to simulate Field */

//	var oClock;

	var _teardown = function() {
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
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oDialog = new Dialog("D1", {
			});
		},
		afterEach: _teardown
	});

	QUnit.test("default values", function(assert) {

		assert.equal(oDialog.getMaxConditions(), undefined, "getMaxConditions");
		assert.ok(oDialog.isMultiSelect(), "isMultiSelect");
		assert.notOk(oDialog._isSingleSelect(), "_isSingleSelect");
		assert.notOk(oDialog.getUseAsValueHelp(), "getUseAsValueHelp");
		assert.notOk(oDialog.shouldOpenOnClick(), "shouldOpenOnClick");
		assert.notOk(oDialog.shouldOpenOnNavigate(), "shouldOpenOnNavigate");
		assert.ok(oDialog.isFocusInHelp(), "isFocusInHelp");
		assert.equal(oDialog.getValueHelpIcon(), "sap-icon://value-help", "getValueHelpIcon");
		sinon.stub(oDialog, "getUIArea").returns("X"); // to test result
		assert.equal(oDialog._getUIAreaForContent(), "X", "_getUIAreaForContent returns own UiArea");
		oDialog.getUIArea.restore();

	});

	QUnit.test("_getContainer", function(assert) {

		oDialog.setTitle("Test");
		var oContainer = oDialog._getContainer();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			var fnDone = assert.async();
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
				assert.ok(oContainer.hasStyleClass("sapUiSizeCozy"), "content density is set explicitly");


				var aButtons = oContainer.getButtons();
				assert.equal(aButtons.length, 2, "Buttons added");
				assert.equal(aButtons[0].getText(), oResourceBundle.getText("valuehelp.OK"), "Button text");
				assert.equal(aButtons[1].getText(), oResourceBundle.getText("valuehelp.CANCEL"), "Button text");

				assert.ok(oContainer.getModel("$help").isA("sap.ui.model.base.ManagedObjectModel"), "ManagedObjectModel assigned");

				var aDialogContent = oContainer.getContent();
				assert.equal(aDialogContent.length, 1, "Dialog content length");
				assert.ok(aDialogContent[0].isA("sap.m.VBox"), "VBox is inside Dialog");
				var aItems = aDialogContent[0].getItems();
				assert.equal(aItems.length, 1, "VBox content length"); // no Panel as no content
				var oIconTabBar = aItems[0];
				assert.ok(oIconTabBar.isA("sap.m.IconTabBar"), "IconTabBar is first VBox item");
				assert.notOk(oIconTabBar.getExpandable(), "IconTabBar expandable");
				assert.notOk(oIconTabBar.getUpperCase(), "IconTabBar upperCase");
				assert.ok(oIconTabBar.getStretchContentHeight(), "IconTabBar stretchContentHeight");
				assert.equal(oIconTabBar.getHeaderMode(), mLibrary.IconTabHeaderMode.Inline, "IconTabBar headerMode");
				assert.notOk(oIconTabBar.getSelectedKey(), "IconTabBar selectedKey");
				assert.ok(oIconTabBar.getModel("$help").isA("sap.ui.model.base.ManagedObjectModel"), "ManagedObjectModel assigned");
				assert.equal(oIconTabBar.getItems().length, 0, "No items assigned");

				// call again
				oContainer = oDialog._getContainer();
				assert.ok(oContainer.isA("sap.m.Dialog"), "sap.m.Dialog directly returned on second call");
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("providesScrolling", function(assert) {

		var bScrolling = oDialog.providesScrolling();
		assert.notOk(bScrolling, "provides no scrolling");

	});

	QUnit.module("assigned to ValueHelp", {
		beforeEach: function() {
			oType = new StringType();

			oValueHelpConfig = {
				maxConditions: -1,
				dataType: oType,
				operators: ["EQ", "BT"],
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
			oCore.applyChanges();
		},
		afterEach: _teardown
	});

	QUnit.test("_getContainer with single content for multi-select", function(assert) {

		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		var oContainer = oDialog._getContainer();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			var fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
				var aButtons = oContainer.getButtons();
				assert.ok(aButtons[0].getVisible(), "OK-Button visible");

				var aDialogContent = oContainer.getContent();
				var aItems = aDialogContent[0].getItems();
				var oIconTabBar = aItems[0];
				var oPanel = aItems[1];
				//assert.notOk(oIconTabBar.getSelectedKey(), "IconTabBar selectedKey"); // as only set on opening
				assert.equal(oIconTabBar.getItems().length, 1, "item assigned");
				var oIconTabHeader = oIconTabBar._getIconTabHeader();
				assert.notOk(oIconTabHeader.getVisible(), "IconTabHeader not visible");
				var oIconTabFilter = oIconTabBar.getItems()[0];
				assert.equal(oIconTabFilter.getKey(), "Content1", "oIconTabFilter key");
				var aIconTabContent = oIconTabFilter.getContent();
				assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
				assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
				assert.equal(aIconTabContent[0].getContent(), oContentField, "Content control");
				assert.equal(oIconTabFilter.getText(), "Content title", "IconTabFilter text");
				assert.ok(oContent.getFormattedTitle.calledWith(1), "Content getFormattedTitle called with Count");

				// invalidation of content should invalidate IconTabFilter, not ValueHelp
				sinon.spy(oIconTabFilter, "invalidate");
				sinon.spy(oValueHelp, "invalidate");
				oContent.invalidate();
				assert.ok(oIconTabFilter.invalidate.calledOnce, "invalidate called on IconTabFilter");
				assert.ok(oValueHelp.invalidate.notCalled, "invalidate not called on ValueHelp");

				assert.ok(oPanel.isA("sap.m.Panel"), "Panel is second VBox item");
				assert.ok(oPanel.getVisible, "Panel is visible");
				assert.equal(oPanel.getHeaderText(), "TokenizerTitle", "Panel headerText");
				assert.equal(oPanel.getBackgroundDesign(), mLibrary.BackgroundDesign.Transparent, "Panel backgroundDesign");
				assert.ok(oPanel.getExpanded(), "Panel expanded");
				assert.notOk(oPanel.getExpandable(), "Panel expandable");
				var aPanelContent = oPanel.getContent();
				assert.equal(aPanelContent.length, 1, "Panel content length");
				assert.ok(aPanelContent[0].isA("sap.m.HBox"), "HBox is inside Panel");
				aItems = aPanelContent[0].getItems();
				assert.equal(aItems.length, 2, "HBox content length");
				var oTokenizer = aItems[0];
				var aTokens = oTokenizer.getTokens();
				assert.equal(aTokens.length, 1, "number of tokens");
				assert.equal(aTokens[0].getText(), "Text", "Token text");
				var oBinding = aTokens[0].getBinding("text");
				var oBindingType = oBinding.getType();
				assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
				var oFormatOptions = {
					maxConditions: -1, // as for tokens there should not be a limit on type side
					valueType: oType,
					operators: ["EQ", "BT"],
					display: FieldDisplay.Description,
					fieldHelpID: "VH",
					control: oField,
					delegate: undefined,
					delegateName: undefined,
					payload: undefined,
					convertWhitespaces: true
				};
				assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");
				var oButton = aItems[1];
				assert.ok(oTokenizer.isA("sap.m.MultiInput"), "MultiInput is first HBox item");
				assert.ok(oButton.isA("sap.m.Button"), "Button is second HBox item");
				assert.equal(oButton.getType(), mLibrary.ButtonType.Transparent, "Button type");
				assert.equal(oButton.getIcon(), "sap-icon://decline", "Button icon");
				assert.equal(oButton.getTooltip(), oResourceBundle.getText("valuehelp.REMOVEALLTOKEN"), "Button tooltip");

				oValueHelp.invalidate.restore();
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("_getContainer with multiple content for multi-select", function(assert) {

		var oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		var oContent2 = new Content("Content2", {title: "Content title2", shortTitle: "ShortTitle2", tokenizerTitle: "TokenizerTitle2"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake(function (aConditions) { return aConditions.length;});

		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		sinon.spy(oContent2,"getFormattedTitle");
		oDialog.addContent(oContent2);
		var oContainer = oDialog._getContainer();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			var fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.equal(oContainer.getTitle(), "Test", "sap.m.Dilaog title");
				var aButtons = oContainer.getButtons();
				assert.ok(aButtons[0].getVisible(), "OK-Button visible");

				var aDialogContent = oContainer.getContent();
				var aItems = aDialogContent[0].getItems();
				var oIconTabBar = aItems[0];
				var oPanel = aItems[1];
				//assert.notOk(oIconTabBar.getSelectedKey(), "IconTabBar selectedKey"); // as only set on opening
				assert.equal(oIconTabBar.getItems().length, 2, "items assigned");
				var oIconTabHeader = oIconTabBar._getIconTabHeader();
				assert.ok(oIconTabHeader.getVisible(), "IconTabHeader visible");
				var oIconTabFilter = oIconTabBar.getItems()[0];
				assert.equal(oIconTabFilter.getKey(), "Content1", "oIconTabFilter key");
				var aIconTabContent = oIconTabFilter.getContent();
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
				var aPanelContent = oPanel.getContent();
				assert.equal(aPanelContent.length, 1, "Panel content length");
				assert.ok(aPanelContent[0].isA("sap.m.HBox"), "HBox is inside Panel");
				aItems = aPanelContent[0].getItems();
				assert.equal(aItems.length, 2, "HBox content length");
				var oTokenizer = aItems[0];
				var aTokens = oTokenizer.getTokens();
				assert.equal(aTokens.length, 1, "number of tokens");
				assert.equal(aTokens[0].getText(), "Text", "Token text");
				var oBinding = aTokens[0].getBinding("text");
				var oBindingType = oBinding.getType();
				assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
				var oFormatOptions = {
					maxConditions: -1, // as for tokens there should not be a limit on type side
					valueType: oType,
					operators: ["EQ", "BT"],
					display: FieldDisplay.Description,
					fieldHelpID: "VH",
					control: oField,
					delegate: undefined,
					delegateName: undefined,
					payload: undefined,
					convertWhitespaces: true
				};
				assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");
				var oButton = aItems[1];
				assert.ok(oTokenizer.isA("sap.m.MultiInput"), "Tokenizer is first HBox item");
				assert.ok(oButton.isA("sap.m.Button"), "Button is first HBox item");
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

	QUnit.test("_getContainer with content for single-select", function(assert) {

		oDialog.removeAllContent(); // remove and add again to update quickSelect
		oValueHelpConfig.maxConditions = 1;
		sinon.stub(oContent, "isQuickSelectSupported").returns(true);
		oDialog.addContent(oContent);
		oDialog.setTitle("Test");
		sinon.spy(oContent,"getFormattedTitle");
		var oContainer = oDialog._getContainer();

		if (oContainer) {
			var fnDone = assert.async();
			oContainer.then(function(oContainer) {
				assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
				var aButtons = oContainer.getButtons();
				assert.notOk(aButtons[0].getVisible(), "OK-Button not visible");

				var aDialogContent = oContainer.getContent();
				var aItems = aDialogContent[0].getItems();
				var oIconTabBar = aItems[0];
				//assert.notOk(oIconTabBar.getSelectedKey(), "IconTabBar selectedKey"); // as only set on opening
				assert.equal(oIconTabBar.getItems().length, 1, "item assigned");
				var oIconTabHeader = oIconTabBar._getIconTabHeader();
				assert.notOk(oIconTabHeader.getVisible(), "IconTabHeader not visible");
				var oIconTabFilter = oIconTabBar.getItems()[0];
				assert.equal(oIconTabFilter.getKey(), "Content1", "oIconTabFilter key");
				var aIconTabContent = oIconTabFilter.getContent();
				assert.equal(aIconTabContent.length, 1, "IconTabFilter content length");
				assert.ok(aIconTabContent[0].isA("sap.ui.mdc.valuehelp.base.DialogTab"), "Content of IconTabFilter");
				assert.equal(aIconTabContent[0].getContent(), oContentField, "Content control");
				assert.equal(oIconTabFilter.getText(), "Content title", "IconTabFilter text");
				assert.ok(oContent.getFormattedTitle.calledWith(1), "Content getFormattedTitle called with Count");

				// invalidation of content should invalidate IconTabFilter, not ValueHelp
				sinon.spy(oIconTabFilter, "invalidate");
				sinon.spy(oValueHelp, "invalidate");
				oContent.invalidate();
				assert.ok(oIconTabFilter.invalidate.calledOnce, "invalidate called on IconTabFilter");
				assert.ok(oValueHelp.invalidate.notCalled, "invalidate not called on ValueHelp");

				assert.equal(aItems.length, 1, "No Panel is visible");

				oValueHelp.invalidate.restore();
				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("open / close", function(assert) {

		var iOpened = 0;
		oDialog.attachEvent("opened", function(oEvent) {
			iOpened++;
		});
		var iClosed = 0;
		oDialog.attachEvent("closed", function(oEvent) {
			iClosed++;
		});
		var iConfirm = 0;
		var bClose = false;
		oDialog.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onHide");

		oDialog.setTitle("Test");
		var oPromise = oDialog.open(Promise.resolve());
		assert.ok(oPromise instanceof Promise, "open returns promise");

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					assert.equal(iOpened, 1, "Opened event fired once");
					var oContainer = oDialog.getAggregation("_container");
					assert.ok(oContainer.isA("sap.m.Dialog"), "Container is sap.m.Dialog");
					assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
					assert.ok(oContent.onShow.calledOnce, "Content onShow called");
					assert.equal(oDialog.getDomRef(), oContainer.getDomRef(), "DomRef of sap.m.Dialog returned");
					sinon.stub(oContainer, "getUIArea").returns("X"); // to test result
					assert.equal(oDialog._getUIAreaForContent(), "X", "_getUIAreaForContent returns UiArea of sap.m.Dialog");
					oContainer.getUIArea.restore();
					assert.equal(oContainer.getTitle(), "ShortTitle: Test", "sap.m.Dilaog title");
					var aDialogContent = oContainer.getContent();
					var aItems = aDialogContent[0].getItems();
					var oIconTabBar = aItems[0];
					assert.equal(oIconTabBar.getSelectedKey(), "Content1", "IconTabBar selectedKey");

					var oPanel = aItems[1];
					var aPanelContent = oPanel.getContent();
					aItems = aPanelContent[0].getItems();
					var oTokenizer = aItems[0];
					var aTokens = oTokenizer.getTokens();
					var oBinding = aTokens[0].getBinding("text");
					var oBindingType = oBinding.getType();
					assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
					var oFormatOptions = {
						maxConditions: -1, // as for tokens there should not be a limit on type side
						valueType: oType,
						operators: ["EQ", "BT"],
						display: FieldDisplay.Description,
						fieldHelpID: "VH",
						control: oField,
						delegate: undefined,
						delegateName: undefined,
						payload: undefined,
						convertWhitespaces: true
					};
					assert.deepEqual(oBindingType.getFormatOptions(), oFormatOptions, "FormatOptions of ConditionType");

					// the inner input element has to been set to transparent.
					assert.ok(oTokenizer.isA("sap.m.MultiInput"), "MultiInput is first HBox item");
					assert.equal(jQuery(oTokenizer.getDomRef("inner")).css("opacity"), "0", "input part of multiInput is not visible");

					// simulate ok-button click
					var aButtons = oContainer.getButtons();
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
						oValueHelpConfig.operators = ["EQ", "BT", "GT", "LT"];
						oValueHelpConfig.display = FieldDisplay.ValueDescription;
						var oPromise = oDialog.open(Promise.resolve());
						assert.ok(oPromise instanceof Promise, "open returns promise");

						if (oPromise) {
							oPromise.then(function() {
								setTimeout(function() { // wait until open
									assert.equal(iOpened, 2, "Opened event fired again");
									assert.ok(oContainer.isOpen(), "sap.m.Dialog is open");
									aTokens = oTokenizer.getTokens();
									oBinding = aTokens[0].getBinding("text");
									oBindingType = oBinding.getType();
									assert.ok(oBindingType.isA("sap.ui.mdc.field.ConditionType"), "Token bound using ConditionType");
									oFormatOptions = {
										maxConditions: -1, // as for tokens there should not be a limit on type side
										valueType: oType,
										operators: ["EQ", "BT", "GT", "LT"],
										display: FieldDisplay.ValueDescription,
										fieldHelpID: "VH",
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

		var oContentField2 = new Icon("I3", {src:"sap-icon://sap-ui5", decorative: false, press: _fPressHandler});
		var oContent2 = new Content("Content2", {title: "Content2 title"});
		sinon.stub(oContent2, "getContent").returns(oContentField2);
		oContent2.setAggregation("displayContent", oContentField2);
		sinon.stub(oContent2, "getCount").callsFake(function (aConditions) { return aConditions.length;});
		oDialog.addContent(oContent2);

		sinon.spy(oContent, "onShow");
		sinon.spy(oContent, "onHide");
		sinon.spy(oContent2, "onShow");
		sinon.spy(oContent2, "onHide");

		oDialog.setTitle("Test");
		var oPromise = oDialog.open(Promise.resolve());

		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function () { // wait until open
					var oContainer = oDialog.getAggregation("_container");
					assert.equal(oContainer.getTitle(), "Test", "sap.m.Dialog title");
					var aDialogContent = oContainer.getContent();
					var aItems = aDialogContent[0].getItems();
					var oIconTabBar = aItems[0];
					var oIconTabHeader = oIconTabBar.getAggregation("_header");
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

		var oCheckAttributes = {
			contentId: null,
			ariaHasPopup: "dialog",
			role: null,
			roleDescription: null
		};
		var oAttributes = oDialog.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("isMultiSelect", function(assert) {

		assert.ok(oDialog.isMultiSelect(), "isMultiSelect");

		oValueHelpConfig.maxConditions = 1;
		assert.notOk(oDialog.isMultiSelect(), "isMultiSelect");

	});

	QUnit.test("isTypeaheadSupported", function(assert) {

		var bSupported = oDialog.isTypeaheadSupported();
		assert.notOk(bSupported, "not supported for dialog");

	});

	QUnit.test("select event", function(assert) {

		var iSelect = 0;
		var aConditions;
		var sType;
		oDialog.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});
		var iConfirm = 0;
		var bClose = false;
		oDialog.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});

		var oContent2 = new Content("Content2", {title: "Content title 2", shortTitle: "ShortTitle 2"});
		sinon.stub(oContent2, "isQuickSelectSupported").returns(true);
		oDialog.addContent(oContent2);

		var oPromise = oDialog.open(Promise.resolve());
		if (oPromise) {
			var fnDone = assert.async();
			oPromise.then(function() {
				setTimeout(function() { // wait until open
					oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: SelectType.Set});
					assert.equal(iSelect, 1, "select event fired");
					assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
					assert.equal(sType, SelectType.Set, "select event type");
					assert.equal(iConfirm, 0, "ConfirmEvent not fired");

					iSelect = 0;
					iConfirm = 0;
					oContent2.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: SelectType.Set});
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
						oContent.fireSelect({conditions: [Condition.createItemCondition("X", "Text")], type: SelectType.Set});
						assert.equal(iSelect, 0, "select event not fired for hidden content");

						iSelect = 0;
						iConfirm = 0;
						oContent2.fireSelect({conditions: [Condition.createItemCondition("Y", "Text")], type: SelectType.Set});
						assert.equal(iSelect, 1, "select event fired");
						assert.deepEqual(aConditions, [Condition.createItemCondition("Y", "Text")], "select event conditions");
						assert.equal(sType, SelectType.Set, "select event type");
						assert.equal(iConfirm, 0, "ConfirmEvent not fired");
						assert.notOk(bClose, "Close parameter not set");

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

	QUnit.test("detele tokens via Tokenizer", function(assert) {

		var iSelect = 0;
		var aConditions;
		var sType;
		oDialog.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		var oContainer = oDialog._getContainer();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			var fnDone = assert.async();
			oContainer.then(function(oContainer) {
				var aDialogContent = oContainer.getContent();
				var aItems = aDialogContent[0].getItems();
				var oPanel = aItems[1];
				var aPanelContent = oPanel.getContent();
				aItems = aPanelContent[0].getItems();
				var oTokenizer = aItems[0];
				var aTokens = oTokenizer.getTokens();

				oTokenizer.fireTokenUpdate({removedTokens: aTokens});
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, [Condition.createItemCondition("X", "Text")], "select event conditions");
				assert.equal(sType, SelectType.Remove, "select event type");

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

	QUnit.test("detele tokens via Button", function(assert) {

		var iSelect = 0;
		var aConditions;
		var sType;
		oDialog.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		var oContainer = oDialog._getContainer();
//		assert.ok(oContainer instanceof Promise, "Promise returned");

		if (oContainer) {
			var fnDone = assert.async();
			oContainer.then(function(oContainer) {
				var aDialogContent = oContainer.getContent();
				var aItems = aDialogContent[0].getItems();
				var oPanel = aItems[1];
				var aPanelContent = oPanel.getContent();
				aItems = aPanelContent[0].getItems();
				var oButton = aItems[1];

				oButton.firePress();
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, [], "select event conditions");
				assert.equal(sType, SelectType.Set, "select event type");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

});
