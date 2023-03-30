/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - ODataListBinding#create"
		+ ": Test Case 4: Create new sales order items with inline creation rows");

	//*****************************************************************************
	opaTest("Test Case 4: Create new sales order items with inline creation rows",
		function (Given, When, Then) {
			var oItem010 = {
					Currency : "EUR",
					GrossAmount : "8.21",
					ItemPosition : "010",
					Note : "Item 010",
					ProductID : "HT-1111",
					Quantity : "1",
					SalesOrderID : "245",
					Status : "From Server",
					Unit : "EA"
				},
				oItem020 = {
					Currency : "EUR",
					GrossAmount : "546.21",
					ItemPosition : "020",
					Note : "G",
					ProductID : "HT-1020",
					Quantity : "1",
					SalesOrderID : "245",
					Status : "Persisted",
					Unit : "EA"
				},
				oInactiveItem = {
					Currency : "",
					GrossAmount : "",
					ItemPosition : "",
					Note : "",
					ProductID : "",
					Quantity : "",
					SalesOrderID : "245",
					Status : "Inactive",
					Unit : ""
				};

			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.internal.samples.odata.v2.SalesOrders",
					settings : {inlineCreationRows : 1}
				}
			});

			// Start the sales orders application with 1 inline creation row
			// Step 1 - start application with inlineCreationRows=1
			When.onMainPage.showSalesOrder("245");
			Then.onMainPage.checkSalesOrderLoaded("245");
			Then.onMainPage.checkSalesOrderItemsLoaded("245");
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, oInactiveItem);
			// Step 2
			When.onMainPage.rememberCurrentItemCount();

			// Edit inactive row - cancel activation
			// Step 1
			When.onMainPage.changeItemNote(1, "E");
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, Object.assign({}, oInactiveItem, {
				Note : "E",
				Status : "Inactive"
			}));
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);
			// Step 2 - reset changes - inactive row is reset
			When.onMainPage.pressResetChangesButton();
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, oInactiveItem);
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);

			// Edit inactive rows
			// Step 1
			When.onMainPage.changeItemValues(1, {Note : "E", ProductID : "HT-1020"});
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, Object.assign({}, oInactiveItem, {
				Note : "E",
				ProductID : "HT-1020",
				Status : "Transient"
			}));
			Then.onMainPage.checkItemAtRow(2, oInactiveItem);
			Then.onMainPage.checkItemCountChangedBy(1);
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);
			// Step 2
			When.onMainPage.changeItemValues(2, {Note : "F", ProductID : "HT-1020"});
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, Object.assign({}, oInactiveItem, {
				Note : "E",
				ProductID : "HT-1020",
				Status : "Transient"
			}));
			Then.onMainPage.checkItemAtRow(2, Object.assign({}, oInactiveItem, {
				Note : "F",
				ProductID : "HT-1020",
				Status : "Transient"
			}));
			Then.onMainPage.checkItemAtRow(3, oInactiveItem);
			Then.onMainPage.checkItemCountChangedBy(1);
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);

			// Reset changes removes only transient entries
			// Step 1
			When.onMainPage.pressResetChangesButton();
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, oInactiveItem);
			Then.onMainPage.checkItemCountChangedBy(-2);
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);

			// Inactive rows are not sent to the server
			// Step 1
			When.onMainPage.changeItemValues(1, {Note : "G", ProductID : "HT-1020"});
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, Object.assign({}, oInactiveItem, {
				Note : "G",
				ProductID : "HT-1020",
				Status : "Transient"
			}));
			Then.onMainPage.checkItemAtRow(2, oInactiveItem);
			Then.onMainPage.checkItemCountChangedBy(1);
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);
			// Step 2
			When.onMainPage.changeItemValues(1, {Quantity : "1", Unit : "EA"});
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, Object.assign({}, oInactiveItem, {
				Note : "G",
				ProductID : "HT-1020",
				Status : "Transient",
				Quantity : "1",
				Unit : "EA"
			}));
			Then.onMainPage.checkItemAtRow(2, oInactiveItem);
			Then.onMainPage.checkItemCountChangedBy(0);
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);
			//Step 3
			When.onMainPage.pressSalesOrderSaveButton();
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, oItem020);
			Then.onMainPage.checkItemAtRow(2, oInactiveItem);
			Then.onMainPage.checkItemCountChangedBy(0);
			Then.onMainPage.checkItemsTableLengthDiffersBy(1);

			Given.iTeardownMyApp();
		});
});