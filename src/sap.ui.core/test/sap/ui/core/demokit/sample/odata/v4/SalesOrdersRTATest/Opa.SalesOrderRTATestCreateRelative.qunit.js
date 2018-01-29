/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/CreateRelative",
	"sap/ui/test/opaQunit"
], function (CreateRelativeTest, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrdersRTATest - Create Relative");

	//*****************************************************************************
	opaTest("Create, modify and delete within relative listbinding", function (Given, When, Then) {

		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrdersRTATest"
			}
		});

		CreateRelativeTest.createRelative(Given, When, Then);

		Then.iTeardownMyUIComponent();
	});
});