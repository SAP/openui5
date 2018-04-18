/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/Create",
	"sap/ui/test/opaQunit"
], function (CreateTest, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Create");

	//*****************************************************************************
	opaTest("Create, modify and delete", function (Given, When, Then) {

		CreateTest.create(Given, When, Then, "sap.ui.core.sample.odata.v4.SalesOrdersRTATest");

	});
});