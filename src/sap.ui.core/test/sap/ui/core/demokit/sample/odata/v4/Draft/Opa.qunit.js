/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/Draft/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/Draft/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
		/*
		 * The actual test run.
		 * @param {object} Given - The OPA Given object
		 * @param {object} When - The OPA When object
		 * @param {object} Then - The OPA Then object
		 * @param {String} [sHash] - The hash the application starts with
		 * @param {boolean} [bShowListEarly]
		 *    When to show the list:
		 *    undefined: It's always there
		 *    true: Immediately after the object page was filled
		 *    false: At the end of the test
		 */
		function runTest(Given, When, Then, sHash, bShowListEarly) {
			var bHasList = bShowListEarly === undefined;

			if (!sHash) {
				When.onAnyPage.applySupportAssistant();
			}

			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.Draft"
				},
				hash : sHash
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			if (!sHash) {
				When.onTheListReport.selectProduct(0);
			}

			Then.onTheObjectPage.checkProductID("10");
			Then.onTheObjectPage.checkIsActiveEntity(true);
			Then.onTheObjectPage.checkName("Product 1");

			if (bShowListEarly) {
				When.onTheObjectPage.pressShowList();
				bHasList = true;
			}
			if (bHasList) {
				Then.onTheListReport.checkProduct(0, "10", true, "Product 1");
			}

			// Edit & Cancel
			When.onTheObjectPage.pressEdit();

			Then.onTheObjectPage.checkProductID("10");
			Then.onTheObjectPage.checkIsActiveEntity(false);
			Then.onTheObjectPage.checkName("Product 1");
			if (bHasList) {
				Then.onTheListReport.checkProduct(0, "10", false, "Product 1");
			}

			When.onTheObjectPage.changeName("Test");

			Then.onTheObjectPage.checkName("Test");
			if (bHasList) {
				Then.onTheListReport.checkProduct(0, "10", false, "Test");
			}

			When.onTheObjectPage.pressCancel();

			Then.onTheObjectPage.checkProductID("10");
			Then.onTheObjectPage.checkIsActiveEntity(true);
			Then.onTheObjectPage.checkName("Product 1");
			if (bHasList) {
				Then.onTheListReport.checkProduct(0, "10", true, "Product 1");
			}

			// Edit & Activate
			When.onTheObjectPage.pressEdit();

			Then.onTheObjectPage.checkProductID("10");
			Then.onTheObjectPage.checkIsActiveEntity(false);
			Then.onTheObjectPage.checkName("Product 1");
			Then.onTheObjectPage.checkPart(0, "1", "Part 1", "2.00");
			if (bHasList) {
				Then.onTheListReport.checkProduct(0, "10", false, "Product 1");
			}

			When.onTheObjectPage.changeName("Test");
			When.onTheObjectPage.changeQuantity(0, "123");

			Then.onTheObjectPage.checkName("Test");
			Then.onTheObjectPage.checkPart(0, "1", "Part 1", "123.00");
			if (bHasList) {
				Then.onTheListReport.checkProduct(0, "10", false, "Test");
			}

			When.onTheObjectPage.pressSave();

			Then.onTheObjectPage.checkProductID("10");
			Then.onTheObjectPage.checkIsActiveEntity(true);
			Then.onTheObjectPage.checkName("Test");
			Then.onTheObjectPage.checkPart(0, "1", "Part 1", "123.00");

			if (bShowListEarly === false) {
				When.onTheObjectPage.pressShowList();
			}
			Then.onTheListReport.checkProduct(0, "10", true, "Test");

			if (!sHash) {
				// here the context for row 1 always exists, so nothing new with a hash

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
			}

			Then.onAnyPage.checkLog();
			if (!sHash) {
				Then.onAnyPage.analyzeSupportAssistant();
			}
		}

		Helper.qUnitModule("sap.ui.core.sample.odata.v4.Draft");

		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			//*****************************************************************************
			opaTest("Start with list", function (Given, When, Then) {
				runTest(Given, When, Then);
			});

			//*****************************************************************************
			opaTest("Start with list and object page", function (Given, When, Then) {
				runTest(Given, When, Then, "/Products(ID=10,IsActiveEntity=true)");
			});

			//*****************************************************************************
			opaTest("Start with object page, then open list", function (Given, When, Then) {
				runTest(Given, When, Then, "Products(ID=10,IsActiveEntity=true)?noList", true);
			});

			//*****************************************************************************
			opaTest("Start with object page, open list in the end", function (Given, When, Then) {
				runTest(Given, When, Then, "Products(ID=10,IsActiveEntity=true)?noList", false);
			});

			//*****************************************************************************
			opaTest("Select defective product from list", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.Draft"
					}
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				// Select part with read error
				When.onTheListReport.selectProduct(3);
				Then.onTheErrorPage.checkError("Entity: /Products(ID=40,IsActiveEntity=true)"
					+ " Error: Communication error: 500 ");
			});

			//*****************************************************************************
			opaTest("Open defective product via hash", function (Given, When, Then) {
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.Draft"
					},
					hash : "/Products(ID=40,IsActiveEntity=true)"
				});
				Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

				When.onAnyPage.applySupportAssistant();
				Then.onTheErrorPage.checkError("Entity: /Products(ID=40,IsActiveEntity=true)"
					+ " Error: Communication error: 500 ");
				Then.onAnyPage.analyzeSupportAssistant();
			});
		}

		QUnit.start();
	});
});
