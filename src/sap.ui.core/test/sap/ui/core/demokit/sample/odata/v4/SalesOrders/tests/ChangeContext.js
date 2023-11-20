/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	return {
		changeContext : function (Given, When, Then, sUIComponent) {
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			When.onTheMainPage.firstSalesOrderIsVisible();

			// CPOUI5ODATAV4-1786: Context#resetChanges for absolute row contexts
			When.onTheMainPage.pressMoreButton(); // to prevent gap filling request due to delete
			When.onTheMainPage.selectSalesOrder(3);
			When.onTheMainPage.changeNoteInSalesOrders(3, "0500000003 changed");
			When.onTheMainPage.selectSalesOrder(4);
			When.onTheMainPage.changeNoteInSalesOrders(4, "0500000004 changed");
			When.onTheMainPage.pressCancelSelectedSalesOrderChangesButton();
			Then.onTheMainPage.checkNote(4, "EPM DG: SO ID 0500000004 Deliver as fast as possible");
			Then.onTheMainPage.checkNote(3, "0500000003 changed");
			When.onTheMainPage.selectSalesOrder(5);
			When.onTheMainPage.changeNoteInSalesOrders(5, "0500000005 changed");
			Then.onTheMainPage.checkUndoSalesOrderDeletionButtonIsEnabled(false);
			When.onTheMainPage.deleteSelectedSalesOrder();
			Then.onTheMainPage.checkNote(5, "EPM DG: SO ID 0500000006 Deliver as fast as possible");
			Then.onTheMainPage.checkUndoSalesOrderDeletionButtonIsEnabled(true);
			When.onTheMainPage.selectSalesOrder(5);
			When.onTheMainPage.deleteSelectedSalesOrder();
			Then.onTheMainPage.checkNote(5, "EPM DG: SO ID 0500000007 Deliver as fast as possible");
			When.onTheMainPage.pressUndoSalesOrderDeletionButton(); // restore 0500000006
			Then.onTheMainPage.checkNote(5, "EPM DG: SO ID 0500000006 Deliver as fast as possible");
			When.onTheMainPage.pressUndoSalesOrderDeletionButton(); // restore 0500000005
			Then.onTheMainPage.checkNote(5, "EPM DG: SO ID 0500000005 Deliver as fast as possible");
			Then.onTheMainPage.checkUndoSalesOrderDeletionButtonIsEnabled(false);
			When.onTheMainPage.pressCancelSalesOrderListChangesButton(); // get rid of 2nd change
			Then.onTheMainPage.checkNote(4, "EPM DG: SO ID 0500000004 Deliver as fast as possible");

			// change a sales order line item, change sales order context
			When.onTheMainPage.selectFirstSalesOrder();
			When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
			When.onTheMainPage.changeNoteInLineItem(0, "Changed by OPA 1");
			When.onTheMainPage.selectSalesOrderWithId("0500000001");
			// check hasPendingChanges via refresh
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			When.onTheRefreshConfirmation.cancel();
			// reset changes via binding (API)
			When.onTheMainPage.resetSalesOrderListChanges();
			When.onTheMainPage.selectFirstSalesOrder();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0,
				"EPM DG: SO ID 0500000000 Item 0000000010");

			// check refresh selected sales order
			When.onTheMainPage.pressCreateSalesOrderItemButton(); // create in dependent ODLB
			When.onTheMainPage.changeNoteInDetails("Changed by OPA 1a"); // change in intermed. ODBC
			When.onTheMainPage.selectSalesOrderItemWithPosition("0000000020");
			When.onTheMainPage.deleteSelectedSalesOrderLineItem(); // delete in dependent ODLB

			// and that refresh of an unchanged sales order is allowed (CPOUI5ODATAV4-1813)
			When.onTheMainPage.selectSalesOrderWithId("0500000004");
			When.onTheMainPage.pressRefreshSelectedSalesOrderButton();
			When.onTheMainPage.selectFirstSalesOrder();
			// check that refresh of the changed sales order is forbidden
			When.onTheMainPage.pressRefreshSelectedSalesOrderButton();
			When.onTheRefreshConfirmation.cancel();
			// reset changes and refresh selected sales order afterwards
			When.onTheMainPage.pressCancelSelectedSalesOrderChangesButton();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0,
				"EPM DG: SO ID 0500000000 Item 0000000010");
			When.onTheMainPage.pressRefreshSelectedSalesOrderButton();

			// check hasPendingChanges via refresh all button
			When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
			When.onTheMainPage.changeNoteInLineItem(0, "Changed by OPA 2");
			When.onTheMainPage.pressRefreshAllButton();
			When.onTheRefreshConfirmation.confirm(); // resets all changes
			When.onTheMainPage.selectFirstSalesOrder();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0,
				"EPM DG: SO ID 0500000000 Item 0000000010");

			// select the first Sales Order and delete Business Partner
			When.onTheMainPage.selectFirstSalesOrder();
			When.onTheMainPage.pressValueHelpOnProductID(0);
			// next line requires modification in VH_ProductID.xml
			Then.onTheValueHelpPopover.checkTitle("Value Help: Product ID (Additional)");
			When.onTheValueHelpPopover.close();
			When.onTheMainPage.pressDeleteBusinessPartnerButton();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkInputValue("PhoneNumber::detail", "");
			Then.onTheMainPage.checkInputValue("City::detail", "");
			Then.onTheMainPage.checkInputValue("PostalCode::detail", "");

			When.onTheMainPage.selectSalesOrderWithId("0500000001");
			When.onTheMainPage.pressValueHelpOnProductID(0);
			Then.onTheValueHelpPopover.checkTitle("Value Help: H_EPM_PR_SH_Set");
			When.onTheValueHelpPopover.close();

			Then.onAnyPage.checkLog();
		}
	};
});
