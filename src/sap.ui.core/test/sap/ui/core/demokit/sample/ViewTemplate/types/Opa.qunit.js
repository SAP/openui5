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
			autoWait : true,
			componentConfig : {
				name : "sap.ui.core.sample.ViewTemplate.types"
			}
		});

		When.onTheMainPage.changeMinMaxField("100");
		Then.onTheMainPage.checkControlIsDirty("decimalInput", true);
		When.onTheMainPage.pressButton("toggleV4Button");
		if (TestUtils.isRealOData()) {
			When.onTheMainPage.changeBoolean();
			When.onTheMainPage.pressButton("saveButton");
			When.onTheMainPage.pressButton("resetButton");
		}
		When.onTheMainPage.enterBoolean("XXX");
		Then.onTheMainPage.checkControlIsDirty("booleanInput", true);
		When.onTheMainPage.pressButton("resetModelButton");
		Then.onTheMainPage.checkBooleanValue(true);
		When.onTheMainPage.enterBoolean("YYY");
		Then.onTheMainPage.checkControlIsDirty("booleanInput", true);
		When.onTheMainPage.pressButton("resetContextBindingButton");
		Then.onTheMainPage.checkBooleanValue(true);
		When.onTheMainPage.enterBoolean("");
		Then.onTheMainPage.checkControlIsDirty("booleanInput", true);
		When.onTheMainPage.pressButton("resetModelButton");
		Then.onTheMainPage.checkBooleanValue(true);
		Then.onTheMainPage.checkControlIsDirty("booleanInput", false);

		Then.onTheMainPage.checkLog([{ component : "sap.ui.model.odata.v4.ODataMetaModel",
			level : jQuery.sap.log.Level.WARNING,
			message : "'Edm.Duration', using sap.ui.model.odata.type.Raw"}]);
		Then.iTeardownMyUIComponent();
	});
});
