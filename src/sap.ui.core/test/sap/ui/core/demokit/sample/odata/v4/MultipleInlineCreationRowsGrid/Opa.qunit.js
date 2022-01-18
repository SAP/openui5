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
[undefined, true].forEach(function (bLegacyPosition) {
	[false, true].forEach(function (bSubmitModeAPI) {
		var sTitle = "Edit Product: API group: " + bSubmitModeAPI + ", legacy position: "
			+ bLegacyPosition;

			opaTest(sTitle, function (Given, When, Then) {
				var aExpectedLogs = [];

				TestUtils.setData(
					"sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.updateGroupId",
					bSubmitModeAPI ? "update" : undefined);
				TestUtils.setData(
					"sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid.legacy",
					bLegacyPosition);

				When.onAnyPage.applySupportAssistant();
				Given.iStartMyUIComponent({
					autoWait : true,
					componentConfig : {
						name : "sap.ui.core.sample.odata.v4.MultipleInlineCreationRowsGrid"
					}
				});
				Then.onTheListReport.checkProductsTableTitle("3 Products");
				Then.onTheListReport.checkProductsLength(5);
				Then.onTheListReport.checkProduct(0, "");
				Then.onTheListReport.checkProduct(1, "");
				Then.onTheListReport.checkProduct(2, "10");
				Then.onTheListReport.checkProduct(3, "20");
				Then.onTheListReport.checkProduct(4, "30");

				When.onTheListReport.selectProduct(2);
				Then.onTheObjectPage.checkPartsLength(5);
				Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 3 Parts");

				if (bLegacyPosition) {
					Then.onTheObjectPage.checkPart(0, "", "Inactive");
					Then.onTheObjectPage.checkPart(1, "", "Inactive");
					Then.onTheObjectPage.checkPart(2, "1", "From Server");
					Then.onTheObjectPage.checkPart(3, "2", "From Server");
					Then.onTheObjectPage.checkPart(4, "3", "From Server");

					// activate row 2
					When.onTheObjectPage.enterPartId(1, "99", bSubmitModeAPI);
					Then.onTheObjectPage.checkPartsLength(6);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
					Then.onTheObjectPage.checkPart(2, "99", "Persisted");

					// activate row 2 (will fail and row will be transient)
					aExpectedLogs.push({
						component : "sap.ui.model.odata.v4.ODataListBinding",
						level : Log.Level.ERROR,
						message : "POST on 'Products(ID=10,IsActiveEntity=false)/_Parts' failed;"
							+ " will be repeated automatically",
						details : "Key exists already"
					});
					When.onTheObjectPage.enterPartId(1, "100", bSubmitModeAPI);
					Then.onTheObjectPage.checkPartsLength(7);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
					Then.onTheObjectPage.checkPart(0, "", "Inactive");
					Then.onTheObjectPage.checkPart(1, "", "Inactive");
					Then.onTheObjectPage.checkPart(2, "100", "Transient");
					Then.onTheObjectPage.checkPartIdErrorState(2, "Key exists already");
					When.onTheMessagePopover.close();
					if (bSubmitModeAPI) {
						// delete row 2 (has to be deleted before activating and submitting row 2)
						When.onTheObjectPage.pressCancel();
						Then.onTheObjectPage.checkPartsLength(6);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
						Then.onTheObjectPage.checkPart(1, "", "Inactive");
						Then.onTheObjectPage.checkPart(2, "99", "Persisted");

						// activate row 2
						When.onTheObjectPage.enterPartId(1, "101", bSubmitModeAPI);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
						Then.onTheObjectPage.checkPart(0, "", "Inactive");
						Then.onTheObjectPage.checkPart(1, "", "Inactive");
						Then.onTheObjectPage.checkPart(2, "101", "Persisted");

						// delete row 2
						When.onTheObjectPage.pressDeletePartButton(2);
						When.onTheObjectPage.confirmDeletion();
						Then.onTheObjectPage.checkPartsLength(6);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
						Then.onTheObjectPage.checkPart(0, "", "Inactive");
						Then.onTheObjectPage.checkPart(1, "", "Inactive");
						Then.onTheObjectPage.checkPart(2, "99", "Persisted");
					} else {
						// activate row 2
						When.onTheObjectPage.enterPartId(1, "101", bSubmitModeAPI);
						Then.onTheObjectPage.checkPartsLength(8);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 6 Parts");
						Then.onTheObjectPage.checkPart(0, "", "Inactive");
						Then.onTheObjectPage.checkPart(1, "", "Inactive");
						Then.onTheObjectPage.checkPart(2, "101", "Persisted");

						// delete row 2
						When.onTheObjectPage.pressDeletePartButton(3);
						When.onTheObjectPage.confirmDeletion();
						Then.onTheObjectPage.checkPartsLength(7);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
						Then.onTheObjectPage.checkPart(0, "", "Inactive");
						Then.onTheObjectPage.checkPart(1, "", "Inactive");
						Then.onTheObjectPage.checkPart(2, "101", "Persisted");

						When.onTheListReport.selectProduct(3);
						When.onTheListReport.selectProduct(2);
						// Note: a reread of the parts is expected, see FIORITECHP1-19539
						Then.onTheObjectPage.checkPartsLength(7);
						Then.onTheObjectPage.checkPart(0, "", "Inactive");
						Then.onTheObjectPage.checkPart(1, "", "Inactive");
						Then.onTheObjectPage.checkPart(2, "1", "From Server", "Part 1 reread");
						Then.onTheObjectPage.checkPart(3, "2", "From Server", "Part 2 reread");
						Then.onTheObjectPage.checkPart(4, "3", "From Server", "Part 3 reread");
						Then.onTheObjectPage.checkPart(5, "99", "From Server", "Part 99 reread");
						Then.onTheObjectPage.checkPart(6, "101", "From Server", "Part 101 reread");
					}
					When.onTheListReport.selectProduct(3); // setContext detects no transient active
					Then.onTheObjectPage.checkPartsLength(5);
					Then.onTheObjectPage.checkPart(0, "", "Inactive");
					Then.onTheObjectPage.checkPart(1, "", "Inactive");
					Then.onTheObjectPage.checkPart(2, "201", "From Server");
					Then.onTheObjectPage.checkPart(3, "202", "From Server");
					Then.onTheObjectPage.checkPart(4, "203", "From Server");
					When.onTheObjectPage.pressSortPartsQuantity(); // binding has no pending changes
					Then.onTheObjectPage.checkPartsLength(5);
					Then.onTheObjectPage.checkPart(0, "", "Inactive");
					Then.onTheObjectPage.checkPart(1, "", "Inactive");
					Then.onTheObjectPage.checkPart(2, "202", "From Server");
					Then.onTheObjectPage.checkPart(3, "203", "From Server");
					Then.onTheObjectPage.checkPart(4, "201", "From Server");
					When.onTheListReport.pressRefresh(); // ODataModel has no pending changes
					Then.onTheObjectPage.checkPartsLength(5);
					Then.onTheObjectPage.checkPart(0, "", "Inactive");
					Then.onTheObjectPage.checkPart(1, "", "Inactive");
					Then.onTheObjectPage.checkPart(2, "202", "From Server");
					Then.onTheObjectPage.checkPart(3, "203", "From Server");
					Then.onTheObjectPage.checkPart(4, "201", "From Server");
				} else { // bLegacyPosition = false
					Then.onTheObjectPage.checkPart(0, "1", "From Server");
					Then.onTheObjectPage.checkPart(1, "2", "From Server");
					Then.onTheObjectPage.checkPart(2, "3", "From Server");
					Then.onTheObjectPage.checkPart(3, "", "Inactive");
					Then.onTheObjectPage.checkPart(4, "", "Inactive");

					// activate row 4
					When.onTheObjectPage.enterPartId(3, "99", bSubmitModeAPI);
					Then.onTheObjectPage.checkPartsLength(6);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
					Then.onTheObjectPage.checkPart(3, "99", "Persisted");

					// activate row 5 (will fail and row will be transient)
					aExpectedLogs.push({
						component : "sap.ui.model.odata.v4.ODataListBinding",
						level : Log.Level.ERROR,
						message : "POST on 'Products(ID=10,IsActiveEntity=false)/_Parts' failed;"
							+ " will be repeated automatically",
						details : "Key exists already"
					});
					When.onTheObjectPage.enterPartId(4, "100", bSubmitModeAPI);
					Then.onTheObjectPage.checkPartsLength(7);
					Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
					Then.onTheObjectPage.checkPart(4, "100", "Transient");
					Then.onTheObjectPage.checkPartIdErrorState(4, "Key exists already");
					Then.onTheObjectPage.checkPart(6, "", "Inactive");
					When.onTheMessagePopover.close();
					if (bSubmitModeAPI) {
						// delete row 5 (has to be deleted before activating and submitting row 6)
						When.onTheObjectPage.pressCancel();
						Then.onTheObjectPage.checkPartsLength(6);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
						Then.onTheObjectPage.checkPart(3, "99", "Persisted");
						Then.onTheObjectPage.checkPart(4, "", "Inactive");

						// activate row 6
						When.onTheObjectPage.enterPartId(5, "101", bSubmitModeAPI);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
						Then.onTheObjectPage.checkPart(4, "", "Inactive");
						Then.onTheObjectPage.checkPart(5, "101", "Persisted");

						// delete row 6
						When.onTheObjectPage.pressDeletePartButton(5);
						When.onTheObjectPage.confirmDeletion();
						Then.onTheObjectPage.checkPartsLength(6);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 4 Parts");
						Then.onTheObjectPage.checkPart(4, "", "Inactive");
						Then.onTheObjectPage.checkPart(5, "", "Inactive");
					} else {
						// activate row 6
						When.onTheObjectPage.enterPartId(5, "101", bSubmitModeAPI);
						Then.onTheObjectPage.checkPartsLength(8);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 6 Parts");
						Then.onTheObjectPage.checkPart(5, "101", "Persisted");
						Then.onTheObjectPage.checkPart(7, "", "Inactive");

						// delete row 5
						When.onTheObjectPage.pressDeletePartButton(4);
						When.onTheObjectPage.confirmDeletion();
						Then.onTheObjectPage.checkPartsLength(7);
						Then.onTheObjectPage.checkPartsTableTitle("Product: 10, 5 Parts");
						Then.onTheObjectPage.checkPart(4, "101", "Persisted");
						Then.onTheObjectPage.checkPart(5, "", "Inactive");
						Then.onTheObjectPage.checkPart(6, "", "Inactive");

						When.onTheListReport.selectProduct(3);
						When.onTheListReport.selectProduct(2);
						// Note: a reread of the parts is expected, see FIORITECHP1-19539
						Then.onTheObjectPage.checkPartsLength(7);
						Then.onTheObjectPage.checkPart(0, "1", "From Server", "Part 1 reread");
						Then.onTheObjectPage.checkPart(1, "2", "From Server", "Part 2 reread");
						Then.onTheObjectPage.checkPart(2, "3", "From Server", "Part 3 reread");
						Then.onTheObjectPage.checkPart(3, "99", "From Server", "Part 99 reread");
						Then.onTheObjectPage.checkPart(4, "101", "From Server", "Part 101 reread");
						Then.onTheObjectPage.checkPart(5, "", "Inactive");
					}
					When.onTheListReport.selectProduct(3); // setContext detects no transient active
					Then.onTheObjectPage.checkPartsLength(5);
					Then.onTheObjectPage.checkPart(0, "201", "From Server");
					Then.onTheObjectPage.checkPart(1, "202", "From Server");
					Then.onTheObjectPage.checkPart(2, "203", "From Server");
					Then.onTheObjectPage.checkPart(3, "", "Inactive");
					Then.onTheObjectPage.checkPart(4, "", "Inactive");
					When.onTheObjectPage.pressSortPartsQuantity(); // binding has no pending changes
					Then.onTheObjectPage.checkPartsLength(5);
					Then.onTheObjectPage.checkPart(0, "202", "From Server");
					Then.onTheObjectPage.checkPart(1, "203", "From Server");
					Then.onTheObjectPage.checkPart(2, "201", "From Server");
					Then.onTheObjectPage.checkPart(3, "", "Inactive");
					Then.onTheObjectPage.checkPart(4, "", "Inactive");
					When.onTheListReport.pressRefresh(); // ODataModel has no pending changes
					Then.onTheObjectPage.checkPartsLength(5);
					Then.onTheObjectPage.checkPart(0, "202", "From Server");
					Then.onTheObjectPage.checkPart(1, "203", "From Server");
					Then.onTheObjectPage.checkPart(2, "201", "From Server");
					Then.onTheObjectPage.checkPart(3, "", "Inactive");
					Then.onTheObjectPage.checkPart(4, "", "Inactive");
				}

				if (!bSubmitModeAPI && !bLegacyPosition) {
					When.onTheListReport.enterProductId(1, "100");
					Then.onTheListReport.checkProductsLength(6);
					Then.onTheListReport.checkProductsTableTitle("4 Products");
					Then.onTheListReport.checkProduct(0, "", "Inactive");
					Then.onTheListReport.checkProduct(1, "100", "Persisted");
					Then.onTheListReport.checkProduct(2, "", "Inactive");
					Then.onTheListReport.checkProduct(3, "10", "From Server");
					Then.onTheListReport.checkProduct(4, "20", "From Server");
					Then.onTheListReport.checkProduct(5, "30", "From Server");
				}

				Then.onAnyPage.checkLog(aExpectedLogs);
				Then.onAnyPage.analyzeSupportAssistant();
				Then.iTeardownMyUIComponent();
			});
	});
});

			QUnit.start();
		}
	});
});
