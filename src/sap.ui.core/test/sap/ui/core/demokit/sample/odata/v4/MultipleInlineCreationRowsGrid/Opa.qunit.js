/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/base/Log",
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/MultipleInlineCreationRowsGrid/pages/Main",
		"sap/ui/test/Opa5",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Log, Helper, Any, Main, Opa5, opaTest, TestUtils) {

		Helper.qUnitModule("sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid");

		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			//*****************************************************************************
			opaTest("Edit Product", function (Given, When, Then) {
				var aExpectedLogs = [];

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
				Then.onTheObjectPage.checkPartsTableTitle("3 Parts");
				Then.onTheObjectPage.checkPart(0, "1", "persisted");
				Then.onTheObjectPage.checkPart(1, "2", "persisted");
				Then.onTheObjectPage.checkPart(2, "3", "persisted");
				Then.onTheObjectPage.checkPart(3, "", "inactive");
				Then.onTheObjectPage.checkPart(4, "", "inactive");
				Then.onTheObjectPage.checkPart(5, "", "inactive");

				// activate row 4
				When.onTheObjectPage.enterPartId(3, "99");
				Then.onTheObjectPage.checkPartsLength(7);
				Then.onTheObjectPage.checkPartsTableTitle("4 Parts");
				Then.onTheObjectPage.checkPart(3, "99", "persisted");
				Then.onTheObjectPage.checkPart(6, "", "inactive");

				// activate row 5 (will fail and row will be transient)
				aExpectedLogs.push({
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message: "POST on 'Products(ID=10,IsActiveEntity=false)/_Parts' failed;"
						+ " will be repeated automatically",
					details: "Error: Key exists already"
				});
				When.onTheObjectPage.enterPartId(4, "100");
				Then.onTheObjectPage.checkPartsLength(8);
				Then.onTheObjectPage.checkPartsTableTitle("5 Parts");
				Then.onTheObjectPage.checkPart(4, "100", "transient");
				Then.onTheObjectPage.checkPartIdErrorState(4, "Key exists already");
				Then.onTheObjectPage.checkPart(7, "", "inactive");

				// activate row 6
				When.onTheObjectPage.enterPartId(5, "101");
				Then.onTheObjectPage.checkPartsLength(9);
				Then.onTheObjectPage.checkPartsTableTitle("6 Parts");
				Then.onTheObjectPage.checkPart(5, "101", "persisted");
				Then.onTheObjectPage.checkPart(8, "", "inactive");

				// delete row 5
				When.onTheObjectPage.pressDeletePartButton(4);
				When.onTheObjectPage.confirmDeletion();
				Then.onTheObjectPage.checkPartsLength(8);
				Then.onTheObjectPage.checkPartsTableTitle("5 Parts");
				Then.onTheObjectPage.checkPart(4, "101", "persisted");
				Then.onTheObjectPage.checkPart(5, "", "inactive");
				Then.onTheObjectPage.checkPart(6, "", "inactive");

				Then.onAnyPage.checkLog(aExpectedLogs);
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});

			QUnit.start();
		}
	});
});
