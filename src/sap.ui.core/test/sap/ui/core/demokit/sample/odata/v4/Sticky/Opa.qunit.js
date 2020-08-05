/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/Sticky/pages/Main",
		"sap/base/Log",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Any, Main, Log, Opa5, opaTest, TestUtils) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

		QUnit.module("sap.ui.core.sample.odata.v4.Sticky", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {

			opaTest("Test sticky service application", function (Given, When, Then) {

				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.Sticky"
					}
				});

				When.onTheMainPage.selectStickyType(0);
				When.onTheMainPage.pressPrepare();
				When.onTheMainPage.changeContent("any value");
				Then.onTheMainPage.checkContent("returned from server");
				When.onTheMainPage.pressSave();
				When.onTheMainPage.pressPrepare();
				When.onTheMainPage.changeContent("any other value");
				Then.onTheMainPage.checkContent("returned from server");
				When.onTheMainPage.pressDiscard();

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});
		}

		QUnit.start();
	});
});
