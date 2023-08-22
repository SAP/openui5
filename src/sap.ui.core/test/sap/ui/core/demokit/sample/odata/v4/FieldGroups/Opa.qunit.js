/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/FieldGroups/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/FieldGroups/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.FieldGroups");

		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			//*****************************************************************************
			opaTest("Enter a name and stay in field group", function (Given, When, Then) {
				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FieldGroups"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				Then.onTheMainPage.checkField("firstName", "Karl");
				Then.onTheMainPage.checkField("lastName", "Müller");

				When.onTheMainPage.observeRequests();
				When.onTheMainPage.selectField("firstName");
				When.onTheMainPage.enterValue("firstName", "Karl*");
				When.onTheMainPage.selectField("lastName");
				Then.onTheMainPage.expectRequest([
					"PATCH ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)"
				]);

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
			});

			opaTest("Enter a last name, leave field group and request side effects",
					function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FieldGroups"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				Then.onTheMainPage.checkField("firstName", "Karl");
				Then.onTheMainPage.checkField("lastName", "Müller");

				When.onTheMainPage.observeRequests();
				When.onTheMainPage.selectField("lastName");
				When.onTheMainPage.enterValue("lastName", "Müller*");
				When.onTheMainPage.selectField("emailAddress");
				Then.onTheMainPage.checkField("firstName", "Karl**");
				Then.onTheMainPage.checkField("lastName", "Müller**");
				Then.onTheMainPage.expectRequest([
					"PATCH ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)",
					"GET ContactList(42010aef-0de5-1eea-af8f-5bce865f0879)?"
					+ "$select=FirstName,LastName"
				]);

				Then.onAnyPage.checkLog();
			});

			QUnit.start();
		}
	});
});
