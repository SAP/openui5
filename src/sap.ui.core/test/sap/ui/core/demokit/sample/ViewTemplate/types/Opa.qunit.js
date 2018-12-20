/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/base/Log",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/ViewTemplate/types/pages/Main",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Log, Any, Main, opaTest, TestUtils) {

		QUnit.module("sap.ui.core.sample.ViewTemplate.types");

		//*****************************************************************************
		opaTest("OData Types", function (Given, When, Then) {

			When.onAnyPage.applySupportAssistant();

			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.ViewTemplate.types"
				}
			});

			When.onTheMainPage.changeMinMaxField("100");
			Then.onTheMainPage.checkControlIsDirty("decimalInput", true);
			When.onTheMainPage.pressButton("toggleV4Button");
			if (TestUtils.isRealOData()) {
				When.onTheMainPage.changeBoolean();
				When.onTheMainPage.pressButton("saveButton");
				When.onTheMainPage.pressButton("resetButton");
				When.onTheMainPage.pressMessagePopoverCloseButton();
			}
			When.onTheMainPage.enterBoolean("XXX");
			Then.onTheMainPage.checkControlIsDirty("booleanInput", true);
			When.onTheMainPage.pressButton("resetModelButton");
			Then.onTheMainPage.checkBooleanValue(true);
			When.onTheMainPage.enterBoolean("YYY");
			Then.onTheMainPage.checkControlIsDirty("booleanInput", true);
			When.onTheMainPage.pressButton("resetContextBindingButton");
			Then.onTheMainPage.checkBooleanValue(true);
			When.onTheMainPage.enterBoolean("");
			Then.onTheMainPage.checkControlIsDirty("booleanInput", true);
			When.onTheMainPage.pressButton("resetModelButton");
			Then.onTheMainPage.checkBooleanValue(true);
			Then.onTheMainPage.checkControlIsDirty("booleanInput", false);

			Then.onAnyPage.checkLog([{ component : "sap.ui.model.odata.v4.ODataMetaModel",
				level : Log.Level.WARNING,
				message : "'Edm.Duration', using sap.ui.model.odata.type.Raw"}]);
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
