/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/pages/Main",
	"sap/base/Log",
	"sap/ui/test/opaQunit",
	"sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/SandboxModel" // preload only
], function (Core, Helper, Any, Main, Log, opaTest) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.SalesOrderTP100_V2");

		//*****************************************************************************
		opaTest("Start sales orders TP100 app and check log", function (Given, When, Then) {
			var aExpectedLogs = [{
					component : "sap.ui.model.odata.v4.lib._V2MetadataConverter",
					level : Log.Level.WARNING,
					message : "Unsupported annotation 'sap:supported-formats'"
				}, {
					component : "sap.ui.model.odata.v4.lib._V2MetadataConverter",
					level : Log.Level.WARNING,
					message : "Unsupported annotation 'sap:semantics'"
				}],
				i;

			for (i = 0; i < 16; i += 1) {
				aExpectedLogs.push({
					component : "sap.ui.model.odata.v4.lib._V2MetadataConverter",
					level : Log.Level.WARNING,
					message : "Unsupported annotation 'sap:value-list'"
				});
			}

			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.SalesOrderTP100_V2"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			When.onTheMainPage.pressMoreButton("SalesOrders");
			When.onTheMainPage.selectSalesOrder(1);
			When.onTheMainPage.pressMoreButton("SalesOrderItems");

			Then.onAnyPage.checkLog(aExpectedLogs);
			Then.onAnyPage.analyzeSupportAssistant();
		});

		QUnit.start();
	});
});
