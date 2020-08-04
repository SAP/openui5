/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/test/opaQunit"
], function (Helper, opaTest) {
	"use strict";

	Helper.qUnitModule(
		"sap.ui.core.internal.samples.odata.v2.SalesOrders - Messages For Note Fields");

	//*****************************************************************************
	opaTest("Change note and check for messages", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.internal.samples.odata.v2.SalesOrders"
			}
		});
		When.onMainPage.showSalesOrder("101");
		Then.onMainPage.checkSalesOrderLoaded("101");
		Then.onMainPage.checkSalesOrderItemsLoaded("101");
		When.onMainPage.rememberCurrentMessageCount();

		[{
			messageKey : "error",
			valueState : "Error"
		}, {
			messageKey : "warning",
			valueState : "Warning"
		}, {
			messageKey : "info",
			valueState : "Information"
		}, {
			messageKey : "success",
			valueState : "Success"
		}].forEach(function (oFixture) {
			When.onMainPage.changeItemNote(0, oFixture.messageKey);
			When.onMainPage.pressSalesOrderSaveButton();
			Then.onMainPage.checkMessageCountHasChangedBy(1);
			Then.onMainPage.checkValueStateOfField(0, "Note", oFixture.valueState,
				oFixture.messageKey);
			Then.onMainPage.checkTableRowHighlight(0, oFixture.valueState);

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageInPopover("010", oFixture.messageKey);
			When.onMainPage.toggleMessagePopover();

			When.onMainPage.changeItemNote(0, "none");
			When.onMainPage.pressSalesOrderSaveButton();
			Then.onMainPage.checkMessageCountHasChangedBy(-1);
			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessageNotInPopover("010", oFixture.messageKey);
			When.onMainPage.toggleMessagePopover();
		});

		Given.iTeardownMyApp();
	});
});