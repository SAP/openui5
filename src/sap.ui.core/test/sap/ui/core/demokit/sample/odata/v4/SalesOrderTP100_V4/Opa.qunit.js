/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrderTP100_V4");

		//*****************************************************************************
		opaTest("Start sales orders TP100 app and check log", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.SalesOrderTP100_V4"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			When.onTheMainPage.pressMoreButton("SalesOrders");
			When.onTheMainPage.selectSalesOrder(1);
			When.onTheMainPage.pressMoreButton("SalesOrderItems");

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
		});

		QUnit.start();
	});
});
