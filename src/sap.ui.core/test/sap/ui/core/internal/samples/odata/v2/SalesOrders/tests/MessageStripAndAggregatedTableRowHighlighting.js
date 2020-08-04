/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule(
		"sap.ui.core.internal.samples.odata.v2.SalesOrders - Message Strip & Row Highlighting");

	//*****************************************************************************
	opaTest("Check item specific messages", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});

		When.onMainPage.showSalesOrder("102");
		Then.onMainPage.checkSalesOrderLoaded("102");
		Then.onMainPage.checkSalesOrderItemsLoaded("102");

		When.onMainPage.changeItemNote(0, "info");
		When.onMainPage.pressSalesOrderSaveButton();
		Then.onMainPage.checkMessageStrip("Information");

		When.onMainPage.changeItemQuantity(1, 1);
		When.onMainPage.pressSalesOrderSaveButton();

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessagePopoverOpen();
		Then.onMainPage.checkMessageInPopover("020", "order");
		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkTableRowHighlight(1, "Warning");

		When.onMainPage.changeItemNote(1, "error");
		When.onMainPage.pressSalesOrderSaveButton();

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessagePopoverOpen();
		Then.onMainPage.checkMessageInPopover("020", "error");
		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkTableRowHighlight(1, "Error");

		When.onMainPage.showSalesOrder("102.2");
		Then.onMainPage.checkSalesOrderLoaded("102.2");
		Then.onMainPage.checkSalesOrderItemsLoaded("102.2");

		When.onMainPage.changeItemNote(0, "errorNoPrefix");
		When.onMainPage.pressSalesOrderSaveButton();
		Then.onMainPage.checkTableRowHighlight(0, "Warning");

		Given.iTeardownMyApp();
	});
});