/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (jQuery, Device, Opa5, opaTest, TestUtils) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Change Context");

	//*****************************************************************************
	opaTest("Change dependent binding, change context and check", function (Given, When, Then) {
		if (TestUtils.isRealOData()) {
			Opa5.assert.ok(true, "Test runs only with mock data");
			return;
		}

		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrdersRTATest"
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

		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	});
});
