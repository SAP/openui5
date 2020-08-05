/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/TypeDeterminationAndDelete",
	"sap/ui/test/opaQunit"
], function (Helper, TypeDeterminationAndDeleteTest, opaTest) {
	"use strict";

	Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrdersRTATest " +
		"- Type Determination and Delete");

	//*****************************************************************************
	opaTest("Type Determination, Delete Sales Orders", function (Given, When, Then) {

		TypeDeterminationAndDeleteTest.typeDeterminationAndDelete(Given, When, Then,
			"sap.ui.core.sample.odata.v4.SalesOrdersRTATest");

	});
});
