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
		Given.iStartMyAppInAFrame(
			"../../../common/index.html?component=odata.v4.SalesOrdersTemplate"
			+ "&sap-language=en"
			+ (TestUtils.isRealOData() ? "&sap-server=test" : "")
			+ TestUtils.getRealOData());

		When.onTheMainPage.pressValueHelpOnCurrencyCode();
		Then.onTheMainPage.checkLog();
		Then.iTeardownMyAppFrame();
	});
});
