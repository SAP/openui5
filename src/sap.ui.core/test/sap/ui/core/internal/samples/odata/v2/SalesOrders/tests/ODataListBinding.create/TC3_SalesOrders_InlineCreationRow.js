/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - ODataListBinding#create"
		+ ": Test Case 3: Create new sales orders with inline creation rows");

	//*****************************************************************************
	opaTest("Test Case 3: Create new sales orders with inline creation rows",
		function (Given, When, Then) {
			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.internal.samples.odata.v2.SalesOrders",
					settings : {inlineCreationRows : 1}
				}
			});

			// Start the sales orders application with 1 inline creation row
			// Step 1 - start application with inlineCreationRows=1
			// Step 2
			When.onMainPage.pressUseTableButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "", "Inactive");
			Then.onMainPage.checkSalesOrderAtRow(1, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			// Step 3
			When.onMainPage.rememberSalesOrdersCount();
			Then.onMainPage.checkSalesOrdersTableLengthDiffersBy(1);

			// Edit inactive rows
			// Step 1
			When.onMainPage.changeSalesOrderNoteOfRow(0, "A");
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "A", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "", "Inactive");
			Then.onMainPage.checkSalesOrderAtRow(2, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			Then.onMainPage.checkSalesOrdersTableLengthDiffersBy(1);
			// Step 2
			When.onMainPage.changeSalesOrderNoteOfRow(1, "B");
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "A", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "B", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "", "", "", "Inactive");
			Then.onMainPage.checkSalesOrderAtRow(3, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			Then.onMainPage.checkSalesOrdersTableLengthDiffersBy(1);

			// Reset changes removes only transient entries
			// Step 1
			When.onMainPage.pressResetChangesButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "", "Inactive");
			Then.onMainPage.checkSalesOrderAtRow(1, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrderAtRow(2, "204", "Telecomunicaciones Star", "Inline Creation Rows 204",
				"From Server");
			Then.onMainPage.checkSalesOrderAtRow(3, "203", "Talpa", "Inline Creation Rows 203",
				"From Server");
			Then.onMainPage.checkSalesOrderAtRow(4, "202", "Asia High tech", "Inline Creation Rows 202",
				"From Server");
			// Table has 6 visible rows - 1 inactive + 4 known rows are available -> read last one from server
			Then.onMainPage.checkSalesOrderAtRow(5, "201", "Telecomunicaciones Star", "Inline Creation Rows 201",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(-2);
			Then.onMainPage.checkSalesOrdersTableLengthDiffersBy(1);

			// Modify inactive entry in the object page
			// Step 1
			When.onMainPage.selectSalesOrderAtRow(0);
			Then.onMainPage.checkSalesOrderItemsTableIsEmpty();
			// Step 2
			When.onMainPage.changeSalesOrderNoteOnObjectPage("C");
			Then.onMainPage.checkSalesOrderAtRow(0, "", "", "C", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "", "Inactive");
			Then.onMainPage.checkSalesOrderAtRow(2, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			Then.onMainPage.checkSalesOrdersTableLengthDiffersBy(1);
			// Step 3
			When.onMainPage.selectSalesOrderAtRow(1);
			Then.onMainPage.checkSalesOrderItemsTableIsEmpty();
			// Step 4
			When.onMainPage.pressSalesOrderSaveButton();
			Then.onMainPage.checkSalesOrderAtRow(0, "240", "SAP", "C", "Persisted");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "", "Inactive");
			// Step 5
			When.onMainPage.changeSalesOrderNoteOfRow(1, "D");
			Then.onMainPage.checkSalesOrderAtRow(0, "240", "SAP", "C", "Persisted");
			Then.onMainPage.checkSalesOrderAtRow(1, "", "", "D", "Transient");
			Then.onMainPage.checkSalesOrderAtRow(2, "", "", "", "Inactive");
			Then.onMainPage.checkSalesOrderAtRow(3, "205", "SAP", "Inline Creation Rows 205",
				"From Server");
			Then.onMainPage.checkSalesOrdersCountChangedBy(1);
			Then.onMainPage.checkSalesOrdersTableLengthDiffersBy(1);

			// Empty sales order items table for inactive and transient sales orders
			// Step 1
			When.onMainPage.selectSalesOrderAtRow(2);
			Then.onMainPage.checkSalesOrderItemsTableIsEmpty();
			// Step 2
			When.onMainPage.selectSalesOrderAtRow(1);
			Then.onMainPage.checkSalesOrderItemsTableIsEmpty();
			// Step 3
			When.onMainPage.selectSalesOrderAtRow(3);
			Then.onMainPage.checkItemAtRow(0, {
				Currency : "EUR",
				GrossAmount : "1,137.64",
				ItemPosition : "010",
				Note : "Item 010",
				ProductID : "HT-1000",
				Quantity : "1",
				SalesOrderID : "205",
				Status : "From Server"
			});
			Then.onMainPage.checkItemAtRow(1, {
				Currency : "",
				GrossAmount : "",
				ItemPosition : "",
				Note : "",
				ProductID : "",
				Quantity : "",
				SalesOrderID : "205",
				Status : "Inactive",
				Unit : ""
			});
			// Step 4
			When.onMainPage.selectSalesOrderAtRow(0);
			Then.onMainPage.checkItemAtRow(0, {
				Currency : "",
				GrossAmount : "",
				ItemPosition : "",
				Note : "",
				ProductID : "",
				Quantity : "",
				SalesOrderID : "240",
				Status : "Inactive",
				Unit : ""
			});

			Given.iTeardownMyApp();
		});
});