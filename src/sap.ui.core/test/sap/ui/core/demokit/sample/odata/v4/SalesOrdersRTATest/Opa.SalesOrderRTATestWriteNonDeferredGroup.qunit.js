/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/core/sample/odata/v4/SalesOrders/tests/WriteNonDeferredGroup",
	"sap/ui/test/opaQunit"
], function (WriteNonDeferredGroupTest, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrders - " +
		"Write via application groups with SubmitMode.Auto/.Direct");

	//*****************************************************************************
	["myAutoGroup", "$auto", "myDirectGroup", "$direct"].forEach(function (sGroupId) {
		opaTest("POST/PATCH SalesOrder via group: " + sGroupId, function (Given, When, Then) {

			Given.iStartMyUIComponent({
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.SalesOrdersRTATest"
				}
			});

			WriteNonDeferredGroupTest.writeNonDeferredGroup(Given, When, Then, sGroupId);

			Then.iTeardownMyUIComponent();
		});
	});
});