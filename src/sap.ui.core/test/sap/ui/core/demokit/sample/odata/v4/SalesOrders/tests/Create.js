/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/TestUtils"
], function (TestUtils) {
	"use strict";

	return {
		create : function (Given, When, Then, sUIComponent) {
			var oExpectedLog = {
					component : "sap.ui.model.odata.v4.ODataParentBinding",
					level : jQuery.sap.log.Level.ERROR,
					message : "POST on 'SalesOrderList' failed; will be repeated automatically"
				},
				sModifiedNote = "Modified by OPA",
				bRealOData = TestUtils.isRealOData();

			Given.iStartMyUIComponent({
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});

			sap.ui.test.Opa.getContext().sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

			// Create, modify and delete of an unsaved sales order
			When.onTheMainPage.firstSalesOrderIsVisible();
			if (!bRealOData) {
				Then.onTheMainPage.checkSalesOrdersCount(10);
			}

			// check value helps within sales order line items
			When.onTheMainPage.selectFirstSalesOrder();
			When.onTheMainPage.pressValueHelpOnProductCategory();
			When.onTheMainPage.pressValueHelpOnProductTypeCode();

			When.onTheMainPage.pressCreateSalesOrdersButton();
			Then.onTheCreateNewSalesOrderDialog.checkNewBuyerId("0100000000");
			Then.onTheCreateNewSalesOrderDialog.checkNewNote();
			Then.onTheCreateNewSalesOrderDialog.checkCurrencyCodeIsValueHelp();
			When.onTheCreateNewSalesOrderDialog.pressValueHelpOnCurrencyCode();
			When.onTheValueHelpPopover.close();
			Then.onTheMainPage.checkNote(0);
			When.onTheCreateNewSalesOrderDialog.changeNote(sModifiedNote);
			Then.onTheCreateNewSalesOrderDialog.checkNewNote(sModifiedNote);
			Then.onTheMainPage.checkNote(0, sModifiedNote);
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			if (!bRealOData) {
				Then.onTheMainPage.checkSalesOrdersCount(10);
			}
			Then.onTheMainPage.checkID(0, "");
			Then.onTheMainPage.checkSalesOrderSelected(0);
			When.onTheMainPage.changeNote(0, sModifiedNote + "_2");
			Then.onTheMainPage.checkNote(0, sModifiedNote + "_2");
			When.onTheMainPage.deleteSelectedSalesOrder();
			When.onTheSalesOrderDeletionConfirmation.cancel();
			Then.onTheMainPage.checkID(0, "");
			When.onTheMainPage.deleteSelectedSalesOrder();
			When.onTheSalesOrderDeletionConfirmation.confirm();
			When.onTheSuccessInfo.confirm();
			if (!bRealOData) {
				Then.onTheMainPage.checkSalesOrdersCount(10);
			}
			Then.onTheMainPage.checkID(0);

			// Create a sales order, save, modify again, save and delete
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.changeNote(sModifiedNote + "_save");
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			Then.onTheMainPage.checkID(0, "");
			Then.onTheMainPage.checkButtonDisabled("confirmSalesOrder");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			When.onTheSuccessInfo.confirm();
			if (bRealOData) {
				Then.onTheMainPage.checkButtonEnabled("confirmSalesOrder");
				// TODO: TestUtils may support to provide JSON response/or generated keys...
				Then.onTheMainPage.checkDifferentID(0, "");
				// TODO: TestUtils does not support PATCH at all
				When.onTheMainPage.changeNote(0, sModifiedNote + "_3");
				When.onTheMainPage.pressSaveSalesOrdersButton();
			}
			When.onTheMainPage.deleteSelectedSalesOrder();
			When.onTheSalesOrderDeletionConfirmation.confirm();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkID(0);

			// Create a sales order, save and refresh the sales orders
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.changeNote(sModifiedNote + "_save");
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			Then.onTheMainPage.checkID(0, "");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			Then.onTheSuccessInfo.checkMessage(/SalesOrder created: \d*, SAP/);
			When.onTheSuccessInfo.confirm();
			if (!bRealOData) {
				Then.onTheMainPage.checkSalesOrdersCount(11);
			}
			When.onTheMainPage.rememberCreatedSalesOrder();
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			Then.onTheMainPage.checkID(0);

			When.onTheMainPage.doubleRefresh();
			Then.onTheMainPage.checkID(0);

			// Create a sales order, refresh/filter w/o saving -> expected "pending changes" message
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			// Cancel refresh
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			When.onTheRefreshConfirmation.cancel();
			Then.onTheMainPage.checkID(0, "");
			When.onTheMainPage.pressRefreshAllButton();
			When.onTheRefreshConfirmation.cancel();
			Then.onTheMainPage.checkID(0, "");
			if (bRealOData) {
				When.onTheMainPage.filterGrossAmount("1000");
				When.onTheErrorInfo.confirm();
				Then.onTheMainPage.checkID(0, "");
			}
			// Confirm refresh
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			When.onTheRefreshConfirmation.confirm();
			When.onTheMainPage.firstSalesOrderIsAtPos0();
			Then.onTheMainPage.checkID(0);

			// Create a sales order, press "cancel sales order changes" w/o saving
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			When.onTheMainPage.pressCancelSalesOrderListChangesButton();
			When.onTheMainPage.firstSalesOrderIsAtPos0();
			if (!bRealOData) {
				Then.onTheMainPage.checkSalesOrdersCount(10);
			}
			Then.onTheMainPage.checkID(0);

			if (bRealOData) {
				// Cancel or resume a failed creation of a sales order
				// Create a sales order with invalid note, save, cancel
				When.onTheMainPage.pressCreateSalesOrdersButton();
				When.onTheCreateNewSalesOrderDialog.confirmDialog();
				When.onTheMainPage.changeNote(0, "RAISE_ERROR");
				When.onTheMainPage.pressSaveSalesOrdersButton();
				When.onTheErrorInfo.confirm();
				When.onTheMainPage.pressRefreshSalesOrdersButton();
				When.onTheRefreshConfirmation.cancel();
				Then.onTheMainPage.checkID(0, "");
				When.onTheMainPage.pressCancelSalesOrderListChangesButton();
				When.onTheMainPage.firstSalesOrderIsAtPos0();
				// Create a sales order with invalid note, save, update note, save -> success
				When.onTheMainPage.pressCreateSalesOrdersButton();
				When.onTheCreateNewSalesOrderDialog.confirmDialog();
				When.onTheMainPage.changeNote(0, "RAISE_ERROR");
				When.onTheMainPage.pressSaveSalesOrdersButton();
				When.onTheErrorInfo.confirm();
				// Do it again to ensure that it is retried without update
				When.onTheMainPage.pressSaveSalesOrdersButton();
				When.onTheErrorInfo.confirm();
				When.onTheMainPage.changeNote(0, "Valid Note");
				When.onTheMainPage.pressSaveSalesOrdersButton();
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkDifferentID(0, "");
				// cleanup
				When.onTheMainPage.deleteSelectedSalesOrder();
				When.onTheSalesOrderDeletionConfirmation.confirm();
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkID(0);
			}

			// set base context for input field FavoriteProductID
			When.onTheMainPage.pressSetBindingContextButton();
			Then.onTheMainPage.checkFavoriteProductID();

			if (!bRealOData) {
				// Some special/detailed filter and sorter tasks
				// Tests made with mockdata to have stable data, -> this can not be tested manually
				// because sort buttons/searchfield are not enabled for !oRealOData
				// therefore the test are directly tiggered either with controller code or via
				// ODLB.changeParameter API

				// Filter and then sort: filter is not lost on sort
				When.onTheMainPage.filterGrossAmountViaAPI("1000");
				Then.onTheMainPage.checkFirstGrossAmountGreater("1000");
				When.onTheMainPage.sortByGrossAmountViaController();
				Then.onTheMainPage.checkFirstGrossAmountGreater("1000");
				When.onTheMainPage.selectFirstSalesOrder();
				// stores sales order ID in Opa context
				When.onTheMainPage.firstSalesOrderIsVisible();
				//sort by sales order ID descending
				When.onTheMainPage.sortByGrossAmountViaController();
				Then.onTheMainPage.checkSalesOrderIdInDetails(false); // selection is kept
				// Change filter via API (changeParameters)
				When.onTheMainPage.sortByGrossAmountViaController();
				When.onTheMainPage.filterSOItemsByProductIdWithChangeParameters(1);
				Then.onTheMainPage.checkSalesOrderItemInRow(0);
				// reset filter again (Note: resets also filter ItemPosition gt '0000000000')
				When.onTheMainPage.filterSOItemsByProductIdWithChangeParameters(undefined);


				// Sort
				When.onTheMainPage.sortBySalesOrderIDviaController(); // sort by sales order ID asc.
				// stores sales order ID in Opa context
				When.onTheMainPage.firstSalesOrderIsVisible();
				// sort by sales order ID desc.
				When.onTheMainPage.sortBySalesOrderIDviaController();
				Then.onTheMainPage.checkSalesOrderIdInDetails(true); // selection lost

				// Relative list bindings show correct data when switching to a different context
				When.onTheMainPage.sortBySalesOrderIDviaController(); // sort to the initial order
				When.onTheMainPage.selectSalesOrderWithId("0500000000");
				Then.onTheMainPage.checkSalesOrderItemInRow(0, "0500000000", "0000000010");
				When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
				Then.onTheMainPage.checkContactNameInRow(0, "Karl");
				Then.onTheMainPage.checkContactNameInRow(1, "Harald");
				When.onTheMainPage.selectSalesOrderItemWithPosition("0000000020");
				Then.onTheMainPage.checkContactNameInRow(0, "Dagmar");
				Then.onTheMainPage.checkContactNameInRow(1, "Ursula");
				Then.onTheMainPage.checkContactNameInRow(2, "Foo");
				When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
				Then.onTheMainPage.checkContactNameInRow(0, "Karl");
				Then.onTheMainPage.checkContactNameInRow(1, "Harald");

				// Filter on relative list binding (table without extended change detection)
				When.onTheMainPage.selectSalesOrderWithId("0500000000");
				Then.onTheMainPage.checkSalesOrderItemInRow(0, "0500000000", "0000000010");
				When.onTheMainPage.selectSalesOrderItemWithPosition("0000000010");
				Then.onTheMainPage.checkSupplierPhoneNumber("0622734567");
				// select the row that remains, so that it will be selected after the filtering
				When.onTheMainPage.selectSalesOrderItemWithPosition("0000000020");
				When.onTheMainPage.filterSalesOrderItemsByProductID("HT-1001");
				Then.onTheMainPage.checkSalesOrderItemInRow(0, "0500000000", "0000000020");
				Then.onTheMainPage.checkSupplierPhoneNumber("3088530");
			}

			if (bRealOData) {
				// primitive sorter and filter tasks,
				// -> probably not dependent on current sales orders in back end
				When.onTheMainPage.sortBySalesOrderID(); // sort via ID ascending (initial order)
				When.onTheMainPage.firstSalesOrderIsVisible(); //-> we expect first order on POS 0
				When.onTheMainPage.sortBySalesOrderID(); // sort via ID descending
				Then.onTheMainPage.checkSalesOrderIdInDetails(true); //selection lost
				When.onTheMainPage.sortBySalesOrderID(); // no sort
				When.onTheMainPage.sortByGrossAmount(); // sort by GrossAmount ascending
				Then.onTheMainPage.checkSalesOrderIdInDetails(true);
				When.onTheMainPage.sortByGrossAmount(); // sort by GrossAmount descending
				Then.onTheMainPage.checkSalesOrderIdInDetails(true);
				// remember GrossAmount of first item
				When.onTheMainPage.selectFirstSalesOrder(true);
				When.onTheMainPage.filterGrossAmount(undefined); // filter by remembered GrossAmount
				// -> no items left because operator is GT
				Then.onTheMainPage.checkSalesOrdersCount(0);
			}

			// delete the last created SalesOrder again
			When.onAnyPage.cleanUp("SalesOrders");
			Then.onAnyPage.checkLog(bRealOData
				? [oExpectedLog, oExpectedLog, oExpectedLog]
				: undefined);
			Then.iTeardownMyUIComponent();
		}
	};
});