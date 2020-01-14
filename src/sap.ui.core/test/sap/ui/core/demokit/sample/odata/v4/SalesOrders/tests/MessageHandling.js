/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (Log, library, Opa5, TestUtils) {
	"use strict";

	var MessageType = library.MessageType, // shortcut for sap.ui.core.MessageType
		ValueState = library.ValueState; // shortcut for sap.ui.core.ValueState


	return {
		checkMessages : function (Given, When, Then, sUIComponent) {
			var sDiscountFailure =
					"User John Doe is not authorized to approve more than 50% discount",
				sNoteBoundWarning = "Enter customer reference if available",
				sNoteFailure = "Property `Note` value `RAISE_ERROR` not allowed!",
				sQuantityBoundError = "Minimum order quantity is 2",
				sQuantityFailure = "Value must be greater than 0",
				sUnboundInfo = "Example for an unbound message";

			if (TestUtils.isRealOData()) {
				Opa5.assert.ok(true, "Test runs only with mock data");
				return;
			}

			Given.iStartMyUIComponent({
				componentConfig : {
					name : sUIComponent || "sap.ui.core.sample.odata.v4.SalesOrders"
				}
			});

			// ************************************************************************************
			// Unbound/Bound Messages
			When.onTheMainPage.firstSalesOrderIsVisible();
			Then.onTheMainPage.checkMessagesButtonCount(2);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteBoundWarning);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
				message : sUnboundInfo,
				type : MessageType.Information
			}, {
				message : sNoteBoundWarning,
				type : MessageType.Warning
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

			When.onTheMessagePopover.selectMessage(sNoteBoundWarning);
			Then.onTheMessagePopover.checkMessageDetails(sNoteBoundWarning,
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

			When.onTheMessagePopover.close();
			Then.onTheMainPage.checkMessagesButtonCount(1);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteBoundWarning);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
				message : sNoteBoundWarning,
				type : MessageType.Warning
			}]);

			When.onTheMessagePopover.close();
			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkMessagesButtonCount(2);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteBoundWarning);
			Then.onTheMainPage.checkInputValueState("Note::detail", "Warning",
				sNoteBoundWarning);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sQuantityBoundError);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteBoundWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityBoundError,
					type : MessageType.Error
			}]);

			When.onTheMessagePopover.selectMessage(sQuantityBoundError);
			Then.onTheMessagePopover.checkMessageDetails(sQuantityBoundError,
				"Details for \"Minimum order quantity is 2\" (absolute longtext URL).");
			Then.onTheMessagePopover.checkMessageHasTechnicalDetails({
				originalMessage : {
					code : "STATE/4713",
					longtextUrl : "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample"
						+ "/0002/Messages(2)",
					message : "Minimum order quantity is 2",
					numericSeverity : 4,
					target : "Quantity",
					transition : false
				}
			});

			When.onTheMessagePopover.back();

			When.onTheMessagePopover.close();
			Then.onTheMainPage.checkMessagesButtonCount(2);

			Then.onTheMainPage.checkNoteValueState(1, "Warning", sNoteBoundWarning);
			Then.onTheMainPage.checkInputValueState("Note::detail", "Warning", sNoteBoundWarning);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sQuantityBoundError);

			When.onTheMainPage.selectSalesOrder(0);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "None", "");
			Then.onTheMainPage.checkMessagesButtonCount(2);

			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sQuantityBoundError);
			Then.onTheMainPage.checkMessagesButtonCount(2);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteBoundWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityBoundError,
					type : MessageType.Error
			}]);

			When.onTheMessagePopover.close();

			// ************************************************************************************
			// Error Messages
			// PATCH scenario
			Then.onTheMainPage.checkMessagesButtonCount(2); // still two for 0500000001
			When.onTheMainPage.selectSalesOrder(4);
			When.onTheMainPage.changeNoteInSalesOrders(4, "RAISE_ERROR");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteBoundWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityBoundError,
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
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(6, "Error",
				sQuantityFailure);
			Then.onTheMessagePopover.checkMessages([{
					message : sNoteBoundWarning,
					type : MessageType.Warning
				}, {
					message : sQuantityBoundError,
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
				.checkControlValue("SimulateDiscountForm::SalesOrderID", "0500000002");
			Then.onTheSimulateDiscountDialog
				.checkControlValue("SimulateDiscountForm::GrossAmount", "250.73");
			Then.onTheSimulateDiscountDialog
				.checkControlValue("SimulateDiscountResult::Result", "");
			When.onTheSimulateDiscountDialog.enterDiscount(25);
			When.onTheSimulateDiscountDialog.executeSimulateDiscount();
			Then.onTheSimulateDiscountDialog
				.checkControlValue("SimulateDiscountResult::Result", "188.05");
			When.onTheSimulateDiscountDialog.enterDiscount(75);
			When.onTheSimulateDiscountDialog.executeSimulateDiscount();
			Then.onTheSimulateDiscountDialog.checkDiscountValueState(ValueState.Error,
				sDiscountFailure);
			When.onTheSimulateDiscountDialog.close();

			Then.onAnyPage.checkLog([{
					component : "sap.ui.model.odata.v4.Context",
					level : Log.Level.ERROR,
					message: "Failed to update path /SalesOrderList('0500000004')/Note",
					details : "Property `Note` value `RAISE_ERROR` not allowed!"
				}, {
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message: "POST on 'SalesOrderList('0500000004')/SO_2_SOITEM' failed"
						+ "; will be repeated automatically",
					details : "Value must be greater than 0"
			}, {
				component : "sap.ui.model.odata.v4.ODataContextBinding",
				level : Log.Level.ERROR,
				message: "Failed to execute /SalesOrderList('0500000002')/"
					+ "com.sap.gateway.default.zui5_epm_sample.v0002."
					+ "SalesOrderSimulateDiscount(...)",
				details : sDiscountFailure
			}, {
				component : "sap.ui.model.odata.v4.ODataPropertyBinding",
				level : Log.Level.ERROR,
				message: "Failed to read path /SalesOrderList('0500000002')/"
					+ "com.sap.gateway.default.zui5_epm_sample.v0002."
					+ "SalesOrderSimulateDiscount(...)/value",
				details : sDiscountFailure
			}]);

			Then.iTeardownMyUIComponent();
		}
	};
});