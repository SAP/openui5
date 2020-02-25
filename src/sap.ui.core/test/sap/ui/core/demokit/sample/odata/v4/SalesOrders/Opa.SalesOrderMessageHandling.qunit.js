/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/MessageHandling",
	"sap/ui/test/opaQunit"
], function (Helper, MessageHandling, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Message Handling");

	//*****************************************************************************
	opaTest("Message Handling", function (Given, When, Then) {

		MessageHandling.checkMessages(Given, When, Then);

	});
});