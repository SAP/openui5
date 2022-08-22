// Use this test page to test the API and features of the ValueHelp.
// The interaction with the Field is tested on the field test page.

/* global QUnit, sinon */
/*eslint max-nested-callbacks: [2, 5]*/

sap.ui.define([
	"sap/ui/mdc/ValueHelpDelegate",
	"sap/ui/mdc/field/FieldBaseDelegate",
	"sap/ui/mdc/valuehelp/content/Conditions",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enum/ConditionValidated",
	"sap/ui/mdc/enum/FieldDisplay",
	"sap/ui/mdc/enum/SelectType",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/type/String",
	"sap/m/library",
	"sap/ui/core/Core"
], function (
		ValueHelpDelegate,
		FieldBaseDelegate,
		Conditions,
		Condition,
		ConditionValidated,
		FieldDisplay,
		SelectType,
		JSONModel,
		StringType,
		mLibrary,
		oCore
	) {
	"use strict";

	var oConditions;
	var bIsTypeahead = false;
	var bIsOpen = false;
	var bIsOpening = false;
	var oModel;
	var oType;
	var oResourceBundle = oCore.getLibraryResourceBundle("sap.ui.mdc");

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
		awaitValueHelpDelegate: function () {
			return Promise.resolve();
		},
		isValueHelpDelegateInitialized: function () {
			return true;
		},
		invalidate: function () {}
	};

	var _teardown = function() {
		oConditions.destroy();
		oConditions = null;
		bIsTypeahead = false;
		bIsOpen = false;
		bIsOpening = false;
		if (oModel) {
			oModel.destroy();
			oModel = undefined;
		}
		if (oType) {
			oType.destroy();
			oType = undefined;
		}
	};

	QUnit.module("basic features", {
		beforeEach: function() {
			oType = new StringType();

			var aConditions = [Condition.createCondition("EQ", ["X"], undefined, undefined, ConditionValidated.NotValidated)];
			oConditions = new Conditions("C1", {
				label: "Test",
				conditions: aConditions, // don't need to test the binding of Container here
				config: { // don't need to test the binding of Container here
					dataType: oType,
					maxConditions: -1,
					delegate: FieldBaseDelegate,
					delegateName: "sap/ui/mdc/field/FieldBaseDelegate",
					payload: { text: "X" },
					operators: ["EQ", "BT", "Contains"],
					defaultOperatorName: "EQ",
					display: FieldDisplay.Description
				}
			});
			sinon.stub(oConditions, "getParent").returns(oContainer);
			oConditions.oParent = oContainer; // fake

			oModel = new JSONModel({
				_valid: true
			});
			oConditions.setModel(oModel, "$valueHelp");
		},
		afterEach: _teardown
	});

	QUnit.test("getContent with scrolling", function(assert) {

		var iSelect = 0;
		var aConditions;
		var sType;
		oConditions.attachEvent("select", function(oEvent) {
			iSelect++;
			aConditions = oEvent.getParameter("conditions");
			sType = oEvent.getParameter("type");
		});

		var oContent = oConditions.getContent();

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				assert.ok(oContent, "Content returned");
				assert.ok(oContent.isA("sap.m.ScrollContainer"), "Container is sap.m.ScrollContainer");
				assert.equal(oContent.getHeight(), "100%", "ScrollContainer height");
				assert.equal(oContent.getWidth(), "100%", "ScrollContainer width");
				assert.ok(oContent.getVertical(), "ScrollContainer vertical");
				assert.ok(oContent.getHorizontal(), "ScrollContainer horizontal");
				assert.equal(oContent.getContent().length, 1, "ScrollContainer content length");
				var oDefineConditionPanel = oContent.getContent()[0];
				assert.ok(oDefineConditionPanel.isA("sap.ui.mdc.field.DefineConditionPanel"), "DefineConditionPanel in ScrollContainer");
				assert.equal(oDefineConditionPanel.getLabel(), "Test", "title");
				assert.deepEqual(oDefineConditionPanel.getConditions(), oConditions.getConditions(), "Conditions on DefineConditionPanel");
				assert.ok(oDefineConditionPanel.getInputOK(), "inputOK on DefineConditionPanel");
				var oFormatOptions = oDefineConditionPanel.getFormatOptions();
				var oTestFormatOptions = {
					valueType: oType,
					maxConditions: -1,
					delegate: FieldBaseDelegate,
					delegateName: "sap/ui/mdc/field/FieldBaseDelegate",
					payload: { text: "X" },
					operators: ["EQ", "BT", "Contains"],
					defaultOperatorName: "EQ",
					display: FieldDisplay.Description
				};
				assert.deepEqual(oFormatOptions, oTestFormatOptions, "FormatOptions on DefineConditionPanel");

				var aNewConditions = [
					Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated),
					Condition.createCondition("EQ", ["Z"], undefined, undefined, ConditionValidated.NotValidated)
				];
				oDefineConditionPanel.setConditions(aNewConditions);
				oDefineConditionPanel.fireConditionProcessed();
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, aNewConditions, "select event conditions");
				assert.equal(sType, SelectType.Set, "select event type");
				iSelect = 0;
				aConditions = undefined;
				sType = undefined;

				oConditions.setConfig({ // don't need to test the binding of Container here
					dataType: oType,
					maxConditions: 1,
					delegate: FieldBaseDelegate,
					delegateName: "sap/ui/mdc/field/FieldBaseDelegate",
					payload: {text: "X"},
					operators: ["EQ", "BT", "Contains"],
					defaultOperatorName: "EQ",
					display: FieldDisplay.Description
				});
				aNewConditions = [
					Condition.createItemCondition("X", "Text"),
					Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated)
				];
				var aCheckConditions = [Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated)];
				oDefineConditionPanel.setConditions(aNewConditions);
				oDefineConditionPanel.fireConditionProcessed();
				assert.equal(iSelect, 1, "select event fired");
				assert.deepEqual(aConditions, aCheckConditions, "select event conditions");
				assert.equal(sType, SelectType.Set, "select event type");

				oModel.setData({
					_valid: false
				});
				assert.notOk(oDefineConditionPanel.getInputOK(), "inputOK on DefineConditionPanel");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getContent without scrolling", function(assert) {

		bIsTypeahead = true; // Popover would provide ScrollContainer
		var oContent = oConditions.getContent();

		if (oContent) {
			var fnDone = assert.async();
			oContent.then(function(oContent) {
				assert.ok(oContent, "Content returned");
				assert.ok(oContent.isA("sap.ui.mdc.field.DefineConditionPanel"), "DefineConditionPanel in ScrollContainer");
				assert.equal(oContent.getLabel(), "Test", "title");
				assert.deepEqual(oContent.getConditions(), oConditions.getConditions(), "Conditions on DefineConditionPanel");
				assert.ok(oContent.getInputOK(), "inputOK on DefineConditionPanel");
				var oFormatOptions = oContent.getFormatOptions();
				var oTestFormatOptions = {
					valueType: oType,
					maxConditions: -1,
					delegate: FieldBaseDelegate,
					delegateName: "sap/ui/mdc/field/FieldBaseDelegate",
					payload: { text: "X" },
					operators: ["EQ", "BT", "Contains"],
					defaultOperatorName: "EQ",
					display: FieldDisplay.Description
				};
				assert.deepEqual(oFormatOptions, oTestFormatOptions, "FormatOptions on DefineConditionPanel");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called: " + oError.message || oError);
				fnDone();
			});
		}

	});

	QUnit.test("getContainerConfig", function(assert) {

		var iConfirm = 0;
		var bClose;
		oConditions.attachEvent("confirm", function(oEvent) {
			iConfirm++;
			bClose = oEvent.getParameter("close");
		});
		var iCancel = 0;
		oConditions.attachEvent("cancel", function(oEvent) {
			iCancel++;
		});

		var oContainerConfig = oConditions.getContainerConfig();
		var oPopupConfig = oContainerConfig && oContainerConfig['sap.ui.mdc.valuehelp.Popover'];

		assert.ok(oContainerConfig, "Config returned");
		assert.ok(oPopupConfig, "Config contains a section for 'sap.ui.mdc.valuehelp.Popover'");
		assert.ok(oPopupConfig.showArrow, "Popup config contains truthy 'showArrow'");
		assert.ok(oPopupConfig.showHeader, "Popup config contains truthy 'showHeader'");

		var oFooterContent = oPopupConfig.getFooter && oPopupConfig.getFooter();

		if (oFooterContent) {
			var fnDone = assert.async();
			oFooterContent.then(function(aFooterContent) {
				assert.ok(aFooterContent, "Content returned");
				assert.ok(Array.isArray(aFooterContent), "Array returned");
				assert.equal(aFooterContent.length, 2, "content length");
				var oButtonOK = aFooterContent[0];
				var oButtonCancel = aFooterContent[1];
				oButtonOK.setModel(oModel, "$valueHelp"); // as Button is not in the control tree right now, will be added by Container
				assert.ok(oButtonOK.isA("sap.m.Button"), "First content is sap.m.Button");
				assert.ok(oButtonCancel.isA("sap.m.Button"), "Second content is sap.m.Button");
				assert.equal(oButtonOK.getText(), oResourceBundle.getText("valuehelp.OK"), "OK-Button text");
				assert.ok(oButtonOK.getEnabled(), "OK-Button enabled");
				assert.equal(oButtonOK.getType(), mLibrary.ButtonType.Emphasized, "OK-Button type");
				assert.equal(oButtonCancel.getText(), oResourceBundle.getText("valuehelp.CANCEL"), "Cancel-Button text");

				oModel.setData({
					_valid: false
				});
				assert.notOk(oButtonOK.getEnabled(), "OK-Button disabled");

				oButtonOK.firePress();
				assert.equal(iConfirm, 1, "Confirm event fired");
				assert.ok(bClose, "Confirm event configured for closing");
				oButtonCancel.firePress();
				assert.equal(iCancel, 1, "Cancel event fired");

				fnDone();
			}).catch(function(oError) {
				assert.notOk(true, "Promise Catch called");
				fnDone();
			});
		}

	});

	QUnit.test("getCount", function(assert) {

		var aConditions = [
			Condition.createItemCondition("X", "Text"),
			Condition.createCondition("EQ", ["Y"], undefined, undefined, ConditionValidated.NotValidated),
			Condition.createCondition("Contains", [], undefined, undefined, ConditionValidated.NotValidated)
		];
		aConditions[2].isEmpty = true;

		var iCount = oConditions.getCount(aConditions);
		assert.equal(iCount, 1, "count");

	});

	QUnit.test("getUseAsValueHelp", function(assert) {

		assert.notOk(oConditions.getUseAsValueHelp(), "getUseAsValueHelp");

	});

	QUnit.test("getValueHelpIcon", function(assert) {

		assert.equal(oConditions.getValueHelpIcon(), "sap-icon://value-help", "icon");

	});

	QUnit.test("isFocusInHelp", function(assert) {

		assert.ok(oConditions.isFocusInHelp(), "isFocusInHelp");

	});

	QUnit.test("getRequiresTokenizer", function(assert) {

		assert.ok(oConditions.getRequiresTokenizer(), "getRequiresTokenizer");

	});

	QUnit.test("getFormattedTitle", function(assert) {

		assert.equal(oConditions.getFormattedTitle(0), oResourceBundle.getText("valuehelp.DEFINECONDITIONSNONUMBER"), "formatted title");
		assert.equal(oConditions.getFormattedTitle(1), oResourceBundle.getText("valuehelp.DEFINECONDITIONS", 1), "formatted title");
		oConditions.setTitle("Text");
		assert.equal(oConditions.getFormattedTitle(0), "Text", "formatted title");

	});

	QUnit.test("getFormattedShortTitle", function(assert) {

		assert.equal(oConditions.getFormattedShortTitle(), oResourceBundle.getText("valuehelp.DEFINECONDITIONS.Shorttitle"), "formatted shortTitle");
		oConditions.setShortTitle("Text");
		assert.equal(oConditions.getFormattedShortTitle(), "Text", "formatted shortTitle");

	});

	QUnit.test("getFormattedTokenizerTitle", function(assert) {

		assert.equal(oConditions.getFormattedTokenizerTitle(0), oResourceBundle.getText("valuehelp.DEFINECONDITIONS.TokenizerTitleNoCount"), "formatted TokenizerTitle");
		assert.equal(oConditions.getFormattedTokenizerTitle(1), oResourceBundle.getText("valuehelp.DEFINECONDITIONS.TokenizerTitle", 1), "formatted TokenizerTitle");

		oConditions.setTokenizerTitle("myTitleText");
		assert.equal(oConditions.getFormattedTokenizerTitle(0), "myTitleText", "formatted TokenizerTitle");
		assert.equal(oConditions.getFormattedTokenizerTitle(1), "myTitleText", "formatted TokenizerTitle");

	});

	QUnit.test("getAriaAttributes", function(assert) {

		var oCheckAttributes = {
			contentId: "C1-DCP",
			ariaHasPopup: "dialog",
			roleDescription: null
		};
		var oAttributes = oConditions.getAriaAttributes();
		assert.ok(oAttributes, "Aria attributes returned");
		assert.deepEqual(oAttributes, oCheckAttributes, "returned attributes");

	});

	QUnit.test("fieldHelp", function(assert) {

		var sFieldHelp = oConditions.getFieldHelp();
		assert.equal(sFieldHelp, null, "fieldHelp is empty");

		oConditions.setFieldHelp("myFieldHelp");
		sFieldHelp = oConditions.getFieldHelp();
		assert.equal(sFieldHelp, "myFieldHelp", "FieldHelp is set");

		var oContentPromise = oConditions.getContent();
		var fnDone = assert.async();
		oContentPromise.then(function(oContent) {
			var oDefineConditionPanel = oContent.getContent()[0];

			assert.equal(oDefineConditionPanel.getFieldHelp(), "myFieldHelp", "DefineConditionPanel fieldHelp is set");
			fnDone();
		});

	});
});
