/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/common/pages/Any",
		"sap/ui/core/sample/odata/v4/ListBinding/pages/Main",
		"sap/ui/test/opaQunit",
		"sap/ui/test/TestUtils"
	], function (Any, Main, opaTest, TestUtils) {
		var sDefaultLanguage = sap.ui.getCore().getConfiguration().getLanguage();

		QUnit.module("sap.ui.core.sample.odata.v4.ListBinding", {
			before : function () {
				sap.ui.getCore().getConfiguration().setLanguage("en-US");
			},
			after : function () {
				sap.ui.getCore().getConfiguration().setLanguage(sDefaultLanguage);
			}
		});

		//*****************************************************************************
		opaTest("Start list binding app and check log", function (Given, When, Then) {
			When.onAnyPage.applySupportAssistant();
			Given.iStartMyUIComponent({
				autoWait : true,
				componentConfig : {
					name : "sap.ui.core.sample.odata.v4.ListBinding"
				}
			});

			Then.onTheMainPage.checkTeamIDInForm("TEAM_01");
			Then.onTheMainPage.checkEmployeeNameInRow(0, "Walter\"s Win's");
			When.onTheMainPage.selectFirstEmployee();
			Then.onTheMainPage.checkEmployeeEquipmentInRow(0, "Office PC");
			Then.onTheMainPage.checkProductImageInRow(0, "TEAMS('TEAM_01')/TEAM_2_EMPLOYEES('1')/"
				+ "EMPLOYEE_2_EQUIPMENTS(Category='Electronics',ID=1)/EQUIPMENT_2_PRODUCT/"
				+ "ProductPicture/Picture");
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
			Then.iTeardownMyUIComponent();
		});

		QUnit.start();
	});
});
