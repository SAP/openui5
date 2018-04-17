/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/TypeDeterminationAndDelete",
	"sap/ui/test/opaQunit"
], function (TypeDeterminationAndDeleteTest, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.config.testTimeout = 180000;
	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - Type Determination and Delete");

	//*****************************************************************************
	opaTest("Type Determination, Delete Sales Orders", function (Given, When, Then) {

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrders"
			}
		});
		TypeDeterminationAndDeleteTest.typeDeterminationAndDelete(Given, When, Then);

		Then.iTeardownMyUIComponent();
	});
});
