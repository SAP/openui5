/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/MessageType',
	"sap/ui/test/Opa5",
	"sap/ui/test/TestUtils"
], function (MessageType, Opa5, TestUtils) {
	"use strict";

	return {
		checkMessages : function (Given, When, Then, sUIComponent) {
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
			Then.onTheMainPage.checkNoteValueState(1, "Warning",
				"Enter customer reference if available");

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : "Example for an unbound message",
				type : MessageType.Information
			}, {
				message : "Enter customer reference if available",
				type : MessageType.Warning
			}]);
			//TODO Navigate to message details and check content

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onTheMainPage.checkMessageCount(0);
			Then.onTheMainPage.checkNoteValueState(1, "None", "");

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([]);

			When.onTheMainPage.pressMessagePopoverCloseButton();
			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkMessageCount(2);
			Then.onTheMainPage.checkNoteValueState(1, "Warning",
				"Enter customer reference if available");
			Then.onTheMainPage.checkInputValueState("SOD_Note", "Warning",
				"Enter customer reference if available");
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				"Minimum order quantity is 2");

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : "Enter customer reference if available",
				type : MessageType.Warning
			}, {
				message : "Minimum order quantity is 2",
				type : MessageType.Error
			}]);

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onTheMainPage.checkMessageCount(1);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : "Minimum order quantity is 2",
				type : MessageType.Error
			}]);

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onTheMainPage.checkNoteValueState(1, "None", "");
			Then.onTheMainPage.checkInputValueState("SOD_Note", "None", "");
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				"Minimum order quantity is 2");

			When.onTheMainPage.selectSalesOrder(0);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "None", "");
			Then.onTheMainPage.checkMessageCount(1);

			When.onTheMainPage.selectSalesOrder(1);
			Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(1, "Error",
				"Minimum order quantity is 2");
			Then.onTheMainPage.checkMessageCount(1);

			When.onTheMainPage.pressMessagesButton();
			Then.onTheMainPage.checkMessages([{
				message : "Minimum order quantity is 2",
				type : MessageType.Error
			}]);

			When.onTheMainPage.pressMessagePopoverCloseButton();
			Then.onAnyPage.checkLog();
			Then.iTeardownMyUIComponent();
		}
	};
});