/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.internal.samples.odata.v2.SalesOrders - Ignored Messages");

	//*****************************************************************************
	opaTest("(X) Suppress messages for currency code if the code is not displayed by the control",
			function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});
		When.onMainPage.showSalesOrder("110");
		Then.onMainPage.checkSalesOrderLoaded("110");
		Then.onMainPage.checkSalesOrderItemsLoaded("110");

		When.onMainPage.toggleMessagePopover();
		Then.onMainPage.checkMessagePopoverOpen();
		Then.onMainPage.checkMessageInPopover("010", "infoCurrency");
		When.onMainPage.toggleMessagePopover();

		Then.onMainPage.checkValueStateOfField(0, "Currency", "Information", "infoCurrency");
		Then.onMainPage.checkValueStateOfField(0, "GrossAmount", "None");

		Given.iTeardownMyApp();
	});
});