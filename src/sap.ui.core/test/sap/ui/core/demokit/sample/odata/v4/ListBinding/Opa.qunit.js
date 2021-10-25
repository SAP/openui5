/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (opaTest, TestUtils) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.ListBinding");

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
		When.onTheMainPage.refreshEmployees();
		Then.onTheMainPage.checkEmployeeNameInRow(0, "Walter\"s Win's");

		Then.onAnyPage.checkLog();
		Then.onAnyPage.analyzeSupportAssistant();
		Then.iTeardownMyUIComponent();
	});
});
