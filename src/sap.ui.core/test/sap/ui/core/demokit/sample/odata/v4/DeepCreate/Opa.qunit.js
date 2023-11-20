/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/DeepCreate/pages/Main",
	"sap/ui/test/Opa",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/DeepCreate/SandboxModel" // preload only
], function (Core, Helper, Any, Main, Opa, opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.DeepCreate");

		//*****************************************************************************
		opaTest("Deep Create", function (Given, When, Then) {
			var bRealOData = TestUtils.isRealOData();

			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.DeepCreate"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			Opa.getContext().sViewName = "sap.ui.core.sample.odata.v4.DeepCreate.ObjectPage";

			// create order, create and delete line items and reset -> show list report
			When.onTheListReport.pressCreate();
			Then.onTheObjectPage.checkSalesOrderID("");
			When.onTheObjectPage.pressCreateLineItem();
			Then.onTheObjectPage.checkSalesOrderItemsCount(1);
			When.onTheObjectPage.pressCreateLineItem();
			When.onTheObjectPage.pressCreateLineItem();
			Then.onTheObjectPage.checkSalesOrderItemsCount(3);
			When.onTheObjectPage.selectLineItem(0);
			When.onTheObjectPage.selectLineItem(2);
			When.onTheObjectPage.pressDeleteSelectedLineItems();
			Then.onTheObjectPage.checkSalesOrderItemsCount(1);
			When.onTheObjectPage.pressResetChanges();

			// create order, create line items and save
			When.onTheListReport.pressCreate();
			When.onTheObjectPage.pressCreateLineItem();
			When.onTheObjectPage.pressCreateLineItem();
			Then.onTheObjectPage.checkSalesOrderItemsCount(2);
			When.onTheObjectPage.pressSave();
			if (bRealOData) {
				Then.onTheObjectPage.checkGrossAmount("4,550.56");
				Then.onTheObjectPage.checkSalesOrderItemsCount(2);
			} else {
				Then.onTheObjectPage.checkSalesOrderID("0500000007");
				Then.onTheObjectPage.checkSalesOrderItemsCount(3); // got a bonus item
				Then.onTheObjectPage.checkGrossAmount("6,825.84");
			}

			When.onAnyPage.cleanUp("SO_2_SOITEM");
			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
		});

		QUnit.start();
	});
});
