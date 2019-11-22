/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/ServerDrivenPaging/pages/Main",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Any, Main, opaTest, TestUtils) {

		QUnit.module("sap.ui.core.sample.odata.v4.ServerDrivenPaging", {
			before : function () {
				this.sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(this.sDefaultLanguage);
			}
		});

		//*****************************************************************************
		[false, true].forEach(function (bCount) {
			var sTitle = "Test ServerDrivenPaging Application, $count=" + bCount;

			opaTest(sTitle, function (Given, When, Then) {
				TestUtils.setData("sap.ui.core.sample.odata.v4.ServerDrivenPaging.$count",
					bCount);

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
				Then.iTeardownMyUIComponent();
			});
		});

		QUnit.start();
	});
});
