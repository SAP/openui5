/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/Create",
	"sap/ui/test/opaQunit"
], function (Helper, CreateTest, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrders - Create", 180);

	//*****************************************************************************
	opaTest("Create, modify and delete", function (Given, When, Then) {

		CreateTest.create(Given, When, Then);

	});
});