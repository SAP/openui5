/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/MessageType",
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (MessageType, Opa5, TestUtils) {
	"use strict";

	return {
		checkMessages : function (Given, When, Then, sUIComponent) {
			var sPersistentMessage = "Enter customer reference if available",
				sPersistentMessage2 = "Enter Postal Code if available",
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
			Then.onTheMainPage.checkMessageCount(3);
			Then.onTheMainPage.checkNoteValueState(1, "Warning", sPersistentMessage);
			Then.onTheMainPage.checkInputValueState("SOD_Note", "Warning", sPersistentMessage);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sTransientMessage);
			Then.onTheMainPage.checkInputValueState("BP_PostalCode", "Warning",
				sPersistentMessage2);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : sPersistentMessage2,
				type : MessageType.Warning
			}, {
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
			Then.onTheMainPage.checkMessageCount(2);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : sPersistentMessage2,
				type : MessageType.Warning
			}, {
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
			Then.onTheMainPage.checkMessageCount(2);

			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				sTransientMessage);
			Then.onTheMainPage.checkMessageCount(2);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : sPersistentMessage2,
				type : MessageType.Warning
			}, {
				message : sTransientMessage,
				type : MessageType.Error
			}]);

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onAnyPage.checkLog();
			Then.iTeardownMyUIComponent();
		}
	};
});