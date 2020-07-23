/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/FlexibleColumnLayout/pages/Main",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Helper, Any, Main, Opa5, opaTest, TestUtils) {

		Helper.qUnitModule("sap.ui.core.sample.odata.v4.FlexibleColumnLayout");

		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			//*****************************************************************************
			opaTest("List report and object page are in sync", function (Given, When, Then) {
				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");

				When.onTheListReport.sortBySalesOrderID();
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000000");
				Then.onTheObjectPage.checkSalesOrderID("0500000000");

				When.onTheObjectPage.changeNote("Test");
				When.onTheApplication.pressSave();
				Then.onTheObjectPage.checkNote("Test");

				When.onTheListReport.sortBySalesOrderID();
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test");

				When.onTheObjectPage.changeNote("Test (changed)");
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test (changed)");
				Then.onTheObjectPage.checkNote("Test (changed)");

				When.onTheApplication.pressCancel();
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test");
				Then.onTheObjectPage.checkNote("Test");

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});

			//*****************************************************************************
			opaTest("Object page and sub-object page are in sync", function (Given, When, Then) {
				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				When.onTheObjectPage.selectSalesOrderItem(0);
				Then.onTheSubObjectPage.checkItemPosition('0000000010');

				When.onTheObjectPage.sortByGrossAmount();
				Then.onTheObjectPage.checkSalesOrderItemNotInTheList('0000000010');
				Then.onTheSubObjectPage.checkItemPosition('0000000010');

				When.onTheSubObjectPage.changeQuantity("2");
				Then.onTheSubObjectPage.checkQuantity("2.000");
				When.onTheObjectPage.pressMore();
				Then.onTheSubObjectPage.checkQuantity("2.000");
				Then.onTheObjectPage.checkSalesOrderItem(9, "0000000010", "2.000");

				When.onTheApplication.pressCancel();
				Then.onTheSubObjectPage.checkQuantity("4.000");
				Then.onTheObjectPage.checkSalesOrderItem(9, "0000000010", "4.000");

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});

			QUnit.start();
		}
	});
});
