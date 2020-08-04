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
			When.onMainPage.rememberCurrentMessageCount();

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageInPopover("050", "order");
			When.onMainPage.toggleMessagePopover();

			When.onMainPage.pressFixAllQuantities();
			Then.onMainPage.checkMessageCountHasChangedBy(-1);

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageNotInPopover("050", "order");
			When.onMainPage.toggleMessagePopover();

			When.onMainPage.scrollTable(1);
			Then.onMainPage.checkItemQuantities();

			Given.iTeardownMyApp();
		});
});