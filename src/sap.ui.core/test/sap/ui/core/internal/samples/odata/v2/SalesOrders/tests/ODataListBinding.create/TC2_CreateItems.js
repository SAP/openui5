/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - ODataListBinding#create"
		+ ": Test Case 2: Create new sales order items inline");

	//*****************************************************************************
	opaTest("Test Case 2: Create new sales order items inline",
		function (Given, When, Then) {
			var oItem010 = {
					Currency : "EUR",
					GrossAmount : "1,306.62",
					ItemPosition : "010",
					Note : "Item 010",
					ProductID : "HT-7000",
					Quantity : "2",
					SalesOrderID : "230"
				},
				oItem020 = {
					Currency : "EUR",
					GrossAmount : "404.60",
					ItemPosition : "020",
					Note : "Item 020",
					ProductID : "HT-1052",
					Quantity : "2",
					SalesOrderID : "230"
				},
				oTransientItem1 = {
					Note : "1",
					ProductID : "HT-1010",
					Quantity : "1",
					SalesOrderID : "230",
					Status : "Transient"
				},
				oTransientItem2 = {
					Note : "2",
					ProductID : "HT-1060",
					Quantity : "1",
					SalesOrderID : "230",
					Status : "Transient"
				},
				oTransientItem3 = {
					Note : "3",
					ProductID : "HT-1042",
					Quantity : "1",
					SalesOrderID : "230",
					Status : "Transient"
				},
				oTransientItem4 = {
					Note : "4",
					ProductID : "HT-9996",
					Quantity : "1",
					SalesOrderID : "230",
					Status : "Transient"
				},
				oPersistedItem1 = Object.assign({}, oTransientItem1, {
					Currency : "EUR",
					GrossAmount : "2,378.81",
					ItemPosition : "030",
					Status : "From Server"
				}),
				oPersistedItem2 = Object.assign({}, oTransientItem2, {
					Currency : "EUR",
					GrossAmount : "10.71",
					ItemPosition : "040",
					Status : "From Server"
				}),
				oPersistedItem4 = Object.assign({}, oTransientItem4, {
					Currency : "EUR",
					GrossAmount : "23.80",
					ItemPosition : "050",
					Status : "From Server"
				});

			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
				}
			});

			// Create two sales order items without saving them
			/* Step 1 */
			When.onMainPage.showSalesOrder("230");
			Then.onMainPage.checkSalesOrderLoaded("230");
			Then.onMainPage.checkSalesOrderItemsLoaded("230");
			// Step 2
			When.onMainPage.rememberCurrentItemCount();
			// Step 3
			When.onMainPage.pressCreateItem();
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");
			// Step 4
			When.onMainPage.changeProductIdInDialog("HT-1010");
			When.onMainPage.changeNoteInDialog("1");
			// Step 5
			When.onMainPage.pressNewItemCloseButton();
			Then.onMainPage.checkItemAtRow(0, oTransientItem1);
			Then.onMainPage.checkItemCountChangedBy(1);
			// Step 5 - repeat steps 3 to 5
			When.onMainPage.pressCreateItem();
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");
			When.onMainPage.changeProductIdInDialog("HT-1060");
			When.onMainPage.changeNoteInDialog("2");
			When.onMainPage.pressNewItemCloseButton();
			Then.onMainPage.checkItemAtRow(0, oTransientItem2);
			Then.onMainPage.checkItemCountChangedBy(1);

			// Sort the Sales Order Items table
			// Step 1
			When.onMainPage.sortItems("desc");
			Then.onMainPage.checkItemAtRow(0, oTransientItem2);
			Then.onMainPage.checkItemAtRow(1, oTransientItem1);
			Then.onMainPage.checkItemAtRow(2, oItem020);
			Then.onMainPage.checkItemCountChangedBy(0);
			// Step 2
			When.onMainPage.sortItems("asc");
			Then.onMainPage.checkItemAtRow(0, oTransientItem2);
			Then.onMainPage.checkItemAtRow(1, oTransientItem1);
			Then.onMainPage.checkItemAtRow(2, oItem010);
			Then.onMainPage.checkItemCountChangedBy(0);

			// Filter the Sales Order Items table by Gross Amount
			// Step 1
			When.onMainPage.rememberCurrentItemCount();
			// Step 2
			When.onMainPage.filterItems("<1000");
			Then.onMainPage.checkItemAtRow(0, oTransientItem2);
			Then.onMainPage.checkItemAtRow(1, oTransientItem1);
			Then.onMainPage.checkItemAtRow(2, oItem020);
			Then.onMainPage.checkItemCountChangedBy(-1);
			// Step 3
			When.onMainPage.filterItems("");
			Then.onMainPage.checkItemAtRow(0, oTransientItem2);
			Then.onMainPage.checkItemAtRow(1, oTransientItem1);
			Then.onMainPage.checkItemAtRow(2, oItem010);
			Then.onMainPage.checkItemAtRow(3, oItem020);
			Then.onMainPage.checkItemCountChangedBy(1);

			// Refresh the Sales Order Items table
			// Step 1
			When.onMainPage.pressCreateItem();
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");
			When.onMainPage.changeProductIdInDialog("HT-1042");
			When.onMainPage.changeNoteInDialog("3");
			When.onMainPage.pressNewItemCloseButton();
			Then.onMainPage.checkItemAtRow(0, oTransientItem3);
			Then.onMainPage.checkItemCountChangedBy(1);
			When.onMainPage.pressCreateItem();
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");
			When.onMainPage.changeProductIdInDialog("HT-9996");
			When.onMainPage.changeNoteInDialog("4");
			When.onMainPage.pressNewItemCloseButton();
			Then.onMainPage.checkItemAtRow(0, oTransientItem4);
			Then.onMainPage.checkItemCountChangedBy(1);
			// Step 2 - remember count, already done
			// Step 3
			When.onMainPage.pressItemsRefreshButton();
			Then.onMainPage.checkItemAtRow(0, oTransientItem4);
			Then.onMainPage.checkItemAtRow(1, oTransientItem3);
			Then.onMainPage.checkItemAtRow(2, oTransientItem2);
			Then.onMainPage.checkItemAtRow(3, oTransientItem1);
			Then.onMainPage.checkItemCountChangedBy(0);

			// Delete a transient sales order item
			// Step 1
			When.onMainPage.rememberCurrentItemCount();
			// Step 2
			When.onMainPage.selectRow(1);
			When.onMainPage.pressDeleteItem();
			// Step 3
			When.onMainPage.confirmDialog();
			Then.onMainPage.checkItemAtRow(0, oTransientItem4);
			Then.onMainPage.checkItemAtRow(1, oTransientItem2);
			Then.onMainPage.checkItemAtRow(2, oTransientItem1);
			Then.onMainPage.checkItemAtRow(3, oItem010);
			Then.onMainPage.checkItemCountChangedBy(-1);

			// Context switch
			// Step 1
			When.onMainPage.showSalesOrder("230.1");
			Then.onMainPage.checkSalesOrderLoaded("230.1");
			Then.onMainPage.checkSalesOrderItemsLoaded("230.1");
			Then.onMainPage.checkItemAtRow(0, {
				Currency : "EUR",
				GrossAmount : "2,275.28",
				ItemPosition : "015",
				Note : "Foo",
				ProductID : "HT-1000",
				Quantity : "2",
				SalesOrderID : "230.1"
			});
			// Step 2
			When.onMainPage.showSalesOrder("230");
			Then.onMainPage.checkSalesOrderLoaded("230");
			Then.onMainPage.checkSalesOrderItemsLoaded("230");
			Then.onMainPage.checkItemAtRow(0, oTransientItem4);
			Then.onMainPage.checkItemAtRow(1, oTransientItem2);
			Then.onMainPage.checkItemAtRow(2, oTransientItem1);
			Then.onMainPage.checkItemAtRow(3, oItem010);
			Then.onMainPage.checkItemCountChangedBy(0);

			// Save the sales order
			// Step 1
			When.onMainPage.rememberCurrentItemCount();
			// Step 2
			When.onMainPage.pressSalesOrderSaveButton();
			// Step 3
			Then.onMainPage.checkMessageToast();
			Then.onMainPage.checkDialogOpen("Success", "Created sales order item '050'");
			Then.onMainPage.checkDialogOpen("Success", "Created sales order item '040'");
			Then.onMainPage.checkDialogOpen("Success", "Created sales order item '030'");
			// current implementation closes all dialogs with an "OK" button
			When.onMainPage.confirmDialog();
			Then.onMainPage.checkItemCountChangedBy(0);
			Then.onMainPage.checkItemAtRow(0, oPersistedItem4);
			Then.onMainPage.checkItemAtRow(1, oPersistedItem2);
			Then.onMainPage.checkItemAtRow(2, oPersistedItem1);
			Then.onMainPage.checkItemAtRow(3, oItem010);

			// Delete the saved sales order item with the Note 4
			// Step 1
			When.onMainPage.rememberCurrentItemCount();
			// Step 2
			When.onMainPage.selectRow(0);
			When.onMainPage.pressDeleteItem();
			Then.onMainPage.checkDialogOpen("Sales Order Item Deletion");
			// Step 3
			When.onMainPage.confirmDialog();
			Then.onMainPage.checkMessageToast();
			Then.onMainPage.checkItemCountChangedBy(-1);
			Then.onMainPage.checkItemAtRow(0, oPersistedItem2);
			Then.onMainPage.checkItemAtRow(1, oPersistedItem1);
			Then.onMainPage.checkItemAtRow(2, oItem010);
			Then.onMainPage.checkItemAtRow(3, oItem020);

			// Switch context again
			// Step 1
			When.onMainPage.showSalesOrder("230.1");
			Then.onMainPage.checkSalesOrderLoaded("230.1");
			Then.onMainPage.checkSalesOrderItemsLoaded("230.1");
			Then.onMainPage.checkItemAtRow(0, {
				Currency : "EUR",
				GrossAmount : "2,275.28",
				ItemPosition : "015",
				Note : "Foo",
				ProductID : "HT-1000",
				Quantity : "2",
				SalesOrderID : "230.1"
			});
			// Step 2
			When.onMainPage.showSalesOrder("230");
			Then.onMainPage.checkSalesOrderLoaded("230");
			Then.onMainPage.checkSalesOrderItemsLoaded("230");
			Then.onMainPage.checkItemAtRow(0, oItem010);
			Then.onMainPage.checkItemAtRow(1, oItem020);
			Then.onMainPage.checkItemAtRow(2, oPersistedItem1);
			Then.onMainPage.checkItemAtRow(3, oPersistedItem2);
			Then.onMainPage.checkItemCountChangedBy(0);

			Given.iTeardownMyApp();
		});
});