/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/CreateRelative",
	"sap/ui/test/opaQunit"
], function (Helper, CreateRelativeTest, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Create Relative", 180);

	//*****************************************************************************
	opaTest("Create, modify and delete within relative listbinding", function (Given, When, Then) {

		CreateRelativeTest.createRelative(Given, When, Then,
			"sap.ui.core.sample.odata.v4.SalesOrdersRTATest");

	});
});