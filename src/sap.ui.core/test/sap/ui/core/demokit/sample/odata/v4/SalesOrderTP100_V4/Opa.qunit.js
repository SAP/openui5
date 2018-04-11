/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], function (jQuery, Opa5, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrderTP100_V4");

	//*****************************************************************************
	opaTest("Start sales orders TP100 app and check log", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrderTP100_V4"
			}
		});

		When.onTheMainPage.pressMoreButton(/SalesOrders-trigger/);
		When.onTheMainPage.selectSalesOrder(1);
		When.onTheMainPage.pressMoreButton(/SalesOrderItems-trigger/);

		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	});
});
