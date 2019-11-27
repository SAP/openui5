/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/pages/Main",
		"sap/ui/test/opaQunit"
	], function (Any, Main, opaTest) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

		QUnit.module("sap.ui.core.sample.odata.v4.SalesOrderTP100_V4", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		opaTest("Start sales orders TP100 app and check log", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
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
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
