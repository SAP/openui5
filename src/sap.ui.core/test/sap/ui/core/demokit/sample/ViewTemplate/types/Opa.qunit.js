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

	QUnit.module("sap.ui.core.sample.ViewTemplate.types");

	//*****************************************************************************
	opaTest("OData Types", function (Given, When, Then) {

		Given.iStartMyUIComponent({
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.changeMinMaxField("100");
		Then.onTheMainPage.checkMinMaxField();
		Then.onTheMainPage.checkLog();
		Then.iTeardownMyUIComponent();
	});
});
