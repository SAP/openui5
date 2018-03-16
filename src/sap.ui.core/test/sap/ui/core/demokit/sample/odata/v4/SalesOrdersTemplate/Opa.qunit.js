/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (jQuery, Opa5, opaTest, TestUtils) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.ListBinding");

	//*****************************************************************************
	opaTest("Start sales orders template app and check log", function (Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrdersTemplate"
			}
		});

		When.onTheMainPage.pressValueHelpOnCurrencyCode();
		When.onTheMainPage.pressValueHelpOnRole();
		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	});
});
