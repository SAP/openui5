/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Create and Delete");

	//*****************************************************************************
	opaTest("Check if creating and deleting sales order items works",
		function (Given, When, Then) {
			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
				}
			});

			/* Step 1 */
			When.onMainPage.showSalesOrder("106");
			Then.onMainPage.checkSalesOrderLoaded("106");
			Then.onMainPage.checkSalesOrderItemsLoaded("106");
			When.onMainPage.rememberCurrentMessageCount();

			/* Step 2 */
			When.onMainPage.pressCreateItem();
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");

			/* Step 3*/
			When.onMainPage.changeProductIdInDialog("");
			When.onMainPage.pressNewItemSaveButton();
			Then.onMainPage.checkDialogOpen("Error", "Mandatory field 'PRODUCT_GUID' is empty");

			/* Step 4*/
			When.onMainPage.closeDialog("Error");
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");

			/* Step 5 */
			When.onMainPage.pressNewItemDiscardButton();
			Then.onMainPage.checkDialogNotOpen("Create a New Sales Order Item");

			/* Step 6 */
			When.onMainPage.rememberSalesOrderDetails();
			When.onMainPage.rememberCurrentItemCount();

			/* Step 7 */
			When.onMainPage.pressCreateItem();
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");

			When.onMainPage.changeProductIdInDialog("");
			When.onMainPage.pressNewItemSaveButton();
			Then.onMainPage.checkDialogOpen("Error", "Mandatory field 'PRODUCT_GUID' is empty");

			When.onMainPage.closeDialog("Error");
			Then.onMainPage.checkDialogOpen("Create a New Sales Order Item");

			/* Step 8 */
			When.onMainPage.changeProductIdInDialog("HT-1000");
			When.onMainPage.changeNoteInDialog("");
			When.onMainPage.pressNewItemSaveButton();

			Then.onMainPage.checkDialogOpen("Success");
			When.onMainPage.closeDialog("Success");
			Then.onMainPage.checkItemCountChangedBy(1);
			Then.onMainPage.checkSalesOrderDetailsUpdated();

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageInPopover("030", "order");
			Then.onMainPage.checkMessageInPopover("030", "note");
			When.onMainPage.toggleMessagePopover();

			/* Step 9 is skipped in OPA tests */

			/* Step 10 */
			When.onMainPage.pressMoreDetails(2);
			Then.onMainPage.checkDialogOpen("Product Details");
			Then.onMainPage.checkDialogShowingProductIdAndName("HT-1000", "Notebook Basic 15");

			/* Step 11*/
			When.onMainPage.closeDialog("Product Details");

			/* Step 12 */
			When.onMainPage.selectRow(2);
			When.onMainPage.pressDeleteItem();
			Then.onMainPage.checkDialogOpen("Sales Order Item Deletion");

			/* Step 13 */
			When.onMainPage.confirmDialog();
			Then.onMainPage.checkMessageToast();
			Then.onMainPage.checkItemCountChangedBy(-1);
			Then.onMainPage.checkSalesOrderDetailsUpdated();

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageNotInPopover("030", "order");
			Then.onMainPage.checkMessageNotInPopover("030", "note");
			When.onMainPage.toggleMessagePopover();

			Given.iTeardownMyApp();
		});
});