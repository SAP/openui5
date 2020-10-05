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

				Then.iTeardownMyUIComponent();
			});

			//*****************************************************************************
			opaTest("Delete a kept-alive context that is not visible in the sales orders table, "
					+ "after refresh context is not visible in the sales orders table and the "
					+ "object page is updated", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});

				When.onTheListReport.sortBySalesOrderID();
				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000009");

				When.onTheListReport.sortBySalesOrderID();
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000009");
				Then.onTheObjectPage.checkSalesOrderID("0500000009");

				When.onTheObjectPage.deleteSalesOrder();
				When.onTheApplication.closeDialog("Success"); // close the success dialog
				Then.onTheApplication.checkMessagesButtonCount(0);
				Then.onTheApplication.checkObjectPageNotVisible();

				Then.iTeardownMyUIComponent();
			});

			//*****************************************************************************
			opaTest("Refresh a kept-alive context that is not visible in the sales order table"
					+ "; after refresh the object page vanishes", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});

				When.onTheListReport.sortBySalesOrderID();
				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000009");
				When.onTheListReport.sortBySalesOrderID();
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000009");
				Then.onTheObjectPage.checkSalesOrderID("0500000009");

				// code under test
				When.onTheObjectPage.refresh();
				// context vanishes
				Then.onTheApplication.checkObjectPageNotVisible();

				Then.iTeardownMyUIComponent();
			});

			//*****************************************************************************
			opaTest("Refresh a kept-alive context that is visible in the sales order table"
					+ "; after refresh the sales order is no longer in the sales order table",
					function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");

				// apply filter and check context still in collection (pre-condition of refresh)
				When.onTheListReport.filterByGrossAmount('1000');
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test (original)");

				// code under test
				When.onTheObjectPage.refresh();
				// the object page is refreshed
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				Then.onTheObjectPage.checkNote("Test (refreshed)");
				// and the context is no longer visible in the sales order table
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000000");

				Then.iTeardownMyUIComponent();
			});
		}

		QUnit.start();
	});
});
