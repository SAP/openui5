/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/SalesOrdersTemplate/pages/Main",
		"sap/ui/test/opaQunit",
		"sap/ui/core/sample/odata/v4/SalesOrdersTemplate/SandboxModel" // preload only
	], function (Helper, Any, Main, opaTest) {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrdersTemplate");

		//*****************************************************************************
		opaTest("Start sales orders template app and check log", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.SalesOrdersTemplate"
				}
			});

			When.onTheMainPage.pressValueHelpOnCurrencyCode();
			When.onTheMainPage.pressValueHelpOnRole();

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
