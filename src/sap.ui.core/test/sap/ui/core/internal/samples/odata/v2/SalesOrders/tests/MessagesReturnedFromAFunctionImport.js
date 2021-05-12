/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Function Import");

	//*****************************************************************************
	opaTest("Check messages returned from function import", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});

		When.onMainPage.showSalesOrder("109");
		Then.onMainPage.checkSalesOrderLoaded("109");
		Then.onMainPage.checkSalesOrderItemsLoaded("109");
		When.onMainPage.rememberCurrentMessageCount();

		When.onMainPage.changeItemQuantity(0, 1);
		When.onMainPage.pressSalesOrderSaveButton();
		Then.onMainPage.checkMessageCountHasChangedBy(1);

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessageInPopover("010", "order");
		When.onMainPage.toggleMessagePopover();

		When.onMainPage.pressFixQuantityInRow(0);
		Then.onMainPage.checkItemQuantities();
		Then.onMainPage.checkMessageCountHasChangedBy(0);

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessageNotInPopover("010", "order");
		Then.onMainPage.checkMessageInPopover("010", "updateSuccess");

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessageCountHasChangedBy(0);
		When.onMainPage.toggleMessagePopover();

		Given.iTeardownMyApp();
	});
});