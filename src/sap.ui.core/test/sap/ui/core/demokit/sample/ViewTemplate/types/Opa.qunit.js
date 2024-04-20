/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/date/UI5Date",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/ViewTemplate/types/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (Log, Localization, Core, Lib, library, UI5Date, DateFormat, MessageType, Any, Main,
			 opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
		var sDefaultLanguage = Localization.getLanguage(),
			ValueState = library.ValueState; // shortcut for sap.ui.core.ValueState

		QUnit.module("sap.ui.core.sample.ViewTemplate.types", {
			before : function () {
				Localization.setLanguage("en-US");
			},
			after : function () {
				Localization.setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		opaTest("OData Types", function (Given, When, Then) {
			var oBundle = Lib.getResourceBundleFor("sap.ui.core");

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
				oBundle.getText("EnterNumberMinExclusive", ["100.000"]));
			When.onTheMainPage.enterInputValue("decimalInput", "101");
			Then.onTheMainPage.checkInputValueState("decimalInput", ValueState.None, "");

			When.onTheMainPage.enterInputValue("I87", "");
			Then.onTheMainPage.checkInputValueState("I87", ValueState.None);
			Then.onTheMainPage.checkInputValue("I87", "0");
			When.onTheMainPage.enterInputValue("I83", "");
			Then.onTheMainPage.checkInputValueState("I83", ValueState.None);
			Then.onTheMainPage.checkInputValue("I83", "0");

			When.onTheMainPage.enterStepInputValue("stepInput", "102");
			Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.Error,
				oBundle.getText("EnterNumberMax", ["99"]));
			When.onTheMainPage.enterStepInputValue("stepInput", "1.234", "1");
			Then.onTheMainPage.checkStepInputValueState("stepInput", ValueState.None, "");
			When.onTheMainPage.enterStepInputValue("stepInput", "0");
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

			When.onTheMainPage.enterDatePickerValue("I54", "Apr 19, 2029");
			Then.onTheMainPage.checkDatePickerValueState("I54", ValueState.None);
			When.onTheMainPage.enterDateTimePickerValue("I56", "Apr 19, 2029, 8:25:21 AM");
			Then.onTheMainPage.checkDateTimePickerValueState("I56", ValueState.None);
			When.onTheMainPage.enterTimePickerValue("I58", "8:25:21 AM");
			Then.onTheMainPage.checkTimePickerValueState("I58", ValueState.None);

			// parseKeepsEmptyString test
			When.onTheMainPage.enterInputValue("Identification::String40", "",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			Then.onTheMainPage.checkInputValue("Identification::String40", "",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			Then.onTheMainPage.checkInputValueState("Identification::String40", ValueState.None, "",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");// no server error on input
			Then.onTheMainPage.checkInputIsDirty("Identification::String40", false,
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");

			// DateTimeOffset with timezone
			When.onTheMainPage.enterInputValue("Identification::TimezoneID", "Europe/Berlin",
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");
			Then.onTheMainPage.checkInputValue("Identification::DateTimeOffset",
				DateFormat.getDateTimeWithTimezoneInstance()
					.format(UI5Date.getInstance(2029, 3, 19, 8, 25, 21), "Europe/Berlin"),
				"sap.ui.core.sample.ViewTemplate.types.TemplateV4");

			Then.onAnyPage.checkLog([{component : "sap.ui.model.odata.v4.ODataMetaModel",
				level : Log.Level.WARNING,
				message : "'Edm.Duration', using sap.ui.model.odata.type.Raw"}]);
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
