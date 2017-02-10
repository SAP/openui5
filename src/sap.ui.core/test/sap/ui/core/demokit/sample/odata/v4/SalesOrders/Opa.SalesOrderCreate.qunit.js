/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/BindingPath",
	"sap/ui/test/matchers/Interactable",
	"sap/ui/test/matchers/Properties",
	"sap/ui/Device"
], function (jQuery, Opa5, opaTest, Press, BindingPath, Interactable, Properties, Device) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Create");

	//*****************************************************************************
	opaTest("Create, modify and delete", function (Given, When, Then) {
		var oExpectedLog = {
				component : "sap.ui.model.odata.v4.ODataListBinding",
				level : jQuery.sap.log.Level.ERROR,
				message : "POST on 'SalesOrderList' failed; will be repeated automatically"
			},
			oExpectedLogChangeParameters = {
				component : "sap.ui.model.odata.v4.lib._Cache",
				level : jQuery.sap.log.Level.ERROR,
				message : "Failed to drill-down into Note, invalid segment: Note"
			},
			sModifiedNote = "Modified by OPA",
			vRealOData = jQuery.sap.getUriParameters().get("realOData"),
			bRealOData = /direct|proxy|true/.test(vRealOData);

		Given.iStartMyAppInAFrame("../../../common/index.html?component=odata.v4.SalesOrders"
				+ "&sap-language=en"
				+ (bRealOData ? "&sap-server=test" : "")
				+ "&realOData=" + encodeURIComponent(vRealOData)
				// TestUtils.js does not support deletion via $batch
				+ (bRealOData ? "" : "&$direct=true"));

		// Create, modify and delete of an unsaved sales order
		When.onTheMainPage.firstSalesOrderIsVisible();
		if (!bRealOData) {
			Then.onTheMainPage.checkSalesOrdersCount(10);
		}
		When.onTheMainPage.pressCreateSalesOrdersButton();
		Then.onTheCreateNewSalesOrderDialog.checkNewBuyerId("0100000000");
		Then.onTheCreateNewSalesOrderDialog.checkNewNote();
		Then.onTheCreateNewSalesOrderDialog.checkCurrencyCodeIsValueHelp();
		When.onTheCreateNewSalesOrderDialog.pressValueHelpOnCurrencyCode();
		Then.onTheCreateNewSalesOrderDialog.checkInnerValueHelpExists();
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
		When.onTheMainPage.pressCancelSalesOrdersChangesButton();
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
			When.onTheMainPage.pressSaveSalesOrdersButton();
			When.onTheErrorInfo.confirm();
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			When.onTheRefreshConfirmation.cancel();
			Then.onTheMainPage.checkID(0, "");
			When.onTheMainPage.pressCancelSalesOrdersChangesButton();
			When.onTheMainPage.firstSalesOrderIsAtPos0();
			// Create a sales order with invalid note, save, update note, save -> success
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
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

		if (bRealOData) {
			// Filter and then sort: filter is not lost on sort
			When.onTheMainPage.filterGrossAmount("1000");
			Then.onTheMainPage.checkFirstGrossAmountGreater("1000");
			When.onTheMainPage.sortByGrossAmount();
			Then.onTheMainPage.checkFirstGrossAmountGreater("1000");
			// Proper update of details on second sort (selection is kept)
			When.onTheMainPage.selectFirstSalesOrder();
			When.onTheMainPage.firstSalesOrderIsVisible(); // stores sales order ID in Opa context
			When.onTheMainPage.sortByGrossAmount();
			Then.onTheMainPage.checkSalesOrderIdInDetailsChanged();
			// Change filter via API (changeParameters)
			When.onTheMainPage.sortByGrossAmount();
			When.onTheMainPage.filterSOItemsByProductIdWithChangeParameters(1);
			Then.onTheMainPage.checkSalesOrderItemInRow(0);
			// Change SalesOrderDetails $select via API
			When.onTheMainPage.unselectSODetailsNoteWithChangeParameters();
			Then.onTheMainPage.checkSalesOrderDetailsNote();
		}

		if (!bRealOData) {
			// Relative list bindings show correct data when switching to a different context
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
			When.onTheMainPage.filterSalesOrderItemsByProductID("HT-1001");
			Then.onTheMainPage.checkSalesOrderItemInRow(0, "0500000000", "0000000020");
			Then.onTheMainPage.checkSupplierPhoneNumber("3088530");
		}

		// delete the last created SalesOrder again
		Then.onTheMainPage.cleanUp();
		Then.onTheMainPage.checkLog(bRealOData
				? [oExpectedLog, oExpectedLog, oExpectedLog, oExpectedLogChangeParameters]
				: undefined);
		Then.iTeardownMyAppFrame();
	});
});
