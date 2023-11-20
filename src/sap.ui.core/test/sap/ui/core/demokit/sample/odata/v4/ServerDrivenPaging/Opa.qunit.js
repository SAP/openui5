/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/ServerDrivenPaging/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/ServerDrivenPaging/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.ServerDrivenPaging");

		//*****************************************************************************
		[false, true].forEach(function (bCount) {
			var sTitle = "Test ServerDrivenPaging Application, $count=" + bCount;

			opaTest(sTitle, function (Given, When, Then) {
				TestUtils.setData("sap.ui.core.sample.odata.v4.ServerDrivenPaging.$count",
					bCount);

				if (bCount) {
					When.onAnyPage.applySupportAssistant();
				}
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.ServerDrivenPaging"
					}
				});

				Then.onTheMainPage.checkLastVisibleItemIndex("19");
				Then.onTheMainPage.checkTableLength(20);
				Then.onTheMainPage.checkTableTitle(bCount
					? "30 Business Partners"
					: " Business Partners");

				When.onTheMainPage.pressMoreButton();
				Then.onTheMainPage.checkLastVisibleItemIndex("29");
				Then.onTheMainPage.checkTableLength(30);
				Then.onTheMainPage.checkTableTitle("30 Business Partners");

				if (bCount) { // scrolling in grid table only works well with known collection size
					When.onTheMainPage.switchToGridTable();
					Then.onTheMainPage.checkLastVisibleRowIndex("20");
					Then.onTheMainPage.checkGridTableTitle("50 Business Partners");

					When.onTheMainPage.pageDownOnGridTable();
					Then.onTheMainPage.checkLastVisibleRowIndex("41");

					When.onTheMainPage.pageDownOnGridTable();
					Then.onTheMainPage.checkLastVisibleRowIndex("49");
				}

				Then.onAnyPage.checkLog();
				if (bCount) {
					Then.onAnyPage.analyzeSupportAssistant();
				}
				Then.iTeardownMyUIComponent();
			});
		});

		QUnit.start();
	});
});
