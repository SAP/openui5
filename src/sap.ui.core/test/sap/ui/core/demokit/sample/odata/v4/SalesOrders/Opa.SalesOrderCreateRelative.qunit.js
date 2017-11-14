/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/TestUtils"
], function (jQuery, Device, Opa5, opaTest, Press, Interactable, Properties, TestUtils) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Create Relative");

	//*****************************************************************************
	opaTest("Create, modify and delete within relative listbinding", function (Given, When, Then) {
		var bRealOData = TestUtils.isRealOData();

		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrders"
			}
		});

		sap.ui.test.Opa.getContext().sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

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
		Then.onTheMainPage.checkNewSalesOrderItemProductName("");
		// update note of new sales order item
		When.onTheMainPage.changeSalesOrderLineItemNote(0, "OPA: Changed item note after save");
		When.onTheMainPage.pressSaveSalesOrderButton();
		Then.onTheMainPage.checkSalesOrderLineItemNote(0, "OPA: Changed item note after save");

		if (bRealOData) {
			// check correct error handling of multiple changes in one $batch
			When.onTheMainPage.changeSalesOrderLineItemNote(0, "Note changed");
			When.onTheMainPage.changeSalesOrderLineItemQuantity(0, "0.0");
			When.onTheMainPage.pressSaveSalesOrderButton();
			When.onTheErrorInfo.confirm();
			When.onTheMainPage.changeSalesOrderLineItemQuantity(0, "2.0");
			When.onTheMainPage.pressSaveSalesOrderButton();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0, "Note changed");

			// change context should be possible after Line Items were saved
			// Test only possible with realOData because same GET request for the Line Items with
			// different result happen which is not possible with mockdata
			When.onTheMainPage.selectSalesOrder(1);
			When.onTheMainPage.selectSalesOrder(0);
			When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
		}

		// delete persisted sales order item
		When.onTheMainPage.deleteSelectedSalesOrderLineItem();
		When.onTheSalesOrderLineItemDeletionConfirmation.confirm();
		When.onTheSuccessInfo.confirm();
		Then.onTheMainPage.checkTableLength(0, "SalesOrderLineItems");

		// delete the last created SalesOrder again
		When.onAnyPage.cleanUp("SalesOrders");
		Then.onAnyPage.checkLog(bRealOData ? [{
			component : "sap.ui.model.odata.v4.ODataPropertyBinding",
			level : jQuery.sap.log.Level.ERROR,
			message : "Failed to update path /SalesOrderList/-1/SO_2_SOITEM/-1/Note"
		}, {
			component : "sap.ui.model.odata.v4.ODataPropertyBinding",
			level : jQuery.sap.log.Level.ERROR,
			message : "Failed to update path /SalesOrderList/-1/SO_2_SOITEM/-1/Quantity"
		}] : undefined);
		Then.iTeardownMyUIComponent();
	});
});
