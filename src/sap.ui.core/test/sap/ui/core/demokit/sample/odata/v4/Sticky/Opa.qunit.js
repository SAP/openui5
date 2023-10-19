/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/Sticky/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/Sticky/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.Sticky");

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
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

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
			});
		}

		QUnit.start();
	});
});
