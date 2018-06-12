/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (Opa5, TestUtils) {
	"use strict";

	return {
		changeContext : function (Given, When, Then, sUIComponent) {
			if (TestUtils.isRealOData()) {
				Opa5.assert.ok(true, "Test runs only with mock data");
				return;
			}

			Given.iStartMyUIComponent({
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});

			When.onTheMainPage.firstSalesOrderIsVisible();

			// change a sales order line item, change sales order context
			When.onTheMainPage.selectFirstSalesOrder();
			When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
			When.onTheMainPage.changeSalesOrderLineItemNote(0, "Changed by OPA 1");
			When.onTheMainPage.selectSalesOrderWithId("0500000001");
			// check hasPendingChanges via refresh
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			When.onTheRefreshConfirmation.cancel();
			// reset changes via binding (API)
			When.onTheMainPage.resetSalesOrderListChanges();
			When.onTheMainPage.selectFirstSalesOrder();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0,
				"EPM DG: SO ID 0500000000 Item 0000000010");

			// check the same via Reset All button
			When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
			When.onTheMainPage.changeSalesOrderLineItemNote(0, "Changed by OPA 2");
			When.onTheMainPage.selectSalesOrderWithId("0500000001");
			// check hasPendingChanges via refresh all button
			When.onTheMainPage.pressRefreshAllButton();
			When.onTheRefreshConfirmation.confirm();
			When.onTheMainPage.selectFirstSalesOrder();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0,
				"EPM DG: SO ID 0500000000 Item 0000000010");

			// select the first Sales Order and delete Business Partner
			When.onTheMainPage.selectFirstSalesOrder();
			When.onTheMainPage.pressDeleteBusinessPartnerButton();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkInputValue("BP_PhoneNumber", "");
			Then.onTheMainPage.checkInputValue("BP_City", "");
			Then.onTheMainPage.checkInputValue("BP_PostalCode", "");

			Then.onAnyPage.checkLog();
			Then.iTeardownMyUIComponent();
		}
	};
});