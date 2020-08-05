/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/base/Log",
		"sap/ui/core/library",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/ViewTemplate/types/pages/Main",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Log, library, Any, Main, opaTest, TestUtils) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage(),
			MessageType = library.MessageType, // shortcut for sap.ui.core.MessageType
			ValueState = library.ValueState; // shortcut for sap.ui.core.ValueState

		QUnit.module("sap.ui.core.sample.ViewTemplate.types", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		opaTest("OData Types", function (Given, When, Then) {

			When.onAnyPage.applySupportAssistant();

			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.ViewTemplate.types"
				}
			});

			When.onTheMainPage.pressButton("toggleV4Button");
			Then.onTheMessagePopover.checkMessages([
			/*TODO: The MessagesPopover is opened, in the details we see the
			Message but not in the master list of the messages, hence we can't check it {
				message : "Type 'sap.ui.model.odata.type.Raw' does not support formatting",
				type : MessageType.Error
			}*/]);
			When.onTheMessagePopover.close();

			if (TestUtils.isRealOData()) {
				// reset data in order to have a predefined starting point
				When.onTheMainPage.changeBoolean();
				When.onTheMainPage.pressButton("saveButton");
				When.onTheMainPage.pressButton("resetButton");
			}

			When.onTheMainPage.enterInputValue("decimalInput", "100");
			Then.onTheMainPage.checkInputValueState("decimalInput", ValueState.Error,
				"Enter a number greater than 100.000");
			When.onTheMainPage.enterInputValue("decimalInput", "101");
			Then.onTheMainPage.checkInputValueState("decimalInput", ValueState.None, "");

			When.onTheMainPage.enterStepInputValue("stepInput", 102);
			Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.Error,
				"Enter a number with a maximum value of 99");
			When.onTheMainPage.enterStepInputValueInteger("stepInput", 1.234);
			Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.None, "");
			/* 	this is fixed with change #4530100 - value with decimals cannot be entered
				anymore when scale/displayValuePrecision is 0; that's why this is commented

			When.onTheMainPage.enterStepInputValue("stepInput", 1.234);
			Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.Error,
				"Enter a number with no decimal places");

			*/
			When.onTheMainPage.enterStepInputValue("stepInput", 0);
			Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.None);

			When.onTheMainPage.enterInputValue("booleanInput", "XXX");
			Then.onTheMainPage.checkInputIsDirty("booleanInput", true);
			When.onTheMainPage.pressButton("resetModelButton");
			Then.onTheMainPage.checkInputValue("booleanInput", "Yes");
			Then.onTheMainPage.checkInputIsDirty("booleanInput", false);
			When.onTheMainPage.enterInputValue("booleanInput", "YYY");
			Then.onTheMainPage.checkInputIsDirty("booleanInput", true);
			When.onTheMainPage.pressButton("resetContextBindingButton");
			Then.onTheMainPage.checkInputValue("booleanInput", "Yes");
			Then.onTheMainPage.checkInputIsDirty("booleanInput", false);
			When.onTheMainPage.enterInputValue("booleanInput", "");
			Then.onTheMainPage.checkInputIsDirty("booleanInput", true);
			When.onTheMainPage.pressButton("resetModelButton");
			Then.onTheMainPage.checkInputValue("booleanInput", "Yes");
			Then.onTheMainPage.checkInputIsDirty("booleanInput", false);

			When.onTheMainPage.enterInputValue("Identification::Duration", "10 sec",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			Then.onTheMainPage.checkInputIsDirty("Identification::Duration", true,
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			When.onTheMainPage.pressButton("messagesButton");
			Then.onTheMessagePopover.checkMessages([{
				message : "Type 'sap.ui.model.odata.type.Raw' does not support parsing",
				type : MessageType.Error
			}]);
			When.onTheMainPage.pressButton("resetModelButton");
			Then.onTheMainPage.checkInputValue("Identification::Duration", "",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			Then.onTheMainPage.checkInputIsDirty("Identification::Duration", false,
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");

			When.onTheMainPage.enterDateTimePickerValue("I54", "Apr 19, 2029");
			Then.onTheMainPage.checkDateTimePickerValueState("I54", ValueState.None);
			When.onTheMainPage.enterDateTimePickerValue("I56", "Apr 19, 2029, 8:25:21 AM");
			Then.onTheMainPage.checkDateTimePickerValueState("I56", ValueState.None);
			When.onTheMainPage.enterDateTimePickerValue("I58", "8:25:21 AM");
			Then.onTheMainPage.checkDateTimePickerValueState("I58", ValueState.None);

			// parseKeepsEmptyString test
			When.onTheMainPage.enterInputValue("Identification::String40", "",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			Then.onTheMainPage.checkInputValue("Identification::String40", "",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			Then.onTheMainPage.checkInputValueState("Identification::String40", ValueState.None, "",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");// no server error on input
			Then.onTheMainPage.checkInputIsDirty("Identification::String40", false,
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");

			Then.onAnyPage.checkLog([{ component : "sap.ui.model.odata.v4.ODataMetaModel",
				level : Log.Level.WARNING,
				message : "'Edm.Duration', using sap.ui.model.odata.type.Raw"}]);
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
