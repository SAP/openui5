/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/opaQunit"
], function (opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrdersTemplate");

	//*****************************************************************************
	opaTest("Start sales orders template app and check log", function (Given, When, Then) {
		When.onAnyPage.applySupportAssistant();
		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrdersTemplate"
			}
		});

		When.onTheMainPage.pressValueHelpOnCurrencyCode();
		When.onTheMainPage.pressValueHelpOnRole();

		Then.onAnyPage.checkLog();
		Then.onAnyPage.analyzeSupportAssistant();
		Then.iTeardownMyUIComponent();
	});
});
