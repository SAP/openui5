/*!
 * ${copyright}
 */

/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/base/util/UriParameters",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/ServerDrivenPaging/pages/Main",
		"sap/base/Log",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (UriParameters, Any, Main, Log, Opa5, opaTest, TestUtils) {

		var bCount = UriParameters.fromQuery(window.location.search).get("$count") === "true",
			sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

		QUnit.module("sap.ui.core.sample.odata.v4.ServerDrivenPaging", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		if (TestUtils.isRealOData()) {
			opaTest("Test ServerDrivenPaging Application", function (Given, When, Then) {
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

				When.onTheMainPage.switchToGridTable();
				Then.onTheMainPage.checkLastVisibleRowIndex("20");
				Then.onTheMainPage.checkGridTableTitle(bCount
					? "50 Business Partners"
					//TODO change to " Business Partners" when prefetch range is not read in case
					// of server-driven paging
					: "50 Business Partners");

				When.onTheMainPage.pageDownOnGridTable();
				Then.onTheMainPage.checkLastVisibleRowIndex("41");
				Then.onTheMainPage.checkGridTableTitle(bCount
					? "50 Business Partners"
					//TODO change to " Business Partners" when prefetch range is not read in case
					// of server-driven paging
					: "50 Business Partners");

				When.onTheMainPage.pageDownOnGridTable();
				Then.onTheMainPage.checkLastVisibleRowIndex("49");
				Then.onTheMainPage.checkGridTableTitle(bCount
					? "50 Business Partners"
					//TODO change to " Business Partners" when prefetch range is not read in case
					// of server-driven paging
					: "50 Business Partners");

				Then.onAnyPage.checkLog();
				Then.iTeardownMyUIComponent();
			});
		} else {
			QUnit.test("Test runs only with realOData=true", function (assert) {
				assert.ok(true, "need one assertion to avoid voter errors due to 'no tests'");
			});
		}

		QUnit.start();
	});
});
