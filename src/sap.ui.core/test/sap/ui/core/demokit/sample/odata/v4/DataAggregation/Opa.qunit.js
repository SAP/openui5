/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/DataAggregation/pages/Main",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Helper, Any, Main, Opa5, opaTest, TestUtils) {

		Helper.qUnitModule("sap.ui.core.sample.odata.v4.DataAggregation");

		//*****************************************************************************
		opaTest("Start data aggregation app, expand a subtotal node", function (Given, When, Then) {

			if (!TestUtils.isRealOData()) {
				Opa5.assert.ok(false, "Test runs only with realOData=true");
				return;
			}

			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.DataAggregation"
				}
			});

			// TODO $count

			Then.onTheMainPage.checkRow(0, 1, false, true, "West", "");
			Then.onTheMainPage.checkRow(1, 1, false, true, "Wales", "");

			When.onTheMainPage.pressExpandInRow(0);
			Then.onTheMainPage.checkRow(0, 1, true, true, "West", "");
			Then.onTheMainPage.checkRow(1, 2, undefined, false, "West", "Alexander Fischer");
			Then.onTheMainPage.checkRow(2, 2, undefined, false, "West", "George Meier");
			Then.onTheMainPage.checkRow(3, 2, undefined, false, "West", "Jacky Woo");
			Then.onTheMainPage.checkRow(4, 2, undefined, false, "West", "Lindsey Wang");
			Then.onTheMainPage.checkRow(5, 2, undefined, false, "West", "Samantha Smith");
			Then.onTheMainPage.checkRow(6, 1, false, true, "Wales", "");

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
