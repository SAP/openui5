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
		createRelative : function (Given, When, Then, sUIComponent) {
			var oDrillDownErrorLog = {
					component : "sap.ui.model.odata.v4.lib._Cache",
					level : Log.Level.ERROR,
					message :
						/Failed to drill-down into \('[0-9]*'\), invalid segment: \('[0-9]*'\)/
				},
				aExpectedLogs = [],
				oReadSchedulesFailLog = {
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message : new RegExp("Failed to get contexts for"
						+ " .*/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002"
						+ "/SalesOrderList\\('.*'\\)/SO_2_SCHDL with start index 0 and length 100"),
					details : "HTTP request was not processed because the previous request failed"
				},
				bRealOData = TestUtils.isRealOData(),
				oSideEffectsFailLog1 = {
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message : "Failed to request side effects",
					details : "HTTP request was not processed because the previous request failed"
				},
				oSideEffectsFailLog2 = {
					component : "sap.ui.model.odata.v4.ODataContextBinding",
					level : Log.Level.ERROR,
					message : "Failed to request side effects",
					details : "HTTP request was not processed because the previous request failed"
				},
				oStrictModeFailLog = {
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message : new RegExp("Failed to refresh entity: "
						+ "\\/SalesOrderList\\('.*'\\)\\[-1;createdPersisted\\]"),
					details : "HTTP request was not processed because the previous request failed"
				},
				oUpdateFailLog = {
					component : "sap.ui.model.odata.v4.Context",
					level : Log.Level.ERROR,
					message : "Failed to update path /SalesOrderList"
				};

			// we check supportAssistantIssues only within this test journey because it is the most
			// deepest one regarding reached UI elements
			When.onAnyPage.applySupportAssistant();

			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			Opa.getContext().sViewName = "sap.ui.core.sample.odata.v4.SalesOrders.Main";

			// Preparation: create a new sales order
			When.onTheMainPage.firstSalesOrderIsVisible();
			When.onTheMainPage.pressCreateSalesOrdersButton();
			When.onTheCreateNewSalesOrderDialog.confirmDialog();
			When.onTheMainPage.pressSaveSalesOrdersButton();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkCompanyName(0, "SAP");
			Then.onTheMainPage.checkTableLength(0, "SO_2_SOITEM");

			// Create a new sales order line item; no refresh allowed; cancel created item
			When.onTheMainPage.pressCreateSalesOrderItemButton();
			Then.onTheMainPage.checkTableLength(1, "SO_2_SOITEM");
			Then.onTheMainPage.checkSalesOrderItemsCount(1);
			When.onTheMainPage.pressRefreshSalesOrdersButton();
			When.onTheRefreshConfirmation.cancel();
			// canceling different group does not remove created sales order item
			When.onTheMainPage.pressCancelSalesOrderListChangesButton();
			Then.onTheMainPage.checkTableLength(1, "SO_2_SOITEM");
			When.onTheMainPage.pressCancelSalesOrderChangesButton();
			Then.onTheMainPage.checkTableLength(0, "SO_2_SOITEM");
			Then.onTheMainPage.checkSalesOrderItemsCount(0);

			// Delete transient sales order line item
			When.onTheMainPage.pressCreateSalesOrderItemButton();
			When.onTheMainPage.selectSalesOrderItemWithPosition("");
			When.onTheMainPage.deleteSelectedSalesOrderLineItem();
			Then.onTheMainPage.checkTableLength(0, "SO_2_SOITEM");

			// Create a sales order line item; save, update and delete it
			When.onTheMainPage.pressCreateSalesOrderItemButton();
			When.onTheMainPage.selectSalesOrderItemWithPosition("");
			When.onTheMainPage.pressSaveSalesOrderButton();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkSalesOrderItemsCount(1);

			if (bRealOData) {
				Then.onTheMainPage.checkNewSalesOrderItemProductName("Notebook Basic 15");
				// update note of new sales order item
				When.onTheMainPage.changeNoteInLineItem(0, "Line Item Note Changed - 1");
				When.onTheMainPage.pressSaveSalesOrderButton();
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "Line Item Note Changed - 1");

				// check correct error handling of multiple changes in one $batch
				aExpectedLogs.push(oUpdateFailLog);
				When.onTheMainPage.changeNoteInLineItem(0, "Line Item Note Changed - 2");
				aExpectedLogs.push(oUpdateFailLog);
				When.onTheMainPage.changeQuantityInLineItem(0, "0.0");
				aExpectedLogs.push(oSideEffectsFailLog1, oSideEffectsFailLog1,
					oSideEffectsFailLog2, oReadSchedulesFailLog);
				When.onTheMainPage.pressSaveSalesOrderButton();
				When.onTheMessagePopover.close();
				When.onTheMainPage.changeQuantityInLineItem(0, "2.0");
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
				When.onTheMainPage.changeNoteInSalesOrders(0, "Sales Order Note Changed - 1");
				When.onTheMainPage.pressSaveSalesOrdersButton();

				// change again Note in details causes error because of outdated ETag
				// because refresh on relative bindings is not supported
				aExpectedLogs.push(oUpdateFailLog);
				When.onTheMainPage.changeNoteInDetails("Sales Order Details Note Changed - 2");
				aExpectedLogs.push(oSideEffectsFailLog1, oSideEffectsFailLog1,
					oSideEffectsFailLog2, oSideEffectsFailLog2, oSideEffectsFailLog2,
					oReadSchedulesFailLog);
				When.onTheMainPage.pressSaveSalesOrderButton();
				When.onTheMessagePopover.close();

				// check has pending changes
				When.onTheMainPage.pressRefreshSelectedSalesOrderButton();
				When.onTheRefreshConfirmation.cancel();

				// reset changes and refresh single sales order
				When.onTheMainPage.pressCancelSalesOrderChangesButton();
				When.onTheMainPage.pressRefreshSelectedSalesOrderButton();

				// change Note in details is now possible again
				When.onTheMainPage.changeNoteInDetails("Sales Order Details Note Changed - 3");
				When.onTheMainPage.pressSaveSalesOrderButton();

				When.onTheMainPage.increaseSalesOrderItemsQuantity();
				Then.onTheMainPage.checkNote(0, "1 item's quantity increased by: 1", true);
				Then.onTheMainPage.checkSalesOrderLineItemNote(0, "Item quantity increased by: 1");
				Then.onTheMainPage.checkSalesOrderLineItemGrossAmount(0, "3,412.92");
				Then.onTheMainPage.checkSalesOrderLineItemQuantity(0, "3.000");

				// delete persisted sales order item
				When.onTheMainPage.deleteSelectedSalesOrderLineItem();
				When.onTheMainPage.pressSaveSalesOrderButton();
				Then.onTheMainPage.checkTableLength(0, "SO_2_SOITEM");

				// Confirmation of new created sales order, non-transient but still having -1 path
				// Note: The sales order must have at least one line item
				When.onTheMainPage.pressCreateSalesOrderItemButton();
				When.onTheMainPage.pressSaveSalesOrderButton();
				When.onTheSuccessInfo.confirm();
				When.onTheMainPage.pressConfirmSalesOrderButton();
				aExpectedLogs.push(oStrictModeFailLog);
				When.onTheMainPage.pressCancelStrictModeButton();

				When.onTheMainPage.pressConfirmSalesOrderButton();
				aExpectedLogs.push(oStrictModeFailLog);
				When.onTheMainPage.pressConfirmStrictModeButton();
				aExpectedLogs.push(oDrillDownErrorLog); // obsolete with CPOUI5ODATAV4-288

				// test refresh single row
				// preparation
				When.onTheMainPage.pressRefreshSalesOrdersButton();
				When.onTheMainPage.pressCreateSalesOrdersButton();
				When.onTheCreateNewSalesOrderDialog.confirmDialog();
				When.onTheMainPage.pressSaveSalesOrdersButton();
				When.onTheSuccessInfo.confirm();
				// test: refresh single row reads expands
				When.onTheMainPage.pressRefreshSelectedSalesOrderButton();
				When.onTheMainPage.pressCreateSalesOrderItemButton();
				When.onTheMainPage.pressSaveSalesOrderButton();
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkTableLength(1, "SO_2_SOITEM");
				// test: refresh single refreshes also dependent bindings
				When.onTheMainPage.pressRefreshSelectedSalesOrderButton();
				Then.onTheMainPage.checkTableLength(1, "SO_2_SOITEM");

				// Create a sales order line item; change Product ID manually
				When.onTheMainPage.pressCreateSalesOrderItemButton();
				When.onTheMainPage.selectSalesOrderItemWithPosition("");
				When.onTheMainPage.changeProductIDinLineItem(1, "HT-1010");
				When.onTheMainPage.pressSaveSalesOrderButton();
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkProductNameInLineItem(1, "Notebook Professional 15");
				Then.onTheMainPage.checkSalesOrderItemsCount(2);
				// and via value help
				When.onTheMainPage.pressValueHelpOnProductID(1);
				When.onTheValueHelpPopover.selectByKey("HT-1000");
				Then.onTheMainPage.checkProductNameInLineItem(1, "Notebook Professional 15");
				When.onTheMainPage.pressSaveSalesOrderButton();
				Then.onTheMainPage.checkProductNameInLineItem(1, "Notebook Basic 15");
			}

			// delete created sales orders
			When.onAnyPage.cleanUp("SalesOrderList");
			Then.onAnyPage.checkLog(aExpectedLogs);
			Then.onAnyPage.analyzeSupportAssistant();
		}
	};
});
