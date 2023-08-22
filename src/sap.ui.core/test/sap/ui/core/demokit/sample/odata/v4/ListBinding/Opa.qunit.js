/*!
 * ${copyright}
 */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/common/Helper",
	"sap/ui/core/sample/common/pages/Any",
	"sap/ui/core/sample/odata/v4/ListBinding/pages/Main",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils",
	"sap/ui/core/sample/odata/v4/ListBinding/SandboxModel" // preload only
], function (Core, Helper, Any, Main, opaTest, TestUtils) {
	"use strict";

	Core.ready().then(function () {
		Helper.qUnitModule("sap.ui.core.sample.odata.v4.ListBinding");

		//*****************************************************************************
		opaTest("Start list binding app and check log", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.ListBinding"
				}
			});
			Then.onAnyPage.iTeardownMyUIComponentInTheEnd();

			Then.onTheMainPage.checkTeamIDInForm("TEAM_01");
			Then.onTheMainPage.checkEmployeeNameInRow(0, "Walter\"s Win's");
			When.onTheMainPage.selectFirstEmployee();
			Then.onTheMainPage.checkEmployeeEquipmentInRow(0, "Office PC");
			Then.onTheMainPage.checkProductImageInRow(0, TestUtils.isRealOData()
				? "TEAMS('TEAM_01')/TEAM_2_EMPLOYEES('1')/"
					+ "EMPLOYEE_2_EQUIPMENTS(Category='Electronics',ID=1)/EQUIPMENT_2_PRODUCT/"
					+ "ProductPicture/Picture"
				: "/favicon.ico"); // avoids access to service w/o real OData!
			When.onTheMainPage.refreshEmployees();
			Then.onTheMainPage.checkEmployeeNameInRow(0, "Walter\"s Win's");

			if (TestUtils.isRealOData()) {
				// change the budget
				When.onTheMainPage.openChangeTeamBudgetDialog();
				Then.onTheChangeTeamBudgetDialog.checkTeamID("TEAM_01");
				Then.onTheChangeTeamBudgetDialog.checkBudget("555.55");
				When.onTheChangeTeamBudgetDialog.changeBudget("444.44");
				When.onTheChangeTeamBudgetDialog.pressChange();
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkBudgetInForm("444.44");

				// change the manager
				When.onTheMainPage.openChangeManagerOfTeamDialog();
				Then.onTheChangeManagerOfTeamDialog.checkManager("3");
				When.onTheChangeManagerOfTeamDialog.changeManager("5");
				When.onTheChangeManagerOfTeamDialog.pressChange();
				When.onTheSuccessInfo.confirm();
				Then.onTheMainPage.checkManagerInForm("5");
			}

			Then.onAnyPage.checkLog();
			Then.onAnyPage.analyzeSupportAssistant();
		});

		QUnit.start();
	});
});
