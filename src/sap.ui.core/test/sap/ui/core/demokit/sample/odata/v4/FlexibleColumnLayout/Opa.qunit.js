/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

/*
 * CAUTION: Do not try to access the list report while the sub-object is visible. All three columns
 * plus the OPA column need a width of more than 1,600 pixels. If the window/frame does not have
 * this width, the list report will be hidden when showing the sub-object page. Then accessing its
 * controls in the OPA will fail.
 */

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/FlexibleColumnLayout/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/FlexibleColumnLayout/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
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
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test (original)");
				Then.onTheObjectPage.checkNote("Test (original)");

				When.onTheObjectPage.changeNote("Test");

				When.onTheListReport.sortBySalesOrderID();
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000000");
				Then.onTheObjectPage.checkSalesOrderID("0500000000");

				Then.onTheObjectPage.checkNote("Test");

				When.onTheListReport.sortBySalesOrderID();
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test");

				When.onTheObjectPage.changeNote("Test (changed)");
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test (changed)");
				Then.onTheObjectPage.checkNote("Test (changed)");

				When.onTheApplication.pressCancel();
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test (original)");
				Then.onTheObjectPage.checkNote("Test (original)");

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
			});

			//*****************************************************************************
			opaTest("Object page and sub-object page are in sync", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				When.onTheObjectPage.selectSalesOrderItem(0);
				Then.onTheSubObjectPage.checkItemPosition("0000000010");

				When.onTheSubObjectPage.changeQuantity("2");

				When.onTheObjectPage.sortByGrossAmount();
				Then.onTheObjectPage.checkSalesOrderItemNotInTheList("0000000010");
				Then.onTheSubObjectPage.checkItemPosition("0000000010");
				Then.onTheSubObjectPage.checkQuantity("2.000");

				When.onTheSubObjectPage.pressResetChanges(); //JIRA: CPOUI5ODATAV4-1819
				Then.onTheSubObjectPage.checkQuantity("4.000");

				When.onTheObjectPage.changeNote("Scenario (5): Reset via parent");
				Then.onTheObjectPage.checkSalesOrderItemsCount(27);
				When.onTheObjectPage.createSalesOrderItem();
				Then.onTheObjectPage.checkSalesOrderItemsCount(28);
				When.onTheSubObjectPage.changeQuantity(""); // an invalid data state
				When.onTheObjectPage.pressResetChanges(); //JIRA: CPOUI5ODATAV4-1819
				Then.onTheObjectPage.checkSalesOrderItemsCount(27);
				Then.onTheObjectPage.checkNote("Test (original)");
				Then.onTheSubObjectPage.checkQuantity("4.000");

				When.onTheSubObjectPage.changeQuantity("2");
				When.onTheObjectPage.pressMore();
				Then.onTheSubObjectPage.checkQuantity("2.000");
				Then.onTheObjectPage.checkSalesOrderItem(9, "0000000010", "2.000");

				When.onTheApplication.pressCancel();
				Then.onTheSubObjectPage.checkQuantity("4.000");
				Then.onTheObjectPage.checkSalesOrderItem(9, "0000000010", "4.000");
			});

			//*****************************************************************************
			opaTest("Delete a kept-alive context that is not visible in the sales orders table"
					+ "; after deletion the count in the table does not change and the object page"
					+ " vanishes", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				Then.onTheListReport.checkSalesOrdersCount(10);
				When.onTheListReport.selectSalesOrder(4);
				Then.onTheObjectPage.checkSalesOrderID("0500000004");

				When.onTheObjectPage.changeNote("Test");

				When.onTheListReport.filterByGrossAmount("1000");
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000004");
				Then.onTheListReport.checkSalesOrdersCount(7);
				Then.onTheObjectPage.checkSalesOrderID("0500000004");

				When.onTheApplication.pressCancel(); // reset "Note" change

				When.onTheObjectPage.deleteSalesOrder();
				When.onTheApplication.closeDialog("Success");
				Then.onTheApplication.checkMessagesButtonCount(0);
				Then.onTheApplication.checkObjectPageNotVisible();
				Then.onTheListReport.checkSalesOrdersCount(7);
			});

			//*****************************************************************************
			opaTest("Delete a kept-alive context in a table with transient contexts; after"
					+ " deletion the count changes and the sub-object page vanishes",
					function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				Then.onTheObjectPage.checkSalesOrderItemsCount(27);

				When.onTheObjectPage.selectSalesOrderItem(0);
				Then.onTheSubObjectPage.checkItemPosition("0000000010");

				When.onTheObjectPage.sortByGrossAmount();
				Then.onTheObjectPage.checkSalesOrderItemNotInTheList("0000000010");
				Then.onTheSubObjectPage.checkItemPosition("0000000010");

				When.onTheObjectPage.createSalesOrderItem();
				Then.onTheObjectPage.checkSalesOrderItemsCount(28);

				When.onTheSubObjectPage.deleteSalesOrderItem();
				When.onTheApplication.closeDialog("Success");
				Then.onTheApplication.checkMessagesButtonCount(0);
				Then.onTheApplication.checkSubObjectPageNotVisible();
				Then.onTheObjectPage.checkSalesOrderItemsCount(27);

				When.onTheApplication.pressCancel();
				Then.onTheObjectPage.checkSalesOrderItemsCount(26);
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
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

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
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");

				// apply filter and check context still in collection (pre-condition of refresh)
				When.onTheListReport.filterByGrossAmount("1000");
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				Then.onTheListReport.checkSalesOrder(0, "0500000000", "Test (original)");

				// code under test
				When.onTheObjectPage.refresh();
				// the object page is refreshed
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				Then.onTheObjectPage.checkNote("Test (refreshed)");
				// and the context is no longer visible in the sales order table
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000000");
			});

			//*****************************************************************************
			opaTest("Refresh the sales orders table with a kept-alive context that is not visible"
					+ " in the list; after refreshing the sales orders table, the sales order"
					+ " appears again in the list", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onTheListReport.selectSalesOrder(4);
				Then.onTheObjectPage.checkSalesOrderID("0500000004");

				// apply filter and check context is not in collection anymore
				When.onTheListReport.filterByGrossAmount("1000");
				Then.onTheObjectPage.checkSalesOrderID("0500000004");
				Then.onTheListReport.checkSalesOrderNotInTheList("0500000004");

				// code under test
				When.onTheListReport.refresh();

				// the object page is refreshed
				Then.onTheObjectPage.checkSalesOrderID("0500000004");
				Then.onTheListReport.checkSalesOrder(4, "0500000004", "Test (refreshed)");
			});

			//*****************************************************************************
			opaTest("Increase sales order line items' quantities (requestSideEffects)",
					function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onTheListReport.selectSalesOrder(0);
				Then.onTheObjectPage.checkSalesOrderID("0500000000");
				Then.onTheListReport.checkSalesOrder(
					0, "0500000000", "Test (original)", "29,558.41");

				When.onTheObjectPage.selectSalesOrderItem(0);
				Then.onTheSubObjectPage.checkItemPosition("0000000010");

				When.onTheObjectPage.sortByGrossAmount();
				Then.onTheObjectPage.checkSalesOrderItemNotInTheList("0000000010");
				Then.onTheSubObjectPage.checkQuantity("4.000");
				Then.onTheObjectPage.checkGrossAmount("29,558.41");
				Then.onTheObjectPage.checkNote("Test (original)");
				Then.onTheObjectPage.checkSalesOrderItem(0, "0000000080", "2.000");
				Then.onTheObjectPage.checkSalesOrderItem(1, "0000000090", "3.000");
				Then.onTheObjectPage.checkSalesOrderItem(2, "0000000050", "3.000");
				Then.onTheObjectPage.checkSalesOrderItem(3, "0000000030", "2.000");
				Then.onTheObjectPage.checkSalesOrderItem(4, "0000000100", "3.000");

				// code under test
				When.onTheObjectPage.increaseSalesOrderItemsQuantity();
				Then.onTheSubObjectPage.checkQuantity("5.000");
				Then.onTheObjectPage.checkGrossAmount("32,768.42");
				Then.onTheObjectPage.checkNote("10 items' quantities increased by 1");
				Then.onTheObjectPage.checkSalesOrderItem(0, "0000000080", "3.000");
				Then.onTheObjectPage.checkSalesOrderItem(1, "0000000090", "4.000");
				Then.onTheObjectPage.checkSalesOrderItem(2, "0000000050", "4.000");
				Then.onTheObjectPage.checkSalesOrderItem(3, "0000000030", "3.000");
				Then.onTheObjectPage.checkSalesOrderItem(4, "0000000100", "4.000");
				// Do not check the group ID in the list report. This may fail because the list
				// report is hidden if the window is too small.
			});

			//*****************************************************************************
			opaTest("Deep Create", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.FlexibleColumnLayout"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onTheApplication.pressCreate();
				When.onTheObjectPage.changeNote("Deep Create");
				Then.onTheListReport.checkSalesOrder(0, "", "Deep Create");
				Then.onTheObjectPage.checkSalesOrderID("");
				Then.onTheObjectPage.checkSalesOrderItemsCount(1);
				Then.onTheObjectPage.checkSalesOrderItem(0, "", "2.000");

				When.onTheObjectPage.createSalesOrderItem();
				Then.onTheObjectPage.checkSalesOrderItemsCount(2);
				Then.onTheObjectPage.checkSalesOrderItem(1, "", "2.000");

				When.onTheObjectPage.createSalesOrderItem();
				Then.onTheObjectPage.checkSalesOrderItemsCount(3);
				Then.onTheObjectPage.checkSalesOrderItem(2, "", "2.000");

				When.onTheObjectPage.createSalesOrderItem();
				Then.onTheObjectPage.checkSalesOrderItemsCount(4);
				Then.onTheObjectPage.checkSalesOrderItem(3, "", "2.000");

				When.onTheObjectPage.selectSalesOrderItem(1);
				When.onTheSubObjectPage.deleteSalesOrderItem();
				When.onTheApplication.closeDialog("Success");
				Then.onTheObjectPage.checkSalesOrderItemsCount(3);

				When.onTheObjectPage.selectSalesOrderItem(1);
				When.onTheSubObjectPage.changeQuantity("4");
				Then.onTheObjectPage.checkSalesOrderItem(1, "", "4.000");

				When.onTheApplication.pressSave();
				// do not check in the list report; it might be hidden
				Then.onTheObjectPage.checkSalesOrderID("0500000005");
				Then.onTheObjectPage.checkGrossAmount("14,176.90");
				Then.onTheObjectPage.checkSalesOrderItem(0, "0000000010", "2.000");
				Then.onTheObjectPage.checkSalesOrderItem(1, "0000000020", "4.000");
				Then.onTheObjectPage.checkSalesOrderItem(2, "0000000030", "2.000");
				Then.onTheApplication.checkSubObjectPageNotVisible();

				When.onTheObjectPage.selectSalesOrderItem(1);
				Then.onTheSubObjectPage.checkQuantity("4.000");

				When.onTheSubObjectPage.changeQuantity("3");
				When.onTheApplication.pressSave();
				Then.onTheObjectPage.checkGrossAmount("12,404.77");

				Then.onAnyPage.checkLog();
			});
		}

		QUnit.start();
	});
});
