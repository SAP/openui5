/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/ChangeContext",
	"sap/ui/test/opaQunit"
], function (ChangeContextTest, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Change Context");

	//*****************************************************************************
	opaTest("Change dependent binding, change context and check", function (Given, When, Then) {

		ChangeContextTest.changeContext(Given, When, Then,
			"sap.ui.core.sample.odata.v4.SalesOrdersRTATest");

	});
});