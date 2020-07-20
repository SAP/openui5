/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (opaTest, Opa5) {
	"use strict";

	//*****************************************************************************
	opaTest("Check if transition messages are working", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});

		When.onMainPage.showSalesOrder("104");
		Then.onMainPage.checkSalesOrderLoaded("104");
		Then.onMainPage.checkSalesOrderItemsLoaded("104");

		When.onMainPage.changeItemNote(0, "error");
		When.onMainPage.pressSalesOrderSaveButton();
		When.onMainPage.scrollTable(1);
		When.onMainPage.changeItemNote(3, "warning");
		When.onMainPage.pressSalesOrderSaveButton();
		When.onMainPage.rememberCurrentMessageCount();

		When.onMainPage.scrollTable(-1);
		When.onMainPage.toggleTransitionMessages();
		Then.onMainPage.checkMessageCountHasChangedByX(-1);

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessagePopoverOpen();
		Then.onMainPage.checkMessageNotInPopover("050", "warningNoPrefix");
		When.onMainPage.toggleMessagePopover();

		When.onMainPage.scrollTable(1);
		Then.onMainPage.checkMessageCountHasChangedByX(1);

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessagePopoverOpen();
		Then.onMainPage.checkMessageInPopover("050", "warningNoPrefix");
		When.onMainPage.toggleMessagePopover();

		Given.iTeardownMyApp();
	});
});