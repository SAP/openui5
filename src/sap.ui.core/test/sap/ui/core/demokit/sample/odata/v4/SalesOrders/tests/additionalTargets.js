/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/library",
	"sap/ui/core/message/MessageType",
	"sap/ui/test/Opa",
	"sap/ui/test/TestUtils"
], function (Log, library, MessageType, Opa, TestUtils) {
	"use strict";

	var ValueState = library.ValueState; // shortcut for sap.ui.core.ValueState

	return function (Given, When, Then, sUIComponent) {
		var aExpectedLogs = [{
				component : "sap.ui.model.odata.v4.ODataListBinding",
				level : Log.Level.ERROR,
				message : "POST on 'SalesOrderList"
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
				message : "Failed to get contexts for",
				details : "HTTP request was not processed because the previous request failed"
			}, {
				component : "sap.ui.model.odata.v4.ODataContextBinding",
				level : Log.Level.ERROR,
				message : "Failed to request side effects",
				details : "HTTP request was not processed because the previous request failed"
			}],
			sQuantityMessage = "Quantity for Product HT-1003 has to be a multiple of 3";

		if (TestUtils.isRealOData()) {
			Opa.assert.ok(true, "Test runs only with mock data, until GATEWAY-101 is done");
			return;
		}

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
		When.onTheMainPage.changeNoteInSalesOrders(0, "any note");
		When.onTheMainPage.pressSaveSalesOrdersButton();
		When.onTheSuccessInfo.confirm();
		When.onTheMainPage.pressMessagesButton(); // clean up unbound messages
		When.onTheMessagePopover.close();

		// Create a new sales order line item which issues a error with additional targets
		When.onTheMainPage.pressCreateSalesOrderItemButton();
		When.onTheMainPage.changeProductIDinLineItem(0, "HT-1003");
		When.onTheMainPage.pressSaveSalesOrderButton();
		Then.onTheMessagePopover.checkMessages([{
				message : "Enter customer reference if available",
				type : MessageType.Warning
			}, {
				message : "Minimum order quantity is 2",
				type : MessageType.Error
			}, {
				message : sQuantityMessage,
				type : MessageType.Error
			}]);
		Then.onTheMainPage.checkSalesOrderLineItemProductIDValueState(0, ValueState.Error,
			sQuantityMessage);
		Then.onTheMainPage.checkSalesOrderLineItemQuantityValueState(0, ValueState.Error,
			sQuantityMessage);

		When.onTheMainPage.changeQuantityInLineItem(0, "3.0");
		When.onTheMainPage.pressSaveSalesOrderButton();
		When.onTheSuccessInfo.confirm();

		// delete created sales orders
		When.onAnyPage.cleanUp("SalesOrderList");
		Then.onAnyPage.checkLog(aExpectedLogs);
	};
});
