/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5"
], function (opaTest, Opa5) {
	"use strict";

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
			Then.onMainPage.checkMessageCountHasChangedByX(1);
			Then.onMainPage.checkValueStateOfNoteField(0, oFixture.valueState,
				oFixture.messageKey + "NoPrefix");
			Then.onMainPage.checkTableRowHighlight(0, oFixture.valueState);

			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessagePopoverOpen();
			Then.onMainPage.checkMessageInPopover("010", oFixture.messageKey + "NoPrefix");
			When.onMainPage.toggleMessagePopover();

			When.onMainPage.changeItemNote(0, "none");
			When.onMainPage.pressSalesOrderSaveButton();
			Then.onMainPage.checkMessageCountHasChangedByX(-1);
			When.onMainPage.toggleMessagePopover();
			Then.onMainPage.checkMessageNotInPopover("010", oFixture.messageKey + "NoPrefix");
			When.onMainPage.toggleMessagePopover();
		});
	});
});