/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (Log, library, MessageType, Opa5, TestUtils) {
	"use strict";

	var ValueState = library.ValueState; // shortcut for sap.ui.core.ValueState

	return {
		checkMessages : function (Given, When, Then, sUIComponent) {
			var sDiscountFailure = "User John Doe is not authorized to approve more than 50%"
					+ " discount w/o approver",
				sItemNoteWarning = "Enter a Note",
				aExpectedLogs = [],
				sNoteSuccess = "This is your requested bound header message",
				sNoteWarning = "Enter customer reference if available",
				sNoteFailure = "Property `Note` value `RAISE_ERROR` not allowed!",
				sQuantityError = "Minimum order quantity is 2",
				sQuantityFailure = "Value must be greater than 0",
				oStrictModeFailLog = {
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message : "Failed to refresh entity: /SalesOrderList('0500000006')[6]",
					details : "HTTP request was not processed because the previous request failed"
				},
				sUnboundInfo = "Example for an unbound message";

			if (TestUtils.isRealOData()) {
				Opa5.assert.ok(true, "Test runs only with mock data");
				return;
			}

			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			// ************************************************************************************
			// Unbound/Bound Messages
			When.onTheMainPage.firstSalesOrderIsVisible();
			Then.onTheMainPage.checkMessagesButtonCount(3);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteWarning);
			Then.onTheMainPage.checkMessageStrip("SalesOrderList", "Error");
			Then.onTheMainPage.checkHighlight(1, "Error");

			When.onTheMainPage.changeNoteInSalesOrders(0, "HEADER_MESSAGE");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			Then.onTheMainPage.checkNoteValueState(0, "Success", sNoteSuccess);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
				message : sUnboundInfo,
				type : MessageType.Information
			}, {
				message : sNoteWarning,
				type : MessageType.Warning
			}, {
				message : sQuantityError,
				type : MessageType.Error
			}, {
				message : sNoteSuccess,
				type : MessageType.Success
			}]);

			When.onTheMessagePopover.selectMessage(sUnboundInfo);
			Then.onTheMessagePopover.checkMessageDetails(sUnboundInfo,
				"Details for \"Example for an unbound message\" (absolute longtext URL).");
			Then.onTheMessagePopover.checkMessageHasTechnicalDetails({
				originalMessage : {
					code : "42",
					longtextUrl : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002"
						+ "/Messages(0)",
					message : sUnboundInfo,
					numericSeverity : 2
				}
			});

			When.onTheMessagePopover.back();

			When.onTheMessagePopover.selectMessage(sNoteWarning);
			Then.onTheMessagePopover.checkMessageDetails(sNoteWarning,
				"Details for \"Enter customer reference if available\" (relative longtext URL).");
			Then.onTheMessagePopover.checkMessageHasTechnicalDetails({
				originalMessage : {
					code : "CODE/1234",
					"@Common.Application" : {
						ComponentId : "OPU-GW-COR",
						ServiceRepository : "DEFAULT"
					},
					"@Common.TransactionId" : "A9DFB82A2D7B0240E0058CB109CEBFBC",
					"@Common.Timestamp" : "20170320071538.918157",
					longtextUrl : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample"
						+ "/0002/SalesOrderList('0500000001')/Messages(1)",
					message : "Enter customer reference if available",
					numericSeverity : 3,
					target : "Note",
					transition : false
				}
			});

			When.onTheMessagePopover.back();
			When.onTheMessagePopover.selectMessageTitle(sNoteWarning, /Note::list/, 1);

			When.onTheMessagePopover.close();
			Then.onTheMainPage.checkMessagesButtonCount(2);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteWarning);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
				message : sNoteWarning,
				type : MessageType.Warning
			}, {
				message : sQuantityError,
				type : MessageType.Error
			}]);

			When.onTheMessagePopover.close();
			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkMessagesButtonCount(2);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteWarning);
			Then.onTheMainPage.checkInputValueState("Note::detail", "Warning",
				sNoteWarning);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sQuantityError);
			Then.onTheMainPage.checkMessageStrip("SalesOrderList", "Error");
			Then.onTheMainPage.checkMessageStrip("SO_2_SOITEM", "Error");
			Then.onTheMainPage.checkHighlight(1, "Error");

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityError,
					type : MessageType.Error
			}]);

			When.onTheMessagePopover.selectMessage(sQuantityError);
			Then.onTheMessagePopover.checkMessageDetails(sQuantityError,
				"Details for \"Minimum order quantity is 2\" (absolute longtext URL).");
			Then.onTheMessagePopover.checkMessageHasTechnicalDetails({
				originalMessage : {
					code : "STATE/4713",
					longtextUrl : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample"
						+ "/0002/Messages(2)",
					message : "Minimum order quantity is 2",
					numericSeverity : 4,
					target :
						"SO_2_SOITEM(SalesOrderID='0500000001',ItemPosition='0000000020')/Quantity",
					transition : false
				}
			});

			When.onTheMessagePopover.back();

			When.onTheMessagePopover.close();
			Then.onTheMainPage.checkMessagesButtonCount(2);

			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteWarning);
			Then.onTheMainPage.checkInputValueState("Note::detail", "Warning", sNoteWarning);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sQuantityError);

			When.onTheMainPage.selectSalesOrder(0);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "None", "");
			Then.onTheMainPage.checkMessagesButtonCount(2);

			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sQuantityError);
			Then.onTheMainPage.checkMessagesButtonCount(2);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityError,
					type : MessageType.Error
			}]);

			When.onTheMessagePopover.close();

			// ************************************************************************************
			// Error Messages
			// PATCH scenario
			Then.onTheMainPage.checkMessagesButtonCount(2); // still two for 0500000001
			When.onTheMainPage.selectSalesOrder(3);
			When.onTheMainPage.changeNoteInSalesOrders(3, "modified Note");
			When.onTheMainPage.selectSalesOrder(4);
			When.onTheMainPage.changeNoteInSalesOrders(4, "RAISE_ERROR");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			aExpectedLogs.push({
				component : "sap.ui.model.odata.v4.Context",
				level : Log.Level.ERROR,
				message : "Failed to update path /SalesOrderList('0500000003')/Note",
				// TODO: This detail is wrong/misleading. It should be something like
				// "HTTP request was not processed because the previous request failed"
				// and will be solved with CPOUI5ODATAV4-810
				details : "Property `Note` value `RAISE_ERROR` not allowed!"
			}, {
				component : "sap.ui.model.odata.v4.Context",
				level : Log.Level.ERROR,
				message : "Failed to update path /SalesOrderList('0500000004')/Note",
				details : "Property `Note` value `RAISE_ERROR` not allowed!"
			});
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityError,
					type : MessageType.Error
				}, {
					message : sNoteFailure,
					type : MessageType.Error
			}]);
			Then.onTheMainPage.checkNoteValueState(4, "Error", sNoteFailure);
			When.onTheMessagePopover.close();
			When.onTheMainPage.changeNoteInSalesOrders(4, "any Note");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			Then.onTheMainPage.checkNoteValueState(4, "None", "");
			Then.onTheMainPage.checkMessagesButtonCount(2);

			// POST scenario
			When.onTheMainPage.pressCreateSalesOrderItemButton();
			When.onTheMainPage.changeQuantityInLineItem(6, "0");
			When.onTheMainPage.pressSaveSalesOrderButton();
			aExpectedLogs.push({
				component : "sap.ui.model.odata.v4.ODataListBinding",
				level : Log.Level.ERROR,
				message : "POST on 'SalesOrderList('0500000004')/SO_2_SOITEM' failed; "
					+ "will be repeated automatically",
				details : "Value must be greater than 0"
			}, {
				component : "sap.ui.model.odata.v4.ODataListBinding",
				level : Log.Level.ERROR,
				message : "Failed to request side effects",
				details : "HTTP request was not processed because the previous request failed"
			}, {
				component : "sap.ui.model.odata.v4.ODataContextBinding",
				level : Log.Level.ERROR,
				message : "Failed to request side effects",
				details : "HTTP request was not processed because the previous request failed"
			}, {
				component : "sap.ui.model.odata.v4.ODataListBinding",
				level : Log.Level.ERROR,
				message : "Failed to request side effects",
				details : "HTTP request was not processed because the previous request failed"
			}, {
				component : "sap.ui.model.odata.v4.ODataListBinding",
				level : Log.Level.ERROR,
				message : "Failed to get contexts for /sap/opu/odata4/sap/zui5_testv4/default/sap"
					+ "/zui5_epm_sample/0002/SalesOrderList('0500000004')/SO_2_SCHDL "
					+ "with start index 0 and length 100",
				details : "HTTP request was not processed because the previous request failed"
			}, {
				component : "sap.ui.model.odata.v4.ODataContextBinding",
				level : Log.Level.ERROR,
				message : "Failed to request side effects",
				details : "HTTP request was not processed because the previous request failed"
			});
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(6, "Error",
				sQuantityFailure);
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityError,
					type : MessageType.Error
				}, {
					message : sQuantityFailure,
					type : MessageType.Error
			}]);
			When.onTheMessagePopover.selectMessage(sQuantityFailure);
			Then.onTheMessagePopover.checkMessageHasTechnicalDetails({
				originalMessage : {
					"@SAP__Common.longtextUrl" : "",
					"@SAP__common.numericSeverity" : 4,
					code : "SEPM_BO_COMMON/022",
					details : [],
					message : "Value must be greater than 0",
					target : "Quantity"
				}
			});
			When.onTheMessagePopover.close();
			When.onTheMainPage.changeQuantityInLineItem(6, "2.0");
			When.onTheMainPage.pressSaveSalesOrderButton();
			When.onTheSuccessInfo.confirm();
			Then.onTheMainPage.checkMessagesButtonCount(2);

			// Function scenario
			When.onTheMainPage.selectSalesOrder(2);
			When.onTheMainPage.pressOpenSimulateDiscountDialog();
			Then.onTheSimulateDiscountDialog
				.checkTextValue("SimulateDiscountForm::SalesOrderID", "0500000002");
			Then.onTheSimulateDiscountDialog
				.checkTextValue("SimulateDiscountForm::GrossAmount", "250.73");
			Then.onTheSimulateDiscountDialog
				.checkInputValue("SimulateDiscountResult::Result", "");
			When.onTheSimulateDiscountDialog.enterDiscount("25");
			When.onTheSimulateDiscountDialog.invokeSimulateDiscount();
			Then.onTheSimulateDiscountDialog
				.checkInputValue("SimulateDiscountResult::Result", "188.05");
			When.onTheSimulateDiscountDialog.enterDiscount("75");
			When.onTheSimulateDiscountDialog.invokeSimulateDiscount();
			aExpectedLogs.push({
				component : "sap.ui.model.odata.v4.ODataContextBinding",
				level : Log.Level.ERROR,
				message : "Failed to invoke /SalesOrderList('0500000002')/"
					+ "com.sap.gateway.default.zui5_epm_sample.v0002."
					+ "SalesOrderSimulateDiscount(...)",
				details : sDiscountFailure
			}, {
				component : "sap.ui.model.odata.v4.ODataPropertyBinding",
				level : Log.Level.ERROR,
				message : "Failed to read path /SalesOrderList('0500000002')/"
					+ "com.sap.gateway.default.zui5_epm_sample.v0002."
					+ "SalesOrderSimulateDiscount(...)/value",
				// TODO: Addressed with CPOUI5ODATAV4-810 (same as above)
				details : sDiscountFailure
			});
			Then.onTheSimulateDiscountDialog.checkDiscountValueState(ValueState.Error,
				sDiscountFailure);
			Then.onTheSimulateDiscountDialog.checkApproverValueState(ValueState.Error,
				sDiscountFailure);
			When.onTheSimulateDiscountDialog.close();
			When.onTheMessagePopover.close(); // opened automatically (due to error)

			// MessageStrip, highlight and filter entities by messages scenario
			Then.onTheMainPage.checkMessagesButtonCount(2);
			Then.onTheMainPage.checkMessageStrip("SalesOrderList", "Error");
			Then.onTheMainPage.checkMessageStrip("SO_2_SOITEM");
			Then.onTheMainPage.checkHighlight(1, "Error");
			When.onTheMainPage.pressMoreButton(); // 0500000006 has further messages
			Then.onTheMainPage.checkMessagesButtonCount(4);
			Then.onTheMainPage.checkHighlight(6, "Error");
			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
				message : sNoteWarning,
				type : MessageType.Warning
			}, {
				message : sQuantityError,
				type : MessageType.Error
			}, {
				message : sItemNoteWarning,
				type : MessageType.Warning
			}, {
				message : sQuantityError,
				type : MessageType.Error
			}]);
			When.onTheMessagePopover.close();
			When.onTheMainPage.selectSalesOrder(6);
			Then.onTheMainPage.checkMessageStrip("SalesOrderList", "Error");
			Then.onTheMainPage.checkMessageStrip("SO_2_SOITEM", "Error");
			When.onTheMainPage.selectSalesOrder(5);
			Then.onTheMainPage.checkMessageStrip("SalesOrderList", "Error");
			Then.onTheMainPage.checkMessageStrip("SO_2_SOITEM");
			When.onTheMainPage.selectSalesOrder(6);
			Then.onTheMainPage.checkMessageStrip("SalesOrderList", "Error");
			Then.onTheMainPage.checkMessageStrip("SO_2_SOITEM", "Error");
			Then.onTheMainPage.checkMessagesButtonCount(4);
			Then.onTheMainPage.checkTableLength(8, "SO_2_SOITEM");
			When.onTheMainPage.pressCreateSalesOrderItemButton(); // new item must survive filtering
			When.onTheMainPage.setFilter("Error");
			Then.onTheMainPage.checkMessagesButtonCount(4); // messages still existing
			Then.onTheMainPage.checkTableLength(2, "SO_2_SOITEM");
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(0, "Error",
				sQuantityError);
			When.onTheMainPage.setFilter("Show All");
			Then.onTheMainPage.checkTableLength(9, "SO_2_SOITEM");
			Then.onTheMainPage.checkMessagesButtonCount(4);
			Then.onTheMainPage.checkSalesOrderLineItemGrossAmount(8, "1,137.64");
			When.onTheMainPage.pressCancelSalesOrderChangesButton();

			When.onTheMainPage.deleteSelectedSalesOrder();
			Then.onTheMainPage.checkMessagesButtonCount(2);
			When.onTheMainPage.pressCancelSalesOrderListChangesButton();
			Then.onTheMainPage.checkMessagesButtonCount(4);
			When.onTheMainPage.selectSalesOrder(6);

			Then.onTheMainPage.checkTableLength(8, "SO_2_SOITEM");
			When.onTheMainPage.changeNoteInLineItem(0, "EPM DG: SO ID 0500000006 Item 0000000010");
			When.onTheMainPage.changeQuantityInLineItem(0, "2");
			When.onTheMainPage.pressSaveSalesOrderButton();
			Then.onTheMainPage.checkHighlight(6, "None"); // messages for 0500000006 are gone
			Then.onTheMainPage.checkMessagesButtonCount(2);
			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
				message : sNoteWarning,
				type : MessageType.Warning
			}, {
				message : sQuantityError,
				type : MessageType.Error
			}]);
			When.onTheMessagePopover.close();

			// "Prefer: handling=strict"
			When.onTheMainPage.pressConfirmSalesOrderButton();
			aExpectedLogs.push(oStrictModeFailLog);
			When.onTheMainPage.pressCancelStrictModeButton();

			When.onTheMainPage.pressConfirmSalesOrderButton();
			aExpectedLogs.push(oStrictModeFailLog);
			When.onTheMainPage.pressConfirmStrictModeButton();

			Then.onAnyPage.checkLog(aExpectedLogs);
		}
	};
});
