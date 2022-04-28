/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/base/Log",
		"sap/ui/core/sample/common/Helper",
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/MultipleInlineCreationRowsGrid/pages/Main",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Log, Helper, Any, Main, opaTest, TestUtils) {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid");

		if (TestUtils.isRealOData()) {
			QUnit.skip("Test runs only with realOData=false");
		} else {
			//*****************************************************************************
[false, true].forEach(function (bSubmitModeAPI) {
			opaTest("Edit Product: API group: " + bSubmitModeAPI, function (Given, When, Then) {
				var aExpectedLogs = [];

				TestUtils.setData(
					"sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.updateGroupId",
					bSubmitModeAPI ? "update" : undefined);

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
				Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 3 Parts");
				Then.onTheObjectPage.checkPart(0, "1", "persisted");
				Then.onTheObjectPage.checkPart(1, "2", "persisted");
				Then.onTheObjectPage.checkPart(2, "3", "persisted");
				Then.onTheObjectPage.checkPart(3, "", "inactive");
				Then.onTheObjectPage.checkPart(4, "", "inactive");
				Then.onTheObjectPage.checkPart(5, "", "inactive");

				// activate row 4
				When.onTheObjectPage.enterPartId(3, "99", bSubmitModeAPI);
				Then.onTheObjectPage.checkPartsLength(7);
				Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
				Then.onTheObjectPage.checkPart(3, "99", "persisted");
				Then.onTheObjectPage.checkPart(6, "", "inactive");

				// activate row 5 (will fail and row will be transient)
				aExpectedLogs.push({
					component : "sap.ui.model.odata.v4.ODataListBinding",
					level : Log.Level.ERROR,
					message : "POST on 'Products(ID=10,IsActiveEntity=false)/_Parts' failed;"
						+ " will be repeated automatically",
					details : "Key exists already"
				});
				When.onTheObjectPage.enterPartId(4, "100", bSubmitModeAPI);
				Then.onTheObjectPage.checkPartsLength(8);
				Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
				Then.onTheObjectPage.checkPart(4, "100", "transient");
				Then.onTheObjectPage.checkPartIdErrorState(4, "Key exists already");
				Then.onTheObjectPage.checkPart(7, "", "inactive");
				When.onTheMessagePopover.close();
				if (bSubmitModeAPI) {
					// delete row 5 (has to be deleted before activating and submitting row 6)
					When.onTheObjectPage.pressCancel();
					Then.onTheObjectPage.checkPartsLength(7);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
					Then.onTheObjectPage.checkPart(3, "99", "persisted");
					Then.onTheObjectPage.checkPart(4, "", "inactive");
					Then.onTheObjectPage.checkPart(5, "", "inactive");
					Then.onTheObjectPage.checkPart(6, "", "inactive");

					// activate row 6
					When.onTheObjectPage.enterPartId(5, "101", bSubmitModeAPI);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
					Then.onTheObjectPage.checkPart(4, "", "inactive");
					Then.onTheObjectPage.checkPart(5, "101", "persisted");
					Then.onTheObjectPage.checkPart(6, "", "inactive");

					// delete row 6
					When.onTheObjectPage.pressDeletePartButton(5);
					When.onTheObjectPage.confirmDeletion();
					Then.onTheObjectPage.checkPartsLength(7);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
					Then.onTheObjectPage.checkPart(4, "", "inactive");
					Then.onTheObjectPage.checkPart(5, "", "inactive");
				} else {
					// activate row 6
					When.onTheObjectPage.enterPartId(5, "101", bSubmitModeAPI);
					Then.onTheObjectPage.checkPartsLength(9);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 6 Parts");
					Then.onTheObjectPage.checkPart(5, "101", "persisted");
					Then.onTheObjectPage.checkPart(8, "", "inactive");

					// delete row 5
					When.onTheObjectPage.pressDeletePartButton(4);
					When.onTheObjectPage.confirmDeletion();
					Then.onTheObjectPage.checkPartsLength(8);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
					Then.onTheObjectPage.checkPart(4, "101", "persisted");
					Then.onTheObjectPage.checkPart(5, "", "inactive");
					Then.onTheObjectPage.checkPart(6, "", "inactive");
					Then.onTheObjectPage.checkPart(7, "", "inactive");

					When.onTheListReport.selectProduct(1);
					When.onTheListReport.selectProduct(0);
					// Note: a reread of the parts is expected, see FIORITECHP1-19539
					Then.onTheObjectPage.checkPartsLength(8);
					Then.onTheObjectPage.checkPart(0, "1", "persisted", "Part 1 reread");
					Then.onTheObjectPage.checkPart(1, "2", "persisted", "Part 2 reread");
					Then.onTheObjectPage.checkPart(2, "3", "persisted", "Part 3 reread");
					Then.onTheObjectPage.checkPart(3, "99", "persisted", "Part 99 reread");
					Then.onTheObjectPage.checkPart(4, "101", "persisted", "Part 101 reread");
					Then.onTheObjectPage.checkPart(5, "", "inactive");
					Then.onTheObjectPage.checkPart(6, "", "inactive");
					Then.onTheObjectPage.checkPart(7, "", "inactive");
				}
				When.onTheListReport.selectProduct(1); // setContext detects no transient active
				Then.onTheObjectPage.checkPartsLength(6);
				Then.onTheObjectPage.checkPart(0, "201", "persisted");
				Then.onTheObjectPage.checkPart(1, "202", "persisted");
				Then.onTheObjectPage.checkPart(2, "203", "persisted");
				Then.onTheObjectPage.checkPart(3, "", "inactive");
				Then.onTheObjectPage.checkPart(4, "", "inactive");
				Then.onTheObjectPage.checkPart(5, "", "inactive");
				When.onTheObjectPage.pressSortPartsQuantity(); // binding has no pending changes
				Then.onTheObjectPage.checkPartsLength(6);
				Then.onTheObjectPage.checkPart(0, "202", "persisted");
				Then.onTheObjectPage.checkPart(1, "203", "persisted");
				Then.onTheObjectPage.checkPart(2, "201", "persisted");
				Then.onTheObjectPage.checkPart(3, "", "inactive");
				Then.onTheObjectPage.checkPart(4, "", "inactive");
				Then.onTheObjectPage.checkPart(5, "", "inactive");
				When.onTheListReport.pressRefresh(); // ODataModel has no pending changes
				Then.onTheObjectPage.checkPartsLength(6);
				Then.onTheObjectPage.checkPart(0, "202", "persisted");
				Then.onTheObjectPage.checkPart(1, "203", "persisted");
				Then.onTheObjectPage.checkPart(2, "201", "persisted");
				Then.onTheObjectPage.checkPart(3, "", "inactive");
				Then.onTheObjectPage.checkPart(4, "", "inactive");
				Then.onTheObjectPage.checkPart(5, "", "inactive");

				Then.onAnyPage.checkLog(aExpectedLogs);
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});
});

			QUnit.start();
		}
	});
});
