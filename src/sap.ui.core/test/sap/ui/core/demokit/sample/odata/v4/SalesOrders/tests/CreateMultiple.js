/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/test/Opa",
	"sap/ui/test/TestUtils"
], function (Log, Opa, TestUtils) {
	"use strict";

	return {
		createMultiple : function (Given, When, Then, sUIComponent) {
			var iCreated = 0,
				oExpectedLog = {
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message : "POST on 'SalesOrderList' failed; will be repeated automatically",
					details : "Property `Note` value `RAISE_ERROR` not allowed!"
				};

			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			Opa.getContext().sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

			/* creates two sales orders
			 *
			 * @param {boolean} bSave
			 *   Whether created sales orders are saved or not
			 */
			function createTwice(bSave) {
				var i;

				for (i = 0; i < 2; i += 1) {
					When.onTheMainPage.pressCreateSalesOrdersButton();
					iCreated += 1;
					// Note property in payload determines the mock data to be used
					When.onTheCreateNewSalesOrderDialog.changeNote("new " + iCreated);
					When.onTheCreateNewSalesOrderDialog.confirmDialog();
					if (bSave) {
						When.onTheMainPage.pressSaveSalesOrdersButton();
						When.onTheSuccessInfo.confirm();
						Then.onTheMainPage.checkDifferentID(0, "");
					}
				}
			}

			When.onTheMainPage.firstSalesOrderIsVisible();

			// Test scenario:
			// Create one entity, save and create second entity, save, create third entity, create
			// fourth entity, delete third entity, reset changes (removes fourth entity)

			// Create and save two entities
			createTwice(true);
			// Create two entities without saving
			createTwice(false);
			// Delete third entity (which is still transient)
			When.onTheMainPage.selectSalesOrder(1);
			When.onTheMainPage.deleteSelectedSalesOrder();
			// Press "cancel" to reset changes (removes fourth entity)
			When.onTheMainPage.pressCancelSalesOrderListChangesButton();

			// Test scenario:
			// Create two new sales orders, save them, delete them, reset (so that they reappear),
			// delete them again and save

			iCreated = 2; // in order to reuse mock data for #3+#4 which are deleted in between
			createTwice(true);
			Then.onTheMainPage.checkNote(0, "new 4");
			Then.onTheMainPage.checkNote(1, "new 3");
			Then.onTheMainPage.checkSalesOrdersCount(14);

			When.onTheMainPage.selectSalesOrder(0);
			When.onTheMainPage.deleteSelectedSalesOrder();
			Then.onTheMainPage.checkSalesOrdersCount(13);
			Then.onTheMainPage.checkObjectPageInvisible();
			When.onTheMainPage.selectSalesOrder(0);
			When.onTheMainPage.deleteSelectedSalesOrder();
			Then.onTheMainPage.checkSalesOrdersCount(12);
			Then.onTheMainPage.checkNote(0, "new 2");
			Then.onTheMainPage.checkNote(1, "new 1");

			When.onTheMainPage.pressCancelSalesOrderListChangesButton();
			Then.onTheMainPage.checkSalesOrdersCount(14);
			Then.onTheMainPage.checkNote(0, "new 4");
			Then.onTheMainPage.checkNote(1, "new 3");
			Then.onTheMainPage.checkNote(2, "new 2");
			Then.onTheMainPage.checkNote(3, "new 1");
			Then.onTheMainPage.checkSalesOrderSelected(1);
			Then.onTheMainPage.checkNoteInDetails("new 3");
			Then.onTheMainPage.checkSalesOrderItemsCount(0); // -> items table is visible

			When.onTheMainPage.selectSalesOrder(0);
			When.onTheMainPage.deleteSelectedSalesOrder();
			Then.onTheMainPage.checkObjectPageInvisible();
			When.onTheMainPage.selectSalesOrder(0);
			When.onTheMainPage.deleteSelectedSalesOrder();
			Then.onTheMainPage.checkObjectPageInvisible();
			Then.onTheMainPage.checkNote(0, "new 2");
			Then.onTheMainPage.checkNote(1, "new 1");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			Then.onTheMainPage.checkSalesOrdersCount(12);

			// Test scenario:
			// Partial POST failure: Create two new entities without save in between, save, second
			// POST leads to a back-end error, "fix" second entity, save

			// Create two entities without saving
			iCreated = 2; // in order to reuse mock data for #3+#4 which are deleted in between
			createTwice(false);
			// Add special note to force back-end error and try to save it
			When.onTheMainPage.changeNoteInSalesOrders(0, "RAISE_ERROR");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			When.onTheMessagePopover.close();
			Then.onTheMainPage.checkID(0, "");
			Then.onTheMainPage.checkID(1, "");
			// Correct the fake error note, try to save it again and check results
			When.onTheMainPage.changeNoteInSalesOrders(0, "new 4");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			When.onTheSuccessInfo.confirm();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkDifferentID(0, "");
			Then.onTheMainPage.checkDifferentID(1, "");

			// Test scenario: create multiple relative
			// Create a new sales order and save, create two line items and check right position,
			// save and check that context can be changed
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.changeNote("new 3");
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			When.onTheMainPage.pressSaveSalesOrdersButton();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkDifferentID(0, "");

			When.onTheMainPage.pressCreateSalesOrderItemButton();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0, "");
			When.onTheMainPage.changeNoteInLineItem(0, "new 10");
			When.onTheMainPage.pressCreateSalesOrderItemButton();
			Then.onTheMainPage.checkSalesOrderLineItemNote(0, "new 10");
			When.onTheMainPage.changeNoteInLineItem(1, "new 20");
			When.onTheMainPage.pressSaveSalesOrderButton();
			When.onTheSuccessInfo.confirm();
			When.onTheSuccessInfo.confirm();

			if (TestUtils.isRealOData()) {
				// For each line item the server implicitely creates a schedule. Check that
				// 1. these schedules become visible via requestSideEffects
				// 2. they can be deleted from within the sales order schedules dialog
				// 3. they are also deleted from the sales order line items table
				When.onTheMainPage.pressShowSalesOrderSchedules();
				Then.onTheSalesOrderSchedulesDialog.checkLength(2);
				When.onTheSalesOrderSchedulesDialog.selectAll();
				When.onTheSalesOrderSchedulesDialog.deleteSalesOrderSchedules();
				Then.onTheSalesOrderSchedulesDialog.checkLength(0);
				When.onTheSuccessInfo.confirm();
				When.onTheSalesOrderSchedulesDialog.close();
				Then.onTheMainPage.checkTableLength(0, "SO_2_SOITEM");
			}

			if (!TestUtils.isRealOData()) {
				// Test scenario: Delete the first line item, cancel changes, delete again and save.
				When.onTheMainPage.selectSalesOrderItemWithPosition("10");
				When.onTheMainPage.deleteSelectedSalesOrderLineItem();
				Then.onTheMainPage.checkSalesOrderItemsCount(1);
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "new 20");
				When.onTheMainPage.pressCancelSalesOrderChangesButton();
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "new 10");
				Then.onTheMainPage.checkSalesOrderLineItemNote(1, "new 20");
				Then.onTheMainPage.checkSalesOrderItemsCount(2);
				When.onTheMainPage.selectSalesOrderItemWithPosition("10");
				When.onTheMainPage.deleteSelectedSalesOrderLineItem();
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "new 20");
				When.onTheMainPage.pressSaveSalesOrderButton();
				Then.onTheMainPage.checkSalesOrderItemsCount(1);
			}

			// delete created sales orders
			When.onAnyPage.cleanUp("SalesOrderList");
			Then.onAnyPage.checkLog([oExpectedLog, oExpectedLog]);
		}
	};
});
