/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

/*
 * CAUTION: Do not try to access the list report while the sub-object is visible. All three columns
 * plus the OPA column need a width of more than 1,600 pixels. If the window/frame does not have
 * this width, the list report will be hidden when showing the sub-object page. Then accessing its
 * controls in the OPA will fail.
 */

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/Draft/pages/Main",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Helper, Any, Main, Opa5, opaTest, TestUtils) {

		Helper.qUnitModule("sap.ui.core.sample.odata.v4.Draft");

		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			//*****************************************************************************
			opaTest("Replace-with Scenario", function (Given, When, Then) {
				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.Draft"
					}
				});

				// Edit & Cancel
				When.onTheListReport.selectProduct(0);
				Then.onTheObjectPage.checkProductID("10");
				Then.onTheObjectPage.checkIsActiveEntity(true);
				Then.onTheObjectPage.checkName("Product 1");
				Then.onTheListReport.checkProduct(0, "10", true, "Product 1");

				When.onTheObjectPage.pressEdit();

				Then.onTheObjectPage.checkProductID("10");
				Then.onTheObjectPage.checkIsActiveEntity(false);
				Then.onTheObjectPage.checkName("Product 1");
				Then.onTheListReport.checkProduct(0, "10", false, "Product 1");

				When.onTheObjectPage.changeName("Test");

				Then.onTheObjectPage.checkName("Test");
				Then.onTheListReport.checkProduct(0, "10", false, "Test");

				When.onTheObjectPage.pressCancel();

				Then.onTheObjectPage.checkProductID("10");
				Then.onTheObjectPage.checkIsActiveEntity(true);
				Then.onTheObjectPage.checkName("Product 1");
				Then.onTheListReport.checkProduct(0, "10", true, "Product 1");

				// Edit & Activate
				When.onTheObjectPage.pressEdit();

				Then.onTheObjectPage.checkProductID("10");
				Then.onTheObjectPage.checkIsActiveEntity(false);
				Then.onTheObjectPage.checkName("Product 1");
				Then.onTheListReport.checkProduct(0, "10", false, "Product 1");

				When.onTheObjectPage.changeName("Test");

				Then.onTheObjectPage.checkName("Test");
				Then.onTheListReport.checkProduct(0, "10", false, "Test");

				When.onTheObjectPage.pressSave();

				Then.onTheObjectPage.checkProductID("10");
				Then.onTheObjectPage.checkIsActiveEntity(true);
				Then.onTheObjectPage.checkName("Test");
				Then.onTheListReport.checkProduct(0, "10", true, "Test");

				// Cancel Without Edit
				When.onTheListReport.selectProduct(1);
				Then.onTheObjectPage.checkProductID("20");
				Then.onTheObjectPage.checkIsActiveEntity(false);
				Then.onTheObjectPage.checkName("Product 2 (draft)");
				Then.onTheListReport.checkProduct(1, "20", false, "Product 2 (draft)");

				When.onTheObjectPage.changeName("Test");

				Then.onTheObjectPage.checkName("Test");
				Then.onTheListReport.checkProduct(1, "20", false, "Test");

				When.onTheObjectPage.pressCancel();

				Then.onTheObjectPage.checkProductID("20");
				Then.onTheObjectPage.checkIsActiveEntity(true);
				Then.onTheObjectPage.checkName("Product 2");
				Then.onTheListReport.checkProduct(1, "20", true, "Product 2");

				Then.onAnyPage.checkLog();
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});
		}

		QUnit.start();
	});
});
