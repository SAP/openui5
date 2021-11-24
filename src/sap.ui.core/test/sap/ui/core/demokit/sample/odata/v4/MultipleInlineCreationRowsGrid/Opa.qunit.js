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
		"sap/ui/core/sample/odata/v4/MultipleInlineCreationRowsGrid/pages/Main",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Helper, Any, Main, Opa5, opaTest, TestUtils) {

		Helper.qUnitModule("sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid");

		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			//*****************************************************************************
			opaTest("Edit Product", function (Given, When, Then) {
				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid"
					}
				});
				Then.onTheListReport.checkFirstProduct("10");

				When.onTheListReport.selectProduct(0);
				Then.onTheObjectPage.checkPartsLength(6);
				Then.onTheObjectPage.checkPart(0, "1", true);
				Then.onTheObjectPage.checkPart(1, "2", true);
				Then.onTheObjectPage.checkPart(2, "3", true);
				Then.onTheObjectPage.checkPart(3, "", false);
				Then.onTheObjectPage.checkPart(4, "", false);
				Then.onTheObjectPage.checkPart(5, "", false);

				When.onTheObjectPage.enterPartId(3, "99");
				Then.onTheObjectPage.checkPartsLength(7);
				Then.onTheObjectPage.checkPart(3, "99", true);
				Then.onTheObjectPage.checkPart(6, "", false);

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});

			QUnit.start();
		}
	});
});
