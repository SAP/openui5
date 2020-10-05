/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Clone Item");

	//*****************************************************************************
	opaTest("(XI) Clone a sales order item and expand product information",
			function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});
		When.onMainPage.showSalesOrder("111");
		Then.onMainPage.checkSalesOrderLoaded("111");
		Then.onMainPage.checkSalesOrderItemsLoaded("111");

		When.onMainPage.rememberCurrentMessageCount();
		When.onMainPage.rememberSalesOrderDetails();
		When.onMainPage.rememberCurrentItemCount();

		When.onMainPage.selectRow(0);

		When.onMainPage.pressCloneItem();
		Then.onMainPage.checkItemCountChangedBy(1);
		Then.onMainPage.checkTableRowsEqualInColumns(0, 1,
			["SalesOrderID", "ProductID", "Quantity", "Unit", "GrossAmount", "Currency"]);
		Then.onMainPage.checkMessageCountHasChangedBy(1);
		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessagePopoverOpen();
		Then.onMainPage.checkMessageInPopover("010", "order");
		Then.onMainPage.checkMessageInPopover("020", "order");
		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkSalesOrderDetailsUpdated();

		When.onMainPage.pressMoreDetails(1);
		Then.onMainPage.checkDialogOpen("Product Details");
		Then.onMainPage.checkDialogShowingProductIdAndName("HT-1000", "Notebook Basic 15");

		When.onMainPage.closeDialog("Product Details");

		Given.iTeardownMyApp();
	});
});