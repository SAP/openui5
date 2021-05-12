/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Message Lifecycle");

	//*****************************************************************************
	opaTest("Check if messages for items that are not currently seen are loaded",
		function (Given, When, Then) {
			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
				}
			});

			When.onMainPage.showSalesOrder("103");
			Then.onMainPage.checkSalesOrderLoaded("103");
			Then.onMainPage.checkSalesOrderItemsLoaded("103");
			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageInPopover("010", "order");
			Then.onMainPage.checkMessageInPopover("030", "order");
			Then.onMainPage.checkMessageInPopover("050", "order");
			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkValueStateOfField(0, "Quantity", "Warning", "order");
			Then.onMainPage.checkValueStateOfField(2, "Quantity", "Warning", "order");
			When.onMainPage.rememberCurrentMessageCount();

			When.onMainPage.pressFixAllQuantities();
			Then.onMainPage.checkMessageCountHasChangedBy(0);
			Then.onMainPage.checkItemQuantities();
			Then.onMainPage.checkValueStateOfField(0, "Quantity", "Success", "updateSuccessAll");
			Then.onMainPage.checkValueStateOfField(2, "Quantity", "Success", "updateSuccessAll");

			When.onMainPage.scrollTable(1);
			Then.onMainPage.checkItemQuantities();
			Then.onMainPage.checkValueStateOfField(3, "Quantity", "Success", "updateSuccessAll");

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageNotInPopover("010", "order");
			Then.onMainPage.checkMessageNotInPopover("030", "order");
			Then.onMainPage.checkMessageNotInPopover("050", "order");
			Then.onMainPage.checkMessageInPopover("010", "updateSuccessAll");
			Then.onMainPage.checkMessageInPopover("030", "updateSuccessAll");
			Then.onMainPage.checkMessageInPopover("050", "updateSuccessAll");

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessageCountHasChangedBy(0);

			Given.iTeardownMyApp();
		});
});