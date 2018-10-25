/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/MessageType",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (Log, MessageType, Opa5, TestUtils) {
	"use strict";

	return {
		checkMessages : function (Given, When, Then, sUIComponent) {
			var sNoteError = "Property `Note` value `RAISE_ERROR` not allowed!",
				sPersistentMessage = "Enter customer reference if available",
				sQuantityError = "Value must be greater than 0",
				sTransientMessage = "Minimum order quantity is 2",
				sUnboundMessage = "Example for an unbound message";

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
			Then.onTheMainPage.checkMessageCount(2);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sPersistentMessage);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : sUnboundMessage,
				type : MessageType.Information
			}, {
				message : sPersistentMessage,
				type : MessageType.Warning
			}]);

			When.onTheMainPage.selectMessage(sUnboundMessage);
			Then.onTheMainPage.checkMessageDetails(sUnboundMessage,
				"Details for \"Example for an unbound message\" (absolute longtext URL).");

			When.onTheMainPage.pressBackToMessagesButton();

			When.onTheMainPage.selectMessage(sPersistentMessage);
			Then.onTheMainPage.checkMessageDetails(sPersistentMessage,
				"Details for \"Enter customer reference if available\" (relative longtext URL).");

			When.onTheMainPage.pressBackToMessagesButton();

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onTheMainPage.checkMessageCount(0);
			Then.onTheMainPage.checkNoteValueState(1, "None", "");

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([]);

			When.onTheMainPage.pressMessagePopoverCloseButton();
			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkMessageCount(2);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sPersistentMessage);
			Then.onTheMainPage.checkInputValueState("SOD_Note", "Warning", sPersistentMessage);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sTransientMessage);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : sPersistentMessage,
				type : MessageType.Warning
			}, {
				message : sTransientMessage,
				type : MessageType.Error
			}]);

			When.onTheMainPage.selectMessage(sTransientMessage);
			Then.onTheMainPage.checkMessageDetails(sTransientMessage,
				"Details for \"Minimum order quantity is 2\" (absolute longtext URL).");

			When.onTheMainPage.pressBackToMessagesButton();

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onTheMainPage.checkMessageCount(1);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : sTransientMessage,
				type : MessageType.Error
			}]);

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onTheMainPage.checkNoteValueState(1, "None", "");
			Then.onTheMainPage.checkInputValueState("SOD_Note", "None", "");
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sTransientMessage);

			When.onTheMainPage.selectSalesOrder(0);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "None", "");
			Then.onTheMainPage.checkMessageCount(1);

			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sTransientMessage);
			Then.onTheMainPage.checkMessageCount(1);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : sTransientMessage,
				type : MessageType.Error
			}]);

			When.onTheMainPage.pressMessagePopoverCloseButton();

			// ************************************************************************************
			// Error Messages
			// PATCH scenario
			Then.onTheMainPage.checkMessageCount(1); // still one for 0500000001
			When.onTheMainPage.selectSalesOrder(4);
			When.onTheMainPage.changeNoteInSalesOrders(4, "RAISE_ERROR");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			Then.onTheMainPage.checkMessages([{
					message : sTransientMessage,
					type : MessageType.Error
				}, {
					message : sNoteError,
					type : MessageType.Error
			}]);
			Then.onTheMainPage.checkNoteValueState(4, "Error", sNoteError);
			When.onTheMainPage.pressMessagePopoverCloseButton();
			When.onTheMainPage.changeNoteInSalesOrders(4, "any Note");
			When.onTheMainPage.pressSaveSalesOrdersButton();
			Then.onTheMainPage.checkNoteValueState(4, "None", "");
			Then.onTheMainPage.checkMessageCount(1);

			// POST scenario
			When.onTheMainPage.pressCreateSalesOrderItemButton();
			When.onTheMainPage.changeQuantityInFirstLineItem("0");
			When.onTheMainPage.pressSaveSalesOrderButton();
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(0, "Error",
				sQuantityError);
			Then.onTheMainPage.checkMessages([{
					message : sTransientMessage,
					type : MessageType.Error
				}, {
					message : sQuantityError,
					type : MessageType.Error
			}]);
			When.onTheMainPage.pressMessagePopoverCloseButton();
			When.onTheMainPage.changeQuantityInFirstLineItem("2.0");
			When.onTheMainPage.pressSaveSalesOrderButton();
			When.onTheSuccessInfo.confirm();
			//TODO: checkMessageCount should be 1 because expected still one for 0500000001
			Then.onTheMainPage.checkMessageCount(0);

			Then.onAnyPage.checkLog([{
					component : "sap.ui.model.odata.v4.ODataPropertyBinding",
					level : Log.Level.ERROR,
					message: "Failed to update path /SalesOrderList('0500000004')/Note",
					details : "Property `Note` value `RAISE_ERROR` not allowed!"
				}, {
					component : "sap.ui.model.odata.v4.ODataParentBinding",
					level : Log.Level.ERROR,
					message: "POST on 'SalesOrderList('0500000004')/SO_2_SOITEM' failed"
						+ "; will be repeated automatically",
					details : "Value must be greater than 0"
			}]);

			Then.iTeardownMyUIComponent();
		}
	};
});