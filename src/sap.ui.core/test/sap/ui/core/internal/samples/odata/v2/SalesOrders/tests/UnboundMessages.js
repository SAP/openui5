/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Unbound Messages");

	//*****************************************************************************
	opaTest("Check unbound messages", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});

		When.onMainPage.showSalesOrder("107");
		Then.onMainPage.checkDialogOpen("Warning", "System maintenance starts in 2 hours");
		When.onMainPage.closeDialog("Warning");

		Then.onMainPage.checkSalesOrderLoaded("107");
		Then.onMainPage.checkSalesOrderItemsLoaded("107");
		When.onMainPage.rememberCurrentMessageCount();

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessageInPopover(undefined, "maintenance");
		When.onMainPage.openTechnicalDetails();
		Then.onMainPage.checkMessageHasTechnicalDetail("target::messageDetails", "");
		Then.onMainPage.checkMessageHasTechnicalDetail("fullTarget::messageDetails", "");

		When.onMainPage.closeDialog("Message Details");
		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessageCountHasChangedBy(-1);

		Given.iTeardownMyApp();
	});
});