/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/TestUtils"
], function (TestUtils) {
	"use strict";

	return {
		createRelative : function (Given, When, Then) {
			var bRealOData = TestUtils.isRealOData();

			sap.ui.test.Opa.getContext().sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

			// Preparation: create a new sales order
			When.onTheMainPage.firstSalesOrderIsVisible();
			When.onTheMainPage.pressCreateSalesOrdersButton();
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
			Then.onTheMainPage.checkSalesOrderItemsCount(bRealOData ? 1 : 0);

			if (bRealOData) {
				Then.onTheMainPage.checkNewSalesOrderItemProductName("Notebook Basic 15");
				// update note of new sales order item
				When.onTheMainPage.changeSalesOrderLineItemNote(0, "Line Item Note Changed - 1");
				When.onTheMainPage.pressSaveSalesOrderButton();
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "Line Item Note Changed - 1");

				// check correct error handling of multiple changes in one $batch
				When.onTheMainPage.changeSalesOrderLineItemNote(0, "Line Item Note Changed - 2");
				When.onTheMainPage.changeSalesOrderLineItemQuantity(0, "0.0");
				When.onTheMainPage.pressSaveSalesOrderButton();
				When.onTheErrorInfo.confirm();
				When.onTheMainPage.changeSalesOrderLineItemQuantity(0, "2.0");
				When.onTheMainPage.pressSaveSalesOrderButton();
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "Line Item Note Changed - 2");

				// change context should be possible after Line Items were saved
				// Test only possible with realOData because same GET request for the Line Items
				// with different result happen which is not possible with mockdata
				When.onTheMainPage.selectSalesOrder(1);
				When.onTheMainPage.selectSalesOrder(0);
				When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");

				// try to change the parent Sales Order,
				// the dependent ODCB should also got its new ETag, check that it can be modified
				When.onTheMainPage.changeNoteInDetails("Sales Order Details Note Changed - 1");
				When.onTheMainPage.pressSaveSalesOrderButton();
				// this is only possible if it has got a new ETag via refresh single
				When.onTheMainPage.changeNote(0, "Sales Order Note Changed - 1");
				When.onTheMainPage.pressSaveSalesOrdersButton();

				// change again Note in details causes error because of outdated ETag
				// because refresh on relative bindings is not supported
				When.onTheMainPage.changeNoteInDetails("Sales Order Details Note Changed - 2");
				When.onTheMainPage.pressSaveSalesOrderButton();
				When.onTheErrorInfo.confirm();

				// check has pending changes
				When.onTheMainPage.pressRefreshSelectedSalesOrdersButton();
				When.onTheRefreshConfirmation.cancel();

				// reset changes and refresh single sales order
				When.onTheMainPage.pressCancelSalesOrderChangesButton();
				When.onTheMainPage.pressRefreshSelectedSalesOrdersButton();

				// change Note in details afterwarts is now possible again
				When.onTheMainPage.changeNoteInDetails("Sales Order Details Note Changed - 3");
				When.onTheMainPage.pressSaveSalesOrderButton();

				// delete persisted sales order item
				When.onTheMainPage.deleteSelectedSalesOrderLineItem();
				When.onTheSalesOrderLineItemDeletionConfirmation.confirm();
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkTableLength(0, "SalesOrderLineItems");
			}

			// test refresh single
			// preparation
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			When.onTheMainPage.pressSaveSalesOrdersButton();
			When.onTheSuccessInfo.confirm();
			When.onTheMainPage.rememberCreatedSalesOrder();
			// test: refresh single reads expands
			When.onTheMainPage.pressRefreshSelectedSalesOrdersButton();
			Then.onTheMainPage.checkCompanyName(0, "SAP");
			When.onTheMainPage.pressCreateSalesOrderItemButton();
			When.onTheMainPage.pressSaveSalesOrderButton();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkTableLength(bRealOData ? 1 : 0, "SalesOrderLineItems");
			// test: refresh single refreshes also dependent bindings
			When.onTheMainPage.pressRefreshSelectedSalesOrdersButton();
			Then.onTheMainPage.checkTableLength(bRealOData ? 1 : 0, "SalesOrderLineItems");

			// delete the all created SalesOrders again
			When.onAnyPage.cleanUp("SalesOrders");
			Then.onAnyPage.checkLog(bRealOData ? [{
				component : "sap.ui.model.odata.v4.ODataPropertyBinding",
				level : jQuery.sap.log.Level.ERROR,
				message : "Failed to update path /SalesOrderList/-1/SO_2_SOITEM"
				//TODO: enable checkLog to deal with RegExp
			}, {
				component : "sap.ui.model.odata.v4.ODataPropertyBinding",
				level : jQuery.sap.log.Level.ERROR,
				message : "Failed to update path /SalesOrderList/-1/SO_2_SOITEM"
				//TODO: enable checkLog to deal with RegExp
			}, {
				component : "sap.ui.model.odata.v4.ODataPropertyBinding",
				level : jQuery.sap.log.Level.ERROR,
				message : "Failed to update path /SalesOrderList/-1/Note"
				//TODO: enable checkLog to deal with RegExp
			}] : undefined);
		}
	};
});