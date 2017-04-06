/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/TestUtils"
], function (jQuery, Device, Opa5, opaTest, Press, BindingPath, Interactable, Properties,
		TestUtils) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Create Relative");

	//*****************************************************************************
	opaTest("Create, modify and delete within relative listbinding", function (Given, When, Then) {

		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrders"
			}
		});

		// Preparation: create a new sales order
		When.onTheMainPage.firstSalesOrderIsVisible();
		When.onTheMainPage.pressCreateSalesOrdersButton();
		When.onTheCreateNewSalesOrderDialog.changeNote(new Date().toString());
		When.onTheCreateNewSalesOrderDialog.confirmDialog();
		When.onTheMainPage.pressSaveSalesOrdersButton();
		When.onTheSuccessInfo.confirm();
		When.onTheMainPage.rememberCreatedSalesOrder();
		Then.onTheMainPage.checkTableLength(0, "SalesOrderLineItems");

		// Create a new sales order line item; no refresh allowed; cancel created item
		When.onTheMainPage.pressCreateSalesOrderItemButton();
		Then.onTheMainPage.checkTableLength(1, "SalesOrderLineItems");
		Then.onTheMainPage.checkSalesOrderItemsCount(0); // server side count is still 0
		When.onTheMainPage.pressRefreshSalesOrdersButton();
		When.onTheRefreshConfirmation.cancel();
		// canceling different group does not remove created sales order item
		When.onTheMainPage.pressCancelSalesOrderListChangesButton();
		Then.onTheMainPage.checkTableLength(1, "SalesOrderLineItems");
		When.onTheMainPage.pressCancelSalesOrderChangesButton();
		Then.onTheMainPage.checkTableLength(0, "SalesOrderLineItems");

		// Delete transient sales order line item
		When.onTheMainPage.pressCreateSalesOrderItemButton();
		When.onTheMainPage.selectSalesOrderItemWithPosition("");
		When.onTheMainPage.deleteSelectedSalesOrderLineItem();
		When.onTheSalesOrderLineItemDeletionConfirmation.confirm();
		When.onTheSuccessInfo.confirm();
		Then.onTheMainPage.checkTableLength(0, "SalesOrderLineItems");

		// Create a sales order line item; save, update and delete it
		When.onTheMainPage.pressCreateSalesOrderItemButton();
		When.onTheMainPage.selectSalesOrderItemWithPosition("");
		When.onTheMainPage.pressSaveSalesOrderButton();
		When.onTheSuccessInfo.confirm();
		Then.onTheMainPage.checkSalesOrderItemsCount(1);
		// update note of new sales order item
		When.onTheMainPage.changeSalesOrderLineItemNote(0, "OPA: Changed item note after save");
		When.onTheMainPage.pressSaveSalesOrderButton();
		// delete persisted sales order item
		When.onTheMainPage.deleteSelectedSalesOrderLineItem();
		When.onTheSalesOrderLineItemDeletionConfirmation.confirm();
		When.onTheSuccessInfo.confirm();
		Then.onTheMainPage.checkTableLength(0, "SalesOrderLineItems");

		// delete the last created SalesOrder again
		Then.onTheMainPage.cleanUp();
		Then.onTheMainPage.checkLog();
		Then.iTeardownMyUIComponent();
	});
});
