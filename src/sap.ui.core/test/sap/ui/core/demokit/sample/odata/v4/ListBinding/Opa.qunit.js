/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/TestUtils"
], function (jQuery, Opa5, opaTest, TestUtils) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.ListBinding");

	//*****************************************************************************
	opaTest("Start list binding app and check log", function (Given, When, Then) {
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
		Then.onAnyPage.checkLog();
		Then.iTeardownMyUIComponent();
	});
});
