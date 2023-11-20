/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - ODataListBinding#create"
		+ ": Test Case 1: Create new sales orders inline");

	//*****************************************************************************
	opaTest("Test Case 1: Create new sales orders inline",
		function (Given, When, Then) {
			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
				}
			});

			// Create two sales orders without saving them
			// Step 1
			When.onMainPage.pressUseTableButton();
			// Step 2
			When.onMainPage.rememberSalesOrdersCount();
			// Step 3
			When.onMainPage.pressSalesOrdersCreateButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "", "Transient");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			// Step 4
			When.onMainPage.changeSalesOrderNoteOfRow(0, "1");
			// Step 5 - repeat steps 3 and 4
			When.onMainPage.pressSalesOrdersCreateButton();
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "", "Transient");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			When.onMainPage.changeSalesOrderNoteOfRow(1, "2");

			// Sort the Sales Orders table
			// Step 1
			When.onMainPage.sortSalesOrders("asc");
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "1", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "2", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "201", "Telecomunicaciones Star",
				"Inline Creation Rows 201", "From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(0);
			// Step 2
			When.onMainPage.sortSalesOrders("desc");
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "1", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "2", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(0);

			// Filter the Sales Orders table by Customer Name
			// Step 1
			When.onMainPage.rememberSalesOrdersCount();
			// Step 2
			When.onMainPage.changeSalesOrdersFilter("SAP");
			When.onMainPage.pressSalesOrdersFilterGoButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "1", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "2", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(-4);
			// Step 3
			When.onMainPage.changeSalesOrdersFilter("");
			When.onMainPage.pressSalesOrdersFilterGoButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "1", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "2", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrderAtRow(3, "204", "Telecomunicaciones Star",
				"Inline Creation Rows 204", "From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(4);

			// Refresh the Sales Orders table
			// Step 1
			When.onMainPage.rememberSalesOrdersCount();
			When.onMainPage.pressSalesOrdersCreateButton();
			Then.onMainPage.checkSalesOrderAtRow(2, "", "", "", "Transient");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			When.onMainPage.changeSalesOrderNoteOfRow(2, "3");
			When.onMainPage.pressSalesOrdersCreateButton();
			Then.onMainPage.checkSalesOrderAtRow(3, "", "", "", "Transient");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			When.onMainPage.changeSalesOrderNoteOfRow(3, "4");
			// Step 2 count already remembered
			// Step 3
			When.onMainPage.pressSalesOrdersRefreshButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "1", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "2", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "", "", "3", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(3, "", "", "4", "Transient");
			Then.onMainPage.checkSalesOrdersCountChangedBy(0);

			// Delete a transient sales order
			// Step 1
			When.onMainPage.rememberSalesOrdersCount();
			// Step 2
			When.onMainPage.selectSalesOrderAtRow(2);
			When.onMainPage.pressSalesOrdersDelete();
			// Step 3
			When.onMainPage.confirmDialog();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "1", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "2", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "", "", "4", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(3, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(-1);

			// Filter and save the transient sales orders
			// Step 1
			When.onMainPage.changeSalesOrdersFilter("Talpa");
			When.onMainPage.pressSalesOrdersFilterGoButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "1", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "2", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "", "", "4", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(3, "203", "Talpa", "Inline Creation Rows 203",
				"From Server");
			// Step 2
			When.onMainPage.rememberSalesOrdersCount();
			// Step 3
			When.onMainPage.pressSalesOrderSaveButton();
			Then.onMainPage.checkSalesOrdersCountChangedBy(0);
			Then.onMainPage.checkSalesOrderAtRow(0, "220", "SAP", "1", "Persisted");
			Then.onMainPage.checkSalesOrderAtRow(1, "221", "SAP", "2", "Persisted");
			Then.onMainPage.checkSalesOrderAtRow(2, "222", "SAP", "4", "Persisted");
			Then.onMainPage.checkSalesOrderAtRow(3, "203", "Talpa", "Inline Creation Rows 203",
				"From Server");

			// Delete the saved sales order with the Note 4
			// Step 1
			When.onMainPage.rememberSalesOrdersCount();
			// Step 2
			When.onMainPage.selectSalesOrderAtRow(2);
			When.onMainPage.pressSalesOrdersDelete();
			// Step 3
			When.onMainPage.confirmDialog();
			Then.onMainPage.checkSalesOrderAtRow(0, "220", "SAP", "1", "Persisted");
			Then.onMainPage.checkSalesOrderAtRow(1, "221", "SAP", "2", "Persisted");
			Then.onMainPage.checkSalesOrderAtRow(2, "203", "Talpa", "Inline Creation Rows 203",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(-1);

			// Sort and page through the Sales Orders table
			// Step 1
			When.onMainPage.changeSalesOrdersFilter("");
			When.onMainPage.pressSalesOrdersFilterGoButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "221", "SAP", "2", "From Server");
			Then.onMainPage.checkSalesOrderAtRow(1, "220", "SAP", "1", "From Server");
			Then.onMainPage.checkSalesOrderAtRow(2, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrderAtRow(3, "204", "Telecomunicaciones Star",
				"Inline Creation Rows 204", "From Server");
			// Step 2
			When.onMainPage.sortSalesOrders("asc");
			// Step 3
			When.onMainPage.pressSalesOrdersMoreButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "201", "Telecomunicaciones Star",
				"Inline Creation Rows 201", "From Server");
			Then.onMainPage.checkSalesOrderAtRow(1, "202", "Asia High tech",
				"Inline Creation Rows 202", "From Server");
			Then.onMainPage.checkSalesOrderAtRow(2, "203", "Talpa", "Inline Creation Rows 203",
				"From Server");
			Then.onMainPage.checkSalesOrderAtRow(3, "204", "Telecomunicaciones Star",
				"Inline Creation Rows 204", "From Server");
			Then.onMainPage.checkSalesOrderAtRow(4, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrderAtRow(5, "220", "SAP", "1", "From Server");
			Then.onMainPage.checkSalesOrderAtRow(6, "221", "SAP", "2", "From Server");

			Given.iTeardownMyApp();
		});
});