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

	QUnit.module("sap.ui.core.sample.odata.v4.SalesOrderTP100_V2");

	//*****************************************************************************
	opaTest("Start sales orders TP100 app and check log", function (Given, When, Then) {
		var aExpectedLogs = [{
				component : "sap.ui.model.odata.v4.lib._V2MetadataConverter",
				level : jQuery.sap.log.Level.WARNING,
				message: "Unsupported annotation 'sap:supported-formats'"
			}, {
				component : "sap.ui.model.odata.v4.lib._V2MetadataConverter",
				level : jQuery.sap.log.Level.WARNING,
				message: "Unsupported annotation 'sap:semantics'"
			}],
			i;

		for (i = 0; i < 16; i++) {
			aExpectedLogs.push({
				component : "sap.ui.model.odata.v4.lib._V2MetadataConverter",
				level : jQuery.sap.log.Level.WARNING,
				message: "Unsupported annotation 'sap:value-list'"
			});
		}

		Given.iStartMyUIComponent({
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.odata.v4.SalesOrderTP100_V2"
			}
		});

		When.onTheMainPage.pressMoreButton(/SalesOrders-trigger/);
		When.onTheMainPage.selectSalesOrder(1);
		When.onTheMainPage.pressMoreButton(/SalesOrderItems-trigger/);

		Then.onAnyPage.checkLog(aExpectedLogs);
		Then.iTeardownMyUIComponent();
	});
});
