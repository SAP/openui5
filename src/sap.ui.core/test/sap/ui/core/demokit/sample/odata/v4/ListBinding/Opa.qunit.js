/*!
 * ${copyright}
 */
sap.ui.require([
	"jquery.sap.global",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
], function (jQuery, Opa5, opaTest) {
	/*global QUnit */
	"use strict";

	QUnit.module("sap.ui.core.sample.odata.v4.ListBinding");

	//*****************************************************************************
	opaTest("Start list binding app and check log", function (Given, When, Then) {
		var vRealOData = jQuery.sap.getUriParameters().get("realOData"),
			bRealOData = /direct|proxy|true/.test(vRealOData);

		Given.iStartMyAppInAFrame("../../../common/index.html?component=odata.v4.ListBinding"
				+ "&sap-language=en"
				+ (bRealOData ? "&sap-server=test" : "")
				+ "&realOData=" + encodeURIComponent(vRealOData));

		Then.onTheMainPage.checkTeamIDInForm("TEAM_01");
		Then.onTheMainPage.checkEmployeeNameInRow(0, "Walter\"s Win's");
		When.onTheMainPage.selectFirstEmployee();
		Then.onTheMainPage.checkEmployeeEquipmentInRow(0, "Office PC");
		Then.onTheMainPage.checkLog();
		Then.iTeardownMyAppFrame();
	});
});
